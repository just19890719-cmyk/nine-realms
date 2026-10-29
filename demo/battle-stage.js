// 戰鬥展示測試頁的驅動程式。只呼叫 game.js 原本的函式（render／tick／updateLive／monFx／monVolley／knHit／knNext／monPaint），
// 不另寫戰鬥動畫。所有資料都在記憶體（loadState 讀的是記憶體版 localStorage → 全新存檔），重新整理就回到初始狀態。
(function(){
const Q=new URLSearchParams(location.search),CATS7=Object.keys(KN);
const cat=CATS7.includes(Q.get('w'))?Q.get('w'):'sword',mi=Math.max(0,Math.min(VILLAGES.length-1,+Q.get('m')||0)),lv=Math.max(0,Math.min(MAX_LV,Q.get('lv')==null?6:+Q.get('lv')));
let mode=Q.get('mode')==='single'?'single':'auto',force=Q.get('force')==='1',log=[];const GEN=+Q.get('gen')||0;   // GEN＝控制頁第幾次載入戰鬥區，控制頁只聽同一次的回報
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
// 請求計數（從這個戰鬥區載入起算）：瀏覽器 Resource Timing 記下的每一個實際送出的請求，依網址分類；被擋下沒送出的另外計
const REQ=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>REQ.push(e.name))).observe({type:'resource',buffered:true})}catch(e){}
const CSPV=[];document.addEventListener('securitypolicyviolation',e=>CSPV.push(e.blockedURI));
const reqKind=u=>/supabase\.co|\/rest\/v1\/|\/auth\/v1\/|\/functions\/v1\//.test(u)?'api':/fonts\.(googleapis|gstatic)\.com/.test(u)?'font':/\/(art|sfx)\//.test(u)?'asset':/\/(src|demo)\/[^?]*\.(js|css)(\?|$)/.test(u)?'code':'other';
let pending=0,killT=-1e9;
// 主迴圈：跟正式遊戲一樣每 250 毫秒（start() 裡的 setInterval）
setInterval(()=>{
  if(mode==='auto'){if(tick())draw();updateLive();
    const b=st.bank;if(b.cycles>=capCycles(mi,w)-1){b.cycles=0;b.gold=0;b.mats={};draw()}}   // 倉庫快滿時清掉（正式遊戲滿了會暫停狩獵）
  else{st.cycleStart=NOW();const h=H();if(h){h.nx=Infinity;monPaint(mi,h)}}   // 單次模式：時間不推進，只有按按鈕才攻擊
},250);

// 包一層 monShot 只為了記錄「打出了什麼」顯示在控制區（原函式照常執行）
// 每一下標清楚來源：自動・自然／自動・強制附加效果／單次・照原本機率／單次・強制一般命中／單次・強制附加效果（持續傷害的後續幾下沿用同一下的標籤）
let TAG={s:'',t:-1e9};const tagNow=()=>performance.now()-TAG.t<2500?TAG.s:mode==='auto'?(force?'自動・強制附加效果':'自動・自然'):'';
const _shot=monShot;monShot=function(i,sh,f,dx){const h=MONFX.hp[i],c0=h&&h.cur;_shot(i,sh,f,dx);const h2=MONFX.hp[i];if(i===mi&&h2&&c0!=null&&h2.cur<c0)note(`${sh[2]||'hit'}${sh[3]?'「'+sh[3]+'」':''} −${fmt(c0-h2.cur)}`,tagNow())};
// 單次模式下，只有按鈕觸發的那一輪會打；第一次畫面時 updateLive 可能排進一輪自動攻擊，這裡擋掉
let ALLOW=0;const _vol=monVolley;monVolley=function(i,h){if(i===mi&&mode==='single'&&!ALLOW)return;return _vol(i,h)};
// P2-01 修法預覽（預設關，只在展示頁；正式遊戲 src/game.js 沒改）：同一隻怪物身上的同類持續傷害（中毒／流血）只留最新一個數字，
// 舊的直接拿掉；舊數字上的「中毒」「流血」標籤搬到新數字上。傷害、機率、出手節奏都不變。要放進遊戲時，就是在 monPop 開頭加同樣這一行。
let FIX=Q.get('fix')==='1';
const _pop=monPop;monPop=function(el,kind,txt,dx,big){if(kind==='kill')note('擊倒',performance.now()-killT<3000?'強制擊倒':'自然（一輪時間到）');
  if(FIX&&el.classList.contains('bs-mon')&&/^(bleed|poison)$/.test(kind))el.querySelectorAll(':scope>.mon-pop.'+kind).forEach(o=>{const l=o.querySelector('i');if(l&&!/<i>/.test(txt))txt=l.outerHTML+txt;o.remove()});
  return _pop(el,kind,txt,dx,big)};

// 單次攻擊：等騎士下一次揮到命中那一格（knNext，跟正式遊戲同一個時間點）才結算一輪。plan＝本武器原本的出招表
function single(kind){const h=H();if(!h||h.refill||pending)return false;const real=h.hs;
  let hs=real;if(kind==='normal')hs={...real,plan:()=>[[0,1]]};else if(kind==='special'){h.amp=0;ui.bsProc=1;clearKH();hs=knHit(w);ui.bsProc=force?1:0;clearKH()}
  h.live=Math.max(0,h.cur-h.unit*real.E);const now=performance.now(),t=knNext(real,now);pending=1;
  setTimeout(()=>{TAG={s:kind==='normal'?'單次・強制一般命中':kind==='special'?'單次・強制附加效果':'單次・照原本機率',t:performance.now()};h.hs=hs;ALLOW=1;monVolley(mi,h);ALLOW=0;h.hs=real;pending=0;setTimeout(()=>{const g=H();if(mode==='single'&&g&&!g.refill&&g.cur<=Math.max(1,g.max*.01))kill()},1600)},Math.max(0,t-now));return true}
// 擊倒：自動模式＝把這一輪的時間撥到剩 1.2 秒（開發者工具 bskill 同一個做法），之後由遊戲自己結算、播擊倒、重生；
// 單次模式＝讓 monFx 走原本的「打倒一隻」分支（倉庫 +1 輪），1.1 秒後再走原本的補血分支
function kill(){killT=performance.now();
  if(mode==='auto'){st.cycleStart=NOW()-dur(mi,w)+1200;return}
  const d=dur(mi,w);st.bank.cycles++;monFx(mi,st,w,false,d,0);monPaint(mi,H());setTimeout(()=>{monFx(mi,st,w,false,d,0);monPaint(mi,H())},1150)}

window.DEMO={
  // 素材狀態：戰鬥卡片裡每一張 <img> 有沒有真的載入（naturalWidth>0），加上 style.css 背景圖（傷害數字、霧氣）各抽一張檢查
  assets:()=>{const im=[...document.querySelectorAll('#view img')],ok=im.filter(x=>x.complete&&x.naturalWidth>0).length,bad=im.filter(x=>x.complete&&!x.naturalWidth);
    const urls=[...new Set(bad.map(x=>x.currentSrc||x.src).concat(DEMO_IMGERR))];   // DEMO_IMGERR 也算進去：命中特效這種只出現 0.4 秒的圖，失敗過也要顯示
    return {total:im.length,ok,bad:urls.length,pending:im.length-ok-bad.length,badUrls:urls.slice(0,5),css:CSSCHK,src:DEMO_SRC,probe:DEMO_PROBE}},
  info:()=>({build:BUILD_ID,weapon:`${bp.n} +${lv}（攻擊力 ${fmt(power(w))}）`,cat,catN:CATS[cat],mon:`${vNo(mi)} ${MON_T[mi]}・${MONS[mi]}`,el:ELEM[MON_EL[mi]].n,mode,force,
    proc:procP(lv),special:(HIT_N[cat]||'').replace(/^.*附加效果/,'附加效果'),hp:H()?Math.ceil(H().cur/H().max*100):null,cycle:Math.round(dur(mi,w)/1000),
    width:innerWidth,blocked:DEMO_BLOCKED.slice(),gen:GEN,fix:FIX,
    req:(()=>{const c={api:0,asset:0,code:0,font:0,other:0},o=[];REQ.forEach(u=>{const k=reqKind(u);c[k]++;if(k==='other'||k==='api')o.push(u)});return {...c,otherUrls:o.slice(0,5),apiBlocked:DEMO_BLOCKED.filter(u=>reqKind(String(u))==='api').length,blockedAll:DEMO_BLOCKED.length,csp:CSPV.length}})(),log:log.slice(0,12).map(x=>({ago:Math.round((performance.now()-x.t)/100)/10,s:x.s,k:x.k}))}),
  setMode:m=>{mode=m==='single'?'single':'auto';if(mode==='auto'){const h=H();if(h)h.nx=null;st.cycleStart=NOW()-dur(mi,w)*(h?1-h.cur/h.max:.3)}note(mode==='auto'?'切到自動連續攻擊':'切到單次攻擊')},
  setForce:v=>{force=!!v;ui.bsProc=force?1:0;clearKH();note(force?'強制觸發附加效果：開':'強制觸發附加效果：關')},
  single,kill,
  setFix:v=>{FIX=!!v;note(FIX?'P2-01 修法預覽：開':'P2-01 修法預覽：關','預覽')},
  gen:GEN,
  // 假數字展示（P2-02）：數字、位置、間隔跟開發者工具 v5.40 的 bspierce（長柄兩段）一樣，直接呼叫遊戲的 monPop。
  // 不走 devdo：devdo 最後會 render() 整個村莊分頁，戰鬥卡片會被擠到村莊列表裡（Work 回報的 P2-02）。這裡不重畫，戰鬥區位置大小不變。
  // 會先切到單次攻擊，騎士照揮但不會插入真的傷害，每次播放的畫面都一樣，方便重複截圖。digits＝4／5／6 位數，twice＝連續兩次貫穿（間隔 1.2 秒＝長柄攻速）
  fake:(digits,twice)=>{const m=mon();if(!m)return;if(mode!=='single')DEMO.setMode('single');const n=Math.max(4,Math.min(6,digits|0)),a='123456'.slice(0,n),b='234567'.slice(0,n);
    const one=()=>{const e=mon();if(!e)return;monPop(e,'hit','-'+a,-24);setTimeout(()=>{const e2=mon();if(e2)monPop(e2,'crit','<i>貫穿</i>-'+b,24)},150)};
    note(`假數字：長柄兩段 ${n} 位數${twice?'，連續兩次':''}`,'假數字');one();if(twice)setTimeout(one,1200)},
};
const CSSCHK={};['fx_dmg_n','fx_dmg_c','dp/fog_band'].forEach(n=>{const u=new URL(A(n),document.baseURI).href,i=new Image();CSSCHK[n]='載入中';i.onload=()=>CSSCHK[n]=i.naturalWidth?'正常':'失敗';i.onerror=()=>CSSCHK[n]='失敗';i.src=u});
draw();note('測試狀態已建立');
// 第一次畫的時候圖片還在下載、解碼，主執行緒很忙，騎士動畫會比 game.js 算好的相位晚開始（實測 105～260ms，正式遊戲是 68～126ms）。
// 等戰鬥卡片的圖都載好再重畫一次，讓騎士動畫從比較安靜的時間點開始，跟正式遊戲進入村莊分頁的情況接近
{const t0=performance.now(),w8=()=>{const im=[...document.querySelectorAll('#view img')];if(im.every(x=>x.complete)||performance.now()-t0>8000){setTimeout(()=>{draw();note('圖片載入完成，重畫戰鬥卡片')},300)}else setTimeout(w8,100)};w8()}
})();
