-- ===== 諸神鐵匠 v4.24 2-10 換成雷神索爾（整段貼到 SQL Editor 執行一次） =====
-- 要先跑過 16_god_weapons_v4.15.sql。
-- 神明武器 g_skadi 改成「索爾之錘」：類別 弓 → 戰錘、天生詞條 霜寒 12 → 雷霆 12（基礎 12、倍率 18 不變）。
-- 代號 g_skadi／srelic／稱號 skadi 都沿用，所以 ac_mult、lb_power、boss_pw、chat_titles、save_game 都不用改，只換 lb_bp 這一行。

create or replace function public.ac_version() returns text language sql immutable as $$ select '4.24'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

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
    ('g_hofund',15,'sword','holy',15),('g_skadi',12,'hammer','thunder',12)
  ) x(id, base, cat, inn_k, inn_v) where x.id = public.lb_bpid(p_b) $$;

-- 確認：跑完後執行下面這行，應該顯示 4.24、hammer、thunder
-- select ac_version(), (select cat from lb_bp('g_skadi')), (select inn_k from lb_bp('g_skadi'));
