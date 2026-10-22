-- ===== 九界鐵匠 v3.87 首領改成「整週駐守」（整段貼到 SQL Editor 執行一次） =====
-- 規則（Mochi 2026-10-22 選）：首領整週開打，每週日 00:00（台灣時間）結算換下一隻；取消週一～四雙倍收成。
-- 1) boss_slot 資料表：每人最多 3 格駐守（武器快照、基礎戰力、開始時間）。結算後武器留著，下一週自動繼續打。
-- 2) boss_post()：派武器駐守。武器必須在雲端存檔裡、不能正在村莊駐守或已經在另一格；傷害由伺服器算
--    每小時傷害＝lb_power（打中「那一週首領」的弱點 ×1.5），每週分開計算
-- 3) boss_unpost()：收回，把累積的傷害結算進 boss.dmg（跨週的話上週、本週各自結算）
-- 4) boss_board()：全服血條、排名＝已結算＋駐守中按時間累積；排名附上每位玩家目前駐守的武器
-- 5) boss_week() 改成週日 00:00 換週；刪掉舊的 boss_hit（一天打 3 下）
-- 需要先跑過 07、08（boss 表、lb_power 含重鍊）。09 先跑也可以，這份最後把版本設成 3.87。

-- 週次：與遊戲 evtWeek() 相同（台灣時間週日 00:00 換週）
create or replace function public.boss_week() returns int language sql stable as $$
  select floor((extract(epoch from now()) * 1000 + 8 * 3600000 + 4 * 86400000) / (7 * 86400000)::float8)::int $$;
create or replace function public.boss_wstart(p_week int) returns timestamptz language sql immutable as $$
  select to_timestamp((p_week::float8 * 7 * 86400) - 4 * 86400 - 8 * 3600) $$;
create or replace function public.boss_wend(p_week int) returns timestamptz language sql immutable as $$
  select boss_wstart(p_week + 1) $$;

-- 舊版（測試用）的駐守表與函式
drop function if exists public.boss_hit(text, jsonb, text);
drop function if exists public.boss_post(text, int, jsonb, text);
drop function if exists public.boss_unpost(text, int);
drop function if exists public.boss_acc(int, timestamptz, int);
drop table if exists public.boss_post;

create table if not exists public.boss_slot (
  user_id uuid not null references auth.users on delete cascade,
  slot smallint not null check (slot between 0 and 2),
  wid bigint not null,
  w jsonb not null,
  pw0 int not null,
  since timestamptz not null default now(),
  primary key (user_id, slot)
);
alter table public.boss_slot enable row level security;

-- 某一週的每小時傷害：基礎戰力，打中那週首領的弱點 ×1.5
create or replace function public.boss_pw(p_w jsonb, p_pw0 int, p_week int) returns int language plpgsql stable set search_path = public as $$
declare bp record; bw record;
begin
  select * into bp from lb_bp(p_w->>'b');
  select * into bw from boss_weak(p_week);
  if coalesce((bw.cat is not null and bp.cat = bw.cat)
     or (bw.aff is not null and (bp.inn_k = bw.aff or exists (select 1 from jsonb_array_elements(coalesce(p_w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and e->>'k' = bw.aff))), false)
    then return round(p_pw0 * 1.5); end if;
  return p_pw0;
end $$;

-- 某一週的累積傷害：只算 since～現在 落在那一週裡的時間
create or replace function public.boss_acc(p_pw int, p_since timestamptz, p_week int) returns bigint language sql stable as $$
  select floor(p_pw * greatest(0, extract(epoch from least(now(), boss_wend(p_week)) - greatest(p_since, boss_wstart(p_week)))) / 3600)::bigint $$;

-- 全服血量：至少 30 萬，每多一位參加者 +15 萬（想調整難度改這裡就好）
create or replace function public.boss_hp(p_players int) returns bigint language sql immutable as $$
  select greatest(300000, 150000 * coalesce(p_players, 0))::bigint $$;

-- 結算一格（上週、本週各自加進 boss.dmg），然後刪掉
create or replace function public.boss_settle(p_slot int, p_nick text) returns bigint
language plpgsql security definer set search_path = public as $$
declare cur int := boss_week(); s public.boss_slot; k int; d bigint; got bigint := 0;
begin
  select * into s from boss_slot p where p.user_id = auth.uid() and p.slot = p_slot for update;
  if not found then return null; end if;
  for k in greatest(cur - 1, floor((extract(epoch from s.since) * 1000 + 8 * 3600000 + 4 * 86400000) / (7 * 86400000)::float8)::int) .. cur loop
    d := boss_acc(boss_pw(s.w, s.pw0, k), s.since, k);
    if d > 0 then
      insert into boss (week, user_id, nick) values (k, auth.uid(), left(p_nick, 16)) on conflict (week, user_id) do nothing;
      update boss b set dmg = b.dmg + d, updated_at = now() where b.week = k and b.user_id = auth.uid();
      if k = cur then got := d; end if;
    end if;
  end loop;
  delete from boss_slot p where p.user_id = auth.uid() and p.slot = p_slot;
  return got;
end $$;
revoke all on function public.boss_settle(int, text) from public, anon, authenticated;

create or replace function public.boss_post(p_sid text, p_slot int, p_w jsonb, p_nick text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk int := boss_week(); w jsonb; sw jsonb; sv jsonb; pw0 int; pw int; v_wid bigint;
begin
  perform mk_check(p_sid);
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
  -- 村莊駐守中、或已經在另一格
  if exists (select 1 from jsonb_array_elements(coalesce(sv->'villages', '[]')) v where jsonb_typeof(v) = 'object' and (v->>'weaponId') ~ '^\d+$' and (v->>'weaponId')::bigint = v_wid)
     or exists (select 1 from boss_slot p where p.user_id = auth.uid() and p.wid = v_wid and p.slot <> p_slot)
    then raise exception 'weapon busy'; end if;
  pw0 := lb_power(w);
  if pw0 is null then raise exception 'bad weapon'; end if;
  perform boss_settle(p_slot, p_nick);   -- 這格原本有武器：先結算
  insert into boss (week, user_id, nick) values (wk, auth.uid(), left(p_nick, 16)) on conflict (week, user_id) do update set nick = excluded.nick, updated_at = now();
  insert into boss_slot (user_id, slot, wid, w, pw0) values (auth.uid(), p_slot, v_wid, w, pw0);
  pw := boss_pw(w, pw0, wk);
  return jsonb_build_object('pw', pw, 'weak', pw <> pw0, 'week', wk);
end $$;
grant execute on function public.boss_post(text, int, jsonb, text) to authenticated;

create or replace function public.boss_unpost(p_sid text, p_slot int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d bigint;
begin
  perform mk_check(p_sid);
  d := boss_settle(p_slot, coalesce((select nickname from saves where user_id = auth.uid()), '無名鐵匠'));
  if d is null then raise exception 'no post'; end if;
  return jsonb_build_object('dmg', d);
end $$;
grant execute on function public.boss_unpost(text, int) to authenticated;

drop function if exists public.boss_board();
drop function if exists public.boss_board(int);
-- p_week：只能查本週或上週（上週用來領排名獎勵）；不帶就是本週。本週的前 10 名附上目前駐守的武器（ws）
create or replace function public.boss_board(p_week int default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cur int := boss_week(); wk int := coalesce(p_week, cur); res jsonb;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if wk not in (cur, cur - 1) then raise exception 'bad week'; end if;
  with u as (select user_id from boss where week = wk union select user_id from boss_slot where since < boss_wend(wk)),
  d as (
    select u.user_id, coalesce(b.nick, s.nickname, '無名鐵匠') as nick,
           coalesce(b.dmg, 0) + coalesce((select sum(boss_acc(boss_pw(p.w, p.pw0, wk), p.since, wk)) from boss_slot p where p.user_id = u.user_id), 0) as dmg
    from u left join boss b on b.week = wk and b.user_id = u.user_id left join saves s on s.user_id = u.user_id),
  n as (select count(*) filter (where dmg > 0)::int as players from d),
  me as (select coalesce((select dmg from d where user_id = auth.uid()), 0) as dmg)
  select jsonb_build_object(
    'week', wk, 'hp', boss_hp((select players from n)),
    'total', coalesce((select sum(dmg) from d), 0),
    'players', (select players from n),
    'top', coalesce((select jsonb_agg(jsonb_build_object('nick', nick, 'dmg', dmg, 'me', user_id = auth.uid(),
              'ws', case when wk = cur then coalesce((select jsonb_agg(p.w || jsonb_build_object('pw', boss_pw(p.w, p.pw0, wk)) order by p.slot) from boss_slot p where p.user_id = t.user_id), '[]') else '[]' end) order by dmg desc)
                     from (select * from d where dmg > 0 order by dmg desc limit 10) t), '[]'),
    'mine', (select dmg from me),
    'rank', (select count(*) + 1 from d where d.dmg > (select dmg from me)))
  into res;
  return res;
end $$;
grant execute on function public.boss_board(int) to authenticated;

-- 版本號（開發者工具「安全設定檢查」會讀）
create or replace function public.ac_version() returns text language sql immutable as $$ select '3.87'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

-- 執行完可以用這行確認：應該顯示 3.87
-- select public.ac_version();
