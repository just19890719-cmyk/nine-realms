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

notify pgrst, 'reload schema';
