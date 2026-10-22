-- ===== 九界鐵匠 v3.65 排行榜戰力改由伺服器計算（整段貼到 SQL Editor 執行一次） =====
-- 1) 戰力不再相信手機傳來的數字，伺服器用武器內容自己算（公式與遊戲 power() 相同）
-- 2) 上傳的武器必須真的在雲端存檔裡（品質、強化等級、特性、附魔都要一樣），類別要符合村莊
-- 3) 現有排行榜紀錄依武器內容重新計算一次戰力

-- 圖紙資料（與遊戲 BPS 相同；舊圖紙 id 先換成保留的那把）
create or replace function public.lb_bpid(p_b text) returns text language sql immutable as $$
  select case p_b when 't1_handaxe' then 't1_woodaxe' when 't1_shortspear' then 't1_farmspear' when 't2_daneaxe' then 't2_wolfaxe'
    when 't2_broadsword' then 't2_longsword' when 't2_warspear' then 't2_glaive' when 't2_seax' then 't2_twindagger'
    when 't3_doubleaxe' then 't3_greataxe' when 't3_saber' then 't3_greatsword' when 't3_spear' then 't3_halberd' when 't3_scythe' then 't3_halberd'
    else p_b end $$;

create or replace function public.lb_bp(p_b text) returns table(base float8, cat text, inn_k text, inn_v float8) language sql immutable as $$
  select x.base::float8, x.cat, x.inn_k, x.inn_v::float8 from (values
    ('t1_woodaxe',14,'axe',null,0),('t1_farmspear',11,'polearm',null,0),('t1_pickaxe',11,'tool',null,0),('t1_huntbow',10,'bow',null,0),
    ('t1_sling',7,'throw',null,0),('t1_huntknife',9,'dagger',null,0),('t1_ironsword',12,'sword',null,0),('t1_roundshield',10,'shield',null,0),
    ('t1_crossbow',13,'crossbow',null,0),('t1_ironhammer',16,'hammer',null,0),
    ('t2_wolfaxe',15,'axe',null,0),('t2_longsword',13,'sword',null,0),('t2_longbow',11,'bow',null,0),('t2_crossbow',13,'crossbow',null,0),
    ('t2_glaive',13,'polearm',null,0),('t2_twindagger',10,'dagger',null,0),('t2_warhammer',16,'hammer',null,0),('t2_throwaxe',9,'throw',null,0),
    ('t2_kiteshield',11,'shield',null,0),
    ('t3_greataxe',16,'axe',null,0),('t3_greatsword',15,'sword',null,0),('t3_bow',12,'bow',null,0),('t3_crossbow',14,'crossbow',null,0),
    ('t3_halberd',14,'polearm',null,0),('t3_hammer',17,'hammer',null,0),('t3_dagger',10,'dagger',null,0),('t3_shield',12,'shield',null,0),
    ('m_fenrir',16,'axe','swift',15),('m_frostgiant',17,'hammer','giant',30),('m_firegiant',15,'sword','flame',20),
    ('m_nidhogg',14,'polearm','dragon',35),('m_iceraven',12,'bow','frost',20),('m_serpent',13,'polearm','loot',30)
  ) x(id, base, cat, inn_k, inn_v) where x.id = public.lb_bpid(p_b) $$;

-- 武器戰力：Math.round(base × 階級倍率 × 品質倍率 × 強化倍率 × (1 + (火焰+冰霜)/100))
create or replace function public.lb_power(w jsonb) returns int language plpgsql immutable set search_path = public as $$
declare bp record; lv int := coalesce((w->>'lv')::int, 0); qm float8; em float8; rm float8; fl float8; fr float8;
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
  return floor(bp.base * ac_mult(lb_bpid(w->>'b')) * qm * em * (1 + (fl + fr) / 100) + 0.5)::int;
end $$;

-- 上傳排行榜：回傳伺服器算出的戰力
drop function if exists public.lb_submit(int, int, jsonb, text);
create or replace function public.lb_submit(p_village int, p_p int, p_w jsonb, p_nick text) returns int
language plpgsql security definer set search_path = public as $$
declare w jsonb; sw jsonb; pw int;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if p_village is null or p_village not between 0 and 9 then raise exception 'bad village'; end if;
  w := jsonb_build_object('b', lb_bpid(p_w->>'b'), 'q', coalesce((p_w->>'q')::int, 0), 'lv', coalesce((p_w->>'lv')::int, 0),
         'traits', coalesce(p_w->'traits', '[]'), 'ench', coalesce(p_w->'ench', '[]'));
  if (select cat from lb_bp(w->>'b')) is distinct from
     (array['axe','polearm','bow','sword','shield','crossbow','hammer','axe','sword','polearm'])[p_village + 1]
    then raise exception 'bad weapon'; end if;
  -- 武器必須已經存進雲端存檔（剛鍛造的武器要等下一次自動存檔，前端會稍後重送）
  select x into sw from saves s, jsonb_array_elements(coalesce(s.data->'weapons', '[]')) x
    where s.user_id = auth.uid() and lb_bpid(x->>'b') = w->>'b'
      and coalesce((x->>'q')::int, 0) = (w->>'q')::int and coalesce((x->>'lv')::int, 0) = (w->>'lv')::int
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

-- 現有紀錄依武器內容重新計算戰力（看不懂的武器保留原數字）
update public.lb set p = coalesce(public.lb_power(w), p);

-- 版本號（開發者工具「安全設定檢查」會讀）
create or replace function public.ac_version() returns text language sql immutable as $$ select '3.65'::text $$;
grant execute on function public.ac_version() to anon, authenticated;
