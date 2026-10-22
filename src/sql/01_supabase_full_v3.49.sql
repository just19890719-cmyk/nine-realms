-- ===== 九界鐵匠 v3.49 伺服器檢查存檔（防作弊）＋交易所完整版 =====

-- 1) 防作弊用的資料表（玩家看不到、改不了）
create table if not exists public.ac_bucket (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gold float8 not null, gems float8 not null, mats float8 not null, items float8 not null, wpn float8 not null,
  t timestamptz not null default now());
create table if not exists public.ac_log (
  id bigint generated always as identity primary key,
  user_id uuid, nick text, reason text, detail jsonb, at timestamptz not null default now());
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.ac_bucket enable row level security;
alter table public.ac_log enable row level security;
alter table public.admins enable row level security;

-- 2) 存檔不能再直接寫入，只能透過下面的函式
drop policy if exists "insert own save" on public.saves;
drop policy if exists "update own save" on public.saves;

create or replace function public.ac_sum(j jsonb) returns float8 language sql immutable as $$
  select coalesce(sum((value #>> '{}')::float8), 0) from jsonb_each(coalesce(j, '{}'::jsonb)) where jsonb_typeof(value) = 'number' $$;

-- 3) 登入：登記這支手機並取回存檔
create or replace function public.claim_session(p_sid text)
returns table (data jsonb, nickname text, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  return query update saves s set session_id = p_sid where s.user_id = auth.uid()
    returning s.data, s.nickname, s.updated_at;
end $$;

-- 4) 新帳號建立存檔（只接受新手數值）
create or replace function public.create_save(p_sid text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if coalesce((p_data->>'gold')::float8, 0) > 5000 or coalesce((p_data->>'gems')::float8, 0) > 1000
     or jsonb_array_length(coalesce(p_data->'weapons', '[]')) > 10 then raise exception 'bad new save'; end if;
  insert into saves (user_id, data, session_id, updated_at) values (auth.uid(), p_data, p_sid, now())
    on conflict (user_id) do nothing;
end $$;

-- 5) 存檔：檢查數值是否合理，不合理就拒絕並記錄（回傳 'ok' 或 'cheat:原因'）
create or replace function public.save_game(p_sid text, p_data jsonb, p_nick text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  old saves; o jsonb; n jsonb := p_data; b ac_bucket; adm boolean; hrs float8;
  reason text; w jsonb; ow jsonb; wid bigint; seen bigint[] := '{}';
  allow_g float8 := 0; allow_m float8 := 0; allow_w float8 := 0;
  g float8; m float8; mt float8; it float8; wp float8;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  select * into old from saves where user_id = auth.uid() for update;
  if not found or old.session_id is distinct from p_sid then raise exception 'session'; end if;
  o := old.data;
  adm := exists (select 1 from admins where user_id = auth.uid());

  -- 已經上架到交易所的武器，不准還留在背包（自動移除）
  n := jsonb_set(n, '{weapons}', coalesce((select jsonb_agg(x) from jsonb_array_elements(coalesce(n->'weapons', '[]')) x
        where not exists (select 1 from market mk where mk.seller = auth.uid() and mk.status in ('open', 'sold')
          and (mk.weapon->>'oid') = (x->>'id') and coalesce(mk.weapon->>'ocr', '0')::float8 = coalesce(x->>'created', '0')::float8)), '[]'::jsonb));

  if not adm then
    -- 遊戲速度、離線上限固定
    n := jsonb_set(jsonb_set(n, '{speed}', '10'), '{capH}', '8');
    -- 武器檢查
    for w in select x from jsonb_array_elements(coalesce(n->'weapons', '[]')) x loop
      wid := (w->>'id')::bigint;
      if wid = any(seen) then reason := coalesce(reason, 'duplicate weapon'); end if;
      seen := seen || wid;
      if coalesce((w->>'q')::int, 0) not between 0 and 4 or coalesce((w->>'lv')::int, 0) not between 0 and 15
         or jsonb_array_length(coalesce(w->'traits', '[]')) > 3 then reason := coalesce(reason, 'weapon range'); end if;
      if exists (select 1 from jsonb_array_elements(coalesce(w->'traits', '[]')) t where (t->>'v')::float8 > 150)
         or exists (select 1 from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and (e->>'v')::float8 > 150)
        then reason := coalesce(reason, 'weapon stat'); end if;
      if o is not null and wid < coalesce((o->>'nextId')::bigint, 1) then
        select x into ow from jsonb_array_elements(coalesce(o->'weapons', '[]')) x where (x->>'id')::bigint = wid limit 1;
        if ow is null then reason := coalesce(reason, 'weapon appeared');
        elsif ow->>'b' is distinct from w->>'b' or ow->>'q' is distinct from w->>'q' or ow->'traits' is distinct from w->'traits'
          then reason := coalesce(reason, 'weapon changed'); end if;
      end if;
    end loop;
    if coalesce((n->>'furnace')::int, 1) > 5 or coalesce((n->>'anvil')::int, 1) > 5 or coalesce((n->>'slots')::int, 1) > 4
      then reason := coalesce(reason, 'workshop'); end if;

    -- 交易所：這次存檔新入帳的成交金額、退回／買到的武器，不算在額度裡
    select coalesce(sum(floor(price * 0.95)) filter (where cur = 'gold'), 0), coalesce(sum(floor(price * 0.95)) filter (where cur = 'gems'), 0)
      into allow_g, allow_m from market
      where seller = auth.uid() and status = 'sold' and settled = false
        and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id);
    select count(*) into allow_w from market
      where (seller = auth.uid() and status in ('expired', 'cancelled') and settled = false
              and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id))
         or (buyer = auth.uid() and buyer_ack = false
              and coalesce(n->'mk'->'got', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'got', '[]') @> to_jsonb(id));

    -- 合理收入額度：隨時間補回，上限約為離線 8 小時的 6 倍以上
    -- v3.50 首次收復村莊獎勵、改版補發（金額表與遊戲 FIRST_GOLD 相同）
    allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000)) f(i, fg)
      where coalesce(n->'villages'->f.i->>'status', '') = 'cleared' and coalesce(o->'villages'->f.i->>'status', '') <> 'cleared'), 0);
    if coalesce(n->>'fcRw', '') = 'true' and coalesce(o->>'fcRw', '') <> 'true' then
      allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000)) f(i, fg)
        where coalesce(o->'villages'->f.i->>'status', '') = 'cleared'), 0);
    end if;

    select * into b from ac_bucket where user_id = auth.uid() for update;
    if not found then insert into ac_bucket values (auth.uid(), 60000, 1500, 2000, 30, 200, now()) returning * into b; end if;
    hrs := greatest(0, extract(epoch from now() - b.t) / 3600);
    b.gold := least(60000, b.gold + 6000 * hrs); b.gems := least(1500, b.gems + 30 * hrs);
    b.mats := least(2000, b.mats + 100 * hrs); b.items := least(30, b.items + 2 * hrs); b.wpn := least(200, b.wpn + 30 * hrs);
    if o is not null then
      g  := greatest(0, coalesce((n->>'gold')::float8, 0) - coalesce((o->>'gold')::float8, 0) - allow_g);
      m  := greatest(0, coalesce((n->>'gems')::float8, 0) - coalesce((o->>'gems')::float8, 0) - allow_m);
      mt := greatest(0, ac_sum(n->'mats') - ac_sum(o->'mats'));
      it := greatest(0, ac_sum(n->'items') - ac_sum(o->'items'));
      wp := greatest(0, coalesce((n->>'nextId')::float8, 0) - coalesce((o->>'nextId')::float8, 0) - allow_w);
      if g > b.gold then reason := coalesce(reason, 'gold +' || g::bigint); end if;
      if m > b.gems then reason := coalesce(reason, 'gems +' || m::bigint); end if;
      if mt > b.mats then reason := coalesce(reason, 'mats +' || mt::bigint); end if;
      if it > b.items then reason := coalesce(reason, 'items +' || it::bigint); end if;
      if wp > b.wpn then reason := coalesce(reason, 'weapons +' || wp::bigint); end if;
      b.gold := b.gold - g; b.gems := b.gems - m; b.mats := b.mats - mt; b.items := b.items - it; b.wpn := b.wpn - wp;
    end if;
    if reason is not null then
      insert into ac_log (user_id, nick, reason, detail) values (auth.uid(), old.nickname, reason,
        jsonb_build_object('gold', array[o->'gold', n->'gold'], 'gems', array[o->'gems', n->'gems'], 'nextId', array[o->'nextId', n->'nextId']));
      return 'cheat:' || reason;
    end if;
    update ac_bucket set gold = b.gold, gems = b.gems, mats = b.mats, items = b.items, wpn = b.wpn, t = now() where user_id = auth.uid();
  end if;

  update saves set data = n, nickname = coalesce(p_nick, nickname), updated_at = now() where user_id = auth.uid();
  return 'ok';
end $$;

-- 6) 伺服器時間
create or replace function public.server_now() returns timestamptz language sql stable as $$ select now() $$;

-- 7) 交易所（每個動作都確認是目前登記的手機；上架的武器必須真的在雲端存檔裡）
drop function if exists public.market_list(jsonb,text,int,int,text,bigint,text);
drop function if exists public.market_list(jsonb,text,int,int,text,bigint,text,text);
drop function if exists public.market_buy(bigint);
drop function if exists public.market_buy(bigint,text);
drop function if exists public.market_cancel(bigint);
drop function if exists public.market_cancel(bigint,text);
drop function if exists public.market_settle();
drop function if exists public.market_settle(text);
drop function if exists public.market_pending(text);
drop function if exists public.market_ack(bigint[],text);

create or replace function public.mk_check(p_sid text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if not exists (select 1 from saves where user_id = auth.uid() and session_id = p_sid) then raise exception 'session'; end if;
end $$;

create or replace function public.market_list(p_weapon jsonb, p_bp text, p_lv int, p_q int, p_cur text, p_price bigint, p_nick text, p_sid text)
returns bigint language plpgsql security definer set search_path = public as $$
declare n int; new_id bigint; sw jsonb;
begin
  perform mk_check(p_sid);
  if p_cur not in ('gold','gems') or p_price < 10
     or (p_cur = 'gold' and p_price > 99999999) or (p_cur = 'gems' and p_price > 999999) then raise exception 'bad price'; end if;
  -- 武器必須在雲端存檔裡，而且內容一致（不能憑空上架）
  select x into sw from saves s, jsonb_array_elements(coalesce(s.data->'weapons', '[]')) x
    where s.user_id = auth.uid() and (x->>'id') = (p_weapon->>'oid') limit 1;
  if sw is null or sw->>'b' is distinct from p_weapon->>'b' or sw->>'q' is distinct from p_weapon->>'q'
     or sw->>'lv' is distinct from p_weapon->>'lv' or sw->'traits' is distinct from p_weapon->'traits'
     or sw->'ench' is distinct from p_weapon->'ench' or coalesce(sw->>'lock', 'false') = 'true' then raise exception 'not owned'; end if;
  if exists (select 1 from market where seller = auth.uid() and status in ('open','sold') and (weapon->>'oid') = (p_weapon->>'oid')
             and coalesce(weapon->>'ocr','0') = coalesce(p_weapon->>'ocr','0')) then raise exception 'not owned'; end if;
  select count(*) into n from market where seller = auth.uid() and status = 'open' and expires_at > now();
  if n >= 10 then raise exception 'listing limit'; end if;
  insert into market (seller, seller_nick, weapon, bp, lv, q, cur, price)
    values (auth.uid(), left(p_nick, 16), p_weapon, sw->>'b', (sw->>'lv')::int, (sw->>'q')::int, p_cur, p_price)
    returning id into new_id;
  return new_id;
end $$;

create or replace function public.market_buy(p_id bigint, p_sid text)
returns public.market language plpgsql security definer set search_path = public as $$
declare r market;
begin
  perform mk_check(p_sid);
  update market set status = 'sold', buyer = auth.uid(), sold_at = now()
    where id = p_id and status = 'open' and expires_at > now() and seller <> auth.uid()
    returning * into r;
  if not found then raise exception 'not available'; end if;
  return r;
end $$;

create or replace function public.market_cancel(p_id bigint, p_sid text)
returns public.market language plpgsql security definer set search_path = public as $$
declare r market;
begin
  perform mk_check(p_sid);
  update market set status = 'cancelled' where id = p_id and seller = auth.uid() and status = 'open' returning * into r;
  if not found then raise exception 'not available'; end if;
  return r;
end $$;

create or replace function public.market_pending(p_sid text)
returns setof public.market language plpgsql security definer set search_path = public as $$
begin
  perform mk_check(p_sid);
  update market set status = 'expired' where seller = auth.uid() and status = 'open' and expires_at <= now();
  return query select * from market
    where (seller = auth.uid() and settled = false and status in ('sold','expired','cancelled'))
       or (buyer = auth.uid() and buyer_ack = false);
end $$;

create or replace function public.market_ack(p_ids bigint[], p_sid text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform mk_check(p_sid);
  update market set settled = true where seller = auth.uid() and id = any(p_ids) and status <> 'open';
  update market set buyer_ack = true where buyer = auth.uid() and id = any(p_ids);
end $$;

-- 8) 權限
revoke all on function public.ac_sum(jsonb) from public;
revoke all on function public.claim_session(text) from public;
revoke all on function public.create_save(text,jsonb) from public;
revoke all on function public.save_game(text,jsonb,text) from public;
revoke all on function public.mk_check(text) from public;
revoke all on function public.market_list(jsonb,text,int,int,text,bigint,text,text) from public;
revoke all on function public.market_buy(bigint,text) from public;
revoke all on function public.market_cancel(bigint,text) from public;
revoke all on function public.market_pending(text) from public;
revoke all on function public.market_ack(bigint[],text) from public;
grant execute on function public.claim_session(text) to authenticated;
grant execute on function public.create_save(text,jsonb) to authenticated;
grant execute on function public.save_game(text,jsonb,text) to authenticated;
grant execute on function public.market_list(jsonb,text,int,int,text,bigint,text,text) to authenticated;
grant execute on function public.market_buy(bigint,text) to authenticated;
grant execute on function public.market_cancel(bigint,text) to authenticated;
grant execute on function public.market_pending(text) to authenticated;
grant execute on function public.market_ack(bigint[],text) to authenticated;
grant execute on function public.server_now() to anon, authenticated;

notify pgrst, 'reload schema';
