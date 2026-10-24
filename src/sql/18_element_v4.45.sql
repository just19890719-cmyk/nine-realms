-- ===== 九界鐵匠 v4.45 屬性附魔與怪物弱點（整段貼到 SQL Editor 執行一次） =====
-- 要先跑過 08、09、10、14、16。
-- 1) lb_power：舊 12 種附魔、圖紙天生詞條全部刪除，攻擊力不再算附魔（屬性附魔不加攻擊力）
-- 2) boss_weak：每週首領的弱點改成屬性（fire 烈焰／ice 霜寒／bolt 雷霆／toxic 劇毒／light 神聖／dark 暗影），順序和遊戲 EVT_BOSS 相同
-- 3) boss_pw：打中弱點的倍率看屬性附魔等級（ench[0].v＝1／2／3 → ×1.2／1.4／1.6），不再看武器類別和天生詞條
-- save_game 不用改：屬性附魔存在 ench[0]，v 只有 1～3（小於 40 的上限），每次附魔照舊算金幣花費；舊附魔清空不會被擋。

create or replace function public.ac_version() returns text language sql immutable as $$ select '4.45'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

create or replace function public.lb_power(w jsonb) returns int language plpgsql immutable set search_path = public as $$
declare bp record; lv int := coalesce((w->>'lv')::int, 0); qm float8; em float8; aw float8 := 1; rf int := least(5, greatest(0, coalesce((w->>'rf')::int, 0)));
begin
  select * into bp from lb_bp(w->>'b');
  if not found then return null; end if;
  qm := case coalesce((w->>'q')::int, 0) when 1 then 1.2 when 2 then 1.45 when 3 then 1.8 when 4 then 2.3 else 1 end;
  em := case when lv <= 6 then 1 + 0.1::float8 * lv else 1.6::float8 + 0.18::float8 * (lv - 6) end;
  if bp.mult < 6 then rf := 0; end if;   -- v3.76 重鍊只算龍鱗以上
  if lb_bpid(w->>'b') in ('g_hofund','g_skadi') and lv >= 11 then aw := 1.1; end if;   -- v4.15 神格覺醒攻擊力 +10%
  return floor(bp.base * bp.mult * qm * em * (1 + 0.12 * rf) * aw + 0.5)::int;   -- v4.45 附魔、天生詞條不算攻擊力
end $$;

-- 每週首領弱點：芬里爾、索列姆、蘇爾特、耶夢加得、尼德霍格（cat 留著給舊函式用，一律 null）
create or replace function public.boss_weak(p_week int) returns table(cat text, aff text) language sql immutable as $$
  select x.cat, x.aff from (values (0, null::text, 'light'), (1, null, 'fire'), (2, null, 'ice'), (3, null, 'bolt'), (4, null, 'light')) x(i, cat, aff)
  where x.i = ((p_week % 5) + 5) % 5 $$;

-- 首領每小時傷害：打中弱點 ×1.2／1.4／1.6（看屬性附魔等級），再加公會加成；神明武器 +13 以上再 ×1.15
create or replace function public.boss_pw(p_w jsonb, p_pw0 int, p_week int) returns int language plpgsql stable set search_path = public as $$
declare bw record; e jsonb := p_w->'ench'->0; k float8 := 1;
begin
  select * into bw from boss_weak(p_week);
  if jsonb_typeof(e) = 'object' and e->>'k' = bw.aff then
    k := 1 + 0.2 * least(3, greatest(1, coalesce((e->>'v')::int, 1)));
  end if;
  if lb_bpid(p_w->>'b') in ('g_hofund','g_skadi') and coalesce((p_w->>'lv')::int, 0) >= 13 then k := k * 1.15; end if;
  return round(p_pw0 * k * (1 + coalesce((p_w->>'gb')::float8, 0) / 100));
end $$;

-- 確認：應該顯示 4.45、418（舊附魔不再加攻擊力）、4320（永凍之霜打蘇爾特 ×1.6）
-- select ac_version(), lb_power('{"b":"g_hofund","q":0,"lv":10,"ench":[{"k":"flame","v":12}]}'::jsonb), boss_pw('{"b":"t1_woodaxe","lv":0,"ench":[{"k":"ice","v":3}]}'::jsonb, 2700, 2);
