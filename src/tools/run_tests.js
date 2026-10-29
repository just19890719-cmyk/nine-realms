// 諸神鐵匠 統一測試指令（v5.08）：在 repo 根目錄執行  node src/tools/run_tests.js
// 會自動：建置 → 開本機伺服器 → 用 Playwright 依序跑五層測試 → 印出結果並寫到 test-out/report.md（失敗時結束碼 1）
//   第 0 層 靜態檢查：語法、版本號／公告／開發者按鈕、圖片檔存在、圖示透明背景、檔名、重複檔、金鑰外洩
//   第 1 層 單元＋整合：tests.js 的快速測試（開發者工具「執行快速測試」同一套）
//   第 2 層 核心流程冒煙：鍛造 → 強化 → 附魔 → 背包 → 駐守村莊 → 狩獵收益 → 回收材料（熔解）→ 存檔 → 重新載入
//   第 3 層 存檔與讀檔：重新整理後資料一致、壞掉的存檔不會當機、舊欄位會被修正
//   第 4 層 BUG 回歸：BUG_HISTORY.md 每一筆對應的測試（名稱開頭是 BUG 編號）
//   第 5 層 手機畫面：360／390／440 寬（390 為主要驗收寬度，Mochi 規則 v2.0），另外 390×640 矮螢幕再查一次溢出，每個分頁與小卡檢查橫向溢出、按鈕文字超框、重畫時畫面不動（截圖存在 test-out/）
// 參數：--only=1,4,5   只跑指定層；--no-build 不重新建置；--keep 跑完不關伺服器（除錯用）
// Playwright：優先用專案自己的（npm i -D playwright），沒有就用雲端環境的 /opt/node-tools/node_modules/playwright
const path=require('path'),fs=require('fs'),cp=require('child_process'),http=require('http');
const ROOT=path.resolve(__dirname,'..','..'),OUT=path.join(ROOT,'test-out');
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k));return a?(a.split('=')[1]??true):null};
const ONLY=arg('only')?String(arg('only')).split(',').map(Number):[0,1,2,3,4,5];
let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/node-tools/node_modules/playwright')}
const PORT=+(process.env.PORT||8799),BASE=`http://localhost:${PORT}/index.html`;
const WIDTHS=[360,390,440],MAIN_W=390,SHORT_H=640;   // Mochi 2026-10-26 規則 v2.0：390 主基準、360～440 正式支援；320 不再是每次必測（BUG-014 的 320 回歸測試照舊保留）
const R=[];let layer='';
const rec=(id,name,pass,detail='')=>{R.push({layer,id,name,pass:pass===null?null:!!pass,detail:String(detail)});console.log(`${pass===null?'SKIP':pass?'PASS':'FAIL'}  [${layer}] ${id} ${name}${detail?'  — '+detail:''}`)};
// 載入完成：每天第一次進遊戲會自動切到商城簽到（signAuto），測試時先標記成已切過，避免中途被切走
async function boot(p){await p.waitForFunction(()=>typeof S!=='undefined'&&typeof ui!=='undefined'&&document.getElementById('view'));await p.evaluate(()=>{ui.signAuto=true});await p.waitForTimeout(300)}
const sleep=ms=>new Promise(z=>setTimeout(z,ms));
function up(){return new Promise(z=>http.get(BASE,r=>{r.resume();z(r.statusCode===200)}).on('error',()=>z(false)))}

// 進遊戲：乾淨存檔（新的瀏覽器環境沒有 localStorage）＋開發者模式；webdriver 會自動跳過登入和新手導覽
async function open(browser,w,h=900,opt={}){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,hasTouch:!opt.desktop,isMobile:!opt.desktop,...(opt.ctx||{})});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(BASE+(opt.hash||''));await boot(p);
  await p.evaluate(()=>{try{localStorage.setItem(DEV_KEY,'1')}catch(e){}devBps&&devBps()});await p.waitForTimeout(300);
  return p}
const go=(p,tab,extra)=>p.evaluate(([t,x])=>{ui.sheet=null;ui.result=null;ui.tab=t;Object.assign(ui,x||{});render();scrollTo(0,0)},[tab,extra||{}]);

/* ---------- 共用檢查（第 4、5 層都用） ---------- */
// 重畫前後每個看得到的元素位置都不能動（抓「render() 讓畫面跳一下」這一類問題）
const RECTS=()=>{const sig=e=>{let s='';for(let n=e;n&&n!==document.body;n=n.parentElement){const i=n.parentElement?[...n.parentElement.children].indexOf(n):0;s=n.tagName+(n.classList[0]?'.'+n.classList[0]:'')+':'+i+'>'+s}return s};
  const m={};for(const e of document.querySelectorAll('#view *,#layer *,.bar,.bar *,nav,nav *')){const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)continue;
    let an=false;for(let n=e;n&&!an;n=n.parentElement)an=n.getAnimations().some(a=>a.playState==='running');if(an)continue;if(e.closest('.ui-prog,[data-vtime],[data-vpend]'))continue;   // 怪物血條、倒數時間是遊戲每 0.25 秒即時更新的，本來就會變   // 自己或上層正在播動畫（飄動的火星、符文、血條）本來就會動，交給動畫檢查
    m[sig(e)]=[Math.round(r.left*2)/2,Math.round(r.top*2)/2,Math.round(r.width*2)/2,Math.round(r.height*2)/2]}return m};
async function renderStable(p,label){const a=await p.evaluate(RECTS);await p.evaluate(()=>render());await p.waitForTimeout(80);const b=await p.evaluate(RECTS);
  const moved=Object.keys(a).filter(k=>b[k]&&a[k].some((v,i)=>Math.abs(v-b[k][i])>1));const gone=Object.keys(a).filter(k=>!b[k]);
  return {ok:!moved.length,detail:moved.length?`${label}：${moved.length} 個元素移動，例：${moved[0].split('>').slice(-3).join('>')} ${JSON.stringify(a[moved[0]])}→${JSON.stringify(b[moved[0]])}`:`${Object.keys(a).length} 個元素不動${gone.length?`（${gone.length} 個重畫後消失）`:''}`}}
// 重畫前後，無限循環的動畫（呼吸燈、跑框…）相位要連續；有限次的彈出動畫不能重播（抓「重畫讓動畫重跑／小卡重新跳出」這一類問題）
const ANIMS=()=>{const sig=e=>{let s='';for(let n=e;n&&n!==document.body;n=n.parentElement){const i=n.parentElement?[...n.parentElement.children].indexOf(n):0;s=n.tagName+(n.classList[0]?'.'+n.classList[0]:'')+':'+i+'>'+s}return s};
  const out={};for(const a of document.getAnimations()){if(!(a instanceof CSSAnimation))continue;const ef=a.effect,t=ef.getComputedTiming(),el=ef.target;if(!el||!el.isConnected)continue;
    const r=el.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>innerHeight)continue;if(/^(mon|bs|kn|ch)/i.test(a.animationName))continue;   // 戰鬥畫面的打擊、傷害數字由遊戲自己的時間軸控制，每一下本來就是新的
    const per=t.duration*(t.direction&&t.direction.startsWith('alternate')?2:1);const k=sig(el)+(ef.pseudoElement||'')+'|'+a.animationName;
    out[k]={inf:t.iterations===Infinity,ph:per?(((t.localTime-t.delay)%per)+per)%per:0,per,cur:a.currentTime,state:a.playState,now:performance.now()}}return out};
async function animStable(p,label){const a=await p.evaluate(ANIMS);await p.evaluate(()=>render());await p.waitForTimeout(450);const b=await p.evaluate(ANIMS);const bad=[];   // 等 0.45 秒：中間遊戲自己的定時重畫也算在內
  for(const k in a){const x=a[k],y=b[k];if(!y)continue;
    if(x.inf){const exp=(x.ph+(y.now-x.now))%x.per,d=Math.min(Math.abs(y.ph-exp),x.per-Math.abs(y.ph-exp));if(d>180&&x.per>500)bad.push('循環重置 '+k.split('>').slice(-2).join('>')+` ${Math.round(x.ph)}→${Math.round(y.ph)}ms`)}
    else if(x.state==='finished'&&y.state==='running'||(x.state==='running'&&y.cur!=null&&x.cur!=null&&y.cur<x.cur-50))bad.push('彈出重播 '+k.split('>').slice(-2).join('>'))}
  return {ok:!bad.length,detail:bad.length?label+'：'+bad.slice(0,3).join('；'):`${Object.keys(a).length} 個動畫連續`}}
// 橫向溢出、按鈕文字超出按鈕
const OVERFLOW=()=>{const W=document.documentElement.clientWidth,bad=[];if(document.documentElement.scrollWidth>W+1)bad.push('整頁可以左右捲 '+document.documentElement.scrollWidth+'>'+W);
  if(document.documentElement.scrollWidth>W+1)for(const e of document.querySelectorAll('#view *,#layer *')){const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&!(e.parentElement&&e.parentElement.getBoundingClientRect().right>W+1))e.dataset.tbad=1}
  for(const e of document.querySelectorAll('#view button,#layer button,.bar button,nav button')){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)continue;
    {let sc=false;for(let n=e.parentElement;n&&n!==document.body;n=n.parentElement)if(/auto|scroll/.test(getComputedStyle(n).overflowX)){sc=true;break}if(sc)continue}   // 在可以左右滑的列裡面，本來就會超出
    if(r.right>W+1&&r.left<W)e.dataset.tbad=1;
    if(r.right>W+1&&r.left<W)bad.push('按鈕超出右邊：'+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,12));
    if(e.scrollWidth>e.clientWidth+2&&cs.overflow!=='visible'&&(e.textContent||'').trim())e.dataset.tbad=1;
    if(e.scrollWidth>e.clientWidth+2&&cs.overflow!=='visible'&&(e.textContent||'').trim())bad.push('字超出按鈕：'+e.textContent.trim().slice(0,12))}
  return [...new Set(bad)]};
// 找到問題時（Mochi 2026-10-25 規定）：在畫面上用紅框圈出有問題的元素，另存「問題_*.png」，報告附這張圖
async function markShot(p,name){await p.evaluate(()=>{for(const e of document.querySelectorAll('[data-tbad]')){const r=e.getBoundingClientRect(),o=document.createElement('div');o.className='tmark';o.style.cssText=`position:fixed;left:${r.left-4}px;top:${r.top-4}px;width:${r.width+8}px;height:${r.height+8}px;border:3px solid #ff2a2a;border-radius:50%;box-shadow:0 0 0 2px #fff;z-index:2147483647;pointer-events:none`;document.body.appendChild(o)}});
  fs.mkdirSync(path.join(OUT,'shots'),{recursive:true});await p.screenshot({path:path.join(OUT,'shots',name)});await p.evaluate(()=>{document.querySelectorAll('.tmark').forEach(e=>e.remove());document.querySelectorAll('[data-tbad]').forEach(e=>delete e.dataset.tbad)})}
// 兩張截圖逐像素比較（同一區域），回傳不同像素比例
async function pixDiff(p,a,b){return p.evaluate(async([a,b])=>{const ld=s=>new Promise(z=>{const i=new Image();i.onload=()=>z(i);i.src='data:image/png;base64,'+s});const [x,y]=await Promise.all([ld(a),ld(b)]);
  if(x.width!==y.width||x.height!==y.height)return 1;const c=document.createElement('canvas');c.width=x.width;c.height=x.height;const g=c.getContext('2d');g.drawImage(x,0,0);const d1=g.getImageData(0,0,c.width,c.height).data;g.clearRect(0,0,c.width,c.height);g.drawImage(y,0,0);const d2=g.getImageData(0,0,c.width,c.height).data;
  let n=0;for(let i=0;i<d1.length;i+=4)if(Math.abs(d1[i]-d2[i])+Math.abs(d1[i+1]-d2[i+1])+Math.abs(d1[i+2]-d2[i+2])>30)n++;return n/(d1.length/4)},[a.toString('base64'),b.toString('base64')])}


/* ---------- 第 0 層：靜態檢查（便宜、每次都跑） ---------- */
async function L0(browser){layer='0 靜態檢查';
  for(const f of ['src/game.js','src/skin.js','src/tests.js','src/sw.js','src/tools/run_tests.js']){let ok=true,m='';try{cp.execSync('node --check '+f,{cwd:ROOT,stdio:'pipe'})}catch(e){ok=false;m=String(e.stderr).split('\n').slice(0,3).join(' ')}rec('ST-語法 '+f,f+' 沒有語法錯誤',ok,m)}
  const src=fs.readFileSync(path.join(ROOT,'src/game.js'),'utf8'),bid=(src.match(/const BUILD_ID='([^']+)'/)||[])[1],ver=JSON.parse(fs.readFileSync(path.join(ROOT,'version.json'),'utf8')).v;
  rec('ST-版本','建置產物 version.json 跟 BUILD_ID 一致（有重新建置）',bid===ver,`BUILD_ID ${bid}、version.json ${ver}`);
  const leak=['src','index.html'].flatMap(d=>{const p=path.join(ROOT,d);return fs.statSync(p).isDirectory()?fs.readdirSync(p,{recursive:true}).map(f=>path.join(d,String(f))):[d]}).filter(f=>/\.(js|html|sql|py|css)$/.test(f)&&!/run_tests\.js$/.test(f)&&/service_role|sb_secret_/i.test(fs.readFileSync(path.join(ROOT,f),'utf8')));
  rec('ST-金鑰','原始碼裡沒有 service_role／secret 金鑰',!leak.length,leak.join('、'));
  const bad=fs.readdirSync(path.join(ROOT,'art'),{recursive:true}).map(String).filter(f=>fs.statSync(path.join(ROOT,'art',f)).isFile()&&!/^[a-z0-9_./-]+$/.test(f));
  rec('ST-檔名','art/ 檔名只用小寫英文、數字、底線（避免手機大小寫／中文路徑讀不到）',!bad.length,bad.slice(0,5).join('、'));
  {const crypto=require('crypto'),h={};for(const d of ['art','sfx'])for(const f of fs.readdirSync(path.join(ROOT,d),{recursive:true}).map(String)){const p=path.join(ROOT,d,f);if(!fs.statSync(p).isFile())continue;const k=crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');(h[k]=h[k]||[]).push(d+'/'+f)}
   const dup=Object.values(h).filter(x=>x.length>1);rec('ST-重複檔','art/、sfx/ 重複的圖檔（只提醒，不算失敗）',true,dup.length?dup.length+' 組：'+dup.slice(0,3).map(x=>x.join(' = ')).join('；'):'沒有')}
  const p=await open(browser,MAIN_W);
  const r=await p.evaluate(()=>({nw:NW_LOG[0]&&NW_LOG[0].v,dv:DEV_LOG[0]&&DEV_LOG[0].v,bid:BUILD_ID,gv:GUIDE_ALL?Math.max(...GUIDE_ALL.map(g=>+g.v||0)):null}));
  rec('ST-公告','更新公告 NW_LOG 最上面一則是這一版',r.nw===r.bid,`NW_LOG ${r.nw}、BUILD_ID ${r.bid}`);
  rec('ST-開發者','開發者工具 DEV_LOG 最上面一段是這一版（新功能要有測試按鈕）',r.dv===r.bid,`DEV_LOG ${r.dv}、BUILD_ID ${r.bid}`);
  // 程式裡寫死的圖片名稱 A('xxx')、img('xxx') 都要有檔案
  const names=[...new Set([...src.matchAll(/\b(?:A|img)\('([a-z0-9_]+)'(?=\s*[,)])/g)].map(m=>m[1]))];
  const urls=await p.evaluate(n=>n.map(x=>[x,A(x)]),names);const miss=urls.filter(([n,u])=>/^art\//.test(u)&&!fs.existsSync(path.join(ROOT,u.split('?')[0])));
  rec('ST-圖檔','程式寫死的 '+names.length+' 個圖片名稱都有檔案',!miss.length,miss.slice(0,6).map(x=>x[1]).join('、'));
  // 小圖示（道具、材料、介面圖示）四個角要透明，不能有灰底／黑底
  const icons=fs.readdirSync(path.join(ROOT,'art')).filter(f=>/^(it|mat|ic)_.*\.webp$/.test(f));
  const op=await p.evaluate(async fs_=>{const out=[];for(const f of fs_){const i=new Image();i.src='art/'+f;try{await i.decode()}catch(e){out.push(f+'（讀不到）');continue}const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const g=c.getContext('2d');g.drawImage(i,0,0);
    const W=c.width-1,H=c.height-1,a=[[0,0],[W,0],[0,H],[W,H]].map(([x,y])=>g.getImageData(x,y,1,1).data[3]);if(a.some(v=>v>40))out.push(f)}return out},icons);
  rec('ST-透明','道具／材料／介面小圖示 '+icons.length+' 張：四角透明（沒有灰底、黑底框）',!op.length,op.slice(0,8).join('、'));
  await p.context().close()}

/* ---------- 第 1 層：tests.js 快速測試 ---------- */
async function L1(browser){layer='1 單元整合';const p=await open(browser,MAIN_W);
  await p.evaluate(()=>devdo('tquick'));await p.waitForFunction(()=>typeof TEST_LAST!=='undefined'&&TEST_LAST&&TEST_LAST.done,null,{timeout:180000});
  const res=await p.evaluate(()=>TEST_LAST.res.map(x=>({n:x.name,p:x.pass,d:x.detail})));
  for(const x of res)rec(x.n.split(' ')[0],x.n.split(' ').slice(1).join(' '),x.p,x.p?'':String(x.d).replace(/<[^>]+>/g,'').slice(0,160));
  rec('L1-err','快速測試期間沒有 JavaScript 錯誤',!p.errs.length,p.errs.slice(0,2).join('；'));await p.context().close()}

/* ---------- 第 2 層：核心流程冒煙（真的頁面、真的存檔） ---------- */
async function L2(browser){layer='2 核心流程';const p=await open(browser,MAIN_W);
  const st=()=>p.evaluate(()=>({gold:S.gold,es:S.items.estone|0,en:S.items.enstone|0,n:S.weapons.length}));
  const bid=await p.evaluate(()=>{S.gold+=200000;S.items.enstone=(S.items.enstone|0)+5;S.items.estone=(S.items.estone|0)+20;save();const b=BPS.find(x=>!x.dev&&!x.unlock);return b&&b.id});
  rec('SM0','有開局可鍛造的正式圖紙',!!bid,bid);if(!bid)return;
  // 鍛造
  const s0=await st();const fr=await p.evaluate(b=>{const j=forgeStart(b,1);return typeof j==='string'?j:'ok'},bid);
  await p.evaluate(()=>{S.jobs.forEach(j=>{j.end=NOW()-1});tick();render()});const s1=await st();
  rec('SM1','鍛造：扣金幣、5 秒後得到 1 把武器',fr==='ok'&&s1.n===s0.n+1&&s1.gold<s0.gold,`${fr}，武器 ${s0.n}→${s1.n}，金幣 ${s0.gold}→${s1.gold}`);
  const id=await p.evaluate(()=>S.weapons[S.weapons.length-1].id);
  // 強化（+1～+6 必成功，用 UI 按鈕走一次，其餘用核心函式）
  await p.evaluate(id=>{ui.sheet={t:'w',id,m:'enh'};ui.enhLast=null;render()},id);await p.click('[data-act=enhance]');await p.evaluate(()=>{ui.fxDone&&ui.fxDone()});await p.waitForTimeout(300);
  const lv1=await p.evaluate(id=>W(id).lv,id);
  for(let k=lv1;k<6;k++)await p.evaluate(id=>enhanceCore(id),id);
  const s2=await st(),lv=await p.evaluate(id=>W(id).lv,id);
  rec('SM2','強化：按鈕強化成功＋1、每次扣 1 顆強化石、到 +6',lv1===1&&lv===6&&s2.es===s1.es-6,`按鈕後 +${lv1}、最後 +${lv}、強化石 ${s1.es}→${s2.es}`);
  // 附魔（固定不破損，避免隨機）
  const ench=await p.evaluate(id=>{DEV.elForce=['fire',1];const r=enchantCore(id);return {r,e:W(id).ench[0]}},id);const s3=await st();
  rec('SM3','附魔：扣 1 顆附魔石＋金幣、武器得到屬性',ench.e&&ench.e.k==='fire'&&s3.en===s2.en-1&&s3.gold<s2.gold,`${JSON.stringify(ench.e)}，附魔石 ${s2.en}→${s3.en}`);
  // 背包：從導覽列點道具欄，格子裡有這把，點開小卡
  await p.evaluate(()=>{ui.sheet=null;render()});await p.click('[data-act=tab][data-k=armory]');await p.waitForTimeout(200);
  const slot=await p.$(`.b2-slot[data-act=wopen][data-id="${id}"]`);rec('SM4','背包：道具欄看得到這把武器（+6）',!!slot&&/\+6/.test(await slot.getAttribute('aria-label')),slot?await slot.getAttribute('aria-label'):'找不到格子');
  if(slot){await slot.click();await p.waitForTimeout(200)}rec('SM5','背包：點格子打開武器小卡',await p.evaluate(id=>!!(ui.sheet&&ui.sheet.t==='w'&&ui.sheet.id===id&&document.querySelector('.sheet')),id));
  // 駐守村莊 1-1
  const dv=await p.evaluate(id=>{ui.sheet=null;const r=deliverCore(0,id);render();return {r,w:S.villages[0].weaponId,s:S.villages[0].status}},id);
  rec('SM6','駐守：武器駐守 1-1、村莊變成已收復',dv.r&&dv.w===id&&dv.s==='cleared',JSON.stringify(dv));
  // 狩獵收益：把開始時間往前推 5 輪（不改時鐘），結算後收成
  const hv=await p.evaluate(()=>{const st=S.villages[0],w=W(st.weaponId),d=dur(0,w);st.cycleStart-=d*5+10;tick();const c=st.bank.cycles,g0=S.gold;const r=collectCore(0);return {c,g:S.gold-g0,n:r&&r.n}});
  rec('SM7','狩獵收益：經過 5 輪結算 5 輪、收成後金幣增加、帳本清空',hv.c===5&&hv.n===5&&hv.g>0,JSON.stringify(hv));
  // 收回＋熔解（用小卡按鈕：熔解→確認）
  await p.evaluate(()=>{recallCore(0);render()});const s4=await st();
  await p.evaluate(id=>{ui.tab='armory';ui.sheet={t:'w',id,m:'main'};ui.meltArm=null;render()},id);await p.click('.sheet [data-act=melt]');await p.click('.sheet [data-act=melt]');await p.waitForTimeout(200);
  const s5=await st(),gone=await p.evaluate(id=>!W(id),id);
  rec('SM8','回收材料：收回後熔解，武器消失、退金幣＋1 顆強化石',gone&&s5.n===s4.n-1&&s5.gold>s4.gold&&s5.es===s4.es+1,`武器 ${s4.n}→${s5.n}、金幣 +${s5.gold-s4.gold}、強化石 ${s4.es}→${s5.es}`);
  // 存檔→重新載入
  await p.evaluate(()=>{forgeStart(BPS.find(x=>!x.dev&&!x.unlock).id,1);S.jobs.forEach(j=>{j.end=NOW()-1});tick();const w=S.weapons[S.weapons.length-1];enhanceCore(w.id);DEV.elForce=['ice',2];enchantCore(w.id);deliverCore(0,w.id);save()});
  const snap=()=>p.evaluate(()=>JSON.stringify({g:S.gold,gm:S.gems,it:S.items,m:S.mats,w:S.weapons.map(w=>[w.id,w.b,w.lv,w.ench[0]&&w.ench[0].k,!!w.lock]),v:S.villages.map(v=>[v.status,v.weaponId]),n:S.nextId,st:S.stats.enhTry}));
  const before=await snap();await p.reload();await boot(p);const after=await snap();const A=JSON.parse(before),B=JSON.parse(after),dk=Object.keys(A).filter(k=>JSON.stringify(A[k])!==JSON.stringify(B[k]));
  rec('SM9','存檔→重新載入：金幣、道具、材料、武器（等級／屬性）、駐守、統計完全一致',before===after,before===after?`${before.length} 字元一致`:'不一致：'+dk.map(k=>k+' '+JSON.stringify(A[k]).slice(0,80)+' → '+JSON.stringify(B[k]).slice(0,80)).join('；'));
  rec('SM-err','整段流程沒有 JavaScript 錯誤',!p.errs.length,p.errs.slice(0,2).join('；'));await p.context().close()}

/* ---------- 第 3 層：存檔與讀檔 ---------- */
async function L3(browser){layer='3 存檔讀檔';const p=await open(browser,MAIN_W);
  const key=await p.evaluate(()=>KEY);
  // 壞掉的存檔
  const BAD=[['不是 JSON','{壞掉'],['空物件','{}'],['陣列','[]'],['null','null'],['欄位型別錯',JSON.stringify({gold:'abc',gems:-5,items:{estone:-3},weapons:[{id:1,b:'不存在的圖紙',lv:3}],villages:[{status:'cleared',weaponId:99}]})],
    ['陣列欄位不是陣列',JSON.stringify({gold:10,weapons:'x',jobs:{},villages:null,items:null,mats:'x',stats:'x',rep:null,sign:5,daily:'x',codex:[]})],['陣列裡有 null',JSON.stringify({gold:10,weapons:[null,1,{id:2}],jobs:[null],villages:[null,{status:'open'}]})]];
  for(const [n,v] of BAD){
    await p.evaluate(([k,v])=>localStorage.setItem(k,v),[key,v]);p.errs.length=0;await p.reload();await boot(p);
    const r=await p.evaluate(()=>({g:S.gold,gm:S.gems,es:S.items.estone,w:S.weapons.length,v0:S.villages[0].weaponId,nv:S.villages.length,ok:!!document.querySelector('#view').children.length}));
    rec('SL-'+n,'讀到壞存檔（'+n+'）不會當機、數值不會是負的或文字（BUG-012）',r.ok&&!p.errs.length&&r.g>=0&&Number.isFinite(r.g)&&r.gm>=0&&r.es>=0&&r.v0==null&&r.nv>=20,JSON.stringify(r)+(p.errs[0]?' 錯誤：'+p.errs[0]:''))}
  // 重複 ID、兩村駐守同一把
  await p.evaluate(k=>{const b=BPS.find(x=>!x.dev&&!x.unlock).id;const s=fresh();s.weapons=[{id:5,b,q:0,lv:2,ench:[null,null,null,null]},{id:5,b,q:0,lv:3,ench:[null,null,null,null]}];s.villages[0].weaponId=5;s.villages[1].weaponId=5;s.villages[1].status='open';localStorage.setItem(k,JSON.stringify(s))},key);
  await p.reload();await boot(p);
  const d=await p.evaluate(()=>({ids:S.weapons.map(w=>w.id),v:S.villages.slice(0,2).map(v=>v.weaponId),next:S.nextId}));
  rec('SL-dup','重複武器 ID 會重新編號、同一把不會同時駐守兩村',new Set(d.ids).size===d.ids.length&&d.v.filter(x=>x!=null).length<=1&&d.next>Math.max(...d.ids),JSON.stringify(d));
  // 舊存檔載入新版本：fixtures/ 每個版本留一份真實存檔，永遠要能載入（BUG_HISTORY 規則：改存檔結構要寫遷移，不能刪舊 fixture）
  const FX=path.join(__dirname,'fixtures');for(const f of fs.existsSync(FX)?fs.readdirSync(FX).filter(x=>/^save_.*\.json$/.test(x)).sort():[]){const raw=fs.readFileSync(path.join(FX,f),'utf8'),o=JSON.parse(raw),exp=o._expect||{};delete o._expect;
    await p.evaluate(([k,v])=>localStorage.setItem(k,v),[key,JSON.stringify(o)]);p.errs.length=0;await p.reload();await boot(p);
    const r=await p.evaluate(()=>({gold:S.gold,gems:S.gems,estone:S.items.estone,enstone:S.items.enstone,weapons:S.weapons.length,posted:S.villages.filter(v=>v.weaponId!=null).length,cleared:S.villages.filter(v=>v.status==='cleared').length,maxLv:Math.max(0,...S.weapons.map(w=>w.lv)),ench:S.weapons.filter(w=>w.ench[0]).length,view:document.querySelector('#view').children.length>0}));
    const bad=Object.keys(exp).filter(k=>r[k]!==exp[k]);
    rec('SL-舊檔 '+f,'舊版存檔 '+f+' 在新版載入：不當機、金幣／道具／武器／駐守／進度都保留',!bad.length&&r.view&&!p.errs.length,bad.length?'不一致：'+bad.map(k=>k+' '+exp[k]+'→'+r[k]).join('、'):JSON.stringify(r)+(p.errs[0]?' 錯誤：'+p.errs[0]:''))}
  // v2 存檔（最舊的格式）遷移
  await p.evaluate(()=>{localStorage.removeItem(KEY);localStorage.setItem(KEY_V2,JSON.stringify({gold:777,gems:5,mats:{},weapons:[{id:1,b:'不存在',lv:2}],villages:[{status:'cleared',weaponId:1,pending:3}]}))});await p.reload();await boot(p);
  const v2=await p.evaluate(()=>({g:S.gold,w:S.weapons.length,v0:S.villages[0].status}));rec('SL-v2','最舊的 v2 存檔會自動遷移、未知武器移除、不當機',v2.g>=777&&v2.w===0&&v2.v0==='cleared',JSON.stringify(v2));
  await p.evaluate(()=>{localStorage.removeItem(KEY_V2);localStorage.removeItem(KEY)});await p.reload();await boot(p);
  // 防重複結算／防複製（連點、重複呼叫）
  const dd=await p.evaluate(async()=>{const o={},b=BPS.find(x=>!x.dev&&!x.unlock).id;S.gold=100000;S.items.estone=50;S.items.enstone=10;
    const f1=forgeStart(b,1),f2=forgeStart(b,1);o.forge2=typeof f1==='object'&&typeof f2==='string'&&S.jobs.length===1;S.jobs.forEach(j=>j.end=NOW()-1);tick();tick();o.forgeOnce=S.weapons.length===1;
    const w=S.weapons[0];deliverCore(0,w.id);S.villages[1].status='open';deliverCore(1,w.id);o.oneVillage=S.villages.filter(v=>v.weaponId===w.id).length===1;
    const st=S.villages[1];st.cycleStart-=dur(1,w)*3+10;tick();const g0=S.gold;ui.tab='village';ui.sheet=null;render();await new Promise(z=>setTimeout(z,100));const hb=document.querySelector('[data-act=collect][data-i="1"]');if(hb){hb.click();hb.click()}const g1=S.gold;const again=collectCore(1);o.collectOnce=!!hb&&g1>g0&&again===null&&st.bank.cycles===0;o._c=[ui.tab,document.querySelectorAll("[data-act=collect]").length,document.querySelectorAll(".vcard").length,ui.realm,S.villages[1].status,!!hb,g0,g1,again,st.bank.cycles];
    const fg0=S.gold,c1=chWinCore(2,30),fg1=S.gold,c2=chWinCore(2,30);o.firstGoldOnce=c1.first&&!c2.first&&S.gold===fg1&&fg1>=fg0;
    recallCore(1);const t0=S.stats.enhTry;ui.lockUntil=0;ui.busy=false;enhance(w.id);enhance(w.id);enhance(w.id);o.enhOnce=S.stats.enhTry===t0+1;ui.fxDone&&ui.fxDone();ui.busy=false;
    const w2=makeWeapon(b,0,0),g2=S.gold,e2=S.items.estone;ui.tab='armory';ui.sheet={t:'w',id:w2.id,m:'main'};ui.meltArm=null;render();await new Promise(z=>setTimeout(z,100));
    for(let n=0;n<4;n++){const x=document.querySelector('.sheet [data-act=melt]');if(x)x.click()}const m1=meltCore(w2.id);o.meltOnce=!W(w2.id)&&m1===null&&S.items.estone===e2+1;
    S.items.estone=0;const w3=makeWeapon(b,0,2),er=enhanceCore(w3.id);o.noStone=!!er.err&&w3.lv===2&&S.items.estone===0;
    const neg=Object.entries({gold:S.gold,gems:S.gems,...S.items,...S.mats}).filter(([k,v])=>!(v>=0));o.noNegative=!neg.length;ui.sheet=null;render();return o});
  for(const [k,n] of [['forge2','鍛造中再按鍛造：第二次被擋下'],['forgeOnce','鍛造完成只發一次武器（重複結算）'],['oneVillage','同一把武器不能同時駐守兩個村莊'],['collectOnce','收成按鈕連點兩次只入帳一次'],['firstGoldOnce','首次收復獎勵只發一次'],['enhOnce','強化連按三次只強化一次'],['meltOnce','熔解連按四次只熔一把、只退一次強化石'],['noStone','強化石不夠時擋下、不扣成負的'],['noNegative','以上操作後沒有任何負數資源']])
    rec('DUP-'+k,n,dd[k],dd[k]?'':JSON.stringify(dd));
  // 存檔後立刻重新整理，自動存檔的時間點不會丟資料
  await p.evaluate(()=>{S.gold=123456;save()});await p.reload();await boot(p);
  rec('SL-rt','存檔後重新整理，金幣保留',await p.evaluate(()=>S.gold===123456),await p.evaluate(()=>S.gold));
  await p.context().close()}

/* ---------- 第 4 層：BUG 回歸（編號對應 BUG_HISTORY.md） ---------- */
async function L4(browser){layer='4 BUG 回歸';
  for(const w of WIDTHS){const p=await open(browser,w,800,{ctx:{}});
    // BUG-005 頁面頂端 8px（瀏覽器預設 body margin）
    rec('BUG-005@'+w,'body 上方沒有瀏覽器預設的 8px 空隙；捲動 1～40px 時上方資源列不動',await p.evaluate(async()=>{ui.tab='armory';devdo('bag98');await new Promise(z=>setTimeout(z,100));const m=getComputedStyle(document.body).marginTop;const t=[];for(const y of [0,1,8,40]){scrollTo(0,y);await new Promise(z=>requestAnimationFrame(()=>z()));t.push(document.querySelector('.bar').getBoundingClientRect().top)}return m==='0px'&&t.every(x=>Math.abs(x-t[0])<.5)}));
    // BUG-001 道具欄上方固定區：從最上面往下捲，標題／頁籤／分類位置與畫面都不動
    {await p.evaluate(()=>{ui.sheet=null;render();scrollTo(0,0)});await p.waitForTimeout(150);
     await p.addStyleTag({content:'#toasts{display:none!important}'});   // 頂端通知是暫時的，拍第一張時還在、第二張已消失就會被當成畫面不同（2026-10-26 在 360 寬出現過 14.7%，跟 shots.js 一樣藏起來）
     const pos=await p.evaluate(async()=>{const o=[];for(const y of [0,4,12,60,300]){scrollTo(0,y);await new Promise(z=>requestAnimationFrame(()=>requestAnimationFrame(z)));const t=document.querySelector('.b2-top').getBoundingClientRect(),b=document.querySelector('.bar').getBoundingClientRect();o.push([Math.round(t.top*2)/2,Math.round(b.bottom*2)/2])}return o});
     const fixed=pos.every(x=>Math.abs(x[0]-pos[0][0])<.6&&Math.abs(x[0]-x[1])<1.1);
     await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(100);const clip=await p.evaluate(()=>{const r=document.querySelector('.b2-top').getBoundingClientRect();return {x:0,y:0,width:innerWidth-20,height:Math.floor(r.bottom)}});
     const loaded=()=>p.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].filter(i=>!i.complete).map(i=>new Promise(z=>{i.onload=i.onerror=z;setTimeout(z,3000)}))]));   // 圖片或字型晚一步載入會讓兩張截圖不同（2026-10-26 在 360 寬出現過一次 14.7%）
     await loaded();const a=await p.screenshot({clip,animations:'disabled'});await p.evaluate(()=>scrollTo(0,300));await p.waitForTimeout(150);await loaded();const b=await p.screenshot({clip,animations:'disabled'});const df=await pixDiff(p,a,b);
     rec('BUG-001@'+w,'道具欄固定區：往下捲 0～300px 都貼在資源列下面、畫面不動（像素差 <0.5%）',fixed&&df<.005,`位置 ${JSON.stringify(pos.map(x=>x[0]))}、像素差 ${(df*100).toFixed(2)}%`)}
    // BUG-004 熔解／危險強化「再按一次確認」：小卡大小、位置不變
    {const r=await p.evaluate(async()=>{const bp=BPS.find(x=>!x.dev&&!x.unlock);const w=makeWeapon(bp.id,0,6);S.items.estone=50;ui.tab='armory';ui.meltArm=null;ui.riskArm=ui.riskOk=null;ui.sheet={t:'w',id:w.id,m:'main'};render();await new Promise(z=>setTimeout(z,450));
       const box=()=>{const e=document.querySelector('.sheet').getBoundingClientRect();return [e.top,e.height].map(Math.round)};const a=box();document.querySelector('.sheet [data-act=melt]').click();await new Promise(z=>setTimeout(z,120));const b=box(),note=/再按一次/.test(document.querySelector('.sheet').textContent);
       ui.meltArm=null;ui.sheet={t:'w',id:w.id,m:'enh'};ui.enhLast=null;render();await new Promise(z=>setTimeout(z,450));const c=box();document.querySelector('.sheet [data-act=enhance]').click();await new Promise(z=>setTimeout(z,120));const d=box(),armed=ui.riskArm===w.id,tries=S.stats.enhTry;
       ui.riskArm=ui.riskOk=null;ui.sheet=null;render();return {a,b,c,d,note,armed}});
     rec('BUG-004@'+w,'熔解、危險區強化按第一次只出現確認字樣，小卡高度和位置不變',r.note&&r.armed&&r.a.join()===r.b.join()&&r.c.join()===r.d.join(),JSON.stringify(r))}
    await p.context().close()}
  // BUG-006 開關小卡時捲軸讓畫面左右跳（電腦瀏覽器有實體捲軸）
  for(const w of [MAIN_W,1280]){const browser2=await pw.chromium.launch({ignoreDefaultArgs:['--hide-scrollbars']});const p=await open(browser2,w,800,{desktop:true});
    const r=await p.evaluate(async()=>{devdo('bag98');await new Promise(z=>setTimeout(z,150));const x=()=>{const s=document.querySelector('.b2-slot[data-act=wopen]').getBoundingClientRect(),b=document.querySelector('.bar .res,.bar').getBoundingClientRect();return [s.left,b.left,b.width].map(v=>Math.round(v*2)/2)};
      const a=x();const id=+document.querySelector('.b2-slot[data-act=wopen]').dataset.id;ui.sheet={t:'w',id,m:'main'};render();await new Promise(z=>setTimeout(z,450));const b=x();ui.sheet=null;render();await new Promise(z=>setTimeout(z,200));const c=x();
      return {a,b,c,gut:getComputedStyle(document.documentElement).scrollbarGutter,sb:innerWidth-document.documentElement.clientWidth}});
    rec('BUG-006@'+w+(w>500?'桌機':''),'有實體捲軸時，開關小卡畫面不會左右移動',r.a.join()===r.b.join()&&r.a.join()===r.c.join(),JSON.stringify(r));await browser2.close()}
  // BUG-007 上方資源列半透明（捲動時透出底下內容）
  {const p=await open(browser,MAIN_W);const bg=await p.evaluate(()=>{const cs=getComputedStyle(document.querySelector('.bar'));return cs.backgroundImage+' '+cs.backgroundColor});
   const alpha=[...bg.matchAll(/rgba\([^)]*,\s*([\d.]+)\)/g)].map(m=>+m[1]).filter(a=>a<1&&a>0);rec('BUG-007','上方資源列背景完全不透明',!alpha.length,bg.slice(0,120));
   // BUG-008 彈窗標題列捲動時往上移
   const r=await p.evaluate(async()=>{ui.sheet={t:'set'};render();await new Promise(z=>setTimeout(z,450));const s=document.querySelector('.sheet'),h=s&&s.querySelector('.sheet-head');if(!h)return null;const a=h.getBoundingClientRect().top;s.scrollTop=60;await new Promise(z=>requestAnimationFrame(()=>requestAnimationFrame(z)));const b=h.getBoundingClientRect().top;ui.sheet=null;render();return [a,b,getComputedStyle(h).position]});
   rec('BUG-008','彈窗標題列（設定頁）捲動內容時位置不動',r&&Math.abs(r[0]-r[1])<.6,JSON.stringify(r));
   // BUG-003／BUG-009 重畫讓呼吸燈、跑框動畫重新開始
   await p.evaluate(()=>{devdo('bag96')});await p.waitForTimeout(1200);const a1=await animStable(p,'道具欄 +9 以上裂縫');rec('BUG-003','道具欄 +9 以上裂縫呼吸燈：重畫後不會從頭開始',a1.ok,a1.detail);
   await p.evaluate(()=>{const w=makeWeapon(BPS.find(x=>!x.dev&&!x.unlock).id,0,9,[]);ui.sheet={t:'w',id:w.id,m:'ench'};render()});await p.waitForTimeout(1200);const a2=await animStable(p,'+9 武器跑框');rec('BUG-009','+9 以上武器小卡跑框：重畫後不會從頭開始',a2.ok,a2.detail);
   // BUG-010／BUG-011 小卡重畫時重新彈出（商城購買小卡、說明小卡）
   await p.evaluate(()=>{ui.sheet=null;ui.tab='shop';S.gold+=5000;ui.shopN=1;shopMatCard(Object.keys(MATS)[0])});await p.waitForTimeout(700);
   const m0=await p.evaluate(()=>{const c=document.querySelector('.modal-card');c.dataset.t='1';return !!c});await p.click('.modal-card [data-act=shopN]');await p.waitForTimeout(80);
   const m1=await p.evaluate(()=>{const c=document.querySelector('.modal-card');return {same:c&&c.dataset.t==='1',pop:c&&c.getAnimations().some(a=>a.playState==='running')}});
   rec('BUG-010','商城購買小卡：調數量時小卡不會重新跳出',m0&&(m1.same||!m1.pop),JSON.stringify(m1));
   await p.evaluate(()=>{ui.result=null;render();ui.result={t:'info',title:'測試',html:'說明'};render()});await p.waitForTimeout(700);const a3=await animStable(p,'說明小卡');
   rec('BUG-011','說明小卡：每次重畫不會重新彈出',a3.ok,a3.detail);
   // BUG-013 紅點呼吸（givePulse）、收成按鈕脈動：重畫後不能從頭播
   await p.evaluate(()=>{ui.result=null;const b=BPS.find(x=>!x.dev&&!x.unlock);makeWeapon(b.id,0,6);const w=makeWeapon(b.id,0,6);S.villages[1].status='open';deliverCore(1,w.id);const st=S.villages[1];st.cycleStart-=dur(1,w)*3+10;tick();ui.sheet=null;ui.tab='village';render();scrollTo(0,0)});await p.waitForTimeout(1100);
   const dots=await p.evaluate(()=>document.querySelectorAll('.give-dot,.harvest-btn').length);const a4=await animStable(p,'村莊頁紅點＋收成按鈕');
   rec('BUG-013','紅點呼吸、收成按鈕脈動：重畫後相位連續（不會一直重新閃）',dots>0&&a4.ok,`${dots} 個紅點／收成鈕；${a4.detail}`);
   await p.context().close()}
  // BUG-014 320px：村莊卡預估秒數、交易所排序列撐破畫面
  {const p=await open(browser,320,860);const r=await p.evaluate(async()=>{const o={};const b=BPS.find(x=>!x.dev&&!x.unlock);const w=makeWeapon(b.id,0,6);deliverCore(0,w.id);
     for(const t of ['village','market']){ui.sheet=null;ui.tab=t;render();await new Promise(z=>setTimeout(z,350));o[t]=document.documentElement.scrollWidth-document.documentElement.clientWidth;
       o[t+'Cut']=[...document.querySelectorAll('.vcard .nobr,.mk-chips.row')].filter(e=>{const r=e.getBoundingClientRect(),c=e.closest('.vcard,.mk-filter').getBoundingClientRect();return e.matches('.nobr')&&r.right>c.right+1}).length}return o});
   rec('BUG-014','320px：村莊頁、交易所不能左右捲，村莊卡文字不超出卡片',r.village<=0&&r.market<=0&&!r.villageCut,JSON.stringify(r));await p.context().close()}
  // BUG-021 騎士揮擊比扣血慢：七種武器各展開一次（村莊戰鬥畫面），比較扣血時鐘（performance.now()%K）和騎士動畫實際播到哪裡，落差要小於 30ms（一個畫面約 17ms＋取樣誤差）；
  // 只量 390（跟寬度無關）。原本 --d 負延遲在 render 時算好、瀏覽器晚開始播，一般速度就慢 29～214ms
  {const p=await open(browser,MAIN_W,860);const r=await p.evaluate(async()=>{devdo('bsall');ui.tab='village';const o={};
     for(const [i,c] of Object.entries(Object.keys(KN))){ui.bsOpen=+i;render();await new Promise(z=>setTimeout(z,700));const bs=document.querySelector('.bs');if(!bs){o[c]='沒有戰鬥畫面';continue}
       const K=parseFloat(getComputedStyle(bs).getPropertyValue('--K')),d=[];
       for(let n=0;n<12;n++){await new Promise(z=>requestAnimationFrame(z));const a=[...bs.querySelectorAll('.bs-kn img')].flatMap(x=>x.getAnimations()).find(x=>/^kn-/.test(x.animationName));if(a){let v=(performance.now()%K-a.effect.getComputedTiming().progress*K)%K;if(v>K/2)v-=K;if(v<-K/2)v+=K;d.push(Math.round(v))}await new Promise(z=>setTimeout(z,60))}
       o[c]=d.length?Math.max(...d.map(Math.abs)):'量不到'}
     ui.bsOpen=null;render();return o});
   rec('BUG-021','戰鬥畫面七種武器：騎士揮擊動畫跟扣血時鐘落差小於 30ms（打到的那一格和扣血同時出現）',Object.values(r).every(v=>typeof v==='number'&&v<30),JSON.stringify(r));await p.context().close()}
  // BUG-020（P2-01）戰鬥畫面中毒／流血字疊在一起：同一種持續傷害只能留最新一個，標籤帶到新字；一般命中數字不受影響；真的雙刀 +12 打 4 秒取樣
  for(const w of WIDTHS){const p=await open(browser,w,860);const r=await p.evaluate(async()=>{const o={};devdo('bsdot');await new Promise(z=>setTimeout(z,400));const m=document.querySelector('.bs .bs-mon');if(!m)return {err:'沒有戰鬥畫面'};
       m.querySelectorAll('.mon-pop').forEach(e=>e.remove());monPop(m,'poison','<i>中毒</i>-3',22);monPop(m,'poison','-3',22);monPop(m,'poison','-3',22);monPop(m,'bleed','<i>流血</i>-5',22);monPop(m,'hit','-9');monPop(m,'hit','-9');
       const q=k=>[...m.querySelectorAll(':scope>.mon-pop.'+k)];o.poison=q('poison').length;o.label=/中毒/.test(q('poison')[0]?.textContent||'');o.bleed=q('bleed').length;o.hit=q('hit').length;
       await new Promise(z=>setTimeout(z,900));let mx=0,seen=0,op=0;for(let t=0;t<80;t++){const ps=q('poison'),n=ps.length;mx=Math.max(mx,n);if(n)seen++;ps.forEach(e=>op=Math.max(op,+getComputedStyle(e).opacity));await new Promise(z=>setTimeout(z,50))}o.live={mx,seen,op:+op.toFixed(2)};return o});
   rec('BUG-020@'+w,'戰鬥畫面：同一種中毒／流血字只留最新一個（標籤保留），一般命中數字不受影響；雙刀 +12 實打 4 秒同時最多 1 個綠字、而且看得清楚（不透明度到 0.8 以上）',!r.err&&r.poison===1&&r.label&&r.bleed===1&&r.hit===2&&r.live.seen>0&&r.live.mx<=1&&r.live.op>=.8,JSON.stringify(r));await p.context().close()}
}

/* ---------- 第 5 層：手機畫面 360／390／440 ---------- */
async function L5(browser){layer='5 手機畫面';fs.mkdirSync(path.join(OUT,'shots'),{recursive:true});
  const SCREENS=require('./screens.js');   // 畫面清單跟 shots.js（前後對照）共用
  for(const w of WIDTHS){const p=await open(browser,w,860);const miss=new Set();p.on('response',r=>{if(r.status()>=400&&/\/(art|sfx)\//.test(r.url()))miss.add(r.url().replace(/^.*?\/(art|sfx)\//,'$1/').split('?')[0])});
    for(const [n,tab,prep] of SCREENS){await go(p,tab,{atab:'w'});if(prep)await prep(p);await p.waitForTimeout(500);
      const ov=await p.evaluate(OVERFLOW);if(ov.length)await markShot(p,`問題_${n}_${w}.png`);rec(`UI-${n}@${w}`,`${n} ${w}px：不會左右捲、按鈕不超出、字不超出按鈕`,!ov.length,ov.slice(0,3).join('；'));
      const st=await renderStable(p,n);rec(`UI-${n}@${w}-重畫`,`${n} ${w}px：重畫（render）時畫面元素不移動`,st.ok,st.detail);
      if(w===MAIN_W){const an=await animStable(p,n);rec(`UI-${n}@${w}-動畫`,`${n}：重畫時動畫不重播、循環動畫不重置`,an.ok,an.detail)}
      await p.screenshot({path:path.join(OUT,'shots',`${n}_${w}.png`)})}
    if(w===MAIN_W){await p.setViewportSize({width:w,height:SHORT_H});   // 矮螢幕（瀏覽器網址列＋鍵盤佔掉高度）：只查溢出，不截圖
      for(const [n,tab,prep] of SCREENS){await go(p,tab,{atab:'w'});if(prep)await prep(p);await p.waitForTimeout(300);const ov=await p.evaluate(OVERFLOW);if(ov.length)await markShot(p,`問題_${n}_${w}x${SHORT_H}.png`);rec(`UI-${n}@${w}x${SHORT_H}`,`${n} ${w}×${SHORT_H}：不會左右捲、按鈕不超出、字不超出按鈕`,!ov.length,ov.slice(0,3).join('；'))}}
    rec('UI-404@'+w,`${w}px 全部畫面沒有讀不到的圖片／音效`,!miss.size,[...miss].slice(0,5).join('、'));
    rec('UI-err@'+w,`${w}px 全部畫面沒有 JavaScript 錯誤`,!p.errs.length,p.errs.slice(0,2).join('；'));await p.context().close()}}

(async()=>{const t0=Date.now();fs.mkdirSync(OUT,{recursive:true});
  if(!arg('no-build'))console.log(cp.execSync('python3 src/build.py',{cwd:ROOT}).toString().trim());
  let srv=null;if(!await up()){srv=cp.spawn('python3',['-m','http.server',String(PORT)],{cwd:ROOT,stdio:'ignore'});for(let i=0;i<50&&!await up();i++)await sleep(100)}
  const browser=await pw.chromium.launch();let crash=null;
  try{for(const [k,f] of [[0,L0],[1,L1],[2,L2],[3,L3],[4,L4],[5,L5]])if(ONLY.includes(k)){try{await f(browser)}catch(e){rec('CRASH-'+k,'第 '+k+' 層執行中斷',false,e.message.split('\n')[0]);crash=e}}}
  finally{await browser.close();if(srv&&!arg('keep'))srv.kill()}
  const by={};for(const r of R){const b=by[r.layer]=by[r.layer]||{p:0,f:0,s:0};r.pass===null?b.s++:r.pass?b.p++:b.f++}
  const fails=R.filter(r=>r.pass===false),sum=Object.entries(by).map(([l,b])=>`| ${l} | ${b.p} | ${b.f} | ${b.s} |`).join('\n');
  const notRun=[0,1,2,3,4,5].filter(k=>!ONLY.includes(k));
  const md=`# 測試報告（v${fs.readFileSync(path.join(ROOT,'version.json'),'utf8').match(/"v":\s*"([^"]+)"/)[1]}，${new Date().toISOString().slice(0,16).replace('T',' ')} UTC，${Math.round((Date.now()-t0)/1000)} 秒）\n\n| 層 | 通過 | 失敗 | 略過 |\n|---|---|---|---|\n${sum}\n\n`+
    (notRun.length?`**未執行**：第 ${notRun.join('、')} 層（這次用 --only 指定）\n\n`:'')+(fails.length?`## 失敗\n${fails.map(f=>`- [${f.layer}] ${f.id} ${f.name} — ${f.detail}`).join('\n')}\n\n`:'## 全部通過\n\n')+`## 全部項目\n${R.map(r=>`- ${r.pass===null?'略過':r.pass?'✓':'✗'} [${r.layer}] ${r.id} ${r.name}${r.detail?'（'+r.detail.slice(0,140)+'）':''}`).join('\n')}\n`;
  fs.writeFileSync(path.join(OUT,'report.md'),md);
  fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({R,crash:crash?String(crash.message||crash).split('\n')[0]:null,notRun},null,1));   // 給 gate.js 讀（關卡用逐項結果判斷）
  console.log('\n'+sum.replace(/\|/g,' ')+`\n合計：通過 ${R.filter(r=>r.pass).length}、失敗 ${fails.length}、略過 ${R.filter(r=>r.pass===null).length}${notRun.length?'、未執行第 '+notRun.join(',')+' 層':''}；報告 test-out/report.md`);
  process.exit(fails.length||crash?1:0)})();
