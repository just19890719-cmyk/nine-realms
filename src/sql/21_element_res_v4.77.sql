-- ===== 諸神鐵匠 v4.77 同屬性抗性（整段貼到 SQL Editor 執行一次） =====
-- 要先跑過 18。只改每週首領（目前首領討伐關閉中，BOSS_OFF），不改 save_game、lb_power、boss_weak。
-- boss_pw：打中弱點 ×1.1／1.2／1.3；跟首領同屬性（首領有抗性）×0.9／0.8／0.7（看 ench[0].v）
-- 首領屬性＝弱點的對手（fire⇄ice、bolt⇄toxic、light⇄dark），從 boss_weak 的 aff 反推

create or replace function public.ac_version() returns text language sql immutable as $$ select '4.77'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

create or replace function public.boss_pw(p_w jsonb, p_pw0 int, p_week int) returns int language plpgsql stable set search_path = public as $$
declare bw record; e jsonb := p_w->'ench'->0; k float8 := 1; t int; bel text;
begin
  select * into bw from boss_weak(p_week);
  bel := case bw.aff when 'fire' then 'ice' when 'ice' then 'fire' when 'bolt' then 'toxic' when 'toxic' then 'bolt' when 'light' then 'dark' when 'dark' then 'light' end;
  if jsonb_typeof(e) = 'object' then
    t := least(3, greatest(1, coalesce((e->>'v')::int, 1)));
    if e->>'k' = bw.aff then k := 1 + 0.1 * t;
    elsif e->>'k' = bel then k := 1 - 0.1 * t; end if;
  end if;
  if lb_bpid(p_w->>'b') in ('g_hofund','g_skadi') and coalesce((p_w->>'lv')::int, 0) >= 13 then k := k * 1.15; end if;
  return round(p_pw0 * k * (1 + coalesce((p_w->>'gb')::float8, 0) / 100));
end $$;

-- 確認：應該顯示 4.77、3510（永凍之霜打蘇爾特 ×1.3）、1890（滅世之焰打蘇爾特 ×0.7）
-- select ac_version(), boss_pw('{"b":"t1_woodaxe","lv":0,"ench":[{"k":"ice","v":3}]}'::jsonb, 2700, 2), boss_pw('{"b":"t1_woodaxe","lv":0,"ench":[{"k":"fire","v":3}]}'::jsonb, 2700, 2);
