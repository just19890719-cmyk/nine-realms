-- v5.34 秒殺榜重新開始（Mochi 2026-10-28：怪物血量改成「偏難」表，舊紀錄是用舊血量打的）
-- 1) 先把舊紀錄整份備份到 fk_old_v473（要復原時可以從這裡搬回去）
-- 2) 清空 fk（每人每關最快紀錄）和 fk_feed（王關公告）
-- 3) fk_version 改成 5.34，最後一行用來確認
-- 只動秒殺榜，不改 save_game、不改 ac_version。遊戲端 v5.34 載入存檔時也會清掉本機的舊秒殺紀錄（S.fkv）。
create table if not exists public.fk_old_v473 as table public.fk with no data;
alter table public.fk_old_v473 enable row level security;
insert into public.fk_old_v473 select * from public.fk;
delete from public.fk;
delete from public.fk_feed;
create or replace function public.fk_version() returns text language sql immutable as $$ select '5.34'::text $$;
grant execute on function public.fk_version() to authenticated, anon;
-- 應該顯示：5.34、0、0、備份筆數
select public.fk_version() as ver, (select count(*) from public.fk) as fk_rows, (select count(*) from public.fk_feed) as feed_rows, (select count(*) from public.fk_old_v473) as backup_rows;
