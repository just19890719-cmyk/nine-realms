-- ===== 九界鐵匠 v3.84 附魔 12 種（整段貼到 SQL Editor 執行一次） =====
-- 要先跑過 08（lb_power 含重鍊）。
-- 1) lb_power：戰力類附魔從烈焰、霜寒擴充成 烈焰／霜寒／雷霆／劇毒／神聖（排行榜和首領傷害都用這個；鍵要和遊戲 AFFIX g:'pow' 一致）
-- save_game 不用改：新附魔數值都 ≤40，原本的檢查就涵蓋。

create or replace function public.ac_version() returns text language sql immutable as $$ select '3.84'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

create or replace function public.lb_power(w jsonb) returns int language plpgsql immutable set search_path = public as $$
declare bp record; lv int := coalesce((w->>'lv')::int, 0); qm float8; em float8; rm float8; el float8; rf int := least(5, greatest(0, coalesce((w->>'rf')::int, 0)));
begin
  select * into bp from lb_bp(w->>'b');
  if not found then return null; end if;
  qm := case coalesce((w->>'q')::int, 0) when 1 then 1.2 when 2 then 1.45 when 3 then 1.8 when 4 then 2.3 else 1 end;
  em := case when lv <= 6 then 1 + 0.1::float8 * lv else 1.6::float8 + 0.18::float8 * (lv - 6) end;
  rm := 1 + least(50, coalesce((select sum((t->>'v')::float8) from jsonb_array_elements(coalesce(w->'traits', '[]')) t where t->>'k' = 'runic'), 0)) / 100;
  el := (case when bp.inn_k in ('flame','frost','thunder','venom','holy') then bp.inn_v else 0 end)
      + coalesce((select sum((e->>'v')::float8) from jsonb_array_elements(coalesce(w->'ench', '[]')) e
                  where jsonb_typeof(e) = 'object' and e->>'k' in ('flame','frost','thunder','venom','holy')), 0) * rm;
  if bp.mult < 6 then rf := 0; end if;   -- v3.76 重鍊只算龍鱗／神器
  return floor(bp.base * bp.mult * qm * em * (1 + el / 100) * (1 + 0.12 * rf) + 0.5)::int;
end $$;

-- 確認：跑完後執行 select ac_version(); 應該顯示 3.84
