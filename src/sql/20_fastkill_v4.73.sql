-- v4.73 秒殺榜（Mochi 選：只做評價＋排行、20 關都有榜、稱號先不用）
-- 1) fk：每個玩家每一關只留最快 1 筆（秒數到 0.1 秒、當時用的武器以雲端存檔為準）
-- 2) fk_feed：4 隻王（1-9、1-10、2-9、2-10）的首殺和刷新全服第 1 名，給跑馬燈用，只留 1 天
-- 3) fk_submit：上傳紀錄（核對登入裝置、這一關在雲端存檔裡已經收復、武器在存檔裡、秒數 1～60、3 秒內不能連傳）
-- 4) fk_board：讀一關的前 50 名＋我的名次；fk_feed_list：拿最近 10 分鐘的王關公告
-- 不改 save_game、不改 ac_version。執行完用最後一行確認，應該顯示 4.73。

create table if not exists public.fk (
  user_id uuid not null references auth.users(id) on delete cascade,
  village int not null check (village between 0 and 89),
  sec numeric(5,1) not null,
  w jsonb not null,
  nick text,
  at timestamptz not null default now(),
  primary key (user_id, village)
);
create index if not exists fk_rank on public.fk (village, sec, at);
create table if not exists public.fk_feed (
  id bigserial primary key,
  user_id uuid,
  nick text,
  village int not null,
  sec numeric(5,1) not null,
  bp text,
  lv int,
  kind text not null,          -- 'first'＝全服首殺、'top'＝刷新全服第 1 名
  created_at timestamptz not null default now()
);
create table if not exists public.fk_ctr (user_id uuid primary key, last timestamptz not null default now());
alter table public.fk enable row level security;
alter table public.fk_feed enable row level security;
alter table public.fk_ctr enable row level security;
-- 不開放直接讀寫，一律經過下面的函式

create or replace function public.fk_version() returns text language sql immutable as $$ select '4.73'::text $$;

create or replace function public.fk_submit(p_sid text, p_village int, p_sec numeric, p_wid bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare sv saves; x jsonb; old fk; top fk; c fk_ctr; s numeric(5,1) := round(p_sec, 1); kind text; rk int; n int;
begin
  if auth.uid() is null then return jsonb_build_object('r', 'login'); end if;
  if p_village is null or p_village not between 0 and 89 or s is null or s < 1 or s > 60 then return jsonb_build_object('r', 'bad'); end if;
  select * into sv from saves where user_id = auth.uid();
  if not found or sv.session_id is distinct from p_sid then return jsonb_build_object('r', 'session'); end if;
  if coalesce(sv.data->'villages'->p_village->>'status', '') <> 'cleared' then return jsonb_build_object('r', 'nope'); end if;
  select e into x from jsonb_array_elements(coalesce(sv.data->'weapons', '[]')) e where (e->>'id')::bigint = p_wid limit 1;
  if x is null then return jsonb_build_object('r', 'weapon'); end if;
  insert into fk_ctr (user_id, last) values (auth.uid(), now() - interval '1 minute') on conflict (user_id) do nothing;
  select * into c from fk_ctr where user_id = auth.uid() for update;
  if now() - c.last < interval '3 seconds' then return jsonb_build_object('r', 'slow'); end if;
  update fk_ctr set last = now() where user_id = auth.uid();
  select * into old from fk where user_id = auth.uid() and village = p_village;
  if found and old.sec <= s then
    select count(*)::int + 1 into rk from fk where village = p_village and (sec < old.sec or (sec = old.sec and at < old.at));
    select count(*)::int into n from fk where village = p_village;
    return jsonb_build_object('r', 'kept', 'rank', rk, 'n', n, 'sec', old.sec, 'top', (select min(sec) from fk where village = p_village));
  end if;
  select * into top from fk where village = p_village order by sec, at limit 1;
  insert into fk (user_id, village, sec, w, nick, at)
    values (auth.uid(), p_village, s, jsonb_build_object('b', x->'b', 'q', coalesce(x->'q', '0'), 'lv', coalesce(x->'lv', '0'), 'ench', coalesce(x->'ench', '[]')), coalesce(sv.nickname, '無名鐵匠'), now())
    on conflict (user_id, village) do update set sec = excluded.sec, w = excluded.w, nick = excluded.nick, at = excluded.at;
  if p_village % 10 >= 8 then   -- 每一界第 9、10 關才上跑馬燈
    if top.user_id is null then kind := 'first';
    elsif s < top.sec and top.user_id <> auth.uid() then kind := 'top';
    end if;
    if kind is not null then
      insert into fk_feed (user_id, nick, village, sec, bp, lv, kind) values (auth.uid(), coalesce(sv.nickname, '無名鐵匠'), p_village, s, x->>'b', coalesce((x->>'lv')::int, 0), kind);
      delete from fk_feed where created_at < now() - interval '1 day';
    end if;
  end if;
  select count(*)::int + 1 into rk from fk where village = p_village and (sec < s or (sec = s and user_id <> auth.uid() and at < now()));
  select count(*)::int into n from fk where village = p_village;
  return jsonb_build_object('r', 'ok', 'rank', rk, 'n', n, 'sec', s, 'prev', old.sec, 'top', (select min(sec) from fk where village = p_village), 'kind', kind);
end $$;

create or replace function public.fk_board(p_village int)
returns jsonb language sql stable security definer set search_path = public as $$
  with r as (
    select f.*, row_number() over (order by f.sec, f.at) as rk from fk f where f.village = p_village
  )
  select jsonb_build_object(
    'n', (select count(*) from r),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('rk', rk, 'uid', user_id, 'nick', nick, 'sec', sec, 'w', w, 'mine', user_id = auth.uid()) order by rk) from r where rk <= 50), '[]'::jsonb),
    'me', (select jsonb_build_object('rk', rk, 'sec', sec, 'w', w) from r where user_id = auth.uid())
  ) where auth.uid() is not null
$$;

create or replace function public.fk_feed_list(p_after bigint default 0)
returns table (id bigint, uid uuid, nick text, village int, sec numeric, bp text, lv int, kind text, mine boolean)
language sql stable security definer set search_path = public as $$
  select f.id, f.user_id, f.nick, f.village, f.sec, f.bp, f.lv, f.kind, f.user_id = auth.uid()
  from fk_feed f where auth.uid() is not null and f.id > coalesce(p_after, 0) and f.created_at > now() - interval '10 minutes'
  order by f.id limit 10
$$;

revoke all on function public.fk_submit(text, int, numeric, bigint) from public, anon;
revoke all on function public.fk_board(int) from public, anon;
revoke all on function public.fk_feed_list(bigint) from public, anon;
grant execute on function public.fk_submit(text, int, numeric, bigint) to authenticated;
grant execute on function public.fk_board(int) to authenticated;
grant execute on function public.fk_feed_list(bigint) to authenticated;
grant execute on function public.fk_version() to authenticated, anon;

notify pgrst, 'reload schema';
-- 執行完用這行確認，應該顯示 4.73：
select public.fk_version();
