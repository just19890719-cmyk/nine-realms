-- ===== 九界鐵匠 v3.85 首領改成「派武器駐守」（整段貼到 SQL Editor 執行一次） =====
-- 1) boss_post 資料表：每週每人最多 3 格駐守（武器快照、每小時傷害、開始時間）；只能透過下面的函式讀寫
-- 2) boss_post()：派武器駐守。武器必須在雲端存檔裡、不能正在村莊駐守或已經在另一格；每小時傷害＝lb_power（弱點 ×1.5），由伺服器算
-- 3) boss_unpost()：收回，把累積的傷害結算進 boss.dmg
-- 4) boss_board()：全服血條、排名改成「已結算傷害＋駐守中按時間累積」（最多算到週一 0 點）；血量隨參加人數變多
-- 5) 刪掉舊的 boss_hit（一天打 3 下）
-- 需要先跑過 07、08（boss 表、lb_power 含重鍊）。PR #23 的 09 先跑也可以，這份最後把版本設成 3.85。

create table if not exists public.boss_post (
  week int not null,
  user_id uuid not null references auth.users on delete cascade,
  slot smallint not null check (slot between 0 and 2),
  wid bigint not null,
  w jsonb not null,
  pw int not null,
  since timestamptz not null default now(),
  primary key (week, user_id, slot)
);
alter table public.boss_post enable row level security;

-- 本週結束時間（台灣時間下週一 00:00），與遊戲 evtNow().end 相同
create or replace function public.boss_wend(p_week int) returns timestamptz language sql immutable as $$
  select to_timestamp(((p_week + 1)::float8 * 7 * 86400) - 3 * 86400 - 8 * 3600) $$;

-- 駐守累積傷害：每小時 pw，算到現在或週末（取早的）
create or replace function public.boss_acc(p_pw int, p_since timestamptz, p_week int) returns bigint language sql stable as $$
  select floor(p_pw * greatest(0, extract(epoch from least(now(), boss_wend(p_week)) - p_since)) / 3600)::bigint $$;

-- 全服血量：至少 30 萬，每多一位參加者 +15 萬（想調整難度改這裡就好）
create or replace function public.boss_hp(p_players int) returns bigint language sql immutable as $$
  select greatest(300000, 150000 * coalesce(p_players, 0))::bigint $$;

drop function if exists public.boss_hit(text, jsonb, text);

drop function if exists public.boss_post(text, int, jsonb, text);
create or replace function public.boss_post(p_sid text, p_slot int, p_w jsonb, p_nick text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk int := boss_week(); w jsonb; sw jsonb; sv jsonb; pw int; bw record; bp record; is_weak boolean; old public.boss_post; v_wid bigint;
begin
  perform mk_check(p_sid);
  if extract(isodow from (now() at time zone 'Asia/Taipei')) < 5 then raise exception 'not boss time'; end if;
  if p_slot is null or p_slot not between 0 and 2 then raise exception 'bad slot'; end if;
  v_wid := (p_w->>'id')::bigint;
  w := jsonb_build_object('b', lb_bpid(p_w->>'b'), 'q', coalesce((p_w->>'q')::int, 0), 'lv', coalesce((p_w->>'lv')::int, 0), 'rf', coalesce((p_w->>'rf')::int, 0),
         'traits', coalesce(p_w->'traits', '[]'), 'ench', coalesce(p_w->'ench', '[]'));
  select s.data into sv from saves s where s.user_id = auth.uid();
  select x into sw from jsonb_array_elements(coalesce(sv->'weapons', '[]')) x
    where (x->>'id')::bigint = v_wid and lb_bpid(x->>'b') = w->>'b' and not coalesce((x->>'test')::boolean, false)
      and coalesce((x->>'q')::int, 0) = (w->>'q')::int and coalesce((x->>'lv')::int, 0) = (w->>'lv')::int
      and coalesce((x->>'rf')::int, 0) = (w->>'rf')::int
      and coalesce(x->'traits', '[]') = w->'traits' and coalesce(x->'ench', '[]') = w->'ench'
    limit 1;
  if sw is null then raise exception 'weapon not saved'; end if;
  -- 村莊駐守中、或本週已經在另一格
  if exists (select 1 from jsonb_array_elements(coalesce(sv->'villages', '[]')) v where jsonb_typeof(v) = 'object' and (v->>'weaponId') ~ '^\d+$' and (v->>'weaponId')::bigint = v_wid)
     or exists (select 1 from boss_post p where p.week = wk and p.user_id = auth.uid() and p.wid = v_wid and p.slot <> p_slot)
    then raise exception 'weapon busy'; end if;
  pw := lb_power(w);
  if pw is null then raise exception 'bad weapon'; end if;
  select * into bp from lb_bp(w->>'b');
  select * into bw from boss_weak(wk);
  is_weak := coalesce((bw.cat is not null and bp.cat = bw.cat)
    or (bw.aff is not null and (bp.inn_k = bw.aff or exists (select 1 from jsonb_array_elements(w->'ench') e where jsonb_typeof(e) = 'object' and e->>'k' = bw.aff))), false);
  pw := round(pw * (case when is_weak then 1.5 else 1 end));
  insert into boss (week, user_id, nick) values (wk, auth.uid(), left(p_nick, 16)) on conflict (week, user_id) do nothing;
  -- 這格原本有武器：先結算
  select * into old from boss_post p where p.week = wk and p.user_id = auth.uid() and p.slot = p_slot for update;
  if found then
    update boss b set dmg = b.dmg + boss_acc(old.pw, old.since, wk), updated_at = now() where b.week = wk and b.user_id = auth.uid();
    delete from boss_post p where p.week = wk and p.user_id = auth.uid() and p.slot = p_slot;
  end if;
  insert into boss_post (week, user_id, slot, wid, w, pw) values (wk, auth.uid(), p_slot, v_wid, w, pw);
  update boss b set nick = left(p_nick, 16), updated_at = now() where b.week = wk and b.user_id = auth.uid();
  return jsonb_build_object('pw', pw, 'weak', is_weak, 'week', wk);
end $$;
grant execute on function public.boss_post(text, int, jsonb, text) to authenticated;

drop function if exists public.boss_unpost(text, int);
create or replace function public.boss_unpost(p_sid text, p_slot int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk int := boss_week(); old public.boss_post; d bigint;
begin
  perform mk_check(p_sid);
  select * into old from boss_post p where p.week = wk and p.user_id = auth.uid() and p.slot = p_slot for update;
  if not found then raise exception 'no post'; end if;
  d := boss_acc(old.pw, old.since, wk);
  update boss b set dmg = b.dmg + d, updated_at = now() where b.week = wk and b.user_id = auth.uid();
  delete from boss_post p where p.week = wk and p.user_id = auth.uid() and p.slot = p_slot;
  return jsonb_build_object('dmg', d);
end $$;
grant execute on function public.boss_unpost(text, int) to authenticated;

drop function if exists public.boss_board();
drop function if exists public.boss_board(int);
-- p_week：只能查本週或上週（上週用來領排名獎勵）；不帶就是本週
create or replace function public.boss_board(p_week int default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare wk int := coalesce(p_week, boss_week()); res jsonb;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if wk not in (boss_week(), boss_week() - 1) then raise exception 'bad week'; end if;
  with d as (
    select b.user_id, b.nick, b.dmg + coalesce((select sum(boss_acc(p.pw, p.since, wk)) from boss_post p where p.week = wk and p.user_id = b.user_id), 0) as dmg,
           exists (select 1 from boss_post p where p.week = wk and p.user_id = b.user_id) as posted
    from boss b where b.week = wk),
  n as (select count(*) filter (where dmg > 0 or posted)::int as players from d),
  me as (select coalesce((select dmg from d where user_id = auth.uid()), 0) as dmg)
  select jsonb_build_object(
    'week', wk, 'hp', boss_hp((select players from n)),
    'total', coalesce((select sum(dmg) from d), 0),
    'players', (select players from n),
    'top', coalesce((select jsonb_agg(jsonb_build_object('nick', coalesce(nick, '無名鐵匠'), 'dmg', dmg, 'me', user_id = auth.uid()) order by dmg desc)
                     from (select * from d where dmg > 0 order by dmg desc limit 10) t), '[]'),
    'mine', (select dmg from me),
    'rank', (select count(*) + 1 from d where d.dmg > (select dmg from me)))
  into res;
  return res;
end $$;
grant execute on function public.boss_board(int) to authenticated;

-- 版本號（開發者工具「安全設定檢查」會讀）
create or replace function public.ac_version() returns text language sql immutable as $$ select '3.85'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

-- 執行完可以用這行確認：應該顯示 3.85
-- select public.ac_version();
