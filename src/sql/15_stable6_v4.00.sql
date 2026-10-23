-- v4.00 安定值全部改成 +6（鐵製、霜銀、龍鱗、神器、巨人都一樣，與遊戲 TIERS.stable 相同）
-- save_game 的防作弊用 ac_stable 判斷「危險區一次存檔最多升 2 級」，這裡同步改成 6，
-- 否則神器／巨人武器一鍵強化到 +6 會被誤判為 enhance too fast。
-- 只換掉這一個函式，save_game 本身不用重貼。
create or replace function public.ac_stable(p_b text) returns int language sql immutable as $$
  select 6 $$;
revoke all on function public.ac_stable(text) from public;

-- 確認：四個都要回 6
select ac_stable('t1_ironsword') t1, ac_stable('t3_greatsword') t3, ac_stable('m_nidhogg') m, ac_stable('t4_sword') t4;
