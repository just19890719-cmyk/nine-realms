-- ===== 九界鐵匠 v3.70 全服強化跑馬燈（整段貼到 SQL Editor 執行一次） =====
-- 需要先執行過 04_leaderboard_v3.65.sql（用到 lb_bp 圖紙表）。這段不改 save_game。
-- 1) news 表：只存「誰、哪張圖紙、幾級、成功或爆裝」，不存任何玩家輸入的文字（公告內容由遊戲固定格式組出來）
-- 2) news_post：伺服器核對雲端存檔，成功公告必須真的有那把武器、爆裝公告必須存檔裡的爆裝次數真的有增加
-- 3) news_list：拿最近 10 分鐘的公告

create or replace function public.ac_version() returns text language sql immutable as $$ select '3.70'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

create table if not exists public.news (
  id bigserial primary key,
  user_id uuid not null,
  nick text,
  bp text not null,
  lv int not null,
  ok boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists news_created_idx on public.news (created_at);
alter table public.news enable row level security;   -- 沒有任何 policy：只能透過下面兩個函式讀寫

create table if not exists public.news_ctr (
  user_id uuid primary key,
  breaks int not null default 0,   -- 已經公告過的爆裝次數
  last timestamptz not null default 'epoch'
);
alter table public.news_ctr enable row level security;

create or replace function public.news_post(p_sid text, p_bp text, p_lv int, p_ok boolean) returns text
language plpgsql security definer set search_path = public as $$
declare sv saves; c news_ctr; b text := lb_bpid(p_bp); nb int;
begin
  if auth.uid() is null then return 'login'; end if;
  if p_lv is null or p_lv not between 10 and 15 or not exists (select 1 from lb_bp(b)) then return 'bad'; end if;
  select * into sv from saves where user_id = auth.uid();
  if not found or sv.session_id is distinct from p_sid then return 'session'; end if;
  nb := coalesce((sv.data->'stats'->>'breaks')::int, 0);
  -- 第一次使用：以前的爆裝不算（最多只放行最近一次）
  insert into news_ctr (user_id, breaks) values (auth.uid(), greatest(0, nb - 1)) on conflict (user_id) do nothing;
  select * into c from news_ctr where user_id = auth.uid() for update;
  if now() - c.last < interval '2 seconds' then return 'slow'; end if;
  if p_ok then
    -- 成功：雲端存檔裡要有這張圖紙、等級至少 p_lv 的武器
    if not exists (select 1 from jsonb_array_elements(coalesce(sv.data->'weapons', '[]')) x
                   where lb_bpid(x->>'b') = b and coalesce((x->>'lv')::int, 0) >= p_lv) then return 'nope'; end if;
  else
    -- 爆裝：存檔裡的爆裝次數要比已公告的多
    if c.breaks >= nb then return 'nope'; end if;
    update news_ctr set breaks = least(nb, c.breaks + 1) where user_id = auth.uid();
  end if;
  update news_ctr set last = now() where user_id = auth.uid();
  insert into news (user_id, nick, bp, lv, ok) values (auth.uid(), coalesce(sv.nickname, '無名鐵匠'), b, p_lv, p_ok);
  delete from news where created_at < now() - interval '1 day';
  return 'ok';
end $$;

create or replace function public.news_list(p_after bigint default 0)
returns table (id bigint, nick text, bp text, lv int, ok boolean, mine boolean)
language sql security definer set search_path = public as $$
  select * from (
    select n.id, n.nick, n.bp, n.lv, n.ok, n.user_id = auth.uid()
    from news n where n.id > coalesce(p_after, 0) and n.created_at > now() - interval '10 minutes'
    order by n.id desc limit 5
  ) t order by t.id
$$;

revoke all on function public.news_post(text, text, int, boolean) from public, anon;
revoke all on function public.news_list(bigint) from public, anon;
grant execute on function public.news_post(text, text, int, boolean) to authenticated;
grant execute on function public.news_list(bigint) to authenticated;

notify pgrst, 'reload schema';
-- 執行完可以用這行確認，應該顯示 3.70：
-- select public.ac_version();
