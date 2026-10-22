-- ===== 九界鐵匠 v3.89 武器卡、稱號、恭喜（整段貼到 SQL Editor 執行一次） =====
-- 需要先執行過 11_chat_v3.88.sql。這段不改 save_game、不改 ac_version，用 select chat_version(); 確認（應該顯示 3.89）。
-- 1) 聊天可以貼武器卡：伺服器從雲端存檔找這把武器（不能是測試武器），訊息只存伺服器查到的數值
-- 2) 稱號：伺服器依存檔／首領排名／讚數判斷有沒有解鎖，沒解鎖的稱號不會顯示
-- 3) 恭喜：+10 以上的強化成功公告可以按恭喜，對方會收到通知（不給獎勵）

create or replace function public.chat_version() returns text language sql immutable as $$ select '3.89'::text $$;
grant execute on function public.chat_version() to anon, authenticated;

alter table public.chat add column if not exists w jsonb;
alter table public.chat add column if not exists title text;

-- 已解鎖的稱號（與遊戲 TITLES 相同）
create or replace function public.chat_titles(p_uid uuid, d jsonb) returns text[]
language sql stable security definer set search_path = public as $$
  select array_remove(array[
    case when coalesce((d->'stats'->>'maxLv')::int, 0) >= 12 then 'smith12' end,
    case when coalesce((d->'stats'->'forged'->>4)::int, 0) > 0 then 'legend' end,
    case when (select count(*) from jsonb_array_elements(coalesce(d->'villages', '[]')) v where v->>'status' = 'cleared') >= 10 then 'guard' end,
    case when coalesce(d->'villages'->10->>'status', '') = 'cleared' then 'giant' end,
    case when exists (select 1 from boss b where b.user_id = p_uid and b.week < boss_week() and b.dmg > 0
                      and (select count(*) from boss b2 where b2.week = b.week and b2.dmg > b.dmg) < 3) then 'dragon' end,
    case when (select count(*) from pc_like where to_user = p_uid) >= 30 then 'pop' end
  ], null)
$$;
revoke all on function public.chat_titles(uuid, jsonb) from public, anon, authenticated;

-- 戴著的稱號（存檔 data.title），沒解鎖就不顯示
create or replace function public.chat_title(p_uid uuid, d jsonb) returns text
language sql stable security definer set search_path = public as $$
  select case when d->>'title' = any(chat_titles(p_uid, d)) then d->>'title' end
$$;
revoke all on function public.chat_title(uuid, jsonb) from public, anon, authenticated;

drop function if exists public.chat_send(text, text, text);
create or replace function public.chat_send(p_sid text, p_ch text, p_body text, p_wid int default null) returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; c chat_ctr; m chat_mute; b text; lv int; wj jsonb; x jsonb;
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
  insert into chat (ch, user_id, nick, lv, body, w, title) values ('w', auth.uid(), sv.nickname, lv, chat_clean(b), wj, chat_title(auth.uid(), sv.data));
  if random() < 0.05 then
    delete from chat where created_at < now() - interval '3 days';
    delete from chat_report where created_at < now() - interval '3 days';
  end if;
  return 'ok';
end $$;

drop function if exists public.chat_list(text, bigint);
create or replace function public.chat_list(p_ch text, p_after bigint default 0)
returns table (id bigint, uid uuid, nick text, lv int, body text, mine boolean, at timestamptz, w jsonb, title text)
language sql stable security definer set search_path = public as $$
  select * from (
    select c.id, c.user_id, coalesce(c.nick, '無名鐵匠'), c.lv, c.body, c.user_id = auth.uid(), c.created_at, c.w, c.title
    from chat c
    where auth.uid() is not null and c.ch = coalesce(p_ch, 'w') and c.id > coalesce(p_after, 0) and not c.hidden
      and c.created_at > now() - interval '3 days'
    order by c.id desc limit 50
  ) t order by t.id
$$;

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
    'w', case when bw is null then null else jsonb_build_object('b', bw->'b', 'q', bw->'q', 'lv', bw->'lv', 'rf', coalesce(bw->'rf', '0'), 'traits', coalesce(bw->'traits', '[]'), 'ench', coalesce(bw->'ench', '[]'), 'p', bp) end
  ) into res;
  return res;
end $$;

revoke all on function public.chat_send(text, text, text, int) from public, anon;
revoke all on function public.chat_list(text, bigint) from public, anon;
revoke all on function public.pc_card(uuid) from public, anon;
grant execute on function public.chat_send(text, text, text, int) to authenticated;
grant execute on function public.chat_list(text, bigint) to authenticated;
grant execute on function public.pc_card(uuid) to authenticated;

-- ===== 恭喜：+10 以上成功的公告，其他玩家可以按恭喜（每則每人 1 次、每天最多 50 次；不給獎勵，只通知對方） =====
create table if not exists public.news_cheer (
  id bigserial primary key,
  news_id bigint not null,
  from_user uuid not null,
  to_user uuid not null,
  from_nick text,
  created_at timestamptz not null default now(),
  unique (news_id, from_user)
);
create index if not exists news_cheer_to_idx on public.news_cheer (to_user, id);
alter table public.news_cheer enable row level security;

create or replace function public.news_cheer_add(p_id bigint) returns text
language plpgsql security definer set search_path = public as $$
declare n news; nk text;
begin
  if auth.uid() is null then return 'login'; end if;
  select * into n from news where id = p_id;
  if not found or not n.ok then return 'gone'; end if;
  if n.user_id = auth.uid() then return 'self'; end if;
  if exists (select 1 from news_cheer where news_id = p_id and from_user = auth.uid()) then return 'done'; end if;
  if (select count(*) from news_cheer where from_user = auth.uid() and created_at > now() - interval '1 day') >= 50 then return 'many'; end if;
  select nickname into nk from saves where user_id = auth.uid();
  insert into news_cheer (news_id, from_user, to_user, from_nick) values (p_id, auth.uid(), n.user_id, coalesce(nk, '無名鐵匠'));
  if random() < 0.05 then delete from news_cheer where created_at < now() - interval '3 days'; end if;
  return 'ok';
end $$;

-- 別人恭喜我的紀錄（p_after 之後的）
create or replace function public.news_cheer_inbox(p_after bigint default 0)
returns table (id bigint, news_id bigint, from_nick text, bp text, lv int)
language sql stable security definer set search_path = public as $$
  select c.id, c.news_id, c.from_nick, n.bp, n.lv
  from news_cheer c left join news n on n.id = c.news_id
  where auth.uid() is not null and c.to_user = auth.uid() and c.id > coalesce(p_after, 0) and c.created_at > now() - interval '3 days'
  order by c.id limit 100
$$;

drop function if exists public.chat_sys(bigint);
create or replace function public.chat_sys(p_after bigint default 0)
returns table (id bigint, uid uuid, nick text, bp text, lv int, ok boolean, at timestamptz, cheers int, cheered boolean)
language sql stable security definer set search_path = public as $$
  select * from (
    select n.id, n.user_id, coalesce(n.nick, '無名鐵匠'), n.bp, n.lv, n.ok, n.created_at,
      (select count(*)::int from news_cheer c where c.news_id = n.id),
      exists (select 1 from news_cheer c where c.news_id = n.id and c.from_user = auth.uid())
    from news n where auth.uid() is not null and n.id > coalesce(p_after, 0)
    order by n.id desc limit 30
  ) t order by t.id
$$;

revoke all on function public.news_cheer_add(bigint) from public, anon;
revoke all on function public.news_cheer_inbox(bigint) from public, anon;
revoke all on function public.chat_sys(bigint) from public, anon;
grant execute on function public.news_cheer_add(bigint) to authenticated;
grant execute on function public.news_cheer_inbox(bigint) to authenticated;
grant execute on function public.chat_sys(bigint) to authenticated;

notify pgrst, 'reload schema';
-- 執行完可以用這行確認，應該顯示 3.89：
-- select public.chat_version();
