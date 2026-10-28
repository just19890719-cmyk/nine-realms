-- v5.36 道具／材料額度：花掉的金幣、鑽石和打開的英靈・遺物算進額度（Mochi 2026-10-28 選「伺服器把花掉的錢算進額度」）
-- 要先跑過 08（save_game 第一次建立）。只改 save_game 裡「道具」「材料」兩個額度的算法，其他檢查（金幣、鑽石、武器、強化…）完全不變。
-- 以前：道具一次最多 +1,000（每小時補 200）、材料 +8,000（每小時補 600），商城一次買很多、或一次打開很多遺物，正常玩家也會被當成作弊。
-- 現在：
--   1. 這次存檔的金幣、鑽石比上次少 → 照商城最便宜的價格換成「可以多拿的道具／材料」（強化石 300 金幣或 6 鑽石一顆、材料 10 金幣或 0.5 鑽石一個；
--      先抵道具、剩下的再抵材料，同一筆錢不會算兩次）。
--   2. 英靈・遺物比上次少 → 每少一個，可以多拿 12 個道具和 50 個材料（金光遺物一次開出的最大量）。
--   超過的部分才扣原本的每小時額度。金幣、鑽石本身的增加照舊受額度限制，所以不能用改金幣的方式換出道具。
create or replace function public.ac_version() returns text language sql immutable as $$ select '5.36'::text $$;
grant execute on function public.ac_version() to anon, authenticated;

create or replace function public.save_game(p_sid text, p_data jsonb, p_nick text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  old saves; o jsonb; n jsonb := p_data; b ac_bucket; adm boolean; hrs float8;
  reason text; w jsonb; ow jsonb; wid bigint; seen bigint[] := '{}';
  allow_g float8 := 0; allow_m float8 := 0; allow_w float8 := 0; allow_sp float8 := 0;
  spend_g float8 := 0; lvn int; lvo int; i int; nclr int; rfn int; rfo int;
  g float8; m float8; mt float8; it float8; wp float8;
  sg float8; ru float8; ci float8;   -- v5.36 花掉的錢（換算成金幣）、打開的遺物、拿來抵道具的錢
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  select * into old from saves where user_id = auth.uid() for update;
  if not found or old.session_id is distinct from p_sid then raise exception 'session'; end if;
  o := old.data;
  adm := exists (select 1 from admins where user_id = auth.uid());

  -- 已經上架到交易所的武器，不准還留在背包（自動移除）
  n := jsonb_set(n, '{weapons}', coalesce((select jsonb_agg(x) from jsonb_array_elements(coalesce(n->'weapons', '[]')) x
        where not exists (select 1 from market mk where mk.seller = auth.uid() and mk.status in ('open', 'sold')
          and (mk.weapon->>'oid') = (x->>'id') and coalesce(mk.weapon->>'ocr', '0')::float8 = coalesce(x->>'created', '0')::float8)), '[]'::jsonb));

  if not adm then
    -- 遊戲速度、離線上限固定（v3.69：10 倍速已寫進遊戲時間，速度 1；離線上限 12 小時）
    n := jsonb_set(jsonb_set(n, '{speed}', '1'), '{capH}', '12');
    -- 武器檢查
    for w in select x from jsonb_array_elements(coalesce(n->'weapons', '[]')) x loop
      wid := (w->>'id')::bigint; lvn := coalesce((w->>'lv')::int, 0); rfn := coalesce((w->>'rf')::int, 0);
      if wid = any(seen) then reason := coalesce(reason, 'duplicate weapon'); end if;
      seen := seen || wid;
      if coalesce((w->>'q')::int, 0) not between 0 and 4 or lvn not between 0 and 15
         or jsonb_array_length(coalesce(w->'traits', '[]')) > 3 then reason := coalesce(reason, 'weapon range'); end if;
      -- v3.76 巨人體重鍊：0～5 級，只有龍鱗（×6）和神器（×11）可以重鍊
      if rfn not between 0 and 5 or (rfn > 0 and ac_mult(w->>'b') < 6) then reason := coalesce(reason, 'weapon range'); end if;
      if exists (select 1 from jsonb_array_elements(coalesce(w->'traits', '[]')) t where (t->>'v')::float8 > 150)
         or exists (select 1 from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and (e->>'v')::float8 > 150)
        then reason := coalesce(reason, 'weapon stat'); end if;
      if o is not null then
        if wid < coalesce((o->>'nextId')::bigint, 1) then
          ow := null;
          select x into ow from jsonb_array_elements(coalesce(o->'weapons', '[]')) x where (x->>'id')::bigint = wid limit 1;
          if ow is null then reason := coalesce(reason, 'weapon appeared');
          elsif ow->>'b' is distinct from w->>'b' or ow->>'q' is distinct from w->>'q' or ow->'traits' is distinct from w->'traits'
            then reason := coalesce(reason, 'weapon changed');
          else
            -- v3.63 強化只會往上、每升一級至少花一次強化費；每改一格附魔至少花一次附魔費
            lvo := coalesce((ow->>'lv')::int, 0);
            if lvn < lvo then reason := coalesce(reason, 'weapon level down'); end if;
            -- 危險區（超過安定值）一次存檔最多升 2 級：正常強化每次都要看動畫、而且成功率低，10 秒內不可能連升好幾級
            if lvn - greatest(lvo, ac_stable(w->>'b')) > 2 then reason := coalesce(reason, 'enhance too fast'); end if;
            spend_g := spend_g + ac_enh_cost(w->>'b', lvo, lvn);
            -- v3.76 重鍊只會往上，每級要花金幣
            rfo := coalesce((ow->>'rf')::int, 0);
            if rfn < rfo then reason := coalesce(reason, 'weapon changed'); end if;
            spend_g := spend_g + ac_rf_gold(rfo, rfn);
            for i in 0..3 loop
              if jsonb_typeof(w->'ench'->i) = 'object' and (w->'ench'->i) is distinct from (ow->'ench'->i) then
                spend_g := spend_g + 40 * ac_mult(w->>'b');
                if (w->'ench'->i->>'v')::float8 > 40 then reason := coalesce(reason, 'weapon stat'); end if;   -- v3.63 新附魔最高 40
              end if;
            end loop;
          end if;
        else
          -- 新武器：鍛造出來是 +0、沒有附魔；之後的強化、附魔都要算花費（交易所買到／退回的另外扣除）
          spend_g := spend_g + ac_enh_cost(w->>'b', 0, lvn) + 40 * ac_mult(w->>'b') * ac_ench_n(w) + ac_rf_gold(0, rfn);
          -- v3.76 新武器不會帶重鍊等級（交易所買到／退回的除外）
          if rfn > 0 and not exists (select 1 from market mk where (mk.buyer = auth.uid() or mk.seller = auth.uid()) and mk.bp = w->>'b' and mk.lv = lvn
             and coalesce((mk.weapon->>'rf')::int, 0) = rfn) then reason := coalesce(reason, 'reforge'); end if;
          if not exists (select 1 from market mk where (mk.buyer = auth.uid() or mk.seller = auth.uid()) and mk.bp = w->>'b' and mk.lv = lvn)
             and lvn - ac_stable(w->>'b') > 2 then reason := coalesce(reason, 'enhance too fast'); end if;
          -- v3.63 新武器的數值上限收緊：特性最高 25×1.8=45、附魔最高 40（舊武器維持原本寬鬆上限，避免舊存檔卡住）
          if exists (select 1 from jsonb_array_elements(coalesce(w->'traits', '[]')) t where (t->>'v')::float8 > 45)
             or exists (select 1 from jsonb_array_elements(coalesce(w->'ench', '[]')) e where jsonb_typeof(e) = 'object' and (e->>'v')::float8 > 40)
            then reason := coalesce(reason, 'weapon stat'); end if;
        end if;
      end if;
    end loop;
    if coalesce((n->>'furnace')::int, 1) > 6 or coalesce((n->>'anvil')::int, 1) > 5 or coalesce((n->>'slots')::int, 1) > 4
      then reason := coalesce(reason, 'workshop'); end if;

    if o is not null then
      -- v3.63 工坊升級要花錢
      spend_g := spend_g + ac_ws_cost('furnace', coalesce((o->>'furnace')::int, 1), coalesce((n->>'furnace')::int, 1))
                         + ac_ws_cost('anvil', coalesce((o->>'anvil')::int, 1), coalesce((n->>'anvil')::int, 1))
                         + ac_ws_cost('slots', coalesce((o->>'slots')::int, 1), coalesce((n->>'slots')::int, 1));
      -- v3.63 村莊只能依序收復，一次存檔最多新收復 2 座
      for i in 1..19 loop
        if coalesce(n->'villages'->i->>'status', '') = 'cleared' and coalesce(o->'villages'->i->>'status', '') <> 'cleared'
           and coalesce(n->'villages'->(i-1)->>'status', '') <> 'cleared'
          then reason := coalesce(reason, 'village order'); end if;
      end loop;
      select count(*) filter (where coalesce(n->'villages'->k->>'status', '') = 'cleared' and coalesce(o->'villages'->k->>'status', '') <> 'cleared')
        into nclr from generate_series(0, 19) k;
      if nclr > 2 then reason := coalesce(reason, 'villages +' || nclr); end if;
    end if;

    -- 交易所：這次存檔新入帳的成交金額、退回／買到的武器，不算在額度裡
    select coalesce(sum(floor(price * 0.95)) filter (where cur = 'gold'), 0), coalesce(sum(floor(price * 0.95)) filter (where cur = 'gems'), 0)
      into allow_g, allow_m from market
      where seller = auth.uid() and status = 'sold' and settled = false
        and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id);
    select count(*), coalesce(sum(ac_enh_cost(bp, 0, lv) + 40 * ac_mult(bp) * ac_ench_n(weapon) + ac_rf_gold(0, coalesce((weapon->>'rf')::int, 0))), 0) into allow_w, allow_sp from market
      where (seller = auth.uid() and status in ('expired', 'cancelled') and settled = false
              and coalesce(n->'mk'->'done', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'done', '[]') @> to_jsonb(id))
         or (buyer = auth.uid() and buyer_ack = false
              and coalesce(n->'mk'->'got', '[]') @> to_jsonb(id) and not coalesce(o->'mk'->'got', '[]') @> to_jsonb(id));
    -- 合理收入額度：隨時間補回
    -- v3.50 首次收復村莊獎勵、改版補發（金額表與遊戲 FIRST_GOLD 相同）
    allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000),(10,15000),(11,18000),(12,21000),(13,24000),(14,27000),(15,30000),(16,35000),(17,40000),(18,45000),(19,50000)) f(i, fg)
      where coalesce(n->'villages'->f.i->>'status', '') = 'cleared' and coalesce(o->'villages'->f.i->>'status', '') <> 'cleared'), 0);
    if coalesce(n->>'fcRw', '') = 'true' and coalesce(o->>'fcRw', '') <> 'true' then
      allow_g := allow_g + coalesce((select sum(f.fg) from (values (0,300),(1,500),(2,800),(3,1200),(4,2000),(5,3000),(6,5000),(7,8000),(8,12000),(10,15000),(11,18000),(12,21000),(13,24000),(14,27000),(15,30000),(16,35000),(17,40000),(18,45000),(19,50000)) f(i, fg)
        where coalesce(o->'villages'->f.i->>'status', '') = 'cleared'), 0);
    end if;

    -- v3.63 額度放寬：後期全村勤收成每小時約 1～2 萬金、數百個材料
    -- v3.69 離線上限改 12 小時：一次收成最多 12 小時份量，金幣上限 16 萬 → 30 萬、材料 4,000 → 6,000（補回速度不變）
    -- v3.76 第二界約頓海姆全開後收入約 3 倍：金幣每小時 2 萬 → 6 萬、上限 30 萬 → 80 萬；材料每小時 400 → 600、上限 6,000 → 8,000
    select * into b from ac_bucket where user_id = auth.uid() for update;
    if not found then insert into ac_bucket values (auth.uid(), 800000, 1500, 8000, 1000, 200, now()) returning * into b; end if;
    hrs := greatest(0, extract(epoch from now() - b.t) / 3600);
    b.gold := least(800000, b.gold + 60000 * hrs); b.gems := least(1500, b.gems + 30 * hrs);
    b.mats := least(8000, b.mats + 600 * hrs); b.items := least(1000, b.items + 200 * hrs); b.wpn := least(200, b.wpn + 30 * hrs);
    if o is not null then
      g  := greatest(0, coalesce((n->>'gold')::float8, 0) - coalesce((o->>'gold')::float8, 0) - allow_g + greatest(0, spend_g - allow_sp));
      m  := greatest(0, coalesce((n->>'gems')::float8, 0) - coalesce((o->>'gems')::float8, 0) - allow_m);
      -- v5.36 花掉的金幣＋鑽石（1 鑽石＝50 金幣，強化石 300 金幣／6 鑽石）、打開的遺物
      sg := greatest(0, coalesce((o->>'gold')::float8, 0) - coalesce((n->>'gold')::float8, 0))
          + 50 * greatest(0, coalesce((o->>'gems')::float8, 0) - coalesce((n->>'gems')::float8, 0));
      ru := greatest(0, (select coalesce(sum((value #>> '{}')::float8), 0) from jsonb_each(coalesce(o->'items', '{}'::jsonb)) where key like 'relic\_%' and jsonb_typeof(value) = 'number')
                      - (select coalesce(sum((value #>> '{}')::float8), 0) from jsonb_each(coalesce(n->'items', '{}'::jsonb)) where key like 'relic\_%' and jsonb_typeof(value) = 'number'));
      it := greatest(0, ac_sum(n->'items') - ac_sum(o->'items') - 12 * ru);
      ci := least(it, sg / 300);          -- 先用花掉的錢抵道具
      it := it - ci;
      mt := greatest(0, ac_sum(n->'mats') - ac_sum(o->'mats') - 50 * ru - (sg - ci * 300) / 10);   -- 剩下的錢再抵材料
      wp := greatest(0, coalesce((n->>'nextId')::float8, 0) - coalesce((o->>'nextId')::float8, 0) - allow_w);
      if g > b.gold then reason := coalesce(reason, 'gold +' || g::bigint); end if;
      if m > b.gems then reason := coalesce(reason, 'gems +' || m::bigint); end if;
      if mt > b.mats then reason := coalesce(reason, 'mats +' || mt::bigint); end if;
      if it > b.items then reason := coalesce(reason, 'items +' || it::bigint); end if;
      if wp > b.wpn then reason := coalesce(reason, 'weapons +' || wp::bigint); end if;
      b.gold := b.gold - g; b.gems := b.gems - m; b.mats := b.mats - mt; b.items := b.items - it; b.wpn := b.wpn - wp;
    end if;
    if reason is not null then
      insert into ac_log (user_id, nick, reason, detail) values (auth.uid(), old.nickname, reason,
        jsonb_build_object('gold', array[o->'gold', n->'gold'], 'gems', array[o->'gems', n->'gems'], 'nextId', array[o->'nextId', n->'nextId'],
          'spend', spend_g, 'allow', allow_g));
      return 'cheat:' || reason;
    end if;
    update ac_bucket set gold = b.gold, gems = b.gems, mats = b.mats, items = b.items, wpn = b.wpn, t = now() where user_id = auth.uid();
  end if;

  update saves set data = n, nickname = coalesce(p_nick, nickname), updated_at = now() where user_id = auth.uid();
  return 'ok';
end $$;

-- v4.83 那份（22）少了函式結尾的 end $$;，如果當時是照檔案貼，道具額度可能還是舊的 30 個；這份會一起補上，把每個人的道具額度補滿
update ac_bucket set items = 1000;

notify pgrst, 'reload schema';
-- 確認：第一欄應該顯示 5.36，第二欄應該是 true（新的額度算法已經生效）
select public.ac_version(), (select prosrc like '%sg / 300%' from pg_proc where proname = 'save_game' limit 1) as new_bucket;
