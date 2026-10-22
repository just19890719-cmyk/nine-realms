-- ===== 九界鐵匠 v3.63 安全與經濟修正（整段貼到 SQL Editor 執行一次） =====
-- 1) 管理員判斷：前端只有管理員才能打開開發者工具
-- 2) 存檔檢查：強化等級、附魔、工坊升級都要有對應的金幣支出；村莊只能依序收復
-- 3) 交易所購買：伺服器確認買家雲端存檔的錢夠，並直接從雲端存檔扣款（不再靠手機自己扣）
-- 4) 放寬收入額度（避免後期勤收成的玩家被誤判作弊）

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid()) $$;

create or replace function public.ac_version() returns text language sql immutable as $$ select '3.63'::text $$;

-- 材質倍率（由圖紙編號判斷：t1 鐵製、t2 霜銀、t3 龍鱗、m 神器），與遊戲 TIERS.mult 相同
create or replace function public.ac_mult(p_b text) returns float8 language sql immutable as $$
  select case when p_b like 't2\_%' then 2.5 when p_b like 't3\_%' then 6 when p_b like 'm\_%' then 11 else 1 end::float8 $$;

-- 安定值（與遊戲 TIERS.stable 相同：鐵製 6、霜銀 5、龍鱗 3、神器 0）
create or replace function public.ac_stable(p_b text) returns int language sql immutable as $$
  select case when p_b like 't2\_%' then 5 when p_b like 't3\_%' then 3 when p_b like 'm\_%' then 0 else 6 end $$;

-- 強化從 p_from 到 p_to 至少要花的金幣（每一級成功一次的費用，與遊戲 ENH_COST 相同）
create or replace function public.ac_enh_cost(p_b text, p_from int, p_to int) returns float8 language sql immutable as $$
  select coalesce(sum(round((array[5,10,18,30,45,65,160,240,340,480,650,900,1250,1700,2300])[least(14, lv) + 1] * ac_mult(p_b))), 0)::float8
  from generate_series(greatest(0, p_from), least(15, p_to) - 1) lv $$;

-- 武器的附魔格數（有詞條的格子）
create or replace function public.ac_ench_n(w jsonb) returns int language sql immutable as $$
  select count(*)::int from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' $$;

-- 工坊升級從 a 級到 b 級的花費（與遊戲 FURNACE_COST／ANVIL_COST／SLOT_COST 相同）
create or replace function public.ac_ws_cost(p_kind text, a int, b int) returns float8 language sql immutable as $$
  select coalesce(sum(case p_kind when 'furnace' then (array[0,3000,6000,15000,40000])[lv + 1]
                                  when 'anvil' then (array[0,2000,8000,25000,50000])[lv + 1]
                                  else (array[0,3000,15000,40000])[lv + 1] end), 0)::float8
  from generate_series(greatest(1, a), least(case p_kind when 'slots' then 4 else 5 end, b) - 1) lv $$;

revoke all on function public.ac_mult(text) from public;
revoke all on function public.ac_stable(text) from public;
revoke all on function public.ac_enh_cost(text,int,int) from public;
revoke all on function public.ac_ench_n(jsonb) from public;
revoke all on function public.ac_ws_cost(text,int,int) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.ac_version() to anon, authenticated;

-- 交易所購買：買家雲端存檔的錢要夠，成交時直接扣款
create or replace function public.market_buy(p_id bigint, p_sid text)
returns public.market language plpgsql security definer set search_path = public as $$
declare r market; bal float8;
begin
  perform mk_check(p_sid);
  select * into r from market where id = p_id and status = 'open' and expires_at > now() and seller <> auth.uid() for update;
  if not found then raise exception 'not available'; end if;
  select coalesce((data->>r.cur)::float8, 0) into bal from saves where user_id = auth.uid();
  if coalesce(bal, 0) < r.price then raise exception 'not enough'; end if;
  -- 直接從買家雲端存檔扣款，並記在 mk.paid（手機重新讀檔時就知道這筆已經付過，不會再扣一次）
  update saves set data = data || jsonb_build_object(r.cur, bal - r.price,
      'mk', coalesce(data->'mk', '{}'::jsonb) || jsonb_build_object('paid', coalesce(data->'mk'->'paid', '[]'::jsonb) || to_jsonb(r.id)))
    where user_id = auth.uid();
  update market set status = 'sold', buyer = auth.uid(), sold_at = now() where id = r.id returning * into r;
  return r;
end $$;

create or replace function public.save_game(p_sid text, p_data jsonb, p_nick text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  old saves; o jsonb; n jsonb := p_data; b ac_bucket; adm boolean; hrs float8;
  reason text; w jsonb; ow jsonb; wid bigint; seen bigint[] := '{}';
  allow_g float8 := 0; allow_m float8 := 0; allow_w float8 := 0; allow_sp float8 := 0;
  spend_g float8 := 0; lvn int; lvo int; i int; nclr int;
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
      wid := (w->>'id')::bigint; lvn := coalesce((w->>'lv')::int, 0);
      if wid = any(seen) then reason := coalesce(reason, 'duplicate weapon'); end if;
      seen := seen || wid;
      if coalesce((w->>'q')::int, 0) not between 0 and 4 or lvn not between 0 and 15
         or jsonb_array_length(coalesce(w->'traits', '[]')) > 3 then reason := coalesce(reason, 'weapon range'); end if;
      if exists (select 1 from jsonb_array_elements(coalesce(w->'traits', '[]')) t where (t->>'v')::float8 > 150)
         or exists (select 1 from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and (e->>'v')::float8 > 150)
        then reason := coalesce(reason, 'weapon stat'); end if;
      if o is not null then
        if wid < coalesce((o->>'nextId')::bigint, 1) then
          ow := null;
          select x into ow from jsonb_array_elements(coalesce(o->'weapons', '[]')) x where (x->>'id')::bigint = wid limit 1;
          if ow is null then reason := coalesce(reason, 'weapon appeared');
          elsif ow->>'b' is distinct from w->>'b' or ow->>'q' is distinct from w->>'q' or ow->'traits' is distinct from w->'traits'
            then reason := coalesce(reason, 'weapon changed');
          else
            -- v3.63 強化只會往上、每升一級至少花一次強化費；每改一格附魔至少花一次附魔費
            lvo := coalesce((ow->>'lv')::int, 0);
            if lvn < lvo then reason := coalesce(reason, 'weapon level down'); end if;
            -- 危險區（超過安定值）一次存檔最多升 2 級：正常強化每次都要看動畫、而且成功率低，10 秒內不可能連升好幾級
            if lvn - greatest(lvo, ac_stable(w->>'b')) > 2 then reason := coalesce(reason, 'enhance too fast'); end if;
            spend_g := spend_g + ac_enh_cost(w->>'b', lvo, lvn);
            for i in 0..3 loop
              if jsonb_typeof(w->'ench'->i) = 'object' and (w->'ench'->i) is distinct from (ow->'ench'->i) then
                spend_g := spend_g + 40 * ac_mult(w->>'b');
                if (w->'ench'->i->>'v')::float8 > 40 then reason := coalesce(reason, 'weapon stat'); end if;   -- v3.63 新附魔最高 40
              end if;
            end loop;
          end if;
        else
          -- 新武器：鍛造出來是 +0、沒有附魔；之後的強化、附魔都要算花費（交易所買到／退回的另外扣除）
          spend_g := spend_g + ac_enh_cost(w->>'b', 0, lvn) + 40 * ac_mult(w->>'b') * ac_ench_n(w);
          if not exists (select 1 from market mk where (mk.buyer = auth.uid() or mk.seller = auth.uid()) and mk.bp = w->>'b' and mk.lv = lvn)
             and lvn - ac_stable(w->>'b') > 2 then reason := coalesce(reason, 'enhance too fast'); end if;
          -- v3.63 新武器的數值上限收緊：特性最高 25×1.8=45、附魔最高 40（舊武器維持原本寬鬆上限，避免舊存檔卡住）
          if exists (select 1 from jsonb_array_elements(coalesce(w->'traits', '[]')) t where (t->>'v')::float8 > 45)
             or exists (select 1 from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and (e->>'v')::float8 > 40)
            then reason := coalesce(reason, 'weapon stat'); end if;
        end if;
      end if;
    end loop;
    if coalesce((n->>'furnace')::int, 1) > 5 or coalesce((n->>'anvil')::int, 1) > 5 or coalesce((n->>'slots')::int, 1) > 4
      then reason := coalesce(reason, 'workshop'); end if;

    if o is not null then
      -- v3.63 工坊升級要花錢
      spend_g := spend_g + ac_ws_cost('furnace', coalesce((o->>'furnace')::int, 1), coalesce((n->>'furnace')::int, 1))
                         + ac_ws_cost('anvil', coalesce((o->>'anvil')::int, 1), coalesce((n->>'anvil')::int, 1))
                         + ac_ws_cost('slots', coalesce((o->>'slots')::int, 1), coalesce((n->>'slots')::int, 1));
      -- v3.63 村莊只能依序收復，一次存檔最多新收復 2 座
      for i in 1..9 loop
        if coalesce(n->'villages'->i->>'status', '') = 'cleared' and coalesce(o->'villages'->i->>'status', '') <> 'cleared'
           and coalesce(n->'villages'->(i-1)->>'status', '') <> 'cleared'
          then reason := coalesce(reason, 'village order'); end if;
      end loop;
      select count(*) filter (where coalesce(n->'villages'->k->>'status', '') = 'cleared' and coalesce(o->'villages'->k->>'status', '') <> 'cleared')
        into nclr from generate_series(0, 9) k;
      if nclr > 2 then reason := coalesce(reason, 'villages +' || nclr); end if;
    end if;

    -- 交易所：這次存檔新入帳的成交金額、退回／買到的武器，不算在額度裡
    select coalesce(sum(floor(price * 0.95)) filter (where cur = 'gold'), 0), coalesce(sum(floor(price * 0.95)) filter (where cur = 'gems'), 0)
      into allow_g, allow_m from market
      where seller = auth.uid() and status = 'sold' and settled = false
        and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id);
    select count(*), coalesce(sum(ac_enh_cost(bp, 0, lv) + 40 * ac_mult(bp) * ac_ench_n(weapon)), 0) into allow_w, allow_sp from market
      where (seller = auth.uid() and status in ('expired', 'cancelled') and settled = false
              and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id))
         or (buyer = auth.uid() and buyer_ack = false
              and coalesce(n->'mk'->'got', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'got', '[]') @> to_jsonb(id));
    -- 合理收入額度：隨時間補回
    -- v3.50 首次收復村莊獎勵、改版補發（金額表與遊戲 FIRST_GOLD 相同）
    allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000)) f(i, fg)
      where coalesce(n->'villages'->f.i->>'status', '') = 'cleared' and coalesce(o->'villages'->f.i->>'status', '') <> 'cleared'), 0);
    if coalesce(n->>'fcRw', '') = 'true' and coalesce(o->>'fcRw', '') <> 'true' then
      allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000)) f(i, fg)
        where coalesce(o->'villages'->f.i->>'status', '') = 'cleared'), 0);
    end if;

    -- v3.63 額度放寬：10 倍速下後期全村勤收成每小時約 1～2 萬金、數百個材料（原本 6,000 金／100 材料會誤判）
    select * into b from ac_bucket where user_id = auth.uid() for update;
    if not found then insert into ac_bucket values (auth.uid(), 160000, 1500, 4000, 30, 200, now()) returning * into b; end if;
    hrs := greatest(0, extract(epoch from now() - b.t) / 3600);
    b.gold := least(160000, b.gold + 20000 * hrs); b.gems := least(1500, b.gems + 30 * hrs);
    b.mats := least(4000, b.mats + 400 * hrs); b.items := least(30, b.items + 2 * hrs); b.wpn := least(200, b.wpn + 30 * hrs);
    if o is not null then
      g  := greatest(0, coalesce((n->>'gold')::float8, 0) - coalesce((o->>'gold')::float8, 0) - allow_g + greatest(0, spend_g - allow_sp));
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
        jsonb_build_object('gold', array[o->'gold', n->'gold'], 'gems', array[o->'gems', n->'gems'], 'nextId', array[o->'nextId', n->'nextId'],
          'spend', spend_g, 'allow', allow_g));
      return 'cheat:' || reason;
    end if;
    update ac_bucket set gold = b.gold, gems = b.gems, mats = b.mats, items = b.items, wpn = b.wpn, t = now() where user_id = auth.uid();
  end if;

  update saves set data = n, nickname = coalesce(p_nick, nickname), updated_at = now() where user_id = auth.uid();
  return 'ok';
end $$;

-- 既有玩家的額度直接補滿到新上限（避免今天剛被扣低的人馬上被誤判）
update ac_bucket set gold = 160000, mats = 4000;

notify pgrst, 'reload schema';
