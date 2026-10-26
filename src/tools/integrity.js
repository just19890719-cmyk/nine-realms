// 諸神鐵匠 素材與流程檔完整性檢查（v5.12 強制驗收關卡，Mochi 2026-10-25 決定）
//   node src/tools/integrity.js                 比對 main（origin/main）的素材清單，印出結果；有問題結束碼 1
//   node src/tools/integrity.js --base=<ref>    指定比對的分支
//   node src/tools/integrity.js --init          用目前 art/、sfx/ 的檔案重建清單（只在第一次建立時用）
// 規則：
//   1. 清單 src/tools/art_manifest.json 記錄 art/、sfx/ 每個檔案的 SHA-256。比對的基準是「main 上的清單」，不是這個分支自己的清單，
//      所以在分支裡偷改清單也蓋不掉：main 清單裡的檔案被改、被刪、被換，一律失敗，
//      除非這個分支的清單在那個檔案寫上 auth（Mochi 授權的日期＋訊息），這時不算失敗，但報告最上面用紅字列出，讓 Mochi 合併前一定看到。
//   2. 新增的素材一定要登記在清單（status:"pending"＝未驗收），沒登記就失敗。
//   3. 清單裡寫的雜湊要跟實際檔案一樣（避免清單和檔案不同步）。
//   4. 流程檔（關卡程式、測試指令、GitHub 工作流程、Claude 權限設定）只要有改，就在報告最上面用紅字列出。
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..','..'),MAN='src/tools/art_manifest.json',DIRS=['art','sfx'];
const PROTECTED=['src/tools/gate.js','src/tools/integrity.js','src/tools/shots.js','src/tools/screens.js','src/tools/run_tests.js','src/tools/known_failures.json','src/tools/locked.js','src/tools/locked.json',MAN,'.github/workflows/','.claude/settings.json','CLAUDE.md','docs/rules/'];
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');
const git=a=>cp.execFileSync('git',a,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']});
function walk(d){const out=[];if(!fs.existsSync(path.join(ROOT,d)))return out;for(const e of fs.readdirSync(path.join(ROOT,d),{withFileTypes:true})){const f=d+'/'+e.name;if(e.isDirectory())out.push(...walk(f));else if(!e.name.startsWith('.'))out.push(f)}return out}
const files=()=>DIRS.flatMap(walk).sort();
function readMan(ref){try{return JSON.parse(ref?git(['show',ref+':'+MAN]):fs.readFileSync(path.join(ROOT,MAN),'utf8'))}catch(e){return null}}

function init(){const old=readMan()||{files:{}},m={_說明:'已驗收／現況凍結的素材雜湊。只能由關卡流程更新：改已登記的檔案要在該筆寫 auth（Mochi 授權日期＋訊息連結）；新檔案加一筆 status:"pending"。status：baseline＝v5.11 時的現況凍結、approved＝Mochi 確認過、pending＝新素材未驗收。',files:{}};
  for(const f of files())m.files[f]=Object.assign({},old.files[f]||{status:'baseline'},{sha256:sha(f)});
  fs.writeFileSync(path.join(ROOT,MAN),JSON.stringify(m,null,1)+'\n');return Object.keys(m.files).length}

// 回傳 {fail:[], warn:[], info:[]}（字串陣列，給 gate.js 寫進報告）
function check(base='origin/main'){const fail=[],warn=[],info=[];
  const cur={};for(const f of files())cur[f]=sha(f);
  const mine=readMan();if(!mine){fail.push(`找不到素材清單 ${MAN}`);return {fail,warn,info}}
  let bm=readMan(base);if(!bm){bm=mine;info.push(`${base} 上還沒有素材清單（第一次建立），這次只檢查清單和檔案一致`)}
  for(const [f,e] of Object.entries(bm.files)){const m=mine.files[f];
    if(cur[f]===e.sha256)continue;
    const what=cur[f]?'被修改／替換':'被刪除';
    if(m&&m.auth&&(cur[f]?m.sha256===cur[f]:m.deleted))warn.push(`已登記素材${what}：${f}（清單寫的授權：${m.auth}）`);
    else fail.push(`已登記素材${what}，而且清單沒有 Mochi 授權：${f}`)}
  for(const f of Object.keys(cur))if(!bm.files[f]){const m=mine.files[f];
    if(!m)fail.push(`新素材沒有登記到清單：${f}`);else info.push(`新素材（${m.status==='approved'?'已驗收':'未驗收'}）：${f}`)}
  for(const [f,m] of Object.entries(mine.files)){if(m.deleted)continue;if(!cur[f])fail.push(`清單有、檔案不存在：${f}`);else if(m.sha256!==cur[f])fail.push(`清單的雜湊跟檔案不一樣：${f}`)}
  let changed=[];try{changed=git(['diff','--name-only',base+'...HEAD']).split('\n').filter(Boolean);changed.push(...git(['status','--porcelain']).split('\n').filter(Boolean).map(l=>l.slice(3)))}catch(e){info.push(`沒辦法跟 ${base} 比對檔案差異（${e.message.split('\n')[0]}）`)}
  for(const f of [...new Set(changed)])if(PROTECTED.some(p=>p.endsWith('/')?f.startsWith(p):f===p))warn.push(`流程檔有修改：${f}`);
  info.push(`素材清單 ${Object.keys(mine.files).length} 個檔案，比對基準 ${base}`);
  return {fail,warn,info}}

module.exports={check,PROTECTED,MAN};
if(require.main===module){const a=process.argv.find(x=>x.startsWith('--base='));
  if(process.argv.includes('--init')){console.log(`已寫入 ${MAN}：${init()} 個檔案`);process.exit(0)}
  const r=check(a?a.slice(7):'origin/main');
  for(const x of r.fail)console.log('FAIL  '+x);for(const x of r.warn)console.log('注意  '+x);for(const x of r.info)console.log('      '+x);
  process.exit(r.fail.length?1:0)}
