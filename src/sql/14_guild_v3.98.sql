-- ===== 九界鐵匠 v3.98 好友＋公會（整段貼到 SQL Editor 執行一次） =====
-- 需要先執行過 10、11、12。這段不改 save_game、不改 ac_version，用 select chat_version(); 確認（應該顯示 3.98）。
-- 1) 好友：互加好友（申請／同意）、最多 30 位、看上線時間（不送禮）
-- 2) 公會：建立（50,000 金幣、鐵匠 Lv.5）、自由加入或審核、會長／副會長、公告、踢人、轉讓會長、公會聊天
-- 3) 捐獻：每天 3 次（金幣／鐵礦／鑽石），由伺服器直接從雲端存檔扣，變成公會經驗和個人貢獻
-- 4) 公會等級 1～10：狩獵金幣加成、首領傷害加成（伺服器算進首領每小時傷害）、成員上限 20／30／40
-- 5) 公會商店：個人貢獻換祝福石、防爆卷、符文碎片（每週限量，由伺服器直接加進雲端存檔）
-- 6) 離開公會後 12 小時內不能加入或建立別的公會；會長 7 天沒上線，會自動轉給最活躍的成員

create or replace function public.chat_version() returns text language sql immutable as $$ select '3.98'::text $$;
grant execute on function public.chat_version() to anon, authenticated;

-- ===================== 資料表 =====================
create table if not exists public.guild (
  id bigserial primary key,
  name text not null,
  emb text not null,
  leader uuid not null,
  notice text not null default '',
  join_mode text not null default 'open' check (join_mode in ('open', 'apply')),
  exp bigint not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists guild_name_idx on public.guild (lower(name));
alter table public.guild enable row level security;

create table if not exists public.guild_mem (
  user_id uuid primary key,
  guild_id bigint not null references public.guild on delete cascade,
  role text not null default 'mem' check (role in ('lead', 'vice', 'mem')),
  joined_at timestamptz not null default now(),
  wk int not null default 0,
  wk_pts int not null default 0,
  tot_pts bigint not null default 0
);
create index if not exists guild_mem_g_idx on public.guild_mem (guild_id);
alter table public.guild_mem enable row level security;

create table if not exists public.guild_app (
  guild_id bigint not null references public.guild on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);
create index if not exists guild_app_u_idx on public.guild_app (user_id);
alter table public.guild_app enable row level security;

-- 個人公會資料（離開公會也保留）：可花的貢獻點、今天捐了幾次、這週商店買了幾個、離開時間
create table if not exists public.gd_user (
  user_id uuid primary key,
  pts bigint not null default 0,
  don_day date,
  don_n int not null default 0,
  shop_wk int not null default 0,
  shop jsonb not null default '{}',
  left_at timestamptz
);
alter table public.gd_user enable row level security;

create table if not exists public.friend (
  a uuid not null,
  b uuid not null,
  created_at timestamptz not null default now(),
  primary key (a, b)
);
alter table public.friend enable row level security;

create table if not exists public.friend_req (
  from_user uuid not null,
  to_user uuid not null,
  created_at timestamptz not null default now(),
  primary key (from_user, to_user)
);
create index if not exists friend_req_to_idx on public.friend_req (to_user);
alter table public.friend_req enable row level security;

-- ===================== 數值（要和遊戲 GD_LV／GD_DON／GD_SHOP 一致） =====================
-- 公會等級：累積經驗 0／1,000／3,000／6,000／10,000／16,000／24,000／35,000／50,000／70,000
create or replace function public.gd_lv(p_exp bigint) returns int language sql immutable as $$
  select count(*)::int from unnest(array[0, 1000, 3000, 6000, 10000, 16000, 24000, 35000, 50000, 70000]) t where t <= coalesce(p_exp, 0) $$;
create or replace function public.gd_gold(p_lv int) returns int language sql immutable as $$
  select (array[0, 2, 2, 4, 4, 4, 6, 6, 8, 8])[greatest(1, least(10, p_lv))] $$;
create or replace function public.gd_boss(p_lv int) returns int language sql immutable as $$
  select (array[0, 0, 3, 3, 3, 5, 5, 5, 5, 8])[greatest(1, least(10, p_lv))] $$;
create or replace function public.gd_cap(p_lv int) returns int language sql immutable as $$
  select case when p_lv >= 8 then 40 when p_lv >= 5 then 30 else 20 end $$;

-- 這位玩家目前的首領傷害加成（%）
create or replace function public.gd_boss_of(p_uid uuid) returns int language sql stable security definer set search_path = public as $$
  select coalesce((select gd_boss(gd_lv(g.exp)) from guild_mem m join guild g on g.id = m.guild_id where m.user_id = p_uid), 0) $$;
revoke all on function public.gd_boss_of(uuid) from public, anon, authenticated;

-- 把公會加成寫進首領駐守中的武器（加入／離開／升級時呼叫）
create or replace function public.gd_boss_sync(p_uid uuid) returns void language sql security definer set search_path = public as $$
  update boss_slot set w = w || jsonb_build_object('gb', gd_boss_of(p_uid)) where user_id = p_uid $$;
revoke all on function public.gd_boss_sync(uuid) from public, anon, authenticated;

-- 首領每小時傷害：弱點 ×1.5，再加公會加成（武器資料裡的 gb）
create or replace function public.boss_pw(p_w jsonb, p_pw0 int, p_week int) returns int language plpgsql stable set search_path = public as $$
declare bp record; bw record; k float8 := 1;
begin
  select * into bp from lb_bp(p_w->>'b');
  select * into bw from boss_weak(p_week);
  if coalesce((bw.cat is not null and bp.cat = bw.cat)
     or (bw.aff is not null and (bp.inn_k = bw.aff or exists (select 1 from jsonb_array_elements(coalesce(p_w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and e->>'k' = bw.aff))), false)
    then k := 1.5; end if;
  return round(p_pw0 * k * (1 + coalesce((p_w->>'gb')::float8, 0) / 100));
end $$;

create or replace function public.boss_post(p_sid text, p_slot int, p_w jsonb, p_nick text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare wk int := boss_week(); w jsonb; sw jsonb; sv jsonb; pw0 int; pw int; pw1 int; v_wid bigint;
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
  if exists (select 1 from jsonb_array_elements(coalesce(sv->'villages', '[]')) v where jsonb_typeof(v) = 'object' and (v->>'weaponId') ~ '^\d+$' and (v->>'weaponId')::bigint = v_wid)
     or exists (select 1 from boss_slot p where p.user_id = auth.uid() and p.wid = v_wid and p.slot <> p_slot)
    then raise exception 'weapon busy'; end if;
  pw0 := lb_power(w);
  if pw0 is null then raise exception 'bad weapon'; end if;
  perform boss_settle(p_slot, p_nick);
  insert into boss (week, user_id, nick) values (wk, auth.uid(), left(p_nick, 16)) on conflict (week, user_id) do update set nick = excluded.nick, updated_at = now();
  pw1 := boss_pw(w, pw0, wk);                       -- 沒有公會加成時的傷害（判斷有沒有打中弱點）
  w := w || jsonb_build_object('gb', gd_boss_of(auth.uid()));
  insert into boss_slot (user_id, slot, wid, w, pw0) values (auth.uid(), p_slot, v_wid, w, pw0);
  pw := boss_pw(w, pw0, wk);
  return jsonb_build_object('pw', pw, 'weak', pw1 <> pw0, 'week', wk, 'gb', (w->>'gb')::int);
end $$;
grant execute on function public.boss_post(text, int, jsonb, text) to authenticated;
update boss_slot set w = w || jsonb_build_object('gb', gd_boss_of(user_id)) where not (w ? 'gb');

-- ===================== 共用 =====================
create or replace function public.gd_sess(p_sid text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from saves where user_id = auth.uid() and session_id = p_sid) $$;
revoke all on function public.gd_sess(text) from public, anon;
grant execute on function public.gd_sess(text) to authenticated;

create or replace function public.gd_user_row(p_uid uuid) returns gd_user language plpgsql security definer set search_path = public as $$
declare r gd_user;
begin
  insert into gd_user (user_id) values (p_uid) on conflict (user_id) do nothing;
  select * into r from gd_user where user_id = p_uid for update;
  if r.don_day is distinct from pc_day() then r.don_day := pc_day(); r.don_n := 0; end if;
  if r.shop_wk <> boss_week() then r.shop_wk := boss_week(); r.shop := '{}'; end if;
  update gd_user set don_day = r.don_day, don_n = r.don_n, shop_wk = r.shop_wk, shop = r.shop where user_id = p_uid;
  return r;
end $$;
revoke all on function public.gd_user_row(uuid) from public, anon, authenticated;

-- 名字檢查：2～8 字、不能有髒話、網址、電話
create or replace function public.gd_name_ok(p text) returns boolean language sql stable security definer set search_path = public as $$
  select char_length(p) between 2 and 8 and p !~ '\s' and chat_clean(p) = p
     and p !~* '(https?://|www\.|\.(com|net|org|tw|cc|io|me|gg)\b|\d{6,})' $$;
revoke all on function public.gd_name_ok(text) from public, anon, authenticated;

-- 會長 7 天沒上線：自動轉給 3 天內上線過、貢獻最多的成員（副會長優先）
create or replace function public.gd_fix_leader(p_gid bigint) returns void language plpgsql security definer set search_path = public as $$
declare g guild; nu uuid;
begin
  select * into g from guild where id = p_gid for update;
  if not found then return; end if;
  if exists (select 1 from saves s where s.user_id = g.leader and s.updated_at > now() - interval '7 days')
     and exists (select 1 from guild_mem where user_id = g.leader and guild_id = p_gid) then return; end if;
  select m.user_id into nu from guild_mem m join saves s on s.user_id = m.user_id
    where m.guild_id = p_gid and m.user_id <> g.leader and s.updated_at > now() - interval '3 days'
    order by (m.role = 'vice') desc, m.tot_pts desc limit 1;
  if nu is null then return; end if;
  update guild_mem set role = 'mem' where user_id = g.leader and guild_id = p_gid;
  update guild_mem set role = 'lead' where user_id = nu;
  update guild set leader = nu where id = p_gid;
end $$;
revoke all on function public.gd_fix_leader(bigint) from public, anon, authenticated;

-- ===================== 公會：讀取 =====================
create or replace function public.guild_mine() returns jsonb
language plpgsql security definer set search_path = public as $$
declare m guild_mem; g guild; u gd_user; lv int; res jsonb; v_wk int := boss_week();
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  u := gd_user_row(auth.uid());
  res := jsonb_build_object('me', jsonb_build_object('pts', u.pts, 'don', greatest(0, 3 - u.don_n), 'shop', u.shop,
    'cd', case when u.left_at > now() - interval '12 hours' then u.left_at + interval '12 hours' end,
    'apps', coalesce((select jsonb_agg(a.guild_id) from guild_app a where a.user_id = auth.uid()), '[]')));
  select * into m from guild_mem where user_id = auth.uid();
  if not found then return res || jsonb_build_object('g', null); end if;
  perform gd_fix_leader(m.guild_id);
  select * into m from guild_mem where user_id = auth.uid();
  select * into g from guild where id = m.guild_id;
  lv := gd_lv(g.exp);
  return res || jsonb_build_object(
    'role', m.role,
    'g', jsonb_build_object('id', g.id, 'name', g.name, 'emb', g.emb, 'notice', g.notice, 'join', g.join_mode, 'exp', g.exp, 'lv', lv,
      'gold', gd_gold(lv), 'boss', gd_boss(lv), 'cap', gd_cap(lv),
      'n', (select count(*) from guild_mem where guild_id = g.id),
      'rank', 1 + (select count(*) from guild x where x.exp > g.exp),
      'wk', (select coalesce(sum(wk_pts), 0) from guild_mem where guild_id = g.id and guild_mem.wk = v_wk)),
    'mem', (select jsonb_agg(jsonb_build_object('uid', x.user_id, 'nick', coalesce(s.nickname, '無名鐵匠'), 'lv', chat_lv(s.data), 'role', x.role,
              'wk', case when x.wk = v_wk then x.wk_pts else 0 end, 'tot', x.tot_pts, 'at', s.updated_at)
            order by case x.role when 'lead' then 0 when 'vice' then 1 else 2 end, case when x.wk = v_wk then x.wk_pts else 0 end desc, x.tot_pts desc)
            from guild_mem x left join saves s on s.user_id = x.user_id where x.guild_id = g.id),
    'apps', case when m.role in ('lead', 'vice') then coalesce((select jsonb_agg(jsonb_build_object('uid', a.user_id, 'nick', coalesce(s.nickname, '無名鐵匠'), 'lv', chat_lv(s.data), 'at', a.created_at) order by a.created_at)
            from guild_app a left join saves s on s.user_id = a.user_id where a.guild_id = g.id and a.created_at > now() - interval '3 days'), '[]') else '[]' end);
end $$;

create or replace function public.guild_list(p_q text default null)
returns table (id bigint, name text, emb text, lv int, n int, cap int, join_mode text, applied boolean)
language sql stable security definer set search_path = public as $$
  select g.id, g.name, g.emb, gd_lv(g.exp), (select count(*)::int from guild_mem m where m.guild_id = g.id), gd_cap(gd_lv(g.exp)), g.join_mode,
         exists (select 1 from guild_app a where a.guild_id = g.id and a.user_id = auth.uid())
  from guild g
  where auth.uid() is not null and (coalesce(btrim(p_q), '') = '' or g.name ilike '%' || replace(replace(btrim(p_q), '%', ''), '_', '') || '%')
  order by g.exp desc, g.id limit 30
$$;

-- ===================== 公會：建立／加入／離開 =====================
create or replace function public.guild_create(p_sid text, p_name text, p_join text default 'open') returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; u gd_user; nm text := btrim(coalesce(p_name, '')); gid bigint; bal float8;
begin
  if auth.uid() is null then return 'login'; end if;
  select * into sv from saves where user_id = auth.uid() for update;
  if not found or sv.session_id is distinct from p_sid then return 'session'; end if;
  if exists (select 1 from guild_mem where user_id = auth.uid()) then return 'in'; end if;
  if chat_lv(sv.data) < 5 and not exists (select 1 from admins where user_id = auth.uid()) then return 'lv'; end if;
  u := gd_user_row(auth.uid());
  if u.left_at > now() - interval '12 hours' then return 'cd'; end if;
  if not gd_name_ok(nm) then return 'name'; end if;
  if exists (select 1 from guild where lower(name) = lower(nm)) then return 'dup'; end if;
  bal := coalesce((sv.data->>'gold')::float8, 0);
  if bal < 50000 then return 'gold'; end if;
  update saves set data = jsonb_set(data, '{gold}', to_jsonb(bal - 50000)) where user_id = auth.uid();
  insert into guild (name, emb, leader, join_mode) values (nm, left(nm, 1), auth.uid(), case when p_join = 'apply' then 'apply' else 'open' end) returning id into gid;
  insert into guild_mem (user_id, guild_id, role) values (auth.uid(), gid, 'lead');
  delete from guild_app where user_id = auth.uid();
  perform gd_boss_sync(auth.uid());
  return 'ok';
end $$;

create or replace function public.guild_join(p_sid text, p_gid bigint) returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; u gd_user; g guild;
begin
  if auth.uid() is null then return 'login'; end if;
  select * into sv from saves where user_id = auth.uid();
  if not found or sv.session_id is distinct from p_sid then return 'session'; end if;
  if exists (select 1 from guild_mem where user_id = auth.uid()) then return 'in'; end if;
  if chat_lv(sv.data) < 3 and not exists (select 1 from admins where user_id = auth.uid()) then return 'lv'; end if;
  u := gd_user_row(auth.uid());
  if u.left_at > now() - interval '12 hours' then return 'cd'; end if;
  select * into g from guild where id = p_gid for update;
  if not found then return 'gone'; end if;
  if (select count(*) from guild_mem where guild_id = g.id) >= gd_cap(gd_lv(g.exp)) then return 'full'; end if;
  if g.join_mode = 'apply' then
    if exists (select 1 from guild_app where guild_id = g.id and user_id = auth.uid()) then return 'applied'; end if;
    if (select count(*) from guild_app where user_id = auth.uid()) >= 5 then return 'apps'; end if;
    insert into guild_app (guild_id, user_id) values (g.id, auth.uid());
    return 'applied';
  end if;
  insert into guild_mem (user_id, guild_id) values (auth.uid(), g.id);
  delete from guild_app where user_id = auth.uid();
  perform gd_boss_sync(auth.uid());
  return 'ok';
end $$;

create or replace function public.guild_unapply(p_gid bigint) returns text
language sql security definer set search_path = public as $$
  delete from guild_app where guild_id = p_gid and user_id = auth.uid() returning 'ok' $$;

create or replace function public.guild_leave(p_sid text) returns text
language plpgsql security definer set search_path = public as $$
declare m guild_mem;
begin
  if auth.uid() is null then return 'login'; end if;
  if not gd_sess(p_sid) then return 'session'; end if;
  select * into m from guild_mem where user_id = auth.uid();
  if not found then return 'none'; end if;
  perform gd_user_row(auth.uid());
  if m.role = 'lead' then
    if exists (select 1 from guild_mem where guild_id = m.guild_id and user_id <> auth.uid()) then return 'lead'; end if;
    delete from guild where id = m.guild_id;          -- 最後一個人離開：公會解散
    update gd_user set left_at = now() where user_id = auth.uid();
    perform gd_boss_sync(auth.uid());
    return 'disband';
  end if;
  delete from guild_mem where user_id = auth.uid();
  update gd_user set left_at = now() where user_id = auth.uid();
  perform gd_boss_sync(auth.uid());
  return 'ok';
end $$;

-- ===================== 公會：管理（會長／副會長） =====================
create or replace function public.guild_set(p_sid text, p_notice text, p_join text) returns text
language plpgsql security definer set search_path = public as $$
declare m guild_mem; nt text := btrim(regexp_replace(coalesce(p_notice, ''), '\s+', ' ', 'g'));
begin
  if auth.uid() is null then return 'login'; end if;
  if not gd_sess(p_sid) then return 'session'; end if;
  select * into m from guild_mem where user_id = auth.uid();
  if not found then return 'none'; end if;
  if m.role not in ('lead', 'vice') then return 'role'; end if;
  if char_length(nt) > 40 then return 'len'; end if;
  if nt ~* '(https?://|www\.|\.(com|net|org|tw|cc|io|me|gg)\b|line\s*(id|:|：)|09\d{2}[\s-]?\d{3}[\s-]?\d{3}|\d{8,})' then return 'link'; end if;
  update guild set notice = chat_clean(nt), join_mode = case when p_join in ('open', 'apply') then p_join else join_mode end where id = m.guild_id;
  return 'ok';
end $$;

create or replace function public.guild_app_ans(p_sid text, p_uid uuid, p_ok boolean) returns text
language plpgsql security definer set search_path = public as $$
declare m guild_mem; g guild;
begin
  if auth.uid() is null then return 'login'; end if;
  if not gd_sess(p_sid) then return 'session'; end if;
  select * into m from guild_mem where user_id = auth.uid();
  if not found or m.role not in ('lead', 'vice') then return 'role'; end if;
  select * into g from guild where id = m.guild_id for update;
  if not exists (select 1 from guild_app where guild_id = g.id and user_id = p_uid) then return 'gone'; end if;
  if not p_ok then delete from guild_app where guild_id = g.id and user_id = p_uid; return 'no'; end if;
  if exists (select 1 from guild_mem where user_id = p_uid) then delete from guild_app where user_id = p_uid; return 'in'; end if;
  if (select count(*) from guild_mem where guild_id = g.id) >= gd_cap(gd_lv(g.exp)) then return 'full'; end if;
  insert into guild_mem (user_id, guild_id) values (p_uid, g.id);
  delete from guild_app where user_id = p_uid;
  perform gd_boss_sync(p_uid);
  return 'ok';
end $$;

-- p_act：kick 踢出、vice 升副會長、unvice 取消副會長、lead 轉讓會長
create or replace function public.guild_mem_act(p_sid text, p_uid uuid, p_act text) returns text
language plpgsql security definer set search_path = public as $$
declare m guild_mem; t guild_mem;
begin
  if auth.uid() is null then return 'login'; end if;
  if not gd_sess(p_sid) then return 'session'; end if;
  select * into m from guild_mem where user_id = auth.uid();
  if not found then return 'none'; end if;
  select * into t from guild_mem where user_id = p_uid and guild_id = m.guild_id;
  if not found or p_uid = auth.uid() then return 'gone'; end if;
  if p_act = 'kick' then
    if not (m.role = 'lead' or (m.role = 'vice' and t.role = 'mem')) then return 'role'; end if;
    delete from guild_mem where user_id = p_uid;
    perform gd_boss_sync(p_uid);
  elsif p_act = 'vice' then
    if m.role <> 'lead' then return 'role'; end if;
    if (select count(*) from guild_mem where guild_id = m.guild_id and role = 'vice') >= 2 then return 'max'; end if;
    update guild_mem set role = 'vice' where user_id = p_uid;
  elsif p_act = 'unvice' then
    if m.role <> 'lead' then return 'role'; end if;
    update guild_mem set role = 'mem' where user_id = p_uid;
  elsif p_act = 'lead' then
    if m.role <> 'lead' then return 'role'; end if;
    update guild_mem set role = 'vice' where user_id = auth.uid();
    update guild_mem set role = 'lead' where user_id = p_uid;
    update guild set leader = p_uid where id = m.guild_id;
  else return 'act';
  end if;
  return 'ok';
end $$;

-- ===================== 捐獻（伺服器直接從雲端存檔扣） =====================
-- gold：5,000 金幣 → 50 點；iron：30 鐵礦 → 30 點；gems：20 鑽石 → 150 點（每天共 3 次）
create or replace function public.guild_donate(p_sid text, p_kind text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare sv saves; m guild_mem; u gd_user; g guild; cost int; v_pts int; bal float8; lv0 int; lv1 int; v_wk int := boss_week();
begin
  if auth.uid() is null then return jsonb_build_object('r', 'login'); end if;
  select * into sv from saves where user_id = auth.uid() for update;
  if not found or sv.session_id is distinct from p_sid then return jsonb_build_object('r', 'session'); end if;
  select * into m from guild_mem where user_id = auth.uid();
  if not found then return jsonb_build_object('r', 'none'); end if;
  if p_kind = 'gold' then cost := 5000; v_pts := 50; bal := coalesce((sv.data->>'gold')::float8, 0);
  elsif p_kind = 'iron' then cost := 30; v_pts := 30; bal := coalesce((sv.data->'mats'->>'iron')::float8, 0);
  elsif p_kind = 'gems' then cost := 20; v_pts := 150; bal := coalesce((sv.data->>'gems')::float8, 0);
  else return jsonb_build_object('r', 'kind'); end if;
  u := gd_user_row(auth.uid());
  if u.don_n >= 3 then return jsonb_build_object('r', 'max'); end if;
  if bal < cost then return jsonb_build_object('r', 'lack'); end if;
  if p_kind = 'iron' then
    update saves set data = jsonb_set(data, '{mats,iron}', to_jsonb(bal - cost)) where user_id = auth.uid();
  else
    update saves set data = jsonb_set(data, array[p_kind], to_jsonb(bal - cost)) where user_id = auth.uid();
  end if;
  update gd_user set don_n = don_n + 1, pts = gd_user.pts + v_pts where user_id = auth.uid();
  update guild_mem set wk_pts = case when guild_mem.wk = v_wk then guild_mem.wk_pts else 0 end + v_pts, wk = v_wk, tot_pts = guild_mem.tot_pts + v_pts where user_id = auth.uid();
  select * into g from guild where id = m.guild_id for update;
  lv0 := gd_lv(g.exp); lv1 := gd_lv(g.exp + v_pts);
  update guild set exp = guild.exp + v_pts where id = g.id;
  if lv1 > lv0 then perform gd_boss_sync(x.user_id) from guild_mem x where x.guild_id = g.id; end if;
  return jsonb_build_object('r', 'ok', 'cost', cost, 'pts', v_pts, 'lv', lv1, 'up', lv1 > lv0, 'don', greatest(0, 2 - u.don_n));
end $$;

-- ===================== 公會商店（個人貢獻換道具，伺服器直接加進雲端存檔） =====================
-- bless：祝福石 ×1／150 點／每週 5 次；scroll：防爆卷 ×1／300 點／每週 2 次；shard：符文碎片 ×5／100 點／每週 3 次
create or replace function public.guild_shop(p_sid text, p_item text) returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; u gd_user; price int; lim int; n int; cnt int;
begin
  if auth.uid() is null then return 'login'; end if;
  select * into sv from saves where user_id = auth.uid() for update;
  if not found or sv.session_id is distinct from p_sid then return 'session'; end if;
  if p_item = 'bless' then price := 150; lim := 5; n := 1;
  elsif p_item = 'scroll' then price := 300; lim := 2; n := 1;
  elsif p_item = 'shard' then price := 100; lim := 3; n := 5;
  else return 'item'; end if;
  u := gd_user_row(auth.uid());
  cnt := coalesce((u.shop->>p_item)::int, 0);
  if cnt >= lim then return 'max'; end if;
  if u.pts < price then return 'pts'; end if;
  if p_item = 'shard' then
    update saves set data = jsonb_set(data, '{mats,shard}', to_jsonb(coalesce((data->'mats'->>'shard')::int, 0) + n)) where user_id = auth.uid();
  else
    update saves set data = jsonb_set(data, array['items', p_item], to_jsonb(coalesce((data->'items'->>p_item)::int, 0) + n)) where user_id = auth.uid();
  end if;
  update gd_user set pts = pts - price, shop = shop || jsonb_build_object(p_item, cnt + 1) where user_id = auth.uid();
  return 'ok';
end $$;

-- ===================== 公會聊天：chat_send／chat_list 多一個 'g' 頻道 =====================
create or replace function public.chat_send(p_sid text, p_ch text, p_body text, p_wid int default null) returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; c chat_ctr; m chat_mute; b text; lv int; wj jsonb; x jsonb; chv text; gid bigint;
begin
  if auth.uid() is null then return 'login'; end if;
  if p_ch = 'w' then chv := 'w';
  elsif p_ch = 'g' then
    select guild_id into gid from guild_mem where user_id = auth.uid();
    if gid is null then return 'noguild'; end if;
    chv := 'g' || gid;
  else return 'ch'; end if;
  select * into sv from saves where user_id = auth.uid();
  if not found or sv.session_id is distinct from p_sid then return 'session'; end if;
  if coalesce(sv.nickname, '') = '' then return 'nonick'; end if;
  select * into m from chat_mute where user_id = auth.uid();
  if found and m.until > now() then return 'muted:' || to_char(m.until at time zone 'Asia/Taipei', 'MM/DD HH24:MI'); end if;
  lv := chat_lv(sv.data);
  if lv < 3 and not exists (select 1 from admins where user_id = auth.uid()) then return 'lv'; end if;
  b := btrim(regexp_replace(coalesce(p_body, ''), '\s+', ' ', 'g'));
  if p_wid is not null then
    select e into x from jsonb_array_elements(coalesce(sv.data->'weapons', '[]')) e
      where (e->>'id')::int = p_wid and coalesce((e->>'test')::boolean, false) = false limit 1;
    if x is null then return 'noweapon'; end if;
    wj := jsonb_build_object('b', lb_bpid(x->>'b'), 'q', coalesce((x->>'q')::int, 0), 'lv', coalesce((x->>'lv')::int, 0), 'rf', coalesce((x->>'rf')::int, 0),
                             'traits', coalesce(x->'traits', '[]'), 'ench', coalesce(x->'ench', '[]'), 'p', lb_power(x));
    if b = '' then b := '分享了一把武器'; end if;
  end if;
  if char_length(b) < 1 or char_length(b) > 60 then return 'len'; end if;
  if b ~* '(https?://|www\.|\.(com|net|org|tw|cc|io|me|gg)\b|line\s*(id|:|：)|09\d{2}[\s-]?\d{3}[\s-]?\d{3}|\d{8,})' then return 'link'; end if;
  insert into chat_ctr (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select * into c from chat_ctr where user_id = auth.uid() for update;
  if now() - c.last < interval '5 seconds' then return 'slow:' || ceil(extract(epoch from (c.last + interval '5 seconds' - now())))::int; end if;
  if now() - c.win_start > interval '60 seconds' then c.win_start := now(); c.win_n := 0; end if;
  if c.win_n >= 8 then return 'many'; end if;
  if c.last_body = b || coalesce(p_wid::text, '') and now() - c.last < interval '60 seconds' then return 'dup'; end if;
  update chat_ctr set last = now(), win_start = c.win_start, win_n = c.win_n + 1, last_body = b || coalesce(p_wid::text, '') where user_id = auth.uid();
  insert into chat (ch, user_id, nick, lv, body, w, title) values (chv, auth.uid(), sv.nickname, lv, chat_clean(b), wj, chat_title(auth.uid(), sv.data));
  if random() < 0.05 then
    delete from chat where created_at < now() - interval '3 days';
    delete from chat_report where created_at < now() - interval '3 days';
  end if;
  return 'ok';
end $$;

create or replace function public.chat_list(p_ch text, p_after bigint default 0)
returns table (id bigint, uid uuid, nick text, lv int, body text, mine boolean, at timestamptz, w jsonb, title text)
language sql stable security definer set search_path = public as $$
  select * from (
    select c.id, c.user_id, coalesce(c.nick, '無名鐵匠'), c.lv, c.body, c.user_id = auth.uid(), c.created_at, c.w, c.title
    from chat c
    where auth.uid() is not null and not c.hidden and c.id > coalesce(p_after, 0) and c.created_at > now() - interval '3 days'
      and c.ch = case when p_ch = 'g' then 'g' || (select m.guild_id from guild_mem m where m.user_id = auth.uid()) else 'w' end
    order by c.id desc limit 50
  ) t order by t.id
$$;

-- ===================== 好友（不送禮） =====================
create or replace function public.friend_list() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'f', coalesce((select jsonb_agg(jsonb_build_object('uid', f.b, 'nick', coalesce(s.nickname, '無名鐵匠'), 'lv', chat_lv(s.data), 'at', s.updated_at,
            'g', (select g.name from guild_mem m join guild g on g.id = m.guild_id where m.user_id = f.b)) order by s.updated_at desc nulls last)
          from friend f left join saves s on s.user_id = f.b where f.a = auth.uid()), '[]'),
    'in', coalesce((select jsonb_agg(jsonb_build_object('uid', r.from_user, 'nick', coalesce(s.nickname, '無名鐵匠'), 'lv', chat_lv(s.data), 'at', r.created_at) order by r.created_at desc)
          from friend_req r left join saves s on s.user_id = r.from_user where r.to_user = auth.uid() and r.created_at > now() - interval '7 days'), '[]'),
    'out', coalesce((select jsonb_agg(r.to_user) from friend_req r where r.from_user = auth.uid() and r.created_at > now() - interval '7 days'), '[]'))
  where auth.uid() is not null
$$;

create or replace function public.friend_make(p_a uuid, p_b uuid) returns text language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from friend where a = p_a) >= 30 then return 'full'; end if;
  if (select count(*) from friend where a = p_b) >= 30 then return 'full2'; end if;
  insert into friend (a, b) values (p_a, p_b), (p_b, p_a) on conflict do nothing;
  delete from friend_req where (from_user = p_a and to_user = p_b) or (from_user = p_b and to_user = p_a);
  return 'ok';
end $$;
revoke all on function public.friend_make(uuid, uuid) from public, anon, authenticated;

create or replace function public.friend_add(p_uid uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'login'; end if;
  if p_uid = auth.uid() then return 'self'; end if;
  if not exists (select 1 from saves where user_id = p_uid) then return 'gone'; end if;
  if exists (select 1 from friend where a = auth.uid() and b = p_uid) then return 'already'; end if;
  if exists (select 1 from friend_req where from_user = p_uid and to_user = auth.uid() and created_at > now() - interval '7 days') then
    return friend_make(auth.uid(), p_uid);              -- 對方也申請過我：直接成為好友
  end if;
  if (select count(*) from friend where a = auth.uid()) >= 30 then return 'full'; end if;
  if exists (select 1 from friend_req where from_user = auth.uid() and to_user = p_uid and created_at > now() - interval '7 days') then return 'sent'; end if;
  if (select count(*) from friend_req where from_user = auth.uid() and created_at > now() - interval '1 day') >= 20 then return 'many'; end if;
  insert into friend_req (from_user, to_user) values (auth.uid(), p_uid) on conflict (from_user, to_user) do update set created_at = now();
  if random() < 0.05 then delete from friend_req where created_at < now() - interval '7 days'; end if;
  return 'sent';
end $$;

create or replace function public.friend_ans(p_uid uuid, p_ok boolean) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'login'; end if;
  if not exists (select 1 from friend_req where from_user = p_uid and to_user = auth.uid()) then return 'gone'; end if;
  if not p_ok then delete from friend_req where from_user = p_uid and to_user = auth.uid(); return 'no'; end if;
  return friend_make(auth.uid(), p_uid);
end $$;

create or replace function public.friend_del(p_uid uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'login'; end if;
  delete from friend where (a = auth.uid() and b = p_uid) or (a = p_uid and b = auth.uid());
  delete from friend_req where from_user = auth.uid() and to_user = p_uid;
  return 'ok';
end $$;

create or replace function public.friend_find(p_nick text)
returns table (uid uuid, nick text, lv int, fr text)
language sql stable security definer set search_path = public as $$
  select s.user_id, s.nickname, chat_lv(s.data),
    case when exists (select 1 from friend where a = auth.uid() and b = s.user_id) then 'friend'
         when exists (select 1 from friend_req where from_user = auth.uid() and to_user = s.user_id) then 'sent'
         when exists (select 1 from friend_req where from_user = s.user_id and to_user = auth.uid()) then 'got' end
  from saves s
  where auth.uid() is not null and char_length(btrim(coalesce(p_nick, ''))) >= 1 and s.user_id <> auth.uid() and s.nickname is not null
    and s.nickname ilike replace(replace(btrim(p_nick), '%', ''), '_', '') || '%'
  order by s.nickname = btrim(p_nick) desc, s.updated_at desc limit 10
$$;

-- ===================== 名片多回傳好友狀態、公會 =====================
create or replace function public.pc_card(p_uid uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare sv saves; bw jsonb; bp int; res jsonb;
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  select * into sv from saves where user_id = p_uid;
  if not found then return null; end if;
  select x, lb_power(x) into bw, bp from jsonb_array_elements(coalesce(sv.data->'weapons', '[]')) x
    where coalesce((x->>'test')::boolean, false) = false order by lb_power(x) desc nulls last limit 1;
  select jsonb_build_object(
    'uid', p_uid, 'nick', coalesce(sv.nickname, '無名鐵匠'), 'lv', chat_lv(sv.data),
    'cleared', (select count(*) from jsonb_array_elements(coalesce(sv.data->'villages', '[]')) v where v->>'status' = 'cleared'),
    'maxlv', coalesce((select max(coalesce((x->>'lv')::int, 0)) from jsonb_array_elements(coalesce(sv.data->'weapons', '[]')) x where coalesce((x->>'test')::boolean, false) = false), 0),
    'likes', (select count(*) from pc_like where to_user = p_uid),
    'liked', exists (select 1 from pc_like where from_user = auth.uid() and to_user = p_uid and day = pc_day()),
    'left', greatest(0, 3 - (select count(*) from pc_like where from_user = auth.uid() and day = pc_day())),
    'me', p_uid = auth.uid(),
    'title', chat_title(p_uid, sv.data),
    'titles', case when p_uid = auth.uid() then to_jsonb(chat_titles(p_uid, sv.data)) else null end,
    'fr', case when exists (select 1 from friend where a = auth.uid() and b = p_uid) then 'friend'
               when exists (select 1 from friend_req where from_user = auth.uid() and to_user = p_uid) then 'sent'
               when exists (select 1 from friend_req where from_user = p_uid and to_user = auth.uid()) then 'got' end,
    'guild', (select g.name from guild_mem m join guild g on g.id = m.guild_id where m.user_id = p_uid),
    'w', case when bw is null then null else jsonb_build_object('b', bw->'b', 'q', bw->'q', 'lv', bw->'lv', 'rf', coalesce(bw->'rf', '0'), 'traits', coalesce(bw->'traits', '[]'), 'ench', coalesce(bw->'ench', '[]'), 'p', bp) end
  ) into res;
  return res;
end $$;

-- ===================== 權限 =====================
revoke all on function public.guild_mine() from public, anon;
revoke all on function public.guild_list(text) from public, anon;
revoke all on function public.guild_create(text, text, text) from public, anon;
revoke all on function public.guild_join(text, bigint) from public, anon;
revoke all on function public.guild_unapply(bigint) from public, anon;
revoke all on function public.guild_leave(text) from public, anon;
revoke all on function public.guild_set(text, text, text) from public, anon;
revoke all on function public.guild_app_ans(text, uuid, boolean) from public, anon;
revoke all on function public.guild_mem_act(text, uuid, text) from public, anon;
revoke all on function public.guild_donate(text, text) from public, anon;
revoke all on function public.guild_shop(text, text) from public, anon;
revoke all on function public.friend_list() from public, anon;
revoke all on function public.friend_add(uuid) from public, anon;
revoke all on function public.friend_ans(uuid, boolean) from public, anon;
revoke all on function public.friend_del(uuid) from public, anon;
revoke all on function public.friend_find(text) from public, anon;
revoke all on function public.chat_send(text, text, text, int) from public, anon;
revoke all on function public.chat_list(text, bigint) from public, anon;
revoke all on function public.pc_card(uuid) from public, anon;
grant execute on function public.guild_mine() to authenticated;
grant execute on function public.guild_list(text) to authenticated;
grant execute on function public.guild_create(text, text, text) to authenticated;
grant execute on function public.guild_join(text, bigint) to authenticated;
grant execute on function public.guild_unapply(bigint) to authenticated;
grant execute on function public.guild_leave(text) to authenticated;
grant execute on function public.guild_set(text, text, text) to authenticated;
grant execute on function public.guild_app_ans(text, uuid, boolean) to authenticated;
grant execute on function public.guild_mem_act(text, uuid, text) to authenticated;
grant execute on function public.guild_donate(text, text) to authenticated;
grant execute on function public.guild_shop(text, text) to authenticated;
grant execute on function public.friend_list() to authenticated;
grant execute on function public.friend_add(uuid) to authenticated;
grant execute on function public.friend_ans(uuid, boolean) to authenticated;
grant execute on function public.friend_del(uuid) to authenticated;
grant execute on function public.friend_find(text) to authenticated;
grant execute on function public.chat_send(text, text, text, int) to authenticated;
grant execute on function public.chat_list(text, bigint) to authenticated;
grant execute on function public.pc_card(uuid) to authenticated;

notify pgrst, 'reload schema';
-- 執行完可以用這行確認，應該顯示 3.98：
-- select public.chat_version();
