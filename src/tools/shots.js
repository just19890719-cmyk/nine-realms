// 諸神鐵匠 UI 修改前／修改後自動對照（v5.12 強制驗收關卡）
//   node src/tools/shots.js [--base=origin/main] [--screens=強化小卡,附魔小卡] [--parts=按鈕]
// 做的事：
//   1. 把「修改前」（--base，預設 origin/main）放到暫存資料夾建置，「修改後」用目前的工作區，兩邊各開一個本機伺服器
//   2. 兩邊用同樣的存檔、同樣的亂數、同樣的時間，在 320／375／430 拍 screens.js 的每個畫面（整頁），動畫停在同一格
//   3. 逐像素比較，把不同的地方用紅框圈起來，輸出「修改前｜修改後」左右對照圖到 test-out/compare/，圖上印 commit 編號和拍攝時間
//   4. 記錄共用元件（圖示鈕、按鈕、導覽列、資源列、道具格、分頁、彈窗、武器名稱）每個畫面的外觀數值，兩邊不一樣就列出
//   5. 範圍檢查：有變動的畫面不在 --screens、有變動的元件不在 --parts → 失敗（未經同意的外觀變動，例如 v5.10 叉叉變八角形）
// 結果寫到 test-out/compare/result.json；被 gate.js 呼叫，也可以自己跑。有失敗時結束碼 1。
const path=require('path'),fs=require('fs'),cp=require('child_process'),http=require('http'),os=require('os');
const ROOT=path.resolve(__dirname,'..','..'),OUT=path.join(ROOT,'test-out','compare');
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):null};
let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/node-tools/node_modules/playwright')}
const SCREENS=require('./screens.js'),WIDTHS=[320,375,430],H=860;
// 共用元件：名稱 → CSS 選擇器。改到這些元件的外觀時，PR 的「範圍元件」一定要寫出來
const PARTS={'圖示鈕':'.ui-btn--icon','按鈕':'button:not(.ui-btn--icon),.btn:not(.ui-btn--icon)','導覽列':'nav,nav button','資源列':'.bar,.bar > *','道具格':'.b2-slot','分頁':'.b2-tab,.ui-tab','彈窗':'.sheet,.sheet-head,.ui-modal','武器名稱':'.wt-name'};
const PROPS=['border-image-source','border-radius','background-image','background-color','color','font-size','font-weight','width','height','clip-path','box-shadow','opacity','filter','border-top-width','border-top-color'];
const sleep=ms=>new Promise(z=>setTimeout(z,ms));
const git=(a,cwd=ROOT)=>cp.execFileSync('git',a,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
function up(port){return new Promise(z=>http.get(`http://localhost:${port}/index.html`,r=>{r.resume();z(r.statusCode===200)}).on('error',()=>z(false)))}
async function serve(dir,port){const s=cp.spawn('python3',['-m','http.server',String(port)],{cwd:dir,stdio:'ignore'});for(let i=0;i<80&&!await up(port);i++)await sleep(100);return s}

// 同樣的亂數（每頁從同一個種子開始）、同樣的時間：遊戲時鐘、計時器、動畫影格都由測試控制（從 2026-10-25 12:00 UTC 開始，只在我們推進時才走）
const SEED=()=>{let a=20261025;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
async function openAt(browser,port,w){const ctx=await browser.newContext({viewport:{width:w,height:H},deviceScaleFactor:1,hasTouch:true});
  await ctx.clock.install({time:new Date('2026-10-25T12:00:00Z')});await ctx.clock.pauseAt(new Date('2026-10-25T12:00:01Z'));   // install 之後時間還會照真實時間走，要 pauseAt 才會停await ctx.addInitScript(SEED);
  await ctx.route(u=>!/^http:\/\/localhost[:/]/.test(u.href),r=>r.abort());   // 擋掉雲端（伺服器時間校正、聊天）和外部字型：兩邊都只用本機檔案，結果才會一樣
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(`http://localhost:${port}/index.html`);await p.clock.runFor(1000);await p.waitForFunction(()=>typeof S!=='undefined'&&typeof ui!=='undefined'&&document.getElementById('view'));
  await p.evaluate(()=>{ui.signAuto=true;try{localStorage.setItem(DEV_KEY,'1')}catch(e){}devBps&&devBps()});await p.clock.runFor(500);
  await p.addStyleTag({content:'#toasts{display:none!important}'});   // 頂端通知是暫時的（例如開局的歡迎提示），不算畫面的一部分
  return p}
// 即時數值（怪物血條、倒數秒數）和村莊卡上的即時戰鬥（怪物被打的特效）每次都不一樣，蓋成同一個顏色再比（跟 run_tests.js 第 5 層排除的範圍相同）
const LIVE='.ui-prog,[data-vtime],[data-vpend],.vmon',SHOT=p=>({fullPage:true,mask:[p.locator(LIVE)],maskColor:'#5a2a5a'});
// 動畫停在同一格：有限次的（彈出、轉場）直接播完，循環的停在第 0 毫秒
const FREEZE=()=>{for(const a of document.getAnimations()){try{const t=a.effect.getComputedTiming();if(t.iterations===Infinity){a.pause();a.currentTime=0}else a.finish()}catch(e){}}};
const STYLES=([parts,props])=>{const out={},org=location.origin;for(const [n,sel] of Object.entries(parts)){let i=0;
  for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
    const k=`${n}#${i++} ${(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,'').slice(0,10)}`;
    out[k]=Object.fromEntries(props.map(x=>[x,cs.getPropertyValue(x).split(org).join('')]))}}return out};
// only＝[寬度, 畫面名稱]：只重拍這一張（前面的畫面照順序走一遍，存檔狀態才會一樣）
async function capture(browser,port,label,only){const shots={},styles={},errs=[];
  for(const w of only?[only[0]]:WIDTHS){const p=await openAt(browser,port,w);
    for(const [n,tab,prep] of SCREENS){if(only&&SCREENS.findIndex(x=>x[0]===only[1])<SCREENS.findIndex(x=>x[0]===n))break;await p.evaluate(([t])=>{ui.sheet=null;ui.result=null;ui.tab=t;ui.atab='w';render();scrollTo(0,0)},[tab]);await p.evaluate(SEED);if(prep)await prep(p);   // 每個畫面重設亂數種子（圖片載入快慢會影響之前用掉幾個亂數）
      await p.clock.runFor(500);await p.waitForTimeout(300);   // 等圖片載入（真實時間），遊戲時間不動
      await p.evaluate(FREEZE);
      // 等圖片都載完：遊戲時間是停住的，畫面只會因為圖片晚到而改變 → 連拍到兩張完全一樣才採用（最多 6 次）
      await p.waitForLoadState('networkidle').catch(()=>{});let shot=await p.screenshot(SHOT(p));
      for(let t=0;t<6;t++){await p.waitForTimeout(250);const again=await p.screenshot(SHOT(p));if(again.equals(shot))break;shot=again;if(t===5)errs.push(`${label} ${n} ${w}px：畫面一直在變，截圖可能不穩定`)}
      if(only&&n!==only[1])continue;
      shots[`${n}_${w}`]=shot;styles[`${n}_${w}`]=await p.evaluate(STYLES,[PARTS,PROPS])}
    errs.push(...p.errs.map(e=>`${label} ${w}px：${e}`));await p.context().close()}
  return {shots,styles,errs}}

// 在瀏覽器裡用 canvas 比對兩張圖，紅框圈出不同的地方，產生左右對照圖（PNG base64）
const COMPOSE=async([a,b,stamp])=>{const ld=s=>new Promise(z=>{const i=new Image();i.onload=()=>z(i);i.src='data:image/png;base64,'+s});const [x,y]=await Promise.all([ld(a),ld(b)]);
  const W=Math.max(x.width,y.width),Hh=Math.max(x.height,y.height),px=im=>{const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');g.fillStyle='#ff00ff';g.fillRect(0,0,W,Hh);g.drawImage(im,0,0);return g.getImageData(0,0,W,Hh).data};
  const d1=px(x),d2=px(y),C=8,cw=Math.ceil(W/C),ch=Math.ceil(Hh/C),cell=new Uint8Array(cw*ch);let n=0;
  const cnt=new Uint32Array(cw*ch);   // 三色差總和超過 60 才算不同（同一版重拍的繪圖雜訊都在 30～59 之間）
  for(let yy=0;yy<Hh;yy++)for(let xx=0;xx<W;xx++){const i=(yy*W+xx)*4;if(Math.abs(d1[i]-d2[i])+Math.abs(d1[i+1]-d2[i+1])+Math.abs(d1[i+2]-d2[i+2])>60){const k=(yy/C|0)*cw+(xx/C|0);cell[k]=1;cnt[k]++}}
  const boxes=[],seen=new Uint8Array(cw*ch);   // 相鄰的差異格子併成一個框
  for(let s=0;s<cell.length;s++){if(!cell[s]||seen[s])continue;let q=[s],x0=1e9,y0=1e9,x1=-1,y1=-1,px=0;seen[s]=1;
    while(q.length){const c=q.pop(),cx=c%cw,cy=c/cw|0;px+=cnt[c];x0=Math.min(x0,cx);y0=Math.min(y0,cy);x1=Math.max(x1,cx);y1=Math.max(y1,cy);
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const nx=cx+dx,ny=cy+dy,k=ny*cw+nx;if(nx>=0&&ny>=0&&nx<cw&&ny<ch&&cell[k]&&!seen[k]){seen[k]=1;q.push(k)}}}
    if(px<24)continue;   // 少於 24 個像素的零星差異是字型反鋸齒的繪圖雜訊（同一版重拍也會出現），不算改動；真正的外觀改動另外有共用元件數值檢查
    n+=px;boxes.push([x0*C-4,y0*C-4,(x1-x0+1)*C+8,(y1-y0+1)*C+8])}
  const G=16,TOP=44,c=document.createElement('canvas');c.width=W*2+G*3;c.height=Hh+TOP+G;const g=c.getContext('2d');g.fillStyle='#202020';g.fillRect(0,0,c.width,c.height);
  g.drawImage(x,G,TOP);g.drawImage(y,W+G*2,TOP);g.fillStyle='#fff';g.font='bold 15px sans-serif';g.fillText('修改前 BEFORE '+stamp[0],G,18);g.fillText('修改後 AFTER '+stamp[1],W+G*2,18);
  g.font='12px sans-serif';g.fillStyle=boxes.length?'#ff6060':'#7fdc7f';g.fillText(stamp[2]+(boxes.length?`  不同的地方 ${boxes.length} 處（紅框）`:'  完全相同'),G,36);
  g.strokeStyle='#ff2a2a';g.lineWidth=3;for(const [bx,by,bw,bh] of boxes){g.strokeRect(G+bx,TOP+by,bw,bh);g.strokeRect(W+G*2+bx,TOP+by,bw,bh)}
  return {n,boxes:boxes.length,png:c.toDataURL('image/png').split(',')[1],sameSize:x.width===y.width&&x.height===y.height}};

async function run({base='origin/main',screens=[],parts=[]}={}){fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
  const fail=[],warn=[],info=[],changed=[];
  const bsha=git(['rev-parse','--short',base]),hsha=git(['rev-parse','--short','HEAD'])+(git(['status','--porcelain']).split('\n').some(l=>l&&!/^\?\?/.test(l))?'+未提交修改':'');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gate-base-'));git(['worktree','add','--detach',tmp,base]);
  let s1,s2,browser;
  try{cp.execSync('python3 src/build.py',{cwd:tmp,stdio:'ignore'});
    s1=await serve(tmp,8797);s2=await serve(ROOT,8796);browser=await pw.chromium.launch({args:['--disable-gpu','--force-color-profile=srgb','--disable-partial-raster','--disable-skia-runtime-opts','--disable-lcd-text','--font-render-hinting=none','--disable-threaded-animation','--disable-checker-imaging','--disable-image-animation-resync']});   // 這些參數讓每次繪圖結果一樣（避免同一版被判成不同）
    const A=await capture(browser,8797,'修改前'),B=await capture(browser,8796,'修改後');
    for(const e of [...A.errs,...B.errs].slice(0,8))(/截圖可能不穩定/.test(e)?warn:e.startsWith('修改後')?fail:warn).push((/截圖/.test(e)?'':'JavaScript 錯誤：')+e);
    const cp2=await browser.newPage(),time=new Date().toISOString().slice(0,16).replace('T',' ')+' UTC';
    for(const k of Object.keys(B.shots)){const [scr,w]=k.split('_');
      const r=await cp2.evaluate(COMPOSE,[A.shots[k].toString('base64'),B.shots[k].toString('base64'),[`${base}@${bsha}`,`HEAD@${hsha}`,`${scr}  ${w}px  拍攝 ${time}`]]);
      let rr=r;   // 有差異時兩邊各重拍 2 次：真的改動每次都在，偶發的繪圖雜訊不會每次都出現
      for(let t=0;t<2&&rr.n;t++){const a2=await capture(browser,8797,'修改前',[+w,scr]),b2=await capture(browser,8796,'修改後',[+w,scr]);
        const r2=await cp2.evaluate(COMPOSE,[a2.shots[k].toString('base64'),b2.shots[k].toString('base64'),[`${base}@${bsha}`,`HEAD@${hsha}`,`${scr}  ${w}px  拍攝 ${time}`]]);if(r2.n<rr.n||!r2.n)rr=r2}
      fs.writeFileSync(path.join(OUT,`${scr}_${w}.png`),Buffer.from(rr.png,'base64'));
      if(rr.n)changed.push({screen:scr,w:+w,pixels:rr.n,boxes:rr.boxes})}
    // 共用元件外觀
    const partDiff={};for(const k of Object.keys(B.styles)){const a=A.styles[k]||{},b=B.styles[k]||{};
      for(const e of new Set([...Object.keys(a),...Object.keys(b)])){const part=e.split('#')[0];
        if(!a[e]||!b[e]){(partDiff[part]=partDiff[part]||[]).push(`${k} ${e}：${a[e]?'不見了':'新出現'}`);continue}
        for(const pr of PROPS)if(a[e][pr]!==b[e][pr])(partDiff[part]=partDiff[part]||[]).push(`${k} ${e} ${pr}：${a[e][pr].slice(0,60)} → ${b[e][pr].slice(0,60)}`)}}
    for(const c of changed){const msg=`${c.screen} ${c.w}px：${c.boxes} 處不同（${c.pixels} 像素），對照圖 test-out/compare/${c.screen}_${c.w}.png`;
      if(screens.includes(c.screen))info.push('範圍內的畫面變動 '+msg);else fail.push('範圍外的畫面變動 '+msg)}
    for(const [part,list] of Object.entries(partDiff)){const msg=`共用元件「${part}」外觀改變 ${list.length} 處，例：${list.slice(0,2).join('；')}`;
      if(parts.includes(part))info.push('範圍內 '+msg);else fail.push('範圍外 '+msg)}
    if(!changed.length&&!Object.keys(partDiff).length)info.push(`跟 ${base} 比對：${Object.keys(B.shots).length} 張畫面（${SCREENS.length} 個畫面 × 320／375／430）完全相同`);
    info.push(`修改前 ${base}@${bsha}，修改後 HEAD@${hsha}；宣告的範圍：畫面［${screens.join('、')||'無'}］元件［${parts.join('、')||'無'}］`);
    await cp2.close()}
  catch(e){fail.push('前後對照沒有跑完：'+e.message.split('\n')[0])}
  finally{if(browser)await browser.close();for(const s of [s1,s2])if(s)s.kill();try{git(['worktree','remove','--force',tmp])}catch(e){}}
  const res={fail,warn,info,changed,base:`${base}@${bsha}`,head:`HEAD@${hsha}`};fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(res,null,1));return res}

module.exports={run,PARTS};
if(require.main===module)run({base:arg('base')||'origin/main',screens:(arg('screens')||'').split(/[,，、]/).filter(Boolean),parts:(arg('parts')||'').split(/[,，、]/).filter(Boolean)}).then(r=>{
  for(const x of r.fail)console.log('FAIL  '+x);for(const x of r.info)console.log('      '+x);process.exit(r.fail.length?1:0)});
