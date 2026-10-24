-- ===== 九界鐵匠 v4.15 神明武器＋神格覺醒（整段貼到 SQL Editor 執行一次） =====
-- 要先跑過 08、09、12、14、15。
-- 1) 兩把神明武器：g_hofund 霍夫德之劍（劍，基礎 15，倍率 12，天生神聖 15）、g_skadi 斯卡蒂之弓（弓，基礎 12，倍率 18，天生霜寒 12）
--    ac_mult（強化／附魔費用）、lb_bp（排行榜、首領傷害、跑馬燈公告都用這個）要認得它們
-- 2) lb_power：神明武器強化到 +11 以上，攻擊力 ×1.1（神格覺醒「九母之子／冬之女神」）
-- 3) boss_pw：神明武器強化到 +13 以上，首領傷害 ×1.15（神格覺醒「加拉爾號角／狼嚎之山」）
-- 4) chat_titles：新稱號「守望者」（霍夫德之劍 +15）、「雪山之主」（斯卡蒂之弓 +15）
-- save_game 不用改：遺物是一般材料（材料總量檢查已涵蓋），安定值固定 6（sql/15）。

create or replace function public.ac_version() returns text language sql immutable as $$ select '4.15'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

create or replace function public.ac_mult(p_b text) returns float8 language sql immutable as $$
  select case when p_b = 'g_hofund' then 12 when p_b = 'g_skadi' then 18
    when p_b like 't2\_%' then 2.5 when p_b like 't3\_%' then 6 when p_b like 'm\_%' then 11 when p_b like 't4\_%' then 16 else 1 end::float8 $$;
revoke all on function public.ac_mult(text) from public;

create or replace function public.lb_bp(p_b text) returns table(base float8, mult float8, cat text, inn_k text, inn_v float8) language sql immutable as $$
  -- mult：階級倍率（與遊戲 TIERS.mult 相同；神明武器每把不同）
  select x.base::float8, (case when x.id = 'g_hofund' then 12 when x.id = 'g_skadi' then 18
    when x.id like 't2\_%' then 2.5 when x.id like 't3\_%' then 6 when x.id like 'm\_%' then 11 when x.id like 't4\_%' then 16 else 1 end)::float8, x.cat, x.inn_k, x.inn_v::float8 from (values
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
    ('t4_hammer',17,'hammer',null,0),('t4_polearm',14,'polearm',null,0),('t4_dagger',11,'dagger',null,0),('t4_shield',12,'shield',null,0),
    ('g_hofund',15,'sword','holy',15),('g_skadi',12,'bow','frost',12)
  ) x(id, base, cat, inn_k, inn_v) where x.id = public.lb_bpid(p_b) $$;

create or replace function public.lb_power(w jsonb) returns int language plpgsql immutable set search_path = public as $$
declare bp record; lv int := coalesce((w->>'lv')::int, 0); qm float8; em float8; rm float8; el float8; aw float8 := 1; rf int := least(5, greatest(0, coalesce((w->>'rf')::int, 0)));
begin
  select * into bp from lb_bp(w->>'b');
  if not found then return null; end if;
  qm := case coalesce((w->>'q')::int, 0) when 1 then 1.2 when 2 then 1.45 when 3 then 1.8 when 4 then 2.3 else 1 end;
  em := case when lv <= 6 then 1 + 0.1::float8 * lv else 1.6::float8 + 0.18::float8 * (lv - 6) end;
  rm := 1 + least(50, coalesce((select sum((t->>'v')::float8) from jsonb_array_elements(coalesce(w->'traits', '[]')) t where t->>'k' = 'runic'), 0)) / 100;
  el := (case when bp.inn_k in ('flame','frost','thunder','venom','holy') then bp.inn_v else 0 end)
      + coalesce((select sum((e->>'v')::float8) from jsonb_array_elements(coalesce(w->'ench', '[]')) e
                  where jsonb_typeof(e) = 'object' and e->>'k' in ('flame','frost','thunder','venom','holy')), 0) * rm;
  if bp.mult < 6 then rf := 0; end if;   -- v3.76 重鍊只算龍鱗以上
  if lb_bpid(w->>'b') in ('g_hofund','g_skadi') and lv >= 11 then aw := 1.1; end if;   -- v4.15 神格覺醒攻擊力 +10%
  return floor(bp.base * bp.mult * qm * em * (1 + el / 100) * (1 + 0.12 * rf) * aw + 0.5)::int;
end $$;

-- 首領每小時傷害：弱點 ×1.5，再加公會加成（武器資料裡的 gb）；v4.15 神明武器 +13 以上再 ×1.15
create or replace function public.boss_pw(p_w jsonb, p_pw0 int, p_week int) returns int language plpgsql stable set search_path = public as $$
declare bp record; bw record; k float8 := 1;
begin
  select * into bp from lb_bp(p_w->>'b');
  select * into bw from boss_weak(p_week);
  if coalesce((bw.cat is not null and bp.cat = bw.cat)
     or (bw.aff is not null and (bp.inn_k = bw.aff or exists (select 1 from jsonb_array_elements(coalesce(p_w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and e->>'k' = bw.aff))), false)
    then k := 1.5; end if;
  if lb_bpid(p_w->>'b') in ('g_hofund','g_skadi') and coalesce((p_w->>'lv')::int, 0) >= 13 then k := k * 1.15; end if;
  return round(p_pw0 * k * (1 + coalesce((p_w->>'gb')::float8, 0) / 100));
end $$;

-- 已解鎖的稱號（與遊戲 TITLES 相同）
create or replace function public.chat_titles(p_uid uuid, d jsonb) returns text[]
language sql stable security definer set search_path = public as $$
  select array_remove(array[
    case when coalesce((d->'stats'->>'maxLv')::int, 0) >= 12 then 'smith12' end,
    case when coalesce((d->'stats'->'forged'->>4)::int, 0) > 0 then 'legend' end,
    case when (select count(*) from jsonb_array_elements(coalesce(d->'villages', '[]')) v where v->>'status' = 'cleared') >= 10 then 'guard' end,
    case when coalesce(d->'villages'->10->>'status', '') = 'cleared' then 'giant' end,
    case when exists (select 1 from boss b where b.user_id = p_uid and b.week < boss_week() and b.dmg > 0
                      and (select count(*) from boss b2 where b2.week = b.week and b2.dmg > b.dmg) < 3) then 'dragon' end,
    case when (select count(*) from pc_like where to_user = p_uid) >= 30 then 'pop' end,
    case when exists (select 1 from jsonb_array_elements(coalesce(d->'weapons', '[]')) x where lb_bpid(x->>'b') = 'g_hofund'
                      and coalesce((x->>'lv')::int, 0) >= 15 and not coalesce((x->>'test')::boolean, false)) then 'watcher' end,
    case when exists (select 1 from jsonb_array_elements(coalesce(d->'weapons', '[]')) x where lb_bpid(x->>'b') = 'g_skadi'
                      and coalesce((x->>'lv')::int, 0) >= 15 and not coalesce((x->>'test')::boolean, false)) then 'skadi' end
  ], null)
$$;
revoke all on function public.chat_titles(uuid, jsonb) from public, anon, authenticated;

-- 確認：跑完後執行下面這行，應該顯示 4.15、569、18（普通霍夫德之劍 +11：15×12×2.5×1.15×1.1＝569）
-- select ac_version(), lb_power('{"b":"g_hofund","q":0,"lv":11}'::jsonb), ac_mult('g_skadi');
