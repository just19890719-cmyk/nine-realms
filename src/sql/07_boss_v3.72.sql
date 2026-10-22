-- ===== 九界鐵匠 v3.72 每週首領討伐：全服血條（整段貼到 SQL Editor 執行一次） =====
-- 1) boss 資料表：每週每人一列（累積傷害、今天出擊次數）；只能透過下面的函式讀寫
-- 2) boss_hit：傷害由伺服器用武器內容計算（lb_power，與排行榜相同），武器必須在雲端存檔裡；每天最多 3 次、只在週五～週日（台灣時間）
-- 3) boss_board：全服累積傷害、血量、參加人數、前 10 名、自己的名次（可查本週或上週，上週用來領排名獎勵）
-- 需要先跑過 04（lb_power、lb_bp、lb_bpid），並且要在 06 之後執行（06 把版本設成 3.70，這份設成 3.72）。

create table if not exists public.boss (
  week int not null,
  user_id uuid not null references auth.users on delete cascade,
  nick text,
  dmg bigint not null default 0,
  day date,
  hits int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (week, user_id)
);
alter table public.boss enable row level security;

-- 週次：與遊戲 evtWeek() 相同（台灣時間週一 00:00 換週）
create or replace function public.boss_week() returns int language sql stable as $$
  select floor((extract(epoch from now()) * 1000 + 8 * 3600000 + 3 * 86400000) / (7 * 86400000)::float8)::int $$;

-- 全服血量（想調整難度改這裡就好）
create or replace function public.boss_hp() returns bigint language sql immutable as $$ select 100000::bigint $$;

-- 首領輪替與弱點（順序與遊戲 EVT_BOSS 相同：芬里爾、索列姆、蘇爾特、耶夢加得、尼德霍格）
create or replace function public.boss_weak(p_week int) returns table(cat text, aff text) language sql immutable as $$
  select x.cat, x.aff from (values (0, 'axe', null), (1, null, 'giant'), (2, null, 'frost'), (3, 'crossbow', null), (4, null, 'dragon')) x(i, cat, aff)
  where x.i = ((p_week % 5) + 5) % 5 $$;

drop function if exists public.boss_hit(text, jsonb, text);
create or replace function public.boss_hit(p_sid text, p_w jsonb, p_nick text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk int := boss_week(); d date := (now() at time zone 'Asia/Taipei')::date;
  w jsonb; sw jsonb; pw int; bw record; bp record; is_weak boolean; v_dmg bigint; r public.boss;
begin
  perform mk_check(p_sid);
  if extract(isodow from (now() at time zone 'Asia/Taipei')) < 5 then raise exception 'not boss time'; end if;
  w := jsonb_build_object('b', lb_bpid(p_w->>'b'), 'q', coalesce((p_w->>'q')::int, 0), 'lv', coalesce((p_w->>'lv')::int, 0),
         'traits', coalesce(p_w->'traits', '[]'), 'ench', coalesce(p_w->'ench', '[]'));
  select x into sw from saves s, jsonb_array_elements(coalesce(s.data->'weapons', '[]')) x
    where s.user_id = auth.uid() and lb_bpid(x->>'b') = w->>'b' and not coalesce((x->>'test')::boolean, false)
      and coalesce((x->>'q')::int, 0) = (w->>'q')::int and coalesce((x->>'lv')::int, 0) = (w->>'lv')::int
      and coalesce(x->'traits', '[]') = w->'traits' and coalesce(x->'ench', '[]') = w->'ench'
    limit 1;
  if sw is null then raise exception 'weapon not saved'; end if;
  pw := lb_power(w);
  if pw is null then raise exception 'bad weapon'; end if;
  select * into bp from lb_bp(w->>'b');
  select * into bw from boss_weak(wk);
  is_weak := coalesce((bw.cat is not null and bp.cat = bw.cat)
    or (bw.aff is not null and (bp.inn_k = bw.aff or exists (select 1 from jsonb_array_elements(w->'ench') e where jsonb_typeof(e) = 'object' and e->>'k' = bw.aff))), false);
  v_dmg := greatest(1, round(pw * (case when is_weak then 1.5 else 1 end) * (0.9 + random() * 0.2)));
  insert into boss (week, user_id, nick, day) values (wk, auth.uid(), left(p_nick, 16), d) on conflict (week, user_id) do nothing;
  select * into r from boss b where b.week = wk and b.user_id = auth.uid() for update;
  if r.day is distinct from d then r.hits := 0; end if;
  if r.hits >= 3 then raise exception 'no hits'; end if;
  update boss b set dmg = r.dmg + v_dmg, hits = r.hits + 1, day = d, nick = left(p_nick, 16), updated_at = now()
    where b.week = wk and b.user_id = auth.uid();
  return jsonb_build_object('dmg', v_dmg, 'weak', is_weak, 'week', wk, 'hits', r.hits + 1);
end $$;
grant execute on function public.boss_hit(text, jsonb, text) to authenticated;

drop function if exists public.boss_board();
drop function if exists public.boss_board(int);
-- p_week：只能查本週或上週（上週用來領排名獎勵）；不帶就是本週
create or replace function public.boss_board(p_week int default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare wk int := coalesce(p_week, boss_week()); res jsonb;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if wk not in (boss_week(), boss_week() - 1) then raise exception 'bad week'; end if;
  select jsonb_build_object(
    'week', wk, 'hp', boss_hp(),
    'total', coalesce((select sum(dmg) from boss where week = wk), 0),
    'players', (select count(*) from boss where week = wk and dmg > 0),
    'top', coalesce((select jsonb_agg(jsonb_build_object('nick', coalesce(nick, '無名鐵匠'), 'dmg', dmg, 'me', user_id = auth.uid()) order by dmg desc)
                     from (select * from boss where week = wk and dmg > 0 order by dmg desc limit 10) t), '[]'),
    'mine', coalesce((select dmg from boss where week = wk and user_id = auth.uid()), 0),
    'rank', (select count(*) + 1 from boss where week = wk and dmg > coalesce((select dmg from boss where week = wk and user_id = auth.uid()), 0)))
  into res;
  return res;
end $$;
grant execute on function public.boss_board(int) to authenticated;

-- 版本號（開發者工具「安全設定檢查」會讀）
create or replace function public.ac_version() returns text language sql immutable as $$ select '3.72'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

-- 執行完可以用這行確認：應該顯示 3.72
-- select public.ac_version();
