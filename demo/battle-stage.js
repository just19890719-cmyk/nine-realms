// 戰鬥展示測試頁的驅動程式。只呼叫 game.js 原本的函式（render／tick／updateLive／monFx／monVolley／knHit／knNext／monPaint），
// 不另寫戰鬥動畫。所有資料都在記憶體（loadState 讀的是記憶體版 localStorage → 全新存檔），重新整理就回到初始狀態。
(function(){
const Q=new URLSearchParams(location.search),CATS7=Object.keys(KN);
const cat=CATS7.includes(Q.get('w'))?Q.get('w'):'sword',mi=Math.max(0,Math.min(VILLAGES.length-1,+Q.get('m')||0)),lv=Math.max(0,Math.min(MAX_LV,Q.get('lv')==null?6:+Q.get('lv')));
let mode=Q.get('mode')==='single'?'single':'auto',force=Q.get('force')==='1',log=[];
const note=(t,k)=>{log.unshift({t:performance.now(),s:t,k:k||''});log.length=Math.min(log.length,40)};

// ③ 建立測試存檔（記憶體）：只有這一座村莊駐守這一把武器，其他都不動。武器用開發者工具同一個做法：該類別最低階圖紙、品質 2、強化 +lv
loadState();applySkin();ui.tab='village';ui.sheet=null;ui.result=null;S.tut=99;S.tips=Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]));
S.villages.forEach((v,j)=>{if(j<=mi||(mi>=10&&j<=10))v.status='cleared'});
const bp=BPS.filter(x=>x.cat===cat&&!x.dev).sort((x,y)=>x.t-y.t)[0],w=makeWeapon(bp.id,2,lv),st=S.villages[mi];
st.weaponId=w.id;st.cycleStart=NOW()-dur(mi,w)*.3;ui.realm=mi>=10?1:0;ui.bsOpen=mi;ui.bsProc=force?1:0;
const clearKH=()=>Object.keys(KHIT).forEach(k=>delete KHIT[k]);clearKH();

// 只留下戰鬥卡片（同一張 .vcard，含戰鬥畫面、血條、掉落），其他村莊卡片、地圖標題拿掉
function prune(){const V=document.getElementById('view'),card=V.querySelector('.vcard.bt');if(!card)return;const list=card.parentElement;
  [...list.children].forEach(c=>{if(c!==card)c.remove()});[...V.children].forEach(c=>{if(c!==list)c.remove()})}
function draw(){render();prune()}
// 戰鬥卡片上的按鈕（收起、收成、掉落說明）在展示頁不作用：沒有綁定遊戲的點擊處理（bindUI），點了不會改任何資料

const H=()=>MONFX.hp[mi],mon=()=>document.querySelector(`#view [data-mon="${mi}"]`);
let pending=0,killT=-1e9;
// 主迴圈：跟正式遊戲一樣每 250 毫秒（start() 裡的 setInterval）
setInterval(()=>{
  if(mode==='auto'){if(tick())draw();updateLive();
    const b=st.bank;if(b.cycles>=capCycles(mi,w)-1){b.cycles=0;b.gold=0;b.mats={};draw()}}   // 倉庫快滿時清掉（正式遊戲滿了會暫停狩獵）
  else{st.cycleStart=NOW();const h=H();if(h){h.nx=Infinity;monPaint(mi,h)}}   // 單次模式：時間不推進，只有按按鈕才攻擊
},250);

// 包一層 monShot 只為了記錄「打出了什麼」顯示在控制區（原函式照常執行）
const _shot=monShot;monShot=function(i,sh,f,dx){const h=MONFX.hp[i],c0=h&&h.cur;_shot(i,sh,f,dx);const h2=MONFX.hp[i];if(i===mi&&h2&&c0!=null&&h2.cur<c0)note(`${sh[2]||'hit'}${sh[3]?'「'+sh[3]+'」':''} −${fmt(c0-h2.cur)}`,mode==='single'||force?'強制/單次':'')};
const _pop=monPop;monPop=function(el,kind,txt,dx,big){if(kind==='kill')note('擊倒',performance.now()-killT<3000?'強制':'');return _pop(el,kind,txt,dx,big)};

// 單次攻擊：等騎士下一次揮到命中那一格（knNext，跟正式遊戲同一個時間點）才結算一輪。plan＝本武器原本的出招表
function single(kind){const h=H();if(!h||h.refill||pending)return false;const real=h.hs;
  let hs=real;if(kind==='normal')hs={...real,plan:()=>[[0,1]]};else if(kind==='special'){h.amp=0;ui.bsProc=1;clearKH();hs=knHit(w);ui.bsProc=force?1:0;clearKH()}
  h.live=Math.max(0,h.cur-h.unit*real.E);const now=performance.now(),t=knNext(real,now);pending=1;
  setTimeout(()=>{h.hs=hs;monVolley(mi,h);h.hs=real;pending=0;setTimeout(()=>{const g=H();if(mode==='single'&&g&&!g.refill&&g.cur<=Math.max(1,g.max*.01))kill()},1600)},Math.max(0,t-now));return true}
// 擊倒：自動模式＝把這一輪的時間撥到剩 1.2 秒（開發者工具 bskill 同一個做法），之後由遊戲自己結算、播擊倒、重生；
// 單次模式＝讓 monFx 走原本的「打倒一隻」分支（倉庫 +1 輪），1.1 秒後再走原本的補血分支
function kill(){killT=performance.now();
  if(mode==='auto'){st.cycleStart=NOW()-dur(mi,w)+1200;return}
  const d=dur(mi,w);st.bank.cycles++;monFx(mi,st,w,false,d,0);monPaint(mi,H());setTimeout(()=>{monFx(mi,st,w,false,d,0);monPaint(mi,H())},1150)}

window.DEMO={
  info:()=>({build:BUILD_ID,weapon:`${bp.n} +${lv}（攻擊力 ${fmt(power(w))}）`,cat,catN:CATS[cat],mon:`${vNo(mi)} ${MON_T[mi]}・${MONS[mi]}`,el:ELEM[MON_EL[mi]].n,mode,force,
    proc:procP(lv),special:(HIT_N[cat]||'').replace(/^.*附加效果/,'附加效果'),hp:H()?Math.ceil(H().cur/H().max*100):null,cycle:Math.round(dur(mi,w)/1000),
    width:innerWidth,blocked:DEMO_BLOCKED.slice(),log:log.slice(0,12).map(x=>({ago:Math.round((performance.now()-x.t)/100)/10,s:x.s,k:x.k}))}),
  setMode:m=>{mode=m==='single'?'single':'auto';if(mode==='auto'){const h=H();if(h)h.nx=null;st.cycleStart=NOW()-dur(mi,w)*(h?1-h.cur/h.max:.3)}note(mode==='auto'?'切到自動連續攻擊':'切到單次攻擊')},
  setForce:v=>{force=!!v;ui.bsProc=force?1:0;clearKH();note(force?'強制觸發附加效果：開':'強制觸發附加效果：關')},
  single,kill,
  // 開發者工具 v5.40 原本的兩個按鈕（固定假數字，直接呼叫 devdo，同一份程式）：bspierce 長柄 6 位數兩段、bsshake 會心→普通錘擊→震碎
  dev:k=>{if(!['bspierce','bsshake'].includes(k))return;note('開發者工具 '+k+'（固定假數字）','強制');devdo(k)},
};
draw();note('測試狀態已建立');
})();
