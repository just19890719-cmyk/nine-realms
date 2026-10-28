-- v5.35 重新開放前清空所有玩家進度（Mochi 2026-10-28：「重新開放時，所有進度都會清除，大家將從頭開始」）
-- ⚠ 只在「確定要重新開放」那天、MAINT 改成 false 之前執行一次。執行後所有玩家（包含管理員）都會從頭開始。
-- 會保留：帳號（Email／密碼，auth.users）、管理員名單 admins、聊天禁言名單 chat_mute、髒話／白名單 chat_bad／chat_okw、所有函式。
-- 會清空：雲端存檔（含暱稱，玩家重新登入時會重新取暱稱）、防作弊額度與紀錄、交易所、排行榜、秒殺榜、跑馬燈、恭喜、
--         世界首領、聊天訊息與檢舉、名片按讚、公會、好友。
-- 清空前先把每一張表完整複製到 bak_v535 這個備份區（萬一要救回來，可以從那裡複製回去）。
-- 不改 save_game、不改 ac_version。最後一行的 select 會列出每張表「備份筆數／清空後筆數」，清空後都應該是 0。

create schema if not exists bak_v535;
revoke all on schema bak_v535 from public, anon, authenticated;

create table if not exists bak_v535.wipe_log (tbl text primary key, backed bigint, after bigint, at timestamptz default now());

do $$
declare
  t text;
  n bigint;
  -- 有外鍵關係的表放後面的先清（子表在前）
  tbls text[] := array['market_fill','market','lb','fk_feed','fk','fk_ctr','news_cheer','news','news_ctr',
                       'boss_slot','boss','chat_report','chat','chat_ctr','pc_like',
                       'guild_app','guild_mem','gd_user','guild','friend_req','friend',
                       'ac_bucket','ac_log','saves'];
begin
  foreach t in array tbls loop
    if to_regclass('public.' || t) is null then
      insert into bak_v535.wipe_log (tbl, backed, after) values (t || '（不存在，略過）', 0, 0) on conflict (tbl) do nothing;
      continue;
    end if;
    -- 備份：已經備份過就不重複覆蓋（重跑這個檔案也安全）
    if to_regclass('bak_v535.' || t) is null then
      execute format('create table bak_v535.%I as table public.%I', t, t);
    end if;
    execute format('select count(*) from bak_v535.%I', t) into n;
    execute format('delete from public.%I', t);
    insert into bak_v535.wipe_log (tbl, backed, after) values (t, n, 0)
      on conflict (tbl) do update set backed = excluded.backed, after = 0, at = now();
  end loop;
end $$;

-- 確認：每張表清空後的筆數（after 欄是實際再數一次）
select l.tbl, l.backed as 備份筆數,
  case when to_regclass('public.' || l.tbl) is null then 0
       else (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', l.tbl), false, true, '')))[1]::text::bigint end as 清空後筆數
from bak_v535.wipe_log l order by l.tbl;
