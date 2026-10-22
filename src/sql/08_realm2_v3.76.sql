-- ===== 九界鐵匠 v3.76 第二界約頓海姆＋巨人體重鍊（整段貼到 SQL Editor 執行一次） =====
-- 要先跑過 05（save_game）、04（排行榜）、07（首領討伐）。
-- 1) save_game：村莊檢查從 10 座改成 20 座、第二界首次收復金幣額度、重鍊等級檢查（0～5、只會往上、要花金幣）、收入額度放寬約 3 倍
-- 2) lb_power：戰力算進重鍊（排行榜和首領傷害都用這個）
-- 3) lb_submit：20 座村莊、重鍊等級要和雲端存檔一樣
-- 4) market_list：上架的武器重鍊等級要和雲端存檔一樣
-- 5) 第五階「巨人」武器（t4_）：階級倍率 16、安定值 0；熔爐可以升到 Lv6（150,000 金）

create or replace function public.ac_version() returns text language sql immutable as $$ select '3.76'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

-- 重鍊 Lv a → Lv b 要花的金幣（與遊戲 RF_COST 相同）
create or replace function public.ac_rf_gold(a int, b int) returns float8 language sql immutable as $$
  select coalesce(sum(c), 0)::float8 from (values (1,5000),(2,8000),(3,12000),(4,18000),(5,25000)) x(l, c) where l > greatest(0, a) and l <= least(5, b) $$;
revoke all on function public.ac_rf_gold(int, int) from public;

-- 第五階「巨人」武器：階級倍率、安定值、工坊升級費用（與遊戲 TIERS、FURNACE_COST 相同）
create or replace function public.ac_mult(p_b text) returns float8 language sql immutable as $$
  select case when p_b like 't2\_%' then 2.5 when p_b like 't3\_%' then 6 when p_b like 'm\_%' then 11 when p_b like 't4\_%' then 16 else 1 end::float8 $$;
create or replace function public.ac_stable(p_b text) returns int language sql immutable as $$
  select case when p_b like 't2\_%' then 5 when p_b like 't3\_%' then 3 when p_b like 'm\_%' then 0 when p_b like 't4\_%' then 0 else 6 end $$;
create or replace function public.ac_ws_cost(p_kind text, a int, b int) returns float8 language sql immutable as $$
  select coalesce(sum(case p_kind when 'furnace' then (array[0,3000,6000,15000,40000,150000])[lv + 1]
                                  when 'anvil' then (array[0,2000,8000,25000,50000])[lv + 1]
                                  else (array[0,3000,15000,40000])[lv + 1] end), 0)::float8
  from generate_series(greatest(1, a), least(case p_kind when 'slots' then 4 when 'furnace' then 6 else 5 end, b) - 1) lv $$;
revoke all on function public.ac_mult(text) from public;
revoke all on function public.ac_stable(text) from public;
revoke all on function public.ac_ws_cost(text,int,int) from public;

create or replace function public.lb_bpid(p_b text) returns text language sql immutable as $$
  select case p_b when 't1_handaxe' then 't1_woodaxe' when 't1_shortspear' then 't1_farmspear' when 't2_daneaxe' then 't2_wolfaxe'
    when 't2_broadsword' then 't2_longsword' when 't2_warspear' then 't2_glaive' when 't2_seax' then 't2_twindagger'
    when 't3_doubleaxe' then 't3_greataxe' when 't3_saber' then 't3_greatsword' when 't3_spear' then 't3_halberd' when 't3_scythe' then 't3_halberd'
    else p_b end $$;

drop function if exists public.lb_bp(text);
create or replace function public.lb_bp(p_b text) returns table(base float8, mult float8, cat text, inn_k text, inn_v float8) language sql immutable as $$
  -- mult：階級倍率（鐵製 1、霜銀 2.5、龍鱗 6、神器 11，與遊戲 TIERS.mult 相同）
  select x.base::float8, (case when x.id like 't2\_%' then 2.5 when x.id like 't3\_%' then 6 when x.id like 'm\_%' then 11 when x.id like 't4\_%' then 16 else 1 end)::float8, x.cat, x.inn_k, x.inn_v::float8 from (values
    ('t1_woodaxe',14,'axe',null,0),('t1_farmspear',11,'polearm',null,0),('t1_pickaxe',11,'tool',null,0),('t1_huntbow',10,'bow',null,0),
    ('t1_sling',7,'throw',null,0),('t1_huntknife',9,'dagger',null,0),('t1_ironsword',12,'sword',null,0),('t1_roundshield',10,'shield',null,0),
    ('t1_crossbow',13,'crossbow',null,0),('t1_ironhammer',16,'hammer',null,0),
    ('t2_wolfaxe',15,'axe',null,0),('t2_longsword',13,'sword',null,0),('t2_longbow',11,'bow',null,0),('t2_crossbow',13,'crossbow',null,0),
    ('t2_glaive',13,'polearm',null,0),('t2_twindagger',10,'dagger',null,0),('t2_warhammer',16,'hammer',null,0),('t2_throwaxe',9,'throw',null,0),
    ('t2_kiteshield',11,'shield',null,0),
    ('t3_greataxe',16,'axe',null,0),('t3_greatsword',15,'sword',null,0),('t3_bow',12,'bow',null,0),('t3_crossbow',14,'crossbow',null,0),
    ('t3_halberd',14,'polearm',null,0),('t3_hammer',17,'hammer',null,0),('t3_dagger',10,'dagger',null,0),('t3_shield',12,'shield',null,0),
    ('m_fenrir',16,'axe','swift',15),('m_frostgiant',17,'hammer','giant',30),('m_firegiant',15,'sword','flame',20),
    ('m_nidhogg',14,'polearm','dragon',35),('m_iceraven',12,'bow','frost',20),('m_serpent',13,'polearm','loot',30),
    ('t4_axe',16,'axe','giant',20),('t4_sword',15,'sword',null,0),('t4_bow',12,'bow',null,0),('t4_crossbow',14,'crossbow',null,0),
    ('t4_hammer',17,'hammer',null,0),('t4_polearm',14,'polearm',null,0),('t4_dagger',11,'dagger',null,0),('t4_shield',12,'shield',null,0)
  ) x(id, base, cat, inn_k, inn_v) where x.id = public.lb_bpid(p_b) $$;

create or replace function public.lb_power(w jsonb) returns int language plpgsql immutable set search_path = public as $$
declare bp record; lv int := coalesce((w->>'lv')::int, 0); qm float8; em float8; rm float8; fl float8; fr float8; rf int := least(5, greatest(0, coalesce((w->>'rf')::int, 0)));
begin
  select * into bp from lb_bp(w->>'b');
  if not found then return null; end if;
  qm := case coalesce((w->>'q')::int, 0) when 1 then 1.2 when 2 then 1.45 when 3 then 1.8 when 4 then 2.3 else 1 end;
  em := case when lv <= 6 then 1 + 0.1::float8 * lv else 1.6::float8 + 0.18::float8 * (lv - 6) end;
  rm := 1 + least(50, coalesce((select sum((t->>'v')::float8) from jsonb_array_elements(coalesce(w->'traits', '[]')) t where t->>'k' = 'runic'), 0)) / 100;
  fl := (case when bp.inn_k = 'flame' then bp.inn_v else 0 end)
      + coalesce((select sum((e->>'v')::float8) from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and e->>'k' = 'flame'), 0) * rm;
  fr := (case when bp.inn_k = 'frost' then bp.inn_v else 0 end)
      + coalesce((select sum((e->>'v')::float8) from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and e->>'k' = 'frost'), 0) * rm;
  if bp.mult < 6 then rf := 0; end if;   -- v3.76 重鍊只算龍鱗／神器
  return floor(bp.base * bp.mult * qm * em * (1 + (fl + fr) / 100) * (1 + 0.12 * rf) + 0.5)::int;
end $$;

create or replace function public.lb_submit(p_village int, p_p int, p_w jsonb, p_nick text) returns int
language plpgsql security definer set search_path = public as $$
declare w jsonb; sw jsonb; pw int;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if p_village is null or p_village not between 0 and 19 then raise exception 'bad village'; end if;
  w := jsonb_build_object('b', lb_bpid(p_w->>'b'), 'q', coalesce((p_w->>'q')::int, 0), 'lv', coalesce((p_w->>'lv')::int, 0), 'rf', coalesce((p_w->>'rf')::int, 0),
         'traits', coalesce(p_w->'traits', '[]'), 'ench', coalesce(p_w->'ench', '[]'));
  if (select cat from lb_bp(w->>'b')) is distinct from
     (array['axe','polearm','bow','sword','shield','crossbow','hammer','axe','sword','polearm',
            'axe','bow','crossbow','hammer','shield','dagger','polearm','sword','hammer','axe'])[p_village + 1]
    then raise exception 'bad weapon'; end if;
  -- 武器必須已經存進雲端存檔（剛鍛造的武器要等下一次自動存檔，前端會稍後重送）
  select x into sw from saves s, jsonb_array_elements(coalesce(s.data->'weapons', '[]')) x
    where s.user_id = auth.uid() and lb_bpid(x->>'b') = w->>'b'
      and coalesce((x->>'q')::int, 0) = (w->>'q')::int and coalesce((x->>'lv')::int, 0) = (w->>'lv')::int and coalesce((x->>'rf')::int, 0) = (w->>'rf')::int
      and coalesce(x->'traits', '[]') = w->'traits' and coalesce(x->'ench', '[]') = w->'ench'
    limit 1;
  if sw is null then raise exception 'weapon not saved'; end if;
  pw := lb_power(w);
  insert into lb (user_id, village, nick, p, w) values (auth.uid(), p_village, left(p_nick, 16), pw, w)
  on conflict (user_id, village) do update set
    nick = excluded.nick,
    p = greatest(lb.p, excluded.p),
    w = case when excluded.p > lb.p then excluded.w else lb.w end,
    updated_at = case when excluded.p > lb.p then now() else lb.updated_at end;
  return pw;
end $$;
grant execute on function public.lb_submit(int, int, jsonb, text) to authenticated;

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
     or sw->'ench' is distinct from p_weapon->'ench' or coalesce(sw->>'rf', '0') is distinct from coalesce(p_weapon->>'rf', '0') or coalesce(sw->>'lock', 'false') = 'true' then raise exception 'not owned'; end if;
  if exists (select 1 from market where seller = auth.uid() and status in ('open','sold') and (weapon->>'oid') = (p_weapon->>'oid')
             and coalesce(weapon->>'ocr','0') = coalesce(p_weapon->>'ocr','0')) then raise exception 'not owned'; end if;
  select count(*) into n from market where seller = auth.uid() and status = 'open' and expires_at > now();
  if n >= 10 then raise exception 'listing limit'; end if;
  insert into market (seller, seller_nick, weapon, bp, lv, q, cur, price)
    values (auth.uid(), left(p_nick, 16), p_weapon, sw->>'b', (sw->>'lv')::int, (sw->>'q')::int, p_cur, p_price)
    returning id into new_id;
  return new_id;
end $$;

create or replace function public.save_game(p_sid text, p_data jsonb, p_nick text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  old saves; o jsonb; n jsonb := p_data; b ac_bucket; adm boolean; hrs float8;
  reason text; w jsonb; ow jsonb; wid bigint; seen bigint[] := '{}';
  allow_g float8 := 0; allow_m float8 := 0; allow_w float8 := 0; allow_sp float8 := 0;
  spend_g float8 := 0; lvn int; lvo int; i int; nclr int; rfn int; rfo int;
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
    -- 遊戲速度、離線上限固定（v3.69：10 倍速已寫進遊戲時間，速度 1；離線上限 12 小時）
    n := jsonb_set(jsonb_set(n, '{speed}', '1'), '{capH}', '12');
    -- 武器檢查
    for w in select x from jsonb_array_elements(coalesce(n->'weapons', '[]')) x loop
      wid := (w->>'id')::bigint; lvn := coalesce((w->>'lv')::int, 0); rfn := coalesce((w->>'rf')::int, 0);
      if wid = any(seen) then reason := coalesce(reason, 'duplicate weapon'); end if;
      seen := seen || wid;
      if coalesce((w->>'q')::int, 0) not between 0 and 4 or lvn not between 0 and 15
         or jsonb_array_length(coalesce(w->'traits', '[]')) > 3 then reason := coalesce(reason, 'weapon range'); end if;
      -- v3.76 巨人體重鍊：0～5 級，只有龍鱗（×6）和神器（×11）可以重鍊
      if rfn not between 0 and 5 or (rfn > 0 and ac_mult(w->>'b') < 6) then reason := coalesce(reason, 'weapon range'); end if;
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
            -- v3.76 重鍊只會往上，每級要花金幣
            rfo := coalesce((ow->>'rf')::int, 0);
            if rfn < rfo then reason := coalesce(reason, 'weapon changed'); end if;
            spend_g := spend_g + ac_rf_gold(rfo, rfn);
            for i in 0..3 loop
              if jsonb_typeof(w->'ench'->i) = 'object' and (w->'ench'->i) is distinct from (ow->'ench'->i) then
                spend_g := spend_g + 40 * ac_mult(w->>'b');
                if (w->'ench'->i->>'v')::float8 > 40 then reason := coalesce(reason, 'weapon stat'); end if;   -- v3.63 新附魔最高 40
              end if;
            end loop;
          end if;
        else
          -- 新武器：鍛造出來是 +0、沒有附魔；之後的強化、附魔都要算花費（交易所買到／退回的另外扣除）
          spend_g := spend_g + ac_enh_cost(w->>'b', 0, lvn) + 40 * ac_mult(w->>'b') * ac_ench_n(w) + ac_rf_gold(0, rfn);
          -- v3.76 新武器不會帶重鍊等級（交易所買到／退回的除外）
          if rfn > 0 and not exists (select 1 from market mk where (mk.buyer = auth.uid() or mk.seller = auth.uid()) and mk.bp = w->>'b' and mk.lv = lvn
             and coalesce((mk.weapon->>'rf')::int, 0) = rfn) then reason := coalesce(reason, 'reforge'); end if;
          if not exists (select 1 from market mk where (mk.buyer = auth.uid() or mk.seller = auth.uid()) and mk.bp = w->>'b' and mk.lv = lvn)
             and lvn - ac_stable(w->>'b') > 2 then reason := coalesce(reason, 'enhance too fast'); end if;
          -- v3.63 新武器的數值上限收緊：特性最高 25×1.8=45、附魔最高 40（舊武器維持原本寬鬆上限，避免舊存檔卡住）
          if exists (select 1 from jsonb_array_elements(coalesce(w->'traits', '[]')) t where (t->>'v')::float8 > 45)
             or exists (select 1 from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and (e->>'v')::float8 > 40)
            then reason := coalesce(reason, 'weapon stat'); end if;
        end if;
      end if;
    end loop;
    if coalesce((n->>'furnace')::int, 1) > 6 or coalesce((n->>'anvil')::int, 1) > 5 or coalesce((n->>'slots')::int, 1) > 4
      then reason := coalesce(reason, 'workshop'); end if;

    if o is not null then
      -- v3.63 工坊升級要花錢
      spend_g := spend_g + ac_ws_cost('furnace', coalesce((o->>'furnace')::int, 1), coalesce((n->>'furnace')::int, 1))
                         + ac_ws_cost('anvil', coalesce((o->>'anvil')::int, 1), coalesce((n->>'anvil')::int, 1))
                         + ac_ws_cost('slots', coalesce((o->>'slots')::int, 1), coalesce((n->>'slots')::int, 1));
      -- v3.63 村莊只能依序收復，一次存檔最多新收復 2 座
      for i in 1..19 loop
        if coalesce(n->'villages'->i->>'status', '') = 'cleared' and coalesce(o->'villages'->i->>'status', '') <> 'cleared'
           and coalesce(n->'villages'->(i-1)->>'status', '') <> 'cleared'
          then reason := coalesce(reason, 'village order'); end if;
      end loop;
      select count(*) filter (where coalesce(n->'villages'->k->>'status', '') = 'cleared' and coalesce(o->'villages'->k->>'status', '') <> 'cleared')
        into nclr from generate_series(0, 19) k;
      if nclr > 2 then reason := coalesce(reason, 'villages +' || nclr); end if;
    end if;

    -- 交易所：這次存檔新入帳的成交金額、退回／買到的武器，不算在額度裡
    select coalesce(sum(floor(price * 0.95)) filter (where cur = 'gold'), 0), coalesce(sum(floor(price * 0.95)) filter (where cur = 'gems'), 0)
      into allow_g, allow_m from market
      where seller = auth.uid() and status = 'sold' and settled = false
        and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id);
    select count(*), coalesce(sum(ac_enh_cost(bp, 0, lv) + 40 * ac_mult(bp) * ac_ench_n(weapon) + ac_rf_gold(0, coalesce((weapon->>'rf')::int, 0))), 0) into allow_w, allow_sp from market
      where (seller = auth.uid() and status in ('expired', 'cancelled') and settled = false
              and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id))
         or (buyer = auth.uid() and buyer_ack = false
              and coalesce(n->'mk'->'got', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'got', '[]') @> to_jsonb(id));
    -- 合理收入額度：隨時間補回
    -- v3.50 首次收復村莊獎勵、改版補發（金額表與遊戲 FIRST_GOLD 相同）
    allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000),(10,15000),(11,18000),(12,21000),(13,24000),(14,27000),(15,30000),(16,35000),(17,40000),(18,45000),(19,50000)) f(i, fg)
      where coalesce(n->'villages'->f.i->>'status', '') = 'cleared' and coalesce(o->'villages'->f.i->>'status', '') <> 'cleared'), 0);
    if coalesce(n->>'fcRw', '') = 'true' and coalesce(o->>'fcRw', '') <> 'true' then
      allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000),(10,15000),(11,18000),(12,21000),(13,24000),(14,27000),(15,30000),(16,35000),(17,40000),(18,45000),(19,50000)) f(i, fg)
        where coalesce(o->'villages'->f.i->>'status', '') = 'cleared'), 0);
    end if;

    -- v3.63 額度放寬：後期全村勤收成每小時約 1～2 萬金、數百個材料
    -- v3.69 離線上限改 12 小時：一次收成最多 12 小時份量，金幣上限 16 萬 → 30 萬、材料 4,000 → 6,000（補回速度不變）
    -- v3.76 第二界約頓海姆全開後收入約 3 倍：金幣每小時 2 萬 → 6 萬、上限 30 萬 → 80 萬；材料每小時 400 → 600、上限 6,000 → 8,000
    select * into b from ac_bucket where user_id = auth.uid() for update;
    if not found then insert into ac_bucket values (auth.uid(), 800000, 1500, 8000, 30, 200, now()) returning * into b; end if;
    hrs := greatest(0, extract(epoch from now() - b.t) / 3600);
    b.gold := least(800000, b.gold + 60000 * hrs); b.gems := least(1500, b.gems + 30 * hrs);
    b.mats := least(8000, b.mats + 600 * hrs); b.items := least(30, b.items + 2 * hrs); b.wpn := least(200, b.wpn + 30 * hrs);
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

-- 既有玩家的額度補滿到新上限
update ac_bucket set gold = 800000, mats = 8000;

notify pgrst, 'reload schema';
-- 執行完可以用這行確認，應該顯示 3.76：
-- select public.ac_version();
