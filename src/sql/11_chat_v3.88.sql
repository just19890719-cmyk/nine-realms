-- ===== 九界鐵匠 v3.88 世界聊天＋玩家名片（整段貼到 SQL Editor 執行一次） =====
-- 需要先執行過 04（lb_power）、06（news 跑馬燈）、08（20 座村莊）。這段不改 save_game、不改 ac_version。
-- 1) chat 表：只能透過下面的函式讀寫（RLS 開著、沒有任何 policy）
-- 2) chat_send：檢查登入、同一支手機、禁言、鐵匠 Lv.3、冷卻 5 秒、每分鐘 8 則、重複訊息、網址／電話、髒話過濾
--    暱稱和等級由伺服器從雲端存檔拿，玩家沒辦法冒充別人
-- 3) chat_list：拿世界頻道訊息；chat_sys：拿系統頻道（強化 +10 以上、爆裝公告）
-- 4) chat_report：3 個不同玩家檢舉同一則就自動隱藏；管理員檢舉直接隱藏
-- 5) chat_mute / chat_hide：管理員禁言、刪訊息
-- 6) pc_card / pc_like：玩家名片、每天按讚 3 次（同一個人一天 1 次）

create or replace function public.chat_version() returns text language sql immutable as $$ select '3.88'::text $$;
grant execute on function public.chat_version() to anon, authenticated;

create table if not exists public.chat (
  id bigserial primary key,
  ch text not null default 'w',
  user_id uuid not null,
  nick text,
  lv int,
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists chat_ch_id_idx on public.chat (ch, id);
create index if not exists chat_created_idx on public.chat (created_at);
alter table public.chat enable row level security;

create table if not exists public.chat_ctr (
  user_id uuid primary key,
  last timestamptz not null default 'epoch',
  win_start timestamptz not null default 'epoch',
  win_n int not null default 0,
  last_body text
);
alter table public.chat_ctr enable row level security;

create table if not exists public.chat_mute (
  user_id uuid primary key,
  until timestamptz not null,
  by_user uuid,
  created_at timestamptz not null default now()
);
alter table public.chat_mute enable row level security;

create table if not exists public.chat_report (
  msg_id bigint not null,
  reporter uuid not null,
  created_at timestamptz not null default now(),
  primary key (msg_id, reporter)
);
alter table public.chat_report enable row level security;

-- 髒話清單（命中的字換成＊）與白名單（含有這些詞的不算髒話）；之後要加字直接 insert
create table if not exists public.chat_bad (word text primary key);
create table if not exists public.chat_okw (word text primary key);
alter table public.chat_bad enable row level security;
alter table public.chat_okw enable row level security;
insert into public.chat_bad (word) values
 ('幹你娘'),('幹恁娘'),('幹拎娘'),('幹林娘'),('幹您娘'),('幹你老師'),('幹'),('姦'),('肏'),('屌'),('撚'),
 ('操你'),('操你媽'),('操'),('靠北'),('靠杯'),('靠腰'),('哭夭'),('機掰'),('雞掰'),('機歪'),('雞歪'),('雞巴'),('機巴'),('雞八'),
 ('白癡'),('白痴'),('智障'),('腦殘'),('低能'),('北七'),('王八蛋'),('混蛋'),('賤人'),('賤貨'),('婊子'),('臭婊'),('屁眼'),
 ('去死'),('他媽的'),('他媽'),('媽的'),('你媽'),('三小'),('啥小'),('傻逼'),('煞筆'),('垃圾人'),
 ('fuck'),('fck'),('shit'),('bitch'),('cunt'),('asshole'),('dick'),('wtf')
on conflict do nothing;
insert into public.chat_okw (word) values
 ('幹嘛'),('幹麻'),('能幹'),('樹幹'),('幹部'),('幹勁'),('主幹'),('才幹'),('骨幹'),('幹活'),('苦幹'),('實幹'),('幹事'),('幹練'),('精幹'),('軀幹'),('幹道'),
 ('操作'),('操場'),('體操'),('節操'),('操心'),('情操'),('操控'),('操練'),('操守'),('早操'),('操盤'),('操刀'),
 ('姦情'),('你媽媽'),('媽的話')
on conflict do nothing;

-- 髒話過濾：先把白名單詞換成暫存符號，再把髒話換成＊（中間夾空白或符號也抓得到），最後把白名單詞換回來
create or replace function public.chat_clean(p text) returns text
language plpgsql stable security definer set search_path = public as $$
declare t text := p; ok text[]; w text; i int; pat text; sep text := '[\s[:punct:]_．。，、！？～…・*＊]*';
begin
  select array_agg(word order by char_length(word) desc) into ok from chat_okw;
  if ok is not null then
    for i in 1..array_length(ok, 1) loop t := replace(t, ok[i], chr(57344 + i)); end loop;
  end if;
  for w in select word from chat_bad order by char_length(word) desc loop
    if char_length(w) = 1 then
      t := replace(t, w, '＊');
    else
      select string_agg(regexp_replace(c, '([.^$|()\[\]{}*+?\\-])', '\\\1', 'g'), sep) into pat
        from regexp_split_to_table(w, '') with ordinality as x(c, n);
      t := regexp_replace(t, pat, repeat('＊', char_length(w)), 'gi');
    end if;
  end loop;
  if ok is not null then
    for i in 1..array_length(ok, 1) loop t := replace(t, chr(57344 + i), ok[i]); end loop;
  end if;
  return t;
end $$;
revoke all on function public.chat_clean(text) from public, anon, authenticated;

-- 鐵匠等級（與遊戲 smithLv 相同：1＋收復村莊＋熔爐＋鐵砧＋舊鍛造欄位）
create or replace function public.chat_lv(d jsonb) returns int language sql immutable as $$
  select 1 + coalesce((select count(*)::int from jsonb_array_elements(coalesce(d->'villages', '[]')) v where v->>'status' = 'cleared'), 0)
           + greatest(0, coalesce((d->>'furnace')::int, 1) - 1) + greatest(0, coalesce((d->>'anvil')::int, 1) - 1) + greatest(0, coalesce((d->>'slots')::int, 1) - 1)
$$;

create or replace function public.chat_send(p_sid text, p_ch text, p_body text) returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; c chat_ctr; m chat_mute; b text; lv int;
begin
  if auth.uid() is null then return 'login'; end if;
  if p_ch is distinct from 'w' then return 'ch'; end if;
  select * into sv from saves where user_id = auth.uid();
  if not found or sv.session_id is distinct from p_sid then return 'session'; end if;
  if coalesce(sv.nickname, '') = '' then return 'nonick'; end if;
  select * into m from chat_mute where user_id = auth.uid();
  if found and m.until > now() then return 'muted:' || to_char(m.until at time zone 'Asia/Taipei', 'MM/DD HH24:MI'); end if;
  lv := chat_lv(sv.data);
  if lv < 3 and not exists (select 1 from admins where user_id = auth.uid()) then return 'lv'; end if;
  b := btrim(regexp_replace(coalesce(p_body, ''), '\s+', ' ', 'g'));
  if char_length(b) < 1 or char_length(b) > 60 then return 'len'; end if;
  if b ~* '(https?://|www\.|\.(com|net|org|tw|cc|io|me|gg)\b|line\s*(id|:|：)|09\d{2}[\s-]?\d{3}[\s-]?\d{3}|\d{8,})' then return 'link'; end if;
  insert into chat_ctr (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select * into c from chat_ctr where user_id = auth.uid() for update;
  if now() - c.last < interval '5 seconds' then return 'slow:' || ceil(extract(epoch from (c.last + interval '5 seconds' - now())))::int; end if;
  if now() - c.win_start > interval '60 seconds' then c.win_start := now(); c.win_n := 0; end if;
  if c.win_n >= 8 then return 'many'; end if;
  if c.last_body = b and now() - c.last < interval '60 seconds' then return 'dup'; end if;
  update chat_ctr set last = now(), win_start = c.win_start, win_n = c.win_n + 1, last_body = b where user_id = auth.uid();
  insert into chat (ch, user_id, nick, lv, body) values ('w', auth.uid(), sv.nickname, lv, chat_clean(b));
  if random() < 0.05 then
    delete from chat where created_at < now() - interval '3 days';
    delete from chat_report where created_at < now() - interval '3 days';
  end if;
  return 'ok';
end $$;

-- p_after = 0：最新 50 則；之後只拿比 p_after 新的
create or replace function public.chat_list(p_ch text, p_after bigint default 0)
returns table (id bigint, uid uuid, nick text, lv int, body text, mine boolean, at timestamptz)
language sql stable security definer set search_path = public as $$
  select * from (
    select c.id, c.user_id, coalesce(c.nick, '無名鐵匠'), c.lv, c.body, c.user_id = auth.uid(), c.created_at
    from chat c
    where auth.uid() is not null and c.ch = coalesce(p_ch, 'w') and c.id > coalesce(p_after, 0) and not c.hidden
      and c.created_at > now() - interval '3 days'
    order by c.id desc limit 50
  ) t order by t.id
$$;

create or replace function public.chat_sys(p_after bigint default 0)
returns table (id bigint, uid uuid, nick text, bp text, lv int, ok boolean, at timestamptz)
language sql stable security definer set search_path = public as $$
  select * from (
    select n.id, n.user_id, coalesce(n.nick, '無名鐵匠'), n.bp, n.lv, n.ok, n.created_at
    from news n where auth.uid() is not null and n.id > coalesce(p_after, 0)
    order by n.id desc limit 30
  ) t order by t.id
$$;

create or replace function public.chat_report(p_id bigint) returns text
language plpgsql security definer set search_path = public as $$
declare r chat; n int;
begin
  if auth.uid() is null then return 'login'; end if;
  select * into r from chat where id = p_id;
  if not found then return 'gone'; end if;
  if r.user_id = auth.uid() then return 'self'; end if;
  if exists (select 1 from admins where user_id = auth.uid()) then
    update chat set hidden = true where id = p_id; return 'hidden';
  end if;
  if (select count(*) from chat_report where reporter = auth.uid() and created_at > now() - interval '1 day') >= 20 then return 'many'; end if;
  insert into chat_report (msg_id, reporter) values (p_id, auth.uid()) on conflict do nothing;
  select count(*) into n from chat_report where msg_id = p_id;
  if n >= 3 then update chat set hidden = true where id = p_id; return 'hidden'; end if;
  return 'ok';
end $$;

-- 管理員：p_hours <= 0 解除禁言
create or replace function public.chat_mute(p_uid uuid, p_hours int) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then return 'admin'; end if;
  if p_hours <= 0 then delete from chat_mute where user_id = p_uid; return 'unmuted'; end if;
  insert into chat_mute (user_id, until, by_user) values (p_uid, now() + make_interval(hours => least(p_hours, 876000)), auth.uid())
    on conflict (user_id) do update set until = excluded.until, by_user = excluded.by_user, created_at = now();
  return 'ok';
end $$;

create or replace function public.chat_hide(p_id bigint) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then return 'admin'; end if;
  update chat set hidden = true where id = p_id;
  return 'ok';
end $$;

-- ===== 玩家名片 =====
create table if not exists public.pc_like (
  from_user uuid not null,
  to_user uuid not null,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (from_user, to_user, day)
);
create index if not exists pc_like_to_idx on public.pc_like (to_user);
alter table public.pc_like enable row level security;

create or replace function public.pc_day() returns date language sql stable as $$ select (now() at time zone 'Asia/Taipei')::date $$;

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
    'w', case when bw is null then null else jsonb_build_object('b', bw->'b', 'q', bw->'q', 'lv', bw->'lv', 'rf', coalesce(bw->'rf', '0'), 'traits', coalesce(bw->'traits', '[]'), 'ench', coalesce(bw->'ench', '[]'), 'p', bp) end
  ) into res;
  return res;
end $$;

create or replace function public.pc_like(p_uid uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'login'; end if;
  if p_uid = auth.uid() then return 'self'; end if;
  if not exists (select 1 from saves where user_id = p_uid) then return 'gone'; end if;
  if exists (select 1 from pc_like where from_user = auth.uid() and to_user = p_uid and day = pc_day()) then return 'done'; end if;
  if (select count(*) from pc_like where from_user = auth.uid() and day = pc_day()) >= 3 then return 'max'; end if;
  insert into pc_like (from_user, to_user, day) values (auth.uid(), p_uid, pc_day());
  return 'ok';
end $$;

revoke all on function public.chat_send(text, text, text) from public, anon;
revoke all on function public.chat_list(text, bigint) from public, anon;
revoke all on function public.chat_sys(bigint) from public, anon;
revoke all on function public.chat_report(bigint) from public, anon;
revoke all on function public.chat_mute(uuid, int) from public, anon;
revoke all on function public.chat_hide(bigint) from public, anon;
revoke all on function public.pc_card(uuid) from public, anon;
revoke all on function public.pc_like(uuid) from public, anon;
grant execute on function public.chat_send(text, text, text) to authenticated;
grant execute on function public.chat_list(text, bigint) to authenticated;
grant execute on function public.chat_sys(bigint) to authenticated;
grant execute on function public.chat_report(bigint) to authenticated;
grant execute on function public.chat_mute(uuid, int) to authenticated;
grant execute on function public.chat_hide(bigint) to authenticated;
grant execute on function public.pc_card(uuid) to authenticated;
grant execute on function public.pc_like(uuid) to authenticated;

notify pgrst, 'reload schema';
-- 執行完可以用這行確認，應該顯示 3.88：
-- select public.chat_version();
-- 髒話過濾測試（應該顯示：這把＊＊＊真的爛、幹嘛啦、操作很難）：
-- select public.chat_clean('這把幹你娘真的爛'), public.chat_clean('幹嘛啦'), public.chat_clean('操作很難');
