// 測試用的畫面清單（run_tests.js 第 5 層和 shots.js 前後對照共用同一份，新畫面只加在這裡）
// [名稱, 分頁, 準備動作]；準備動作在頁面裡執行（p＝Playwright page）
module.exports=[['鐵匠鋪','forge',null],['道具欄武器','armory',p=>p.evaluate(()=>{devdo('bag96')})],['道具欄材料','armory',p=>p.evaluate(()=>{ui.atab='m';render()})],
  ['村莊','village',p=>p.evaluate(()=>{const b=BPS.find(x=>!x.dev&&!x.unlock);const w=makeWeapon(b.id,0,6);deliverCore(0,w.id);const st=S.villages[0];st.cycleStart-=dur(0,w)*3+10;tick();render()})],['交易所','market',null],['商城','shop',null],
  ['武器小卡','armory',p=>p.evaluate(()=>{const w=S.weapons.find(x=>!x.test)||makeWeapon(BPS.find(x=>!x.dev&&!x.unlock).id,0,6);ui.sheet={t:'w',id:w.id,m:'main'};render()})],
  ['強化小卡','armory',p=>p.evaluate(()=>{const w=makeWeapon(BPS.find(x=>!x.dev&&!x.unlock).id,0,6);ui.sheet={t:'w',id:w.id,m:'enh'};render()})],
  ['附魔小卡','armory',p=>p.evaluate(()=>{const w=makeWeapon(BPS.find(x=>!x.dev&&!x.unlock).id,0,3);ui.sheet={t:'w',id:w.id,m:'ench'};render()})],
  ['設定頁','forge',p=>p.evaluate(()=>{ui.sheet={t:'set'};render()})]];
