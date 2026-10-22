/* ===================== 九界鐵匠 v3 ===================== */
/* ---------- 資料表 ---------- */
const VERSION=3;
const ART_V='?v=3';  // 武器顯示圖改過透明度：加版本號，避免瀏覽器沿用舊快取
const A=n=>(typeof UI_ART!=='undefined'&&UI_ART[n])||'art/'+n+'.webp'+(n.endsWith('_disp')?ART_V:'');  // UI_ART（skin.js）可把既有圖示換成新素材路徑；預設空白＝不變
const MATS={iron:'鐵礦',oak:'橡木',leather:'皮革',silver:'霜銀',fang:'狼牙',scale:'龍鱗',rune:'符文石',shard:'符文碎片',fur:'魔狼黑毛',icecore:'霜巨人冰核',fireheart:'火巨人焰心',serpent:'海蛇鱗'};
const MATART={iron:'mat_iron',oak:'mat_oak',leather:'mat_leather',silver:'mat_silver',fang:'mat_fang',scale:'mat_scale',rune:'mat_rune',shard:'mat_shard',fur:'mat_fur',icecore:'mat_icecore',fireheart:'mat_fireheart',serpent:'mat_serpent'};
const CATS={axe:'斧',sword:'劍',dagger:'短刃',polearm:'長柄',hammer:'錘',bow:'弓',crossbow:'弩',shield:'盾',throw:'投擲',tool:'工具'};
// sec = 正式版 1× 秒數；試玩可在測試工具調整時間流速
const TIERS=[
  {n:'鐵製',mult:1,stable:6,sec:60,gold:10,furnace:1,unlock:0,slag:1},
  {n:'霜銀',mult:2.5,stable:5,sec:300,gold:60,furnace:2,unlock:4,slag:4},
  {n:'龍鱗',mult:6,stable:3,sec:900,gold:250,furnace:4,unlock:7,slag:10},
  {n:'神器',mult:11,stable:0,sec:2400,gold:800,furnace:5,unlock:8,slag:25}
];
const BPS=[
 ['t1_woodaxe','伐木斧','axe',0,14,0],['t1_handaxe','手斧','axe',0,12,0],
 ['t1_farmspear','農用長矛','polearm',0,11,1],['t1_shortspear','短矛','polearm',0,10,1],['t1_pickaxe','礦鎬','tool',0,11,1],
 ['t1_huntbow','獵弓','bow',0,10,2],['t1_sling','投石索','throw',0,7,2],['t1_huntknife','獵刀','dagger',0,9,2],
 ['t1_ironsword','鐵劍','sword',0,12,3],['t1_roundshield','圓盾','shield',0,10,3],['t1_crossbow','十字弩','crossbow',0,13,3],['t1_ironhammer','鐵錘','hammer',0,16,3],
 ['t2_wolfaxe','霜狼戰斧','axe',1,15],['t2_daneaxe','丹麥長斧','axe',1,14],['t2_longsword','霜銀長劍','sword',1,13],['t2_broadsword','霜銀闊劍','sword',1,14],
 ['t2_longbow','霜銀長弓','bow',1,11],['t2_crossbow','霜銀重弩','crossbow',1,13],['t2_warspear','霜銀戰矛','polearm',1,12],['t2_glaive','霜銀長柄刀','polearm',1,13],['t2_twindagger','霜銀雙匕','dagger',1,10],
 ['t2_seax','霜銀短刀','dagger',1,9],['t2_warhammer','霜獅戰錘','hammer',1,16],['t2_throwaxe','霜銀飛斧','throw',1,9],['t2_kiteshield','霜狼鳶盾','shield',1,11],
 ['t3_greataxe','龍首巨斧','axe',2,16],['t3_doubleaxe','龍鱗雙刃斧','axe',2,15],['t3_greatsword','龍鱗巨劍','sword',2,15],['t3_saber','龍鱗彎刀','sword',2,13],
 ['t3_bow','龍骨長弓','bow',2,12],['t3_crossbow','龍鱗重弩','crossbow',2,14],['t3_spear','龍鱗長矛','polearm',2,12],['t3_halberd','龍鱗戟','polearm',2,14],
 ['t3_scythe','龍鱗鐮刀','polearm',2,13],['t3_hammer','龍鱗戰錘','hammer',2,17],['t3_dagger','龍牙匕首','dagger',2,10],['t3_shield','龍鱗塔盾','shield',2,12],
 ['m_fenrir','芬里爾魔狼斧','axe',3,16,8,{fur:3,scale:3,rune:2},['swift',15]],
 ['m_frostgiant','霜巨人戰錘','hammer',3,17,8,{icecore:3,silver:4,rune:2},['giant',30]],
 ['m_firegiant','火巨人焰劍','sword',3,15,9,{fireheart:3,scale:3,rune:2},['flame',20]],
 ['m_nidhogg','尼德霍格龍矛','polearm',3,14,8,{scale:5,rune:3,fur:1},['dragon',35]],
 ['m_iceraven','冰鴉長弓','bow',3,12,8,{icecore:2,fang:6,rune:2},['frost',20]],
 ['m_serpent','海蛇三叉戟','polearm',3,13,8,{serpent:3,silver:4,rune:2},['loot',30]]
].map(([id,n,cat,t,base,unlock,r,inn])=>({id,n,cat,t,base,unlock:unlock??TIERS[t].unlock,r,inn}));
const BP=Object.fromEntries(BPS.map(b=>[b.id,b]));
// v3.20 同階同類只保留一把圖紙；移除的圖紙在存檔裡自動換成保留的那把
const BP_ALIAS={t1_handaxe:'t1_woodaxe',t1_shortspear:'t1_farmspear',t2_daneaxe:'t2_wolfaxe',t2_broadsword:'t2_longsword',t2_warspear:'t2_glaive',t2_seax:'t2_twindagger',t3_doubleaxe:'t3_greataxe',t3_saber:'t3_greatsword',t3_spear:'t3_halberd',t3_scythe:'t3_halberd'};
for(const k in BP_ALIAS){const i=BPS.findIndex(b=>b.id===k);if(i>=0)BPS.splice(i,1);delete BP[k]}
const bpId=id=>BP_ALIAS[id]||id;
const goldOf=b=>TIERS[b.t].gold;
function recipe(b){if(b.r)return b.r;if(b.t===0){const sec={axe:'oak',polearm:'oak',bow:'oak',crossbow:'oak',throw:'leather',tool:'oak',sword:'leather',dagger:'leather',shield:'oak',hammer:'iron'}[b.cat];return add({iron:3},{[sec]:2})}
  if(b.t===1)return{silver:3,fang:2,iron:2};return{scale:2,rune:2,silver:2}}
const QUAL=[{n:'普通',m:1},{n:'精良',m:1.2},{n:'稀有',m:1.45},{n:'史詩',m:1.8},{n:'傳說',m:2.3}];
// 品質權重用整數（千分比），每級鐵砧位移加總為 0，總和恆為 1000
const QW=[550,280,120,40,10],QSHIFT=[-70,30,25,11,4];
const AFFIX={
  flame:{n:'烈焰',min:5,max:12,w:21,d:'戰力'},frost:{n:'霜寒',min:5,max:12,w:21,d:'戰力'},
  swift:{n:'迅捷',min:5,max:15,w:18,d:'狩獵時間縮短'},loot:{n:'掠奪',min:10,max:30,w:18,d:'掉落率提升'},
  giant:{n:'剋巨人',min:20,max:40,w:12,d:'巨人委託必備'},dragon:{n:'剋龍',min:20,max:40,w:10,d:'龍族委託必備'}
};
// 先天鍛造特性：數值 = 隨機(min,max) × (1 + 0.2 × 品質等級)
const TRAITS={
  sharp:{n:'鋒利',min:4,max:10,d:'野獸委託狩獵時間縮短'},
  sturdy:{n:'堅固',min:10,max:25,d:'村莊危險事件機率降低'},
  light:{n:'輕巧',min:3,max:7,d:'所有狩獵時間縮短'},
  treasure:{n:'尋寶',min:8,max:20,d:'稀有素材掉落提升'},
  giantslayer:{n:'巨人獵手',min:6,max:14,d:'巨人委託時間縮短、金幣提升'},
  runic:{n:'符文親和',min:8,max:20,d:'附魔數值提升'}
};
const TRAIT_N=[[[0,6],[1,4]],[[1,1]],[[1,6],[2,4]],[[2,1]],[[2,5],[3,5]]]; // 每品質的特性數量分布
const CAP={time:50,loot:60,treasure:50,sturdy:60,runic:50}; // 加成上限（%）
const STRATS={
  normal:{n:'一般狩獵',gold:1,common:1,rare:1,time:1,bonus:0,d:'金幣、材料、時間都正常'},
  material:{n:'素材追獵',gold:.6,common:1.5,rare:1,time:1,bonus:.5,d:'金幣 −40%，一般材料 ×1.5，50% 機率多 1 個'},
  rare:{n:'稀有追蹤',gold:.7,common:.8,rare:1.8,time:1.4,bonus:0,d:'時間 ×1.4、金幣 −30%，稀有素材機率 ×1.8'}
};
const RARE_P=.3;
const PITY_FORGE=10;
const CAP_WEAPONS=200; // 武器庫容量
const POWER_FLOOR=.6; // 戰力超過需求時，狩獵時間最多縮短到 60% // 基礎機率低於 30% 的掉落視為稀有素材
const SLOT_ANVIL=[1,1,3,5]; // 附魔第 1~4 格需要的鐵砧等級
const REALMS=['米德加德','約頓','尼福爾','亞爾夫','瓦納','斯瓦塔','穆斯貝','赫爾','阿斯嘉'];
const VILLAGES=[
 {name:'鐵爐村',who:'村民・伐木工',cat:'axe',req:10,sec:1200,gold:12,danger:0,tag:'labor',drops:[['iron',.8,1,1],['oak',.6,1,1]],txt:'伐木工的斧頭全鈍了，冬天前得砍夠柴火。'},
 {name:'松林哨站',who:'村民・守林人',cat:'polearm',req:13,sec:1800,gold:24,danger:.02,tag:'beast',drops:[['oak',.8,1,1],['leather',.5,1,1]],txt:'守林人要長矛擋住林中的野豬群。'},
 {name:'狼嚎谷',who:'村民・獵人',cat:'bow',req:15,sec:2700,gold:45,danger:.04,tag:'beast',drops:[['leather',.8,1,1],['iron',.4,1,1],['fang',.15,1,1],['fur',.03,1,1]],txt:'獵人要一把好弓，谷裡的狼群越來越大膽。'},
 {name:'霜溪鎮',who:'鎮民自衛隊',cat:'sword',req:22,sec:3600,gold:70,danger:.05,tag:'beast',drops:[['iron',.6,1,1],['silver',.35,1,1],['fang',.35,1,1]],txt:'溪邊出現霜狼，自衛隊要換新劍。'},
 {name:'鹿角堡',who:'軍隊・堡壘守衛',cat:'shield',req:32,sec:7200,gold:100,danger:.06,tag:'beast',drops:[['silver',.5,1,2],['fang',.4,1,2],['shard',.25,1,1]],txt:'冰鴉群天天俯衝城牆，守衛需要堅固的盾。'},
 {name:'渡鴉灣',who:'軍隊・港口衛兵',cat:'crossbow',req:34,sec:10800,gold:170,danger:.08,tag:'beast',drops:[['silver',.5,1,2],['fang',.3,1,1],['shard',.3,1,1],['serpent',.06,1,1]],txt:'海蛇在港外出沒，衛兵要能遠射的弩。'},
 {name:'雪峰營地',who:'軍隊・山地軍團',cat:'hammer',req:75,sec:14400,gold:280,danger:.1,tag:'beast',drops:[['silver',.6,1,2],['fang',.6,1,2],['scale',.15,1,1],['rune',.15,1,1],['fur',.1,1,1],['shard',.15,1,1]],txt:'雪怪的甲殼太硬，軍團要能砸碎它的戰錘。'},
 {name:'巨人足跡',who:'軍隊・王國先鋒',cat:'axe',req:110,sec:21600,gold:450,danger:.12,tag:'giant',need:'giant',drops:[['rune',.3,1,1],['scale',.2,1,1],['shard',.5,1,2],['icecore',.15,1,1]],txt:'霜巨人走下山了。武器必須帶有「剋巨人」。'},
 {name:'灰燼要塞',who:'軍隊・要塞騎士',cat:'sword',req:160,sec:28800,gold:700,danger:.14,tag:'giant',drops:[['scale',.3,1,1],['rune',.3,1,1],['shard',.3,1,1],['fireheart',.15,1,1]],txt:'火巨人的斥候燒毀了外牆，騎士要更強的劍。'},
 {name:'世界樹根穴',who:'軍隊・屠龍軍',cat:'polearm',req:200,sec:36000,gold:1000,danger:.16,tag:'dragon',need:'dragon',drops:[['scale',.35,1,2],['rune',.3,1,1],['shard',.5,1,2]],txt:'尼德霍格啃咬著世界樹根。長柄武器必須帶有「剋龍」。'}
];
const TAGN={labor:'勞務',beast:'野獸',giant:'巨人',dragon:'龍族'};
const FURNACE_COST=[0,3000,6000,15000,40000],ANVIL_COST=[0,2000,8000,25000,50000],SLOT_COST=[0,3000,15000,40000];
const SHOP_MATS=[['iron',8],['oak',6],['leather',10]];
const SELL_PRICE={iron:1,oak:1,leather:1}; // 商人收購價，低於售價，不能套利
const SLAG_SHOP=[['iron',4,3],['silver',1,10],['shard',1,25]]; // [材料, 數量, 殘渣成本]
const ITEMS={scroll:['防爆卷','it_scroll'],bless:['祝福石','it_bless'],blueprint:['傳說圖紙','it_blueprint']};
// 祈願權重（千分比），總和 = 1000；保底池 = 權重 ≤ 100 的獎勵
const GACHA=[['fang',3,270],['silver',3,240],['shard',2,150],['rune',1,100],['scale',1,80],['bless',1,60],['scroll',1,40],['fur',1,15],['icecore',1,15],['fireheart',1,10],['serpent',1,10],['blueprint',1,10]];
const PITY_MAX_W=100;
const RATE=[0,.95,.9,.85,.8,.75,.7,.6,.5,.4,.3,.22,.15,.1,.07,.05];
const ACH=[
  {id:'c3',n:'收復 1-3 狼嚎谷',g:'v',ic:'v3',p:()=>[cleared(),3],test:()=>cleared()>=3,r:{scroll:1}},
  {id:'c6',n:'收復 1-6 渡鴉灣',g:'v',ic:'v6',p:()=>[cleared(),6],test:()=>cleared()>=6,r:{scroll:1}},
  {id:'c9',n:'收復 1-9 灰燼要塞',g:'v',ic:'v9',p:()=>[cleared(),9],test:()=>cleared()>=9,r:{scroll:2}},
  {id:'h100',n:'累積收成 100 輪',g:'h',ic:'it_gold',p:()=>[S.stats.harvest,100],test:()=>S.stats.harvest>=100,r:{scroll:1}},
  {id:'h300',n:'累積收成 300 輪',g:'h',ic:'it_gold',p:()=>[S.stats.harvest,300],test:()=>S.stats.harvest>=300,r:{scroll:2}},
  {id:'e50',n:'強化成功 50 次',g:'f',ic:'mat_rune',p:()=>[S.stats.enhOk,50],test:()=>S.stats.enhOk>=50,r:{scroll:1}},
  {id:'m30',n:'熔解 30 把武器',g:'f',ic:'mat_shard',p:()=>[S.stats.melted,30],test:()=>S.stats.melted>=30,r:{bless:2}},
  {id:'f50',n:'鍛造 50 把武器',g:'f',ic:'nav_forge',p:()=>[S.stats.forged.reduce((a,b)=>a+b,0),50],test:()=>S.stats.forged.reduce((a,b)=>a+b,0)>=50,r:{bless:1,shard:3}}
];

/* ---------- 工具 ---------- */
let QUIET=false;
const CLOCK={offset:0};
const NOW=()=>Date.now()+CLOCK.offset;
function add(a,b){const o={...a};for(const k in b)o[k]=(o[k]||0)+b[k];return o}
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const fmt=n=>Math.floor(n).toLocaleString('zh-TW');
const pct=x=>Math.round(x*1000)/10+'%';
function fmtT(ms){const s=Math.max(0,Math.ceil(ms/1000));if(s>=3600)return Math.floor(s/3600)+'時'+Math.floor(s%3600/60)+'分';if(s>=60)return Math.floor(s/60)+'分'+String(s%60).padStart(2,'0')+'秒';return s+'秒'}
const today=()=>new Date(NOW()).toLocaleDateString('sv');
function weighted(list,wf){const tot=list.reduce((s,x)=>s+wf(x),0);let r=Math.random()*tot;for(const x of list){r-=wf(x);if(r<0)return x}return list[list.length-1]}
const itemName=k=>MATS[k]||ITEMS[k][0];

/* ---------- 狀態與存檔 ---------- */
const KEY='nine-realms-smith-v3',KEY_V2='nine-realms-smith-v2';
function freshStats(){return{harvest:0,forged:[0,0,0,0,0],enhTry:0,enhOk:0,enhFail:0,breaks:0,scrollUsed:0,maxLv:0,melted:0,goldIn:0,events:0}}
function freshVillage(i){return{status:i===0?'open':'locked',weaponId:null,cycleStart:null,strat:'normal',bank:{cycles:0,gold:0,mats:{},events:0}}}
const GAME_SPEED=10;   // v3.45 封測速度（狩獵／鍛造 10 倍）
function fresh(){return{v:VERSION,gold:500,fcRw:true,gems:100,slag:0,speed:GAME_SPEED,capH:8,pity:0,
  mats:{iron:8,oak:6,leather:3,silver:0,fang:0,scale:0,rune:0,shard:1,fur:0,icecore:0,fireheart:0,serpent:0},
  items:{scroll:1,bless:1,blueprint:0},furnace:1,anvil:1,slots:1,weapons:[],nextId:1,jobs:[],
  villages:VILLAGES.map((v,i)=>freshVillage(i)),monthly:{until:0,last:''},stats:freshStats(),ach:{},best:{},lbRw:{},lastSeen:NOW(),clockWarn:false}}
function migrateV2(o){
  const s=fresh();s.gold=o.gold||0;s.gems=o.gems||0;Object.assign(s.mats,o.mats||{});Object.assign(s.items,o.items||{});
  s.mute=!!o.mute;s.furnace=o.furnace||1;s.anvil=o.anvil||1;s.slots=o.slots||1;s.monthly=o.monthly||s.monthly;
  s.weapons=(o.weapons||[]).filter(w=>BP[w.b]).map(w=>({id:w.id,b:w.b,q:w.q||0,lv:w.lv||0,traits:[],ench:[0,1,2,3].map(i=>(w.ench||[])[i]||null),created:NOW()}));
  s.jobs=(o.jobs||[]).filter(j=>BP[j.b]).map(j=>({...j,qty:j.qty||1,cost:null}));
  s.villages=VILLAGES.map((v,i)=>{const ov=(o.villages||[])[i]||{},nv=freshVillage(i);nv.status=ov.status||nv.status;nv.weaponId=ov.weaponId??null;nv.cycleStart=ov.cycleStart??null;nv._pending=ov.pending||0;return nv});
  return s;
}
function sanitize(s){
  for(const k in MATS)s.mats[k]=Math.max(0,Math.floor(+s.mats[k]||0));
  for(const k in ITEMS)s.items[k]=Math.max(0,Math.floor(+s.items[k]||0));
  s.gold=Math.max(0,Math.floor(+s.gold||0));s.gems=Math.max(0,Math.floor(+s.gems||0));s.slag=Math.max(0,Math.floor(+s.slag||0));
  s.stats=Object.assign(freshStats(),s.stats||{});s.ach=s.ach||{};s.best=s.best||{};s.lbRw=s.lbRw||{};s.speed=GAME_SPEED;s.capH=s.capH||8;s.pity=s.pity||0;
  s.weapons.forEach(w=>w.b=bpId(w.b));(s.jobs||[]).forEach(j=>j.b=bpId(j.b));for(const k in (s.best||{}))if(s.best[k])s.best[k].b=bpId(s.best[k].b);
  const seen=new Set();s.weapons=s.weapons.filter(w=>BP[w.b]);let maxId=0;
  for(const w of s.weapons){if(seen.has(w.id))w.id=null;else seen.add(w.id);maxId=Math.max(maxId,w.id||0);w.lock=!!w.lock;w.test=!!w.test;w.traits=w.traits||[];w.ench=[0,1,2,3].map(i=>(w.ench||[])[i]||null);w.created=w.created||NOW()}
  for(const w of s.weapons)if(w.id==null)w.id=++maxId;
  s.nextId=Math.max(s.nextId||1,maxId+1);
  const used=new Set();
  s.villages.forEach(v=>{if(v.weaponId!=null&&(!s.weapons.some(w=>w.id===v.weaponId)||used.has(v.weaponId))){v.weaponId=null;v.cycleStart=null}if(v.weaponId!=null)used.add(v.weaponId);
    v.strat=STRATS[v.strat]?v.strat:'normal';v.bank=v.bank||{cycles:0,gold:0,mats:{},events:0}});
  s.villages.forEach((v,i)=>{const w=v.weaponId!=null&&s.weapons.find(x=>x.id===v.weaponId);if(w)lbRecord(s,i,w)});
  if(!s.fcRw){s.fcRw=true;const g=s.villages.reduce((a,v,i)=>a+(v.status==='cleared'?FIRST_GOLD[i]||0:0),0);if(g){s.gold+=g;s._fcMsg=g}}   // v3.50 補發已收復村莊的首破獎勵
  return s;
}
let S;
// v3.43 正式網站（github.io）一律雲端存檔：不讀寫本機存檔、沒有訪客模式。Claude 測試版連不到伺服器，保留本機模式方便看畫面。
const CLOUD_ONLY=typeof location!=='undefined'&&(/github\.io$/.test(location.hostname)||/cloudonly/.test(location.hash));
function loadState(){
  let s=null,migrated=false;
  if(CLOUD_ONLY){try{localStorage.removeItem(KEY);localStorage.removeItem(KEY_V2)}catch(e){}S=sanitize(fresh());return false}
  try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!s){try{const o=JSON.parse(localStorage.getItem(KEY_V2));if(o&&o.villages){s=migrateV2(o);migrated=true}}catch(e){}}
  if(typeof window!=='undefined'&&window.claude?.hot?.data?.S)s=window.claude.hot.data.S;
  if(!s||!s.villages)s=fresh();
  S=sanitize(s);
  if(migrated){S.villages.forEach((st,i)=>{const n=st._pending||0;delete st._pending;if(!n)return;const w=st.weaponId!=null&&W(st.weaponId);for(let c=0;c<n;c++)rollCycle(i,w,st)});}
  return migrated;
}
function save(){if(QUIET)return;S.savedAt=Date.now();CLOUD.dirty=true;if(CLOUD_ONLY)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- v3.34 雲端帳號與存檔（Supabase：Email＋密碼；本機照常存，定時與離開時同步到雲端） ---------- */
const BUILD_ID='3.65';const BUILD='v'+BUILD_ID+' 封測';const BETA=true;
const SB_URL='https://bzvilstgpjkztrydjwlt.supabase.co',SB_KEY='sb_publishable_CMSLltB8qKwMU3nUFezthw_HRm3EBN4',AUTH_KEY='nrs-auth';
const CLOUD={dirty:false,busy:false,last:0,err:'',state:'off',ready:false,kicked:false};let SID=null;
let AUTH=null;try{AUTH=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch(e){}
function authSave(a){AUTH=a;try{a?localStorage.setItem(AUTH_KEY,JSON.stringify(a)):localStorage.removeItem(AUTH_KEY)}catch(e){}}
function authFrom(r){return{access_token:r.access_token,refresh_token:r.refresh_token,expires_at:Date.now()+((r.expires_in||3600)-60)*1000,user:{id:r.user?.id,email:r.user?.email}}}
const SB_ERR=m=>{m=String(m||'');return /signups? (are )?(not allowed|disabled)/i.test(m)?'目前暫停開放註冊，請聯絡遊戲管理員':/duplicate key|unique|23505/i.test(m)?'這個暱稱已經有人用了，換一個吧':/invalid login/i.test(m)?'Email 或密碼錯誤':/already registered|already exists/i.test(m)?'這個 Email 已經註冊過，請直接登入':/at least 6|password should/i.test(m)?'密碼至少要 6 碼':/invalid.*email|email.*invalid|unable to validate email/i.test(m)?'Email 格式不正確':/rate limit|too many/i.test(m)?'嘗試太多次，請稍後再試':/failed to fetch|network/i.test(m)?'連不上伺服器，請檢查網路':m||'發生錯誤，請再試一次'};
async function sbAuth(path,body){const r=await fetch(SB_URL+'/auth/v1/'+path,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.msg||j.error_description||j.message||j.error||('HTTP '+r.status));return j}
async function sbToken(){if(!AUTH)return null;if(Date.now()<AUTH.expires_at)return AUTH.access_token;
  try{const st=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');if(st&&st.user&&st.user.id===AUTH.user.id&&st.expires_at>Date.now()){AUTH=st;return AUTH.access_token}}catch(e){}   // v3.47 同瀏覽器另一個分頁已經換過新憑證，直接沿用，避免兩邊同時換憑證互相作廢
  try{const j=await sbAuth('token?grant_type=refresh_token',{refresh_token:AUTH.refresh_token});authSave({...authFrom(j),user:AUTH.user});return AUTH.access_token}
  catch(e){CLOUD.err='登入已過期，請重新登入';if(!/fetch|network/i.test(e.message)&&CLOUD.ready&&!CLOUD.kicked){CLOUD.reauth=true;CLOUD.ready=false;authSave(null);if(typeof showLogin==='function')showLogin('登入已過期，請重新登入（目前的進度會保留）')}return null}}
async function sbRest(path,opt={}){const t=await sbToken();if(!t)throw new Error('尚未登入');
  const r=await fetch(SB_URL+'/rest/v1/'+path,{...opt,headers:{apikey:SB_KEY,Authorization:'Bearer '+t,'Content-Type':'application/json',...(opt.headers||{})}});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||('HTTP '+r.status))}const tx=await r.text();if(!tx)return null;try{return JSON.parse(tx)}catch(e){return null}}
async function cloudSignup(email,pw){const j=await sbAuth('signup',{email,password:pw});
  if(!j.access_token){const k=await sbAuth('token?grant_type=password',{email,password:pw});authSave(authFrom(k))}else authSave(authFrom(j));return cloudAfterLogin()}
async function cloudLogin(email,pw){authSave(authFrom(await sbAuth('token?grant_type=password',{email,password:pw})));return cloudAfterLogin()}
function cloudLogout(){cloudPush(true).finally(()=>{authSave(null);CLOUD.ready=false;CLOUD.state='off';CLOUD.admin=false;
  if(CLOUD_ONLY){S=sanitize(fresh());ui.sheet=null;ui.result=null;render();showLogin()}else{toast('已登出。');render()}})}
// 登入後：讀雲端存檔（雲端為準）；新帳號建立全新進度。並登記這支手機的連線代碼（同帳號只能一支手機）
async function cloudAfterLogin(){const uid=AUTH.user.id;SID=Math.random().toString(36).slice(2)+Date.now().toString(36);CLOUD.kicked=false;
  LBR.rows={};LBR.t=0;MK.rows=[];MK.mine=[];MK.t=0;
  // 先登記這支手機、同一個請求拿回存檔：避免「讀完存檔、還沒登記前，舊手機又存了一次」被蓋掉
  let row=null;try{const r=await sbRest('rpc/claim_session',{method:'POST',body:JSON.stringify({p_sid:SID})});row=Array.isArray(r)?r[0]:r;if(row&&!row.data&&!row.updated_at)row=null}catch(e){CLOUD.err=SB_ERR(e.message);throw e}
  const keepMem=CLOUD.reauth&&S.uid===uid&&row&&Date.parse(row.updated_at)<=(CLOUD.pushAt||0)+3000;   // 登入過期重登：雲端沒被別台改過 → 保留目前畫面上的進度
  if(keepMem){}else if(row&&row.data&&row.data.villages){S=sanitize(row.data);if(row.nickname&&!S.nick)S.nick=row.nickname}else if(CLOUD_ONLY)S=sanitize(fresh());
  S.uid=uid;CLOUD.reauth=false;
  if(S.tut==null)S.tut=(!S.weapons.length&&!S.jobs.length&&cleared()===0)?0:99;   // v3.51 登入後換成雲端存檔，新帳號要重新判斷是否開始新手導覽
  if(!row)await sbRest('rpc/create_save',{method:'POST',body:JSON.stringify({p_sid:SID,p_data:S})});
  try{localStorage.setItem('nrs-sid',SID)}catch(e){}
  CLOUD.ready=true;CLOUD.dirty=!!keepMem;CLOUD.last=Date.now();CLOUD.state='ok';CLOUD.err='';if(!CLOUD_ONLY)try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  if(keepMem)cloudPush(true);syncClock();adminCheck();render();return row?'cloud':'new'}
// v3.63 向伺服器確認是不是管理員（admins 表）；查不到或伺服器還沒更新 → 當作一般玩家
function adminCheck(){CLOUD.admin=false;if(!AUTH)return Promise.resolve(false);return sbRest('rpc/is_admin',{method:'POST',body:'{}'}).then(r=>{CLOUD.admin=r===true;render();return CLOUD.admin}).catch(()=>false)}
// 伺服器時間：所有狩獵／鍛造計時都用伺服器時間，換手機、手機時間不準都不會出錯
async function syncClock(){if(!AUTH)return;try{const t0=Date.now(),r=await sbRest('rpc/server_now',{method:'POST',body:'{}'}),t1=Date.now();const sv=Date.parse(typeof r==='string'?r:(r&&r.server_now)||'');
  if(sv)CLOCK.offset=sv+(t1-t0)/2-t1}catch(e){}}
// 存檔上傳：只有「目前登記的這支手機」寫得進去；寫不進去代表帳號已在別的手機登入
async function cloudPush(force,leaving){if(!AUTH||!CLOUD.ready||CLOUD.busy||CLOUD.kicked||CLOUD.outdated||(!force&&!CLOUD.dirty))return;CLOUD.busy=true;CLOUD.dirty=false;
  try{const body=JSON.stringify({p_sid:SID,p_data:S,p_nick:S.nick||null});
    const r=await sbRest('rpc/save_game',{method:'POST',keepalive:!!leaving&&body.length<60000,body});   // v3.49 存檔一律經過伺服器檢查
    if(typeof r==='string'&&r.startsWith('cheat')){CLOUD.busy=false;return cloudCheat(r)}
    CLOUD.last=CLOUD.pushAt=Date.now();CLOUD.err='';CLOUD.state='ok'}
  catch(e){if(/session/i.test(e.message)){CLOUD.busy=false;return cloudKicked()}CLOUD.dirty=true;CLOUD.err=SB_ERR(e.message);CLOUD.state='err'}finally{CLOUD.busy=false}}
// 伺服器判定存檔異常（數值增加超過合理範圍）：還原到雲端上最後一次正常的進度
async function cloudCheat(r){console.warn('save rejected',r);CLOUD.dirty=false;try{const x=await sbRest('saves?select=data&user_id=eq.'+AUTH.user.id);if(x&&x[0]&&x[0].data&&x[0].data.villages){S=sanitize(x[0].data);S.uid=AUTH.user.id}}catch(e){}
  ui.sheet=null;ui.result=null;render();toast('⚠ 存檔資料異常，已還原到上一次正常的進度。若你沒有修改遊戲資料，請截圖回報給管理員。','bad')}
function cloudKicked(){if(CLOUD.kicked||CLOUD.leaving)return;   // 頁面正在關閉／重新整理：不處理（避免舊頁面把新頁面的登入清掉）
  CLOUD.kicked=true;CLOUD.ready=false;CLOUD.admin=false;
  let tab=false;try{const ls=localStorage.getItem('nrs-sid');tab=!!ls&&ls!==SID&&!!localStorage.getItem(AUTH_KEY)}catch(e){}
  if(tab)AUTH=null;else authSave(null);   // v3.47 同瀏覽器另一個分頁接手：不清共用憑證；別台裝置接手：清掉這裡的憑證，避免重新整理又把對方擠掉
  if(CLOUD_ONLY){S=sanitize(fresh());ui.sheet=null;ui.result=null;render()}
  if(tab)return showKickTab();showLogin('這個帳號已經在其他裝置登入，這裡已自動登出。')}
function showKickTab(){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-loading';g.onclick=e=>{if(e.target.closest('[data-gk]'))location.reload()};
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key_bg')}" alt=""><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo')}" alt="九界鐵匠"><div class="gt-box gt-load"><div class="gt-ttl">遊戲已在另一個分頁開啟</div><div class="small muted center">同一個帳號一次只能在一個地方玩。要在這裡繼續，請按下方按鈕（另一個分頁會自動停止）。</div><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gk="1">在這裡繼續玩</button></div>`}
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key==='nrs-sid'&&CLOUD.ready&&e.newValue&&e.newValue!==SID)cloudKicked()});
async function cloudCheckSession(){if(!AUTH||!CLOUD.ready||CLOUD.kicked)return;try{const r=await sbRest('saves?select=session_id&user_id=eq.'+AUTH.user.id);if(r&&r[0]&&r[0].session_id&&r[0].session_id!==SID)cloudKicked()}catch(e){}}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const NICK_OK=n=>{const c=Array.from(n);return c.length<2?'暱稱至少 2 個字':c.length>8?'暱稱最多 8 個字':/^[\p{L}\p{N}_]+$/u.test(n)?'':'暱稱只能用中文、英文、數字或底線'};
async function cloudSetNick(n){const old=S.nick;S.nick=n;
  try{const r=await sbRest('rpc/save_game',{method:'POST',body:JSON.stringify({p_sid:SID,p_data:S,p_nick:n})});if(typeof r==='string'&&r.startsWith('cheat')){S.nick=old;cloudCheat(r);throw new Error('存檔資料異常')}save();CLOUD.dirty=false;CLOUD.last=Date.now()}
  catch(e){S.nick=old;if(/session/i.test(e.message)){cloudKicked();throw new Error('這個帳號已經在其他手機登入')}throw e}}
// 取暱稱畫面（註冊後、或之前沒取過暱稱時出現；頭像→鐵匠等級可改名）
function showName(first,preview){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-name';
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key_glow')}" alt=""><div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div>
   <img class="gt-logo" src="${LG('logo')}" alt="九界鐵匠">
   <form class="gt-box" onsubmit="return false"><div class="gt-ttl">${first?'為你的鐵匠取個名字':'修改暱稱'}</div>
    <input id="gtNick" type="text" maxlength="16" autocomplete="off" placeholder="2～8 個字，不能和別人重複" value="${first?'':(S.nick||'')}">
    <div class="gt-msg small"></div>
    <div class="gt-row"><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gn="ok">確定</button>${first?'':'<button type="button" class="ui-btn ui-btn--secondary btn btn-sec big" data-gn="cancel">取消</button>'}</div></form>`;
  const msg=g.querySelector('.gt-msg'),say=(t,bad)=>{msg.textContent=t;msg.className='gt-msg small'+(bad?' bad':'')};
  g.onclick=e=>{const b=e.target.closest('[data-gn]');if(!b)return;snd('ui_click');
    if(b.dataset.gn==='cancel'){gateClose();return}
    const n=(g.querySelector('#gtNick').value||'').trim(),bad=NICK_OK(n);if(bad)return say(bad,1);if(n===S.nick){gateClose();return}
    if(preview){if(n==='冰脊'||n==='測試重複')return say('這個暱稱已經有人用了，換一個吧（預覽：模擬重複）',1);toast(`（預覽）歡迎，${n}！實際登入時會存到雲端`,'ok');showStory();return}
    if(g.dataset.busy)return;g.dataset.busy='1';b.disabled=true;say('確認中…');
    cloudSetNick(n).then(()=>{if(AUTH)sbRest('rpc/lb_rename',{method:'POST',body:JSON.stringify({p_nick:n})}).then(()=>lbFetch(true)).catch(()=>{});toast(first?`歡迎，${n}！`:`暱稱已改為「${n}」`,'ok');render();if(first&&!S.introSeen)showStory();else gateClose()})
      .catch(e=>say(SB_ERR(e.message),1)).finally(()=>{delete g.dataset.busy;b.disabled=false})}}
function afterAuthEnter(){setTimeout(()=>mkSettle(true),1500);setTimeout(()=>{lbSync().finally(()=>lbFetch(true))},2000);if(AUTH&&!S.nick)return showName(true);if(!S.introSeen)return showStory();gateClose()}   // v3.51 直接從登入畫面切到故事，不先露出遊戲畫面
async function cloudPull(){const r=await sbRest('saves?select=data,updated_at&user_id=eq.'+AUTH.user.id);if(!r||!r[0])throw new Error('雲端還沒有存檔');S=sanitize(r[0].data);S.uid=AUTH.user.id;if(!CLOUD_ONLY)try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}CLOUD.last=Date.now();render()}
if(typeof window!=='undefined'){setInterval(()=>{if(AUTH&&CLOUD.dirty)cloudPush()},10000);setInterval(()=>{if(AUTH&&!document.hidden)syncClock()},600000);
  // 雲端存檔連續失敗超過 30 秒：畫面上方顯示紅色提示（避免玩家玩了很久卻沒存到）
  setInterval(()=>{let b=document.getElementById('cloudbar');const bad=AUTH&&CLOUD.ready&&CLOUD.err&&CLOUD.dirty&&Date.now()-CLOUD.last>30000;
    if(!bad){if(b)b.remove();return}if(!b){b=document.createElement('button');b.id='cloudbar';b.onclick=()=>{CLOUD.last=Date.now()-25000;cloudPush(true)};document.body.appendChild(b)}
    b.textContent='⚠ 雲端存檔失敗：'+CLOUD.err+'（點這裡重試）'},2000);setInterval(()=>{if(!document.hidden)cloudCheckSession()},30000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&AUTH){save();cloudPush(true,true)}else if(AUTH)cloudCheckSession()})}

/* ---------- v3.41 交易所（玩家之間買賣武器；伺服器 Supabase：market 表＋market_* 函式） ---------- */
const MK_FEE=.05,MK_MAX=10,MK_DAYS=3,MK_CUR={gold:['it_gold','金幣'],gems:['it_gems','鑽石']};
const MK={rows:[],mine:[],loading:false,err:'',t:0,tab:'buy',cat:'all',cur:'all',sort:'new',sellCur:'gold'};
const mkMock=()=>!AUTH&&devMode();   // 未登入但開了開發者模式 → 用本機「離線模擬」市場，方便測試畫面
const MK_ERR=m=>{m=String(m||'');return /not owned/i.test(m)?'伺服器上找不到這把武器（請稍等幾秒再試）':/bad price/i.test(m)?`價格不正確（最低 ${MK_MIN}）`:/session/i.test(m)?'這個帳號已經在其他手機登入':/not available/i.test(m)?'這件商品已經賣出或下架了':/listing limit/i.test(m)?`同時最多上架 ${MK_MAX} 件`:/not enough/i.test(m)?'錢不夠（以雲端存檔為準，請稍後再試）':/bad price/i.test(m)?'價格不正確':/self/i.test(m)?'不能買自己上架的武器':/could not find the function|PGRST202|relation .*market/i.test(m)?'交易所尚未啟用（伺服器還沒設定好）｜'+m.slice(0,140):SB_ERR(m)};
const mkLeft=r=>Math.max(0,Date.parse(r.expires_at)-Date.now());
const mkGarrison=id=>S.villages.some(v=>v.weaponId===id);
const mkSellable=w=>!w.lock&&!w.test&&!mkGarrison(w.id)&&!(S.jobs||[]).some(j=>j.wid===w.id);
// ---- 帳本（v3.48）：每筆交易只處理一次。伺服器保留「待處理」直到這邊的存檔確定上傳，才回報完成 ----
const MK_MIN=10,MK_MAXP={gold:99999999,gems:999999};
const mkLedger=()=>{S.mk=S.mk||{};for(const k of ['done','got','listed'])S.mk[k]=S.mk[k]||[];return S.mk};
// v3.63 伺服器成交時已經從雲端存檔扣款，並記在 mk.paid；這支手機是從雲端讀檔的話就不要再扣一次
const mkPaid=id=>{const p=(S.mk&&S.mk.paid)||[],ix=p.indexOf(id);if(ix<0)return false;p.splice(ix,1);return true};
const mkMark=(k,id)=>{const L=mkLedger();if(!L[k].includes(id)){L[k].push(id);if(L[k].length>300)L[k].splice(0,L[k].length-300)}};
const mkClean=w=>{const o=JSON.parse(JSON.stringify(w));o.oid=w.id;o.ocr=w.created||0;delete o.id;delete o.lock;delete o.test;return o};
// 把上架中的武器從背包拿掉（用原本的武器編號＋建立時間辨認，避免拿錯）
const mkTake=r=>{const w=r.weapon||{};const ix=S.weapons.findIndex(x=>x.id===w.oid&&(x.created||0)===(w.ocr||0)&&x.b===bpId(r.bp));if(ix>=0)S.weapons.splice(ix,1);return ix>=0};
// ---- 離線模擬（只在開發者模式、沒登入時使用）----
function mkMockDB(){let d=null;try{d=JSON.parse(localStorage.getItem('nrs-mkmock')||'null')}catch(e){}
  if(!d){d={seq:1,rows:[]};const bps=BPS.filter(b=>b.t<=1);for(let k=0;k<12;k++){const b=bps[(k*7)%bps.length],q=Math.min(4,(k*3)%5),lv=(k*5)%10,cur=k%3?'gold':'gems';
    d.rows.push({id:d.seq++,seller:'npc',seller_nick:LB_NAMES[k%LB_NAMES.length].split('・')[0],weapon:{b:b.id,q,lv,traits:rollTraits(q),ench:[null,null,null,null]},bp:b.id,lv,q,cur,price:cur==='gold'?(300+k*137)*(lv+1):20+k*9,status:'open',created_at:new Date(Date.now()-k*36e5).toISOString(),expires_at:new Date(Date.now()+(MK_DAYS*24-k*5)*36e5).toISOString(),settled:false,buyer_ack:false})}}
  return d}
const mkMockSave=d=>{try{localStorage.setItem('nrs-mkmock',JSON.stringify(d))}catch(e){}};
async function mkMockApi(fn,a){const d=mkMockDB(),now=Date.now(),me='me';let out=null;
  if(fn==='browse')out=d.rows.filter(r=>r.status==='open'&&Date.parse(r.expires_at)>now);
  else if(fn==='mine')out=d.rows.filter(r=>r.seller===me&&r.status==='open');
  else if(fn==='list'){if(!(a.p_price>=MK_MIN))throw new Error('bad price');if(d.rows.filter(r=>r.seller===me&&r.status==='open'&&Date.parse(r.expires_at)>now).length>=MK_MAX)throw new Error('listing limit');
    out=d.seq;d.rows.unshift({id:d.seq++,seller:me,seller_nick:S.nick||'我',weapon:a.p_weapon,bp:a.p_bp,lv:a.p_lv,q:a.p_q,cur:a.p_cur,price:a.p_price,status:'open',created_at:new Date().toISOString(),expires_at:new Date(now+MK_DAYS*864e5).toISOString(),settled:false,buyer_ack:false})}
  else if(fn==='buy'){const r=d.rows.find(r=>r.id===a.p_id&&r.status==='open'&&Date.parse(r.expires_at)>now);if(!r||r.seller===me)throw new Error('not available');r.status='sold';r.buyer=me;out=r}
  else if(fn==='cancel'){const r=d.rows.find(r=>r.id===a.p_id&&r.seller===me&&r.status==='open');if(!r)throw new Error('not available');r.status='cancelled';out=r}
  else if(fn==='pending'){d.rows.forEach(r=>{if(r.seller===me&&r.status==='open'&&Date.parse(r.expires_at)<=now)r.status='expired'});out=d.rows.filter(r=>(r.seller===me&&!r.settled&&r.status!=='open')||(r.buyer===me&&!r.buyer_ack))}
  else if(fn==='ack'){d.rows.forEach(r=>{if(!a.p_ids.includes(r.id))return;if(r.seller===me)r.settled=true;if(r.buyer===me)r.buyer_ack=true})}
  mkMockSave(d);return JSON.parse(JSON.stringify(out))}
// ---- 伺服器 ----
async function mkApi(fn,a={}){if(mkMock())return mkMockApi(fn,a);if(!AUTH)throw new Error('尚未登入');
  if(fn==='browse')return sbRest('market?select=id,seller,seller_nick,weapon,bp,lv,q,cur,price,expires_at,created_at&status=eq.open&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&order=created_at.desc&limit=80');
  if(fn==='mine')return sbRest('market?select=id,seller,seller_nick,weapon,bp,lv,q,cur,price,expires_at,created_at&seller=eq.'+AUTH.user.id+'&status=eq.open&order=created_at.desc');
  return sbRest('rpc/market_'+fn,{method:'POST',body:JSON.stringify({...a,p_sid:SID})})}
const mkMe=r=>mkMock()?r.seller==='me':AUTH&&r.seller===AUTH.user.id;
const mkMeBuyer=r=>mkMock()?r.buyer==='me':AUTH&&r.buyer===AUTH.user.id;
// 確定存檔已上傳雲端（離線模擬視為成功）
async function mkSaved(){save();if(!AUTH)return true;for(let k=0;k<20&&CLOUD.busy;k++)await new Promise(r=>setTimeout(r,150));await cloudPush(true);return !CLOUD.dirty&&!CLOUD.err&&!CLOUD.kicked}
async function mkLoad(){if(MK.loading)return MK.p;MK.loading=true;MK.err='';mkRender();return MK.p=(async()=>{
  try{const [a,b]=await Promise.all([mkApi('browse'),mkApi('mine')]);MK.rows=(a||[]).filter(r=>BP[bpId(r.bp)]);MK.mine=(b||[]).filter(r=>BP[bpId(r.bp)]);MK.t=Date.now();await mkReconcile(true)}
  catch(e){MK.err=MK_ERR(e.message);console.warn('market',e.message)}finally{MK.loading=false;mkRender()}})()}
const mkRender=()=>{if(ui.tab==='market'||ui.sheet&&/^mk/.test(ui.sheet.t))render()};
function mkGive(w){const o={...JSON.parse(JSON.stringify(w)),id:S.nextId++,lock:false,test:false,created:NOW()};delete o.oid;delete o.ocr;o.b=bpId(o.b);o.traits=o.traits||[];o.ench=[0,1,2,3].map(i=>(o.ench||[])[i]||null);S.weapons.push(o);return o}
// 對帳：成交入帳、過期／下架退回、我買到的武器、我上架但背包還在的武器；全部只處理一次，存檔上傳成功才回報伺服器
let MK_REC=false;
async function mkReconcile(quiet){if((!AUTH||!CLOUD.ready)&&!mkMock())return;if(MK_REC)return;MK_REC=true;
  try{const L=mkLedger();let changed=false,g=0,m=0,back=0,got=[],ack=[];
    for(const r of MK.mine||[])if(!L.listed.includes(r.id)){mkTake(r);mkMark('listed',r.id);changed=true}   // 上架成功但當時沒存到檔
    const rs=await mkApi('pending')||[];
    for(const r of rs){
      if(mkMe(r)){if(!L.listed.includes(r.id)){mkTake(r);mkMark('listed',r.id)}
        if(!L.done.includes(r.id)){if(r.status==='sold'){const net=Math.floor(r.price*(1-MK_FEE));if(r.cur==='gems'){S.gems+=net;m+=net}else{S.gold+=net;g+=net}}else{mkGive(r.weapon);back++}mkMark('done',r.id);changed=true}}
      else if(mkMeBuyer(r)){if(!L.got.includes(r.id)){if(!mkPaid(r.id))S[r.cur]=Math.max(0,S[r.cur]-r.price);const w=mkGive(r.weapon);got.push(BP[w.b].n+' +'+w.lv);mkMark('got',r.id);changed=true}}
      ack.push(r.id)}
    if(changed&&!(await mkSaved()))return;   // 存檔沒上傳成功：先不回報，下次再對一次（帳本保證不會重複）
    if(ack.length)await mkApi('ack',{p_ids:ack});
    const msg=[g||m?`交易所成交入帳：${g?fmt(g)+' 金':''}${g&&m?'、':''}${m?fmt(m)+' 鑽':''}（已扣 5% 手續費）`:'',back?`${back} 件武器已退回武器庫（下架或 ${MK_DAYS} 天未售出）`:'',got.length&&!quiet?'':got.length?'已補發購買的武器：'+got.join('、'):''].filter(Boolean);
    if(g||m||back||got.length){S.mkNew=(S.mkNew||0)+1;save()}   // v3.64 交易所紅點
    if(msg.length)toast(msg.join('<br>'),'ok');if(changed)render()}
  catch(e){if(!quiet)toast('交易所對帳失敗：'+MK_ERR(e.message),'bad')}finally{MK_REC=false}}
const mkSettle=q=>mkReconcile(q);
async function mkList(id,cur,price){const w=S.weapons.find(x=>x.id===id);if(!w)return toast('找不到這把武器','bad');if(!mkSellable(w))return toast('上鎖或駐守村莊中的武器不能上架','bad');
  price=Math.floor(+price);if(!(price>=MK_MIN))return toast(`最低售價 ${MK_MIN}`,'bad');if(price>MK_MAXP[cur])return toast(`最高售價 ${fmt(MK_MAXP[cur])}`,'bad');
  if(MK.mine.length>=MK_MAX)return toast(`同時最多上架 ${MK_MAX} 件`,'bad');if(ui.mkBusy)return;ui.mkBusy=true;
  try{if(!(await mkSaved()))throw new Error('存檔還沒上傳成功，請稍後再試');const nid=await mkApi('list',{p_weapon:mkClean(w),p_bp:w.b,p_lv:w.lv,p_q:w.q,p_cur:cur,p_price:price,p_nick:S.nick||'無名鐵匠'});
    const ix=S.weapons.indexOf(w);if(ix>=0)S.weapons.splice(ix,1);if(nid)mkMark('listed',+nid);await mkSaved();
    toast(`已上架：${BP[w.b].n} +${w.lv}，${fmt(price)} ${MK_CUR[cur][1]}`,'ok');ui.sheet=null;MK.tab='mine';snd('deliver')}
  catch(e){toast('上架失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;mkLoad()}}   // 失敗時武器沒動過；若其實上架成功，mkLoad 對帳會自動移出背包
async function mkBuy(id){const r=MK.rows.find(x=>x.id===id);if(!r)return;if(mkMe(r))return toast('不能買自己上架的武器','bad');
  if(S[r.cur]<r.price)return toast(`${MK_CUR[r.cur][1]}不足`,'bad');if(ui.mkBusy)return;ui.mkBusy=true;
  try{if(!(await mkSaved()))throw new Error('存檔還沒上傳成功，請稍後再試');   // v3.63 伺服器用雲端存檔的錢判斷夠不夠，先存檔
    CLOUD.busy=true;let row,w;   // 成交到本機扣款之間暫停自動存檔，避免把還沒扣款的金額存上去
    try{const x=await mkApi('buy',{p_id:id});row=x&&x.id?x:r;mkPaid(row.id);S[row.cur]=Math.max(0,S[row.cur]-row.price);w=mkGive(row.weapon);mkMark('got',row.id)}finally{CLOUD.busy=false}
    if(await mkSaved())await mkApi('ack',{p_ids:[row.id]}).catch(()=>{});snd('coin');toast(`購買成功：${BP[w.b].n} +${w.lv} 已放進武器庫`,'ok');ui.sheet=null}
  catch(e){toast('購買失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;mkLoad()}}   // 若其實已成交，mkLoad 對帳會補發武器並扣款
async function mkCancel(id){if(ui.mkBusy)return;ui.mkBusy=true;
  try{await mkApi('cancel',{p_id:id});toast('已下架，武器退回武器庫','ok')}
  catch(e){toast('下架失敗：'+MK_ERR(e.message),'bad')}finally{ui.mkBusy=false;await mkLoad()}}   // 退回武器統一由對帳處理（只會退一次）
if(typeof window!=='undefined')setInterval(()=>{if(AUTH&&CLOUD.ready&&!document.hidden)mkReconcile(true)},60000);
// ---- 畫面 ----
const mkPrice=(cur,p,cls='')=>`<span class="mk-price ${cls}">${img(MK_CUR[cur][0])}<b>${fmt(p)}</b></span>`;
function mkRow(r,act){const w=r.weapon,b=BP[bpId(r.bp)],me=mkMe(r);
  return `<button class="ui-card ui-card--row mk-row ${me?'me':''}" data-act="${act}" data-id="${r.id}"><div class="mk-art">${wArt(b.id,{frame:w.q})}</div>
   <div class="grow mk-mid"><b class="q${w.q}">${b.n} <span class="lvt">+${w.lv}</span></b><span class="small muted">${QUAL[w.q].n}・${CATS[b.cat]}・戰力 ${fmt(power({...w,b:b.id}))}</span>
   <span class="small muted">${me?'<span class="t-gold">我的上架</span>':esc(r.seller_nick||'無名鐵匠')}・剩 ${fmtT(mkLeft(r))}</span></div>${mkPrice(r.cur,r.price)}</button>`}
function viewMarketPage(){if(!MK.t&&!MK.loading&&(AUTH||mkMock()))setTimeout(mkLoad,0);return `<div class="pagehead"><h2>交易所</h2></div>`+viewMarket()}
function viewMarket(){
  if(!AUTH&&!mkMock())return `<div class="ui-panel panel mk-gate">${ptitle('交易所')}<div class="small muted center">交易所需要登入帳號才能使用，訪客進度只存在這支手機，無法和其他玩家交易。</div>${btn('登入／註冊','mklogin',{cls:'btn-primary big'})}</div>`;
  if(!MK.t&&!MK.loading&&!MK.err)setTimeout(mkLoad,0);
  const tabs=[['buy','購買'],['mine',`我的上架 ${MK.mine.length}/${MK_MAX}`],['sell','上架武器']].map(([k,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${MK.tab===k?'on':''}" data-act="mktab" data-k="${k}">${n}</button>`).join('');
  let body='';
  if(MK.tab==='buy'){const cats=['all',...new Set(MK.rows.map(r=>BP[bpId(r.bp)].cat))];
    let rows=MK.rows.filter(r=>(MK.cat==='all'||BP[bpId(r.bp)].cat===MK.cat)&&(MK.cur==='all'||r.cur===MK.cur));
    if(MK.sort==='low')rows=[...rows].sort((a,b)=>(a.cur===b.cur?a.price-b.price:a.cur==='gold'?-1:1));if(MK.sort==='pow')rows=[...rows].sort((a,b)=>power({...b.weapon,b:bpId(b.bp)})-power({...a.weapon,b:bpId(a.bp)}));
    const chip=(act,k,n,on)=>`<button class="ui-btn ui-btn--chip chipbtn ${on?'on':''}" data-act="${act}" data-k="${k}">${n}</button>`;
    body=`<div class="mk-filter"><div class="hscroll mk-chips">${cats.map(c=>chip('mkcat',c,c==='all'?'全部':CATS[c],MK.cat===c)).join('')}</div>
      <div class="mk-chips row">${chip('mkcur','all','全部',MK.cur==='all')}${chip('mkcur','gold','金幣',MK.cur==='gold')}${chip('mkcur','gems','鑽石',MK.cur==='gems')}<span class="grow"></span>${chip('mksort','new','最新',MK.sort==='new')}${chip('mksort','low','價低',MK.sort==='low')}${chip('mksort','pow','戰力',MK.sort==='pow')}</div></div>
      <div class="mk-list">${rows.length?rows.map(r=>mkRow(r,'mkview')).join(''):`<div class="small muted center mk-empty">${MK.loading?'讀取中…':'目前沒有符合條件的商品'}</div>`}</div>`}
  else if(MK.tab==='mine'){body=`<div class="mk-list">${MK.mine.length?MK.mine.map(r=>`<div class="mk-mine">${mkRow(r,'mkview')}${btn('下架','mkcancel',{cls:'btn-sec sm',attrs:`data-id="${r.id}"`})}</div>`).join(''):`<div class="small muted center mk-empty">${MK.loading?'讀取中…':'你目前沒有上架中的武器'}</div>`}</div>
      <div class="small muted mk-note">成交後收入會自動入帳（扣 ${MK_FEE*100}% 手續費）；上架 ${MK_DAYS} 天沒賣出會自動退回武器庫。</div>`}
  else{const ws=S.weapons.filter(w=>!w.test).sort((a,b)=>power(b)-power(a));
    body=`<div class="small muted mk-note">點選要上架的武器。上鎖、駐守村莊中的武器不能上架。</div><div class="mk-list">${ws.length?ws.map(w=>{const b=BP[w.b],ok=mkSellable(w);
      return `<button class="ui-card ui-card--row mk-row ${ok?'':'off'}" data-act="mksellw" data-id="${w.id}" ${ok?'':'disabled'}><div class="mk-art">${wArt(b.id,{frame:w.q})}</div><div class="grow mk-mid"><b class="q${w.q}">${b.n} <span class="lvt">+${w.lv}</span></b><span class="small muted">${QUAL[w.q].n}・${CATS[b.cat]}・戰力 ${fmt(power(w))}</span>${ok?'':`<span class="small t-danger">${w.lock?'已上鎖':'駐守村莊中'}</span>`}</div></button>`}).join(''):'<div class="small muted center mk-empty">武器庫是空的</div>'}</div>`}
  return `<div class="ui-panel panel mk">${ptitle(mkMock()?'離線模擬市場':'玩家交易')}<div class="mk-tabs">${tabs}<button class="ui-iconbtn mk-ref" data-act="mkref" aria-label="重新整理">${MK.loading?'…':'⟳'}</button></div>
   ${MK.err?`<div class="small t-danger center mk-err">${MK.err}</div>`:''}${body}</div>`}
function mkWeaponBox(w){const b=BP[bpId(w.b)],rm=runicMul(w),nE=(w.ench||[]).filter(Boolean).length;
  const traits=(w.traits||[]).map(t=>`<button class="wd-chip tap" data-act="trinfo" data-k="${t.k}" data-v="${t.v}">${img(TRAIT_ICON[t.k])}${TRAITS[t.k].n} <b>+${t.v}%</b><i>ⓘ</i></button>`);
  const slots=[0,1,2,3].map(s=>{const e=(w.ench||[])[s];return `<div class="ui-card ui-card--slot eslot">${e?`${img(AFFIX_ICON[e.k])}<span>${AFFIX[e.k].n}</span><span class="small t-gold">+${Math.round(e.v*rm*10)/10}%</span>`:'<span class="small muted">空欄位</span>'}</div>`}).join('');
  return `<div class="ui-card ui-card--feature wd-head q${w.q}b"><div class="wd-art">${wArt(b.id,{frame:w.q})}</div>
    <div class="wd-info"><h2 class="q${w.q}">${b.n} <span class="lvt">+${w.lv}</span></h2><div class="wd-tags"><span class="qpill q${w.q}b">${QUAL[w.q].n}</span></div>
     <div class="small muted">${TIERS[b.t].n}・${CATS[b.cat]}・<span class="nw">安定值 <b class="${TIERS[b.t].stable?'t-ok':'t-danger'}">+${TIERS[b.t].stable}</b></span></div>
     <div class="wd-pow"><span class="small muted">戰力</span><b>${fmt(power({...w,b:b.id}))}</b></div></div></div>
   <div class="ui-panel panel wd-sub"><div class="wd-row"><span class="wd-k">特性</span><div class="wd-chips">${traits.length?traits.join(''):'<span class="small muted">沒有先天特性</span>'}</div></div>
    <div class="wd-row"><span class="wd-k">附魔 ${nE}/4</span><div class="slots wd-slots">${slots}</div></div></div>`}
function sheetMk(s){const head=t=>`<div class="sheet-head"><span></span><h2>${t}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  if(s.t==='mkw'){const r=MK.rows.find(x=>x.id===s.id)||MK.mine.find(x=>x.id===s.id);if(!r)return head('交易所')+'<div class="small muted center">這件商品已經不在架上了</div>';
    const me=mkMe(r),have=S[r.cur],lack=have<r.price;
    return head('交易所商品')+`<div class="lbw-owner"><div class="grow"><b>${me?'我的上架':esc(r.seller_nick||'無名鐵匠')}</b><div class="small muted">剩 ${fmtT(mkLeft(r))} 自動下架</div></div>${mkPrice(r.cur,r.price,'big')}</div>${mkWeaponBox({...r.weapon,b:bpId(r.bp)})}
     ${me?btn('下架','mkcancel',{cls:'btn-sec big',attrs:`data-id="${r.id}"`}):`<div class="small muted center mk-have">持有 ${img(MK_CUR[r.cur][0])} ${fmt(have)}${lack?'<span class="t-danger">（不足）</span>':''}</div>${btn(`購買　${fmt(r.price)} ${MK_CUR[r.cur][1]}`,'mkbuy',{cls:'btn-primary big',attrs:`data-id="${r.id}"`,dis:lack||ui.mkBusy})}`}`}
  const w=S.weapons.find(x=>x.id===s.id);if(!w)return head('上架武器')+'<div class="small muted center">找不到這把武器</div>';
  const cur=MK.sellCur,p=Math.max(0,Math.floor(+(ui.mkPrice||0))),net=Math.floor(p*(1-MK_FEE));
  return head('上架武器')+mkWeaponBox(w)+`<div class="ui-panel panel mk-form">
    <div class="kv"><span>收取貨幣</span><b class="row">${['gold','gems'].map(c=>`<button class="ui-btn ui-btn--chip chipbtn ${cur===c?'on':''}" data-act="mkscur" data-k="${c}">${img(MK_CUR[c][0])}${MK_CUR[c][1]}</button>`).join('')}</b></div>
    <div class="kv"><span>售價</span><b><input id="mkprice" type="number" inputmode="numeric" min="10" step="1" placeholder="最低 10" value="${ui.mkPrice||''}"></b></div>
    <div class="kv"><span>手續費 ${MK_FEE*100}%</span><b class="mk-fee">${p?'-'+fmt(p-net):'—'}</b></div>
    <div class="kv"><span>成交後實收</span><b class="mk-net t-gold">${p?fmt(net)+' '+MK_CUR[cur][1]:'—'}</b></div>
    <div class="small muted">上架期間武器會先從武器庫移出；${MK_DAYS} 天沒賣出自動退回，也可以隨時下架。</div></div>
   ${btn('確認上架','mksell',{cls:'btn-primary big',attrs:`data-id="${w.id}"`,dis:p<MK_MIN||ui.mkBusy})}`}

/* ---------- 排行榜（v3.16 電腦對手版：虛構的北境鐵匠；上架前改接真人資料，畫面沿用） ---------- */
const LB_NAMES=['霜錘・埃里克','鐵顎・博格','灰燼・西格麗','渡鴉・烏爾夫','熔心・托爾芬','狼牙・英格麗','寒鋼・哈康','冰脊・阿斯特麗','雷砧・比約恩','黑爐・古納',
 '火鬃・芙蕾雅','鹿角・奧拉夫','碎岩・斯凱','鷹眼・希爾達','北風・拉格納','銀鬚・瓦爾德','血斧・凱爾','霧峽・露恩','石心・哈爾德','星鐵・伊娃'];
const LB_RW=[[10,{bless:1},'前 10 名'],[3,{scroll:1},'前 3 名'],[1,{scroll:2},'第 1 名']];
// v3.46 真人排行榜：伺服器 lb 表（每位玩家每座村莊一筆最佳紀錄）；電腦對手已移除
const LBR={rows:{},t:0,loading:false,err:''};
async function lbFetch(force){if(!AUTH||LBR.loading||(!force&&Date.now()-LBR.t<60000))return;LBR.loading=true;
  try{const r=await sbRest('lb?select=user_id,village,nick,p,w,updated_at&order=p.desc,updated_at.asc&limit=1000');const g={};
    (r||[]).forEach(x=>{if(!VILLAGES[x.village]||!x.w||!BP[bpId(x.w.b)])return;x.w.b=bpId(x.w.b);(g[x.village]=g[x.village]||[]).push(x)});LBR.rows=g;LBR.t=Date.now();LBR.err=''}
  catch(e){LBR.err=/relation|lb/.test(e.message)?'排行榜尚未啟用（伺服器還沒設定好）':SB_ERR(e.message)}finally{LBR.loading=false}
  const pend=[];VILLAGES.forEach((v,i)=>{const r=lbReward(i);if(r.length)pend.push(`${v.name}：${r.join('、')}`)});if(pend.length)toast('排行榜獎勵：<br>'+pend.join('<br>'),'ok');render()}
// 其他玩家（不含自己），戰力高到低
// v3.58 同戰力：先達成者（伺服器 updated_at 較早）排前面；t 是達成時間
const lbOthers=i=>(LBR.rows[i]||[]).filter(x=>!AUTH||x.user_id!==AUTH.user.id).map(x=>({n:x.nick||'無名鐵匠',p:x.p,t:Date.parse(x.updated_at)||Infinity,w:{traits:[],ench:[],...x.w}}));
// 自己紀錄的達成時間：伺服器上那筆戰力相同才算；還沒上傳就當作最晚
const lbMyT=i=>{const b=S.best[i],r=AUTH&&(LBR.rows[i]||[]).find(x=>x.user_id===AUTH.user.id);return b&&r&&r.p===b.p&&Date.parse(r.updated_at)||Infinity};
const lbAhead=(x,p,t)=>x.p>p||(x.p===p&&x.t<t);
async function lbSync(){if(!AUTH||!CLOUD.ready)return;let n=0;for(const k in S.best){const b=S.best[k];if(!b||b.sub)continue;
  try{const p=await sbRest('rpc/lb_submit',{method:'POST',body:JSON.stringify({p_village:+k,p_p:b.p,p_w:{b:b.b,q:b.q,lv:b.lv,traits:b.traits||[],ench:b.ench||[]},p_nick:S.nick||'無名鐵匠'})});if(typeof p==='number')b.p=p;b.sub=true;n++}
    // v3.65 伺服器自己算戰力，武器要先存進雲端；還沒存到就等下一輪，10 分鐘都找不到（已熔解）或類別不符就放棄
    catch(e){if(/weapon not saved/.test(e.message)){if(Date.now()-(b.at||0)>6e5)b.sub=true;continue}if(/bad weapon|bad village/.test(e.message)){b.sub=true;continue}return}}
  if(n){save();lbFetch(true)}}
if(typeof window!=='undefined')setInterval(()=>{if(AUTH&&CLOUD.ready&&!document.hidden){lbSync();if(ui.sheet&&/^lb/.test(ui.sheet.t))lbFetch()}},30000);
function lbRecord(s,i,w){const p=power(w),b=s.best[i];if(!b||p>b.p){s.best[i]={p,b:w.b,q:w.q,lv:w.lv,traits:JSON.parse(JSON.stringify(w.traits||[])),ench:JSON.parse(JSON.stringify(w.ench||[])),sub:false,at:Date.now()};if(typeof window!=='undefined'&&s===S)setTimeout(lbSync,500)}}   // 存一份當時的武器內容，排行榜可以點開看
const lbRank=i=>{const b=S.best[i];if(!b||(AUTH&&!LBR.t))return null;const t=lbMyT(i);return lbOthers(i).filter(x=>lbAhead(x,b.p,t)).length+1};
// 第一次衝進前 10／前 3／第 1 名各領一次
function lbReward(i){if(!AUTH||!LBR.t)return[];const rk=lbRank(i);if(!rk)return[];const got=S.lbRw[i]=S.lbRw[i]||[];const out=[];
  for(const [t,r,n] of LB_RW)if(rk<=t&&!got.includes(t)){got.push(t);for(const k in r)S.items[k]+=r[k];out.push(n+'：'+Object.entries(r).map(([k,c])=>itemName(k)+' ×'+c).join('、'))}
  if(out.length)save();return out}

/* ---------- 規則 ---------- */
const W=id=>S.weapons.find(w=>w.id===id);
const cleared=()=>S.villages.filter(v=>v.status==='cleared').length;
const bpOf=w=>BP[w.b];
function enhMult(lv){return lv<=6?1+.1*lv:1.6+.18*(lv-6)} // 加法累積
const traitVal=(w,k)=>(w.traits||[]).filter(t=>t.k===k).reduce((a,t)=>a+t.v,0);
const runicMul=w=>1+Math.min(CAP.runic,traitVal(w,'runic'))/100;
function enchVal(w,k){return(w.ench||[]).filter(e=>e&&e.k===k).reduce((a,e)=>a+e.v,0)*runicMul(w)}
function affixVal(w,k){const b=bpOf(w);return((b.inn&&b.inn[0]===k)?b.inn[1]:0)+enchVal(w,k)}
function power(w,lv){const b=bpOf(w);return Math.round(b.base*TIERS[b.t].mult*QUAL[w.q].m*enhMult(lv??w.lv)*(1+(affixVal(w,'flame')+affixVal(w,'frost'))/100))}
const stable=w=>TIERS[bpOf(w).t].stable;
const where=w=>S.villages.findIndex(v=>v.weaponId===w.id);
function timeReduction(i,w){const v=VILLAGES[i];let r=affixVal(w,'swift')+traitVal(w,'light');if(v.tag==='beast')r+=traitVal(w,'sharp');if(v.tag==='giant')r+=traitVal(w,'giantslayer');return Math.min(CAP.time,r)/100}
function gameDur(i,w,strat){const v=VILLAGES[i];const ratio=Math.min(1,Math.max(POWER_FLOOR,v.req/power(w)));return v.sec*1000*ratio*(1-timeReduction(i,w))*STRATS[strat||S.villages[i].strat].time}
const dur=(i,w,strat)=>gameDur(i,w,strat)/S.speed;
const capCycles=(i,w)=>Math.max(1,Math.floor(S.capH*3600000/gameDur(i,w)));
function eligible(i,w){const v=VILLAGES[i];return !w.test&&bpOf(w).cat===v.cat&&power(w)>=v.req&&(!v.need||affixVal(w,v.need)>0)}
// v3.64 紅點提醒：只在「有事可以做」時亮
// 可交付：未解鎖以外的村莊，「等待交付／沒有駐守」門檻 -1；已有駐守則門檻是目前武器戰力（武器庫有更強的也提醒）
const giveMin=()=>S.villages.map(st=>{if(st.status==='locked')return null;const c=st.weaponId!=null&&W(st.weaponId);return c?power(c):-1});
function canGive(w,gm=giveMin()){return where(w)<0&&gm.some((m,i)=>m!=null&&eligible(i,w)&&power(w)>m)}
const vGiveDot=(i,gm=giveMin())=>gm[i]!=null&&S.weapons.some(w=>where(w)<0&&eligible(i,w)&&power(w)>gm[i]);
const anyGive=()=>{const gm=giveMin();return S.weapons.some(w=>canGive(w,gm))};
// 新武器（鍛造完成、交易所買到）：離開武器庫才算看過
const wNew=w=>!w.test&&w.id>(S.seenW??(S.seenW=S.nextId-1));
// 新圖紙：點選過才算看過（舊存檔第一次讀取時，已解鎖的都算看過）
const bpSeen=()=>S.bpSeen||(S.bpSeen=BPS.filter(b=>!bpLock(b)).map(b=>b.id));
const bpNew=b=>!bpLock(b)&&!bpSeen().includes(b.id);
// 學徒有空、有圖紙材料夠打
const forgeIdle=()=>S.jobs.length<S.slots&&S.weapons.length+queuedQty()<CAP_WEAPONS&&BPS.some(b=>!bpLock(b)&&!lackList(recipe(b),goldOf(b)).length);
const monthlyDot=()=>monthlyOn()?S.monthly.last!==today():BETA;
const achReadyN=()=>ACH.filter(a=>!S.ach[a.id]&&a.test()).length;
function breakChance(w,next){const s=stable(w);return next<=s?0:Math.min(.8,.35+.05*(next-s-1))}
// v3.50 平衡：安全區（+1～+6）便宜好衝，危險區有代價，高等級是長期目標；再乘材質倍率
const ENH_COST=[5,10,18,30,45,65,160,240,340,480,650,900,1250,1700,2300];
function enhCost(w){return Math.round(ENH_COST[Math.min(14,w.lv)]*TIERS[bpOf(w).t].mult)}
function enchCost(w,directed){return 40*TIERS[bpOf(w).t].mult*(directed?3:1)}
function qualWeights(useBp,t){if(useBp)return[0,0,0,0,1000];const s=S.anvil-1;const q=QW.map((x,i)=>x+QSHIFT[i]*s);if(t===3){q[0]=0;q[1]=0}return q}
const forgeSec=b=>TIERS[b.t].sec*(1-.1*(S.furnace-1));
const hasMats=c=>Object.entries(c).every(([k,n])=>S.mats[k]>=n);
// v3.59 列出缺少的材料／金幣（鍛造按鈕、提示共用）
let DEV_LACK=0;   // 開發者工具「缺料提示測試」：暫時當作材料全部不夠（不動存檔）
const lackList=(need,g)=>{const hv=k=>DEV_LACK>Date.now()?0:S.mats[k]||0;const l=Object.entries(need).filter(([k,n])=>!(hv(k)>=n)).map(([k,n])=>[k,n-hv(k)]);if(S.gold<g)l.push(['gold',g-S.gold]);return l};
const lackStr=l=>l.map(([k,n])=>(k==='gold'?'金幣':MATS[k])+' ×'+fmt(n)).join('、');
const monthlyOn=()=>S.monthly.until>NOW();
const slotOpen=s=>S.anvil>=SLOT_ANVIL[s];
function bpLock(b){if(cleared()<b.unlock)return'收復 1-'+b.unlock+' 解鎖';if(S.furnace<TIERS[b.t].furnace)return'熔爐 Lv'+TIERS[b.t].furnace;return''}
const bulkOn=()=>cleared()>=5;
function dropChance(i,w,d,strat){const st=STRATS[strat];const loot=w?Math.min(CAP.loot,affixVal(w,'loot'))/100:0;const rare=d[1]<RARE_P;
  let p=d[1]*(1+loot)*(rare?st.rare*(1+(w?Math.min(CAP.treasure,traitVal(w,'treasure')):0)/100):st.common);return Math.min(rare?.6:1,p)}
function eventChance(i,w){return VILLAGES[i].danger*(1-Math.min(CAP.sturdy,w?traitVal(w,'sturdy')*2:0)/100)}

/* 純函式：方便測試 */
function rollQuality(useBp,t){const qs=qualWeights(useBp,t);return weighted([0,1,2,3,4],x=>qs[x])}
function rollTraits(q){const n=weighted(TRAIT_N[q],x=>x[1])[0];const keys=Object.keys(TRAITS).sort(()=>Math.random()-.5).slice(0,n);
  return keys.map(k=>({k,v:Math.round(rnd(TRAITS[k].min,TRAITS[k].max)*(1+.2*q))}))}
function rollEnhance(r,bc){const ok=Math.random()<r;if(ok)return'ok';return Math.random()<bc?'break':'fail'}

/* ---------- 行動（核心，不碰畫面） ---------- */
function makeWeapon(b,q,lv=0,traits,ench){b=bpId(b);const w={id:S.nextId++,b,q,lv,traits:traits||rollTraits(q),ench:ench||[null,null,null,null],created:NOW()};S.weapons.push(w);return w}
function rollCycle(i,w,st){
  const v=VILLAGES[i],s=STRATS[st.strat],b=st.bank;b.cycles++;
  if(Math.random()<eventChance(i,w)){b.events++;b.gold+=Math.round(v.gold*s.gold*.5);return}
  const gs=w&&v.tag==='giant'?1+traitVal(w,'giantslayer')/100:1;b.gold+=Math.round(v.gold*s.gold*gs);
  for(const d of v.drops){if(Math.random()<dropChance(i,w,d,st.strat)){let n=rnd(d[2],d[3]);if(d[1]>=RARE_P&&s.bonus&&Math.random()<s.bonus)n++;b.mats[d[0]]=(b.mats[d[0]]||0)+n}}
}
function tick(){
  const t=NOW();let changed=false;
  if(t<S.lastSeen-5000){if(!S.clockWarn){S.clockWarn=true;toast('偵測到裝置時間倒退，狩獵與鍛造會暫停，直到時間恢復。')}}
  else if(S.clockWarn&&t>=S.lastSeen){S.clockWarn=false}
  S.lastSeen=Math.max(S.lastSeen||0,t);
  S.villages.forEach((st,i)=>{
    if(st.weaponId==null||st.cycleStart==null)return;const w=W(st.weaponId);if(!w){st.weaponId=null;st.cycleStart=null;return}
    const d=dur(i,w),cap=capCycles(i,w);if(st.bank.cycles>=cap){st.cycleStart=Math.max(st.cycleStart,t);return}
    const k=Math.floor((t-st.cycleStart)/d);if(k<=0)return;
    const n=Math.min(k,cap-st.bank.cycles);for(let c=0;c<n;c++)rollCycle(i,w,st);
    st.cycleStart+=k*d;if(st.bank.cycles>=cap)st.cycleStart=t;changed=true;
  });
  for(const j of [...S.jobs])if(t>=j.end){finishJob(j);changed=true}
  return changed;
}
function finishJob(j){
  const ix=S.jobs.indexOf(j);if(ix<0)return;S.jobs.splice(ix,1);const b=BP[j.b];let best=null;
  for(let n=0;n<(j.qty||1);n++){let q=rollQuality(j.bp&&n===0,b.t);
    if(b.t>=1){if(q>=2)S.pity=0;else if(++S.pity>=PITY_FORGE){q=2;S.pity=0}} /* 霜銀以上：連續 9 把低於稀有，第 10 把保證稀有 */
    S.stats.forged[q]++;const w=makeWeapon(b.id,q);if(!best||q>best.q)best=w}
  snd('forge_done');toast(`鍛造完成：${j.qty>1?j.qty+' 把 '+b.n+'，最佳 ':''}<b class="q${best.q}">${QUAL[best.q].n}・${b.n}</b>（戰力 ${power(best)}）`);save();return best;
}
function forgeStart(bid,qty,useBp){
  const b=BP[bid];if(!b)return'沒有這張圖紙';if(bpLock(b))return bpLock(b);qty=bulkOn()?Math.max(1,Math.min(10,Math.floor(qty)||1)):1;
  const c=recipe(b),need={};for(const k in c)need[k]=c[k]*qty;const g=goldOf(b)*qty;
  if(S.jobs.length>=S.slots)return'學徒都在忙';{const ls=lackList(need,g);if(ls.length)return'缺少：'+lackStr(ls)}
  if(S.weapons.length+S.jobs.reduce((a,j)=>a+(j.qty||1),0)+qty>CAP_WEAPONS)return'武器庫已滿（'+CAP_WEAPONS+' 把），先熔解一些武器';
  for(const k in need)S.mats[k]-=need[k];S.gold-=g;
  const bp=!!(useBp&&S.items.blueprint>0);if(bp)S.items.blueprint--;
  const s=NOW(),len=forgeSec(b)*1000*(qty>1?qty*.6:1)/S.speed;
  const j={b:b.id,qty,start:s,end:s+len,bp,cost:{mats:need,gold:g}};S.jobs.push(j);save();return j;
}
function cancelJob(ix){const j=S.jobs[ix];if(!j)return false;S.jobs.splice(ix,1);
  if(j.cost){for(const k in j.cost.mats)S.mats[k]+=j.cost.mats[k];S.gold+=j.cost.gold}if(j.bp)S.items.blueprint++;save();return true}
function collectCore(i){const st=S.villages[i],b=st.bank;if(!b.cycles)return null;
  const got={gold:b.gold,...b.mats},n=b.cycles,ev=b.events;
  S.gold+=b.gold;for(const k in b.mats)S.mats[k]+=b.mats[k];S.stats.harvest+=n;S.stats.goldIn+=b.gold;S.stats.events+=ev;
  st.bank={cycles:0,gold:0,mats:{},events:0};
  if(st.weaponId!=null&&st.cycleStart!=null){const w=W(st.weaponId);if(w&&n>=capCycles(i,w))st.cycleStart=NOW()}
  save();return{got,n,ev}}
function setStrategy(i,k){const st=S.villages[i];if(!STRATS[k]||st.strat===k)return false;tick();st.strat=k;if(st.cycleStart!=null)st.cycleStart=NOW();save();return true}
// v3.50 第一次收復村莊的金幣獎勵（伺服器存檔檢查有同一張表）
const FIRST_GOLD=[300,500,800,1200,2000,3000,5000,8000,12000,0];
function deliverCore(i,id){
  const w=W(id);if(!w||!eligible(i,w)||S.villages[i].status==='locked')return null;
  const old=where(w);if(old>=0&&old!==i){tick();S.villages[old].weaponId=null;S.villages[old].cycleStart=null}
  const st=S.villages[i];tick();st.weaponId=id;st.cycleStart=NOW();let first=false;lbRecord(S,i,w);
  let fg=0;if(st.status!=='cleared'){st.status='cleared';first=true;fg=FIRST_GOLD[i]||0;S.gold+=fg;const nx=S.villages[i+1];if(nx&&nx.status==='locked')nx.status='open'}
  save();return{first,fg};
}
function recallCore(i){const st=S.villages[i];if(st.weaponId==null)return false;tick();st.weaponId=null;st.cycleStart=null;save();return true}
function meltCore(id){const w=W(id);if(!w||where(w)>=0||w.lock)return null;if(w.test){S.weapons.splice(S.weapons.indexOf(w),1);save();return{}}const b=bpOf(w),c=recipe(b),got={gold:Math.round(goldOf(b)*.5)};
  for(const k in c){const n=Math.floor(c[k]*.3);if(n){S.mats[k]+=n;got[k]=n}}if(Math.random()<.25){S.mats.shard++;got.shard=1}
  S.gold+=got.gold;S.weapons.splice(S.weapons.indexOf(w),1);S.stats.melted++;save();return got}
// 強化判定（唯一入口）。所有費用都用 enhCost；道具不足時直接拒絕，不會默默改成無保護強化。
// 測試武器（w.test）：不扣任何資源、不計入統計，可接受開發工具指定的結果，避免動到正式資料。
function enhanceCore(id,opt={}){
  const w=W(id);if(!w)return{err:'找不到武器'};if(where(w)>=0)return{err:'駐守中的武器要先收回'};if(w.lv>=15)return{err:'已經是最高等級 +15'};
  const next=w.lv+1,cost=enhCost(w),danger=next>stable(w),test=!!w.test;
  if(!test&&S.gold<cost)return{err:'金幣不夠',need:'gold'};
  if(opt.bless&&!test&&S.items.bless<1)return{err:'祝福石不足：請取消勾選或到商城補充',need:'bless'};
  if(opt.scroll&&danger&&!test&&S.items.scroll<1)return{err:'防爆卷不足：請取消勾選或到商城補充',need:'scroll'};
  if(!test){S.gold-=cost;S.stats.enhTry++}
  // v3.14：危險區勾選防爆卷，每次強化都消耗 1 張（不論成功、失敗或爆裝）
  const usedScroll=!!(opt.scroll&&danger);if(usedScroll&&!test){S.items.scroll--;S.stats.scrollUsed++}
  let r=RATE[next];const bc=breakChance(w,next);
  let usedBless=false;if(opt.bless){if(!test)S.items.bless--;r=Math.min(1,r+.1);usedBless=true}
  const f=test?opt.force:null;
  const out=f==='ok'?'ok':f==='fail'?'fail':(f==='break'||f==='saved')?'break':rollEnhance(r,bc),before={art:A(w.b),name:bpOf(w).n,q:w.q,from:w.lv,tier:bpOf(w).t};
  if(out==='ok'){w.lv=next;if(!test){S.stats.enhOk++;S.stats.maxLv=Math.max(S.stats.maxLv,next)}save();return{k:'ok',next,danger,before,usedBless,usedScroll,w,test}}
  if(!test)S.stats.enhFail++;
  if(out==='break'){
    if(f==='saved'||(f!=='break'&&opt.scroll&&danger)){save();return{k:'saved',next,danger,before,usedBless,usedScroll,test}}
    S.weapons.splice(S.weapons.indexOf(w),1);let slag=0;if(!test){S.stats.breaks++;slag=TIERS[before.tier].slag;S.slag+=slag}save();return{k:'broke',next,danger,before,slag,usedBless,test}}
  save();return{k:'fail',next,danger,before,usedBless,usedScroll,test};
}
function enchantCore(id,slot,directKey){
  const w=W(id);if(!w)return{err:'找不到武器'};if(where(w)>=0)return{err:'駐守中的武器要先收回'};if(!slotOpen(slot))return{err:'鐵砧 Lv'+SLOT_ANVIL[slot]+' 才能使用這一格'};
  const directed=!!directKey,c=enchCost(w,directed),sh=directed?4:1;
  if(S.mats.shard<sh||S.gold<c)return{err:`需要 ${sh} 個符文碎片和 ${c} 金幣`};
  S.mats.shard-=sh;S.gold-=c;const k=directed?directKey:weighted(Object.keys(AFFIX),x=>AFFIX[x].w),a=AFFIX[k];
  w.ench[slot]={k,v:rnd(a.min,a.max)};save();return{k,v:w.ench[slot].v};
}
function claimAch(id){const a=ACH.find(x=>x.id===id);if(!a||S.ach[id]||!a.test())return false;S.ach[id]=true;
  for(const k in a.r){if(MATS[k])S.mats[k]+=a.r[k];else S.items[k]+=a.r[k]}save();return true}
function slagTrade(ix){const[k,n,c]=SLAG_SHOP[ix];if(S.slag<c)return false;S.slag-=c;S.mats[k]+=n;save();return true}
function pullCore(n){const cost=n===10?900:100;if(S.gems<cost)return null;S.gems-=cost;const res=[];let hit=false;
  for(let i=0;i<n;i++){let p=weighted(GACHA,x=>x[2]);if(n===10&&i===9&&!hit)p=weighted(GACHA.filter(x=>x[2]<=PITY_MAX_W),x=>x[2]);
    if(p[2]<=PITY_MAX_W)hit=true;res.push(p);if(MATS[p[0]])S.mats[p[0]]+=p[1];else S.items[p[0]]+=p[1]}save();return res}
function spendGems(n){if(S.gems<n){toast('鑽石不夠，可以先用「儲值測試」補充。');return false}S.gems-=n;return true}

/* ---------- 行動（介面包裝） ---------- */
const DEV_KEY='nrs-dev';
function devMode(){if(CLOUD_ONLY&&!CLOUD.admin)return false;   // v3.63 正式網站：只有管理員帳號（伺服器 admins 表）能開開發者工具
  try{return localStorage.getItem(DEV_KEY)==='1'||/dev/.test(location.hash)}catch(e){return false}}
function setDev(on){try{on?localStorage.setItem(DEV_KEY,'1'):localStorage.removeItem(DEV_KEY)}catch(e){};if(!on&&ui.sheet&&ui.sheet.t==='d')ui.sheet=null;render()}
const ui={tab:'forge',sheet:null,ftab:'bp',cat:'all',acat:'all',asort:'power',aidle:false,alock:false,bp:'t1_woodaxe',qty:1,useScroll:false,useBless:false,useBp:false,confirmReset:false,meltArm:null,directKey:'giant',enchSlot:0,testOut:'',busy:false,result:null};
const CAT_ICON=Object.fromEntries(['axe','sword','dagger','polearm','hammer','bow','crossbow','shield','throw','tool'].map(k=>[k,'cat_'+k]));
const AFFIX_ICON={flame:'mat_fireheart',frost:'mat_icecore',swift:'it_hourglass',loot:'it_gold',giant:'m_frostgiant',dragon:'mat_scale'};
const TRAIT_ICON={sharp:'tr_sharp',sturdy:'tr_sturdy',light:'tr_light',treasure:'tr_treasure',giantslayer:'tr_giantslayer',runic:'tr_runic'};
const STRAT_ICON={normal:'it_gold',material:'mat_iron',rare:'mat_scale'};
const TIER_FRAME=[0,2,3,4]; // 圖紙外框顏色：鐵製灰、霜銀藍、龍鱗紫、神器金
// v3.40 音效設定：喇叭圖示打開，可開關音效、調整音量
function sndSettings(){const v=Math.round((S.vol??1)*100);
  ui.result={t:'info',k:'snd',title:'音效設定',html:`<div class="snd-set"><div class="kv"><span>音效</span><b><button class="ui-btn ui-btn--chip chipbtn ${S.mute?'':'on'}" data-act="sndmute">${S.mute?'關閉':'開啟'}</button></b></div>
   <div class="kv"><span>音量</span><b class="snd-v">${v}%</b></div><input id="sndvol" type="range" min="0" max="100" step="5" value="${v}" ${S.mute?'disabled':''}></div>`};render()}
function showLevel(){const c=cleared(),lv=smithLv();
  const row=(k,v,m)=>`<div class="kv"><span>${k}</span><b>${v}${m?` <span class="small muted">／${m}</span>`:''}</b></div>`;
  const nb=BPS.filter(b=>b.unlock===c+1),nx=VILLAGES[c],nt=TIERS.find(t=>t.furnace>S.furnace);
  const next=[nx?`收復 1-${c+1} ${nx.name}${nb.length?`：解鎖 ${nb.length} 張新圖紙`:''}`:'',c<5?`收復 5 座村莊：開放批量鍛造`:'',nt?`熔爐升到 Lv${nt.furnace}：可鍛造${nt.n}武器`:'',S.anvil<5?`升級鐵砧：開放更多附魔欄`:''].filter(Boolean);
  ui.result={t:'info',icon:'ui_player_emblem',title:`鐵匠等級 Lv.${lv}`,html:`${AUTH?`<div class="kv nick-row"><span>暱稱</span><b>${S.nick||'（尚未取名）'} <button class="ui-btn ui-btn--chip chipbtn" data-act="rename">改名</button></b></div>`:''}<div class="small muted">等級代表你的整體進度。收復村莊、升級熔爐、鐵砧、附魔欄，每一項都會讓等級 +1。</div>
   <div class="lv-rows">${row('收復村莊',c,VILLAGES.length)}${row('熔爐','Lv'+S.furnace,'Lv5')}${row('鐵砧','Lv'+S.anvil,'Lv5')}${row('附魔欄',S.slots,4)}</div>
   <div class="label">下一步可以做</div><ul class="lv-next">${next.map(t=>`<li>${t}</li>`).join('')}</ul>`};render()}
const smithLv=()=>1+cleared()+(S.furnace-1)+(S.anvil-1)+(S.slots-1);
const queuedQty=()=>S.jobs.reduce((a,j)=>a+(j.qty||1),0);

/* ---------- 行動（介面包裝） ---------- */
function startForge(){const r=forgeStart(ui.bp,ui.qty,ui.useBp);if(typeof r==='string'){const el=document.querySelector('.sel-bp .lack-line,.sel-bp .goal');if(el)el.scrollIntoView({behavior:'smooth',block:'center'});return toast(r,'bad')}snd('forge_start');
  ui.useBp=false;toast(`開始鍛造 ${BP[ui.bp].n}${r.qty>1?' ×'+r.qty:''}，完成需要 ${fmtT(r.end-r.start)}`,'ok');ui.ftab='queue';render()}
function maxQty(){const b=BP[ui.bp];if(!bulkOn()||bpLock(b))return 1;const c=recipe(b);let n=10;
  for(const k in c)n=Math.min(n,Math.floor(S.mats[k]/c[k]));n=Math.min(n,Math.floor(S.gold/goldOf(b)),CAP_WEAPONS-S.weapons.length-queuedQty());return Math.max(1,n)}
function collect(i,silent){const r=collectCore(i);if(!r){if(!silent)toast('還沒有可收成的狩獵。');return null}
  if(!silent){snd('coin');showHarvest(`${VILLAGES[i].name} 收成 ${r.n} 輪`,r.got,r.ev)}return r}
const gotText=g=>Object.entries(g).filter(([k,n])=>n).map(([k,n])=>`${k==='gold'?'金幣':MATS[k]} +${fmt(n)}`).join('、')||'無';
function collectAll(){tick();let tot={},cnt=0,ev=0;S.villages.forEach((st,i)=>{const r=collect(i,true);if(r){cnt+=r.n;ev+=r.ev;tot=add(tot,r.got)}});
  if(!cnt)return toast('目前沒有可收成的村莊。');snd('coin');showHarvest(`全部收成 ${cnt} 輪`,tot,ev);render()}
function showHarvest(title,got,ev){ui.result={t:'h',title,got,ev};render()}
function deliver(i,id){const r=deliverCore(i,id);if(!r)return toast('這把武器不符合委託條件。','bad');const lbr=lbReward(i);if(lbr.length)setTimeout(()=>toast(`${VILLAGES[i].name}排行榜 第 ${lbRank(i)} 名！<br>`+lbr.join('<br>'),'ok'),400);snd(r.first?'unlock':'deliver');if(r.fg)setTimeout(()=>toast(`首次收復 ${VILLAGES[i].name}：獲得 ${fmt(r.fg)} 金幣`,'ok'),200);
  if(r.first){const nb=BPS.filter(b=>b.unlock===cleared()).map(b=>b.n);const nx=VILLAGES[i+1];
    toast(nx?`委託完成！解鎖 1-${i+2} ${nx.name}`+(nb.length?`，新圖紙：${nb.slice(0,4).join('、')}${nb.length>4?' 等 '+nb.length+' 張':''}`:''):'米德加德全部收復！','ok')}
  else toast(`${bpOf(W(id)).n} 已駐守 ${VILLAGES[i].name}`,'ok');ui.sheet=null;render()}
function recall(i){if(recallCore(i))toast(`武器已收回，${VILLAGES[i].name} 暫停狩獵。`);render()}
const cheapList=()=>S.weapons.filter(w=>w.q<=1&&w.lv===0&&where(w)<0&&!w.lock&&!(w.traits||[]).length);
function meltCheap(){snd('melt');const list=cheapList();if(!list.length)return toast('沒有可一鍵熔解的武器。');
  let tot={};list.forEach(w=>tot=add(tot,meltCore(w.id)));toast(`熔解 ${list.length} 把：`+gotText(tot),'ok');ui.sheet=null;render()}
// 一鍵強化到安定值：安定區失敗不降級、不爆裝，連續強化到安定值為止（不使用祝福石、防爆卷；金幣不夠就停）
function autoEnhCost(w){let g=0;const m=TIERS[bpOf(w).t].mult;for(let lv=w.lv;lv<stable(w);lv++)g+=Math.round(15*Math.pow(lv+1,1.8)*m)/RATE[lv+1];return Math.round(g/10)*10}
function autoEnhance(id){if(ui.busy)return;const w=W(id);if(!w)return;const s=stable(w);
  if(where(w)>=0)return toast('駐守中的武器要先收回。','bad');if(w.lv>=s)return toast(`已經達到安定值 +${s}。`);
  const from=w.lv,g0=S.gold;let tries=0,fails=0,err='';
  while(w.lv<s&&tries<500){const r=enhanceCore(id,{});if(r.err){err=r.err;break}tries++;if(r.k!=='ok')fails++}
  if(!tries){toast(err||'無法強化。','bad');return render()}
  ui.enhLast=null;snd(w.lv>from?'upgrade':'ui_error');
  toast(`一鍵強化 +${from} → <b>+${w.lv}</b>：強化 ${tries} 次、失敗 ${fails} 次${w.test?'（測試武器免費）':'，花費 '+fmt(g0-S.gold)+' 金'}${err?`。${err}，已停止`:''}`,w.lv>=s?'ok':'bad');render()}
const DEV={force:null};
function enhance(id){
  if(ui.busy)return;                          // 動畫播放中鎖定，只能點舞台略過
  if(Date.now()<(ui.lockUntil||0))return;     // 結果剛出現時防止連點誤觸
  const w=W(id);if(!w)return;
  const useSc=ui.useScroll&&(!!w.test||S.items.scroll>0),useBl=ui.useBless&&(!!w.test||S.items.bless>0);
  const next=w.lv+1,danger=next>stable(w),guarded=danger&&useSc;
  // 沒有防爆卷保護的危險強化：同一次進入強化頁只需要確認一次
  if(danger&&!guarded&&!w.test&&ui.riskOk!==id){if(ui.riskArm===id){ui.riskOk=id}else{ui.riskArm=id;renderLayer();return}}
  const force=w.test?DEV.force:null;
  const r=enhanceCore(id,{bless:useBl,scroll:useSc,force});if(r.err){toast(r.err,'bad');return renderLayer()}
  if(force)DEV.force=null;ui.busy=true;ui.enhLast=null;
  const res=r.k==='ok'?{k:'ok',t:`強化成功 +${r.next}`,d:`戰力提升到 ${fmt(power(r.w))}`}:r.k==='saved'?{k:'saved',t:'防爆卷生效',d:'武器完整保留，等級維持 +'+r.before.from+(r.test?'（測試）':'')}
   :r.k==='broke'?{k:'broke',t:'武器已損毀',d:`${r.before.name} 在符文石碑上碎裂${r.test?'（測試武器）':`，回收鍛造殘渣 ×${r.slag}`}`}:{k:'fail',t:'強化失敗',d:'等級維持 +'+r.before.from+'，武器沒有受損'};
  res.id=id;res.guarded=!!r.usedScroll;playFx(r.danger,r.before,r.next,res)}
function enchant(id,slot,directed){const r=enchantCore(id,slot,directed?ui.directKey:null);if(r.err)return toast(r.err,'bad');snd('enchant');toast(`附魔結果：<b>${AFFIX[r.k].n} +${r.v}%</b>`,'ok');render()}
function buyMat(k,p,n){if(S.gold<p*n)return toast('金幣不夠。','bad');S.gold-=p*n;S.mats[k]+=n;snd('ui_buy');toast(`買入 ${MATS[k]} ×${n}`);save();render()}
function sellMat(k,n){n=Math.min(n,S.mats[k]);if(!n||!SELL_PRICE[k])return toast('沒有可賣的'+MATS[k]+'。');S.mats[k]-=n;S.gold+=n*SELL_PRICE[k];snd('coin');toast(`賣出 ${MATS[k]} ×${n}，得到 ${n*SELL_PRICE[k]} 金`);save();render()}
function upgrade(kind){const lv=S[kind],tbl=kind==='furnace'?FURNACE_COST:ANVIL_COST;if(lv>=5)return;const c=tbl[lv];if(S.gold<c)return toast('金幣不夠。','bad');
  S.gold-=c;S[kind]++;snd('upgrade');toast((kind==='furnace'?'熔爐':'鐵砧')+' 升到 Lv'+S[kind]+(kind==='anvil'&&(S.anvil===3||S.anvil===5)?'，開放新的附魔欄位':''),'ok');save();render()}
function hire(){if(S.slots>=4)return;const c=SLOT_COST[S.slots];if(S.gold<c)return toast('金幣不夠。','bad');S.gold-=c;S.slots++;snd('upgrade');toast('新學徒報到，可同時鍛造 '+S.slots+' 批。','ok');save();render()}
function buyItem(k,n){if(!spendGems(n))return;S.items[k]++;snd('ui_buy');toast('獲得 '+ITEMS[k][0],'ok');save();render()}
function speedHunt(){tick();const go=[];S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(w&&st.cycleStart!=null)go.push([st,i,w])});if(!go.length)return toast('目前沒有村莊在狩獵。');if(!spendGems(50))return;
  go.forEach(([st,i,w])=>{const k=Math.min(capCycles(i,w)-st.bank.cycles,Math.max(1,Math.floor(30*60000/gameDur(i,w))));for(let c=0;c<k;c++)rollCycle(i,w,st)});toast(`${go.length} 座村莊立即完成 30 分鐘狩獵。`,'ok');save();render()}
function speedForge(){if(!S.jobs.length)return toast('目前沒有鍛造中的武器。');if(!spendGems(40))return;S.jobs.forEach(j=>j.end=NOW());tick();render()}
function pull(n){const res=pullCore(n);if(!res)return toast('鑽石不夠，可以先用「儲值測試」補充。','bad');const got={};res.forEach(p=>{got[p[0]]=(got[p[0]]||0)+p[1]});
  ui.result={t:'h',title:n===10?'十連祈願':'祈願結果',got,ev:0};render()}
function monthly(){S.monthly.until=Math.max(NOW(),S.monthly.until)+30*864e5;S.gems+=300;toast('月卡啟用 30 天，立即獲得 300 鑽石。','ok');save();render()}
function claimMonthly(){if(!monthlyOn())return;if(S.monthly.last===today())return toast('今天已經領過了。');S.monthly.last=today();S.gems+=50;toast('月卡每日領取 50 鑽石。','ok');save();render()}

/* ---------- 強化動畫 v2：真實武器＋特效 PNG 疊加＋程式補間與粒子 ----------
   結果在 enhanceCore 已經決定，這裡只負責呈現，不會改任何數值。 */
const VFX={
  // N=畫格數、peak=最亮那一格（程式的閃光、碎裂、粒子都對齊這一格）、rest=結果畫面保留的那一格
  ok:{set:'success_gold',T:1200,color:'255,200,90',label:'成功',N:16,peak:10,rest:12},
  fail:{set:'failure_blue',T:900,color:'120,190,255',label:'失敗',N:16,peak:9,rest:12},
  broke:{set:'destroy_red',T:1700,color:'255,70,50',label:'爆裝',N:16,peak:8,rest:11},
  saved:{set:'protect_purple',T:1300,color:'190,120,255',label:'防爆',N:16,peak:9,rest:13}
};
const LOW_END=(typeof navigator!=='undefined'&&(navigator.hardwareConcurrency||8)<=4)||(typeof matchMedia!=='undefined'&&matchMedia('(max-width:380px)').matches);
let fxState=null;
const vfxSrc=(v,i)=>A(`vfx16_${v.set}_${String(i).padStart(2,'0')}`);
const FX_START=.03,FX_END=.97,peakAt=v=>FX_START+(v.peak-.5)*(FX_END-FX_START)/v.N;
// 統一武器顯示元件：武器圖已裁到實際可見範圍；有品質框時用逐把計算的比例（離框 10%、四角花飾額外避讓、離卡片外緣 10%），武器與框是獨立圖層
const WFIT={"t1_woodaxe":0.615,"t1_huntbow":0.595,"t1_huntknife":0.61,"t1_farmspear":0.615,"t1_ironsword":0.605,"t1_roundshield":0.635,"t1_ironhammer":0.635,"t1_handaxe":0.645,"t1_shortspear":0.615,"t1_sling":0.625,"t1_crossbow":0.63,"t1_pickaxe":0.605,"t2_wolfaxe":0.62,"t2_longsword":0.59,"t2_daneaxe":0.595,"t2_longbow":0.595,"t2_warspear":0.615,"t2_twindagger":0.61,"t2_broadsword":0.585,"t2_warhammer":0.615,"t2_glaive":0.615,"t2_throwaxe":0.635,"t2_seax":0.625,"t2_kiteshield":0.575,"t3_greataxe":0.595,"t3_greatsword":0.565,"t3_bow":0.595,"t3_spear":0.615,"t3_hammer":0.64,"t3_dagger":0.59,"t3_halberd":0.615,"t3_saber":0.62,"t3_crossbow":0.625,"t3_shield":0.565,"t3_doubleaxe":0.57,"t3_scythe":0.605,"m_fenrir":0.605,"m_frostgiant":0.575,"m_firegiant":0.565,"m_nidhogg":0.615,"m_iceraven":0.595,"m_serpent":0.62,"t2_crossbow":0.66};
// 2026-10-20 已換成單張重新生成的完整圖（原本柄尾被截斷的 10 把）
const WREGEN=['t1_farmspear','t1_shortspear','t2_warspear','t2_glaive','t3_spear','t3_halberd','t3_crossbow','t3_scythe','m_nidhogg','m_serpent'];
// 開發工具：一次產生指定武器的測試版（品質、等級可輪替），並切到武器庫只看測試武器
function devAllWeapons(ids){const L=[0,1,6,7,9,10,15],q=ui.devAllQ??-1,lv=ui.devAllLv??-1;
  S.weapons=S.weapons.filter(w=>!w.test||where(w)>=0);
  ids.forEach((id,i)=>{const w=makeWeapon(id,q<0?i%5:q,lv<0?L[i%L.length]:lv,[]);w.lv=lv<0?L[i%L.length]:lv;w.test=true});
  ui.sheet=null;ui.tab='armory';ui.acat='all';ui.aq='all';ui.ast='test';scrollTo(0,0);toast('已產生 '+ids.length+' 把測試武器（武器庫已篩選「測試」）')}
function wArt(id,{frame=null,cls=''}={}){const k=(frame!=null?(WFIT[id]||.65):.8)*100,o=(100-k)/2;
  return `<span class="wart ${cls}"><img class="wart-w" src="${A(id+'_disp')}" alt="" style="left:${o}%;top:${o}%;width:${k}%;height:${k}%">${frame!=null?`<img class="wart-f" src="${A('frame'+frame)}" alt="">`:''}</span>`}
const cutArt=src=>src.replace(/\.webp$/,'_disp.webp'+ART_V); // 去背版武器圖（暗色底轉透明），特效才能包住武器
// 預先載入特效圖，避免第一次播放時閃白
function preloadVfx(){setTimeout(()=>{for(const k in VFX)for(let i=1;i<=VFX[k].N;i++){const im=new Image();im.src=vfxSrc(VFX[k],i)}},1500)}
// 音效：放入 art/sfx_*.mp3 後把檔名加進 SFX_READY 就會播放（目前沒有正式音效檔，先保持安靜）
// 音效（v3.9）：sfx/*.mp3；暫用 Kenney Interface Sounds（CC0，真實錄音），之後換 ElevenLabs 只要覆蓋同名檔案
const SFX_VER='?v=9';const SFXV={ui_click:.3,ui_tab:.45,ui_open:.5,ui_close:.45,ui_error:.6,ui_buy:.7,coin:.75,forge_start:.8,forge_done:.75,deliver:.8,upgrade:.75,enchant:.8,melt:.7,enh_start:.6,enh_spoke:.7,enh_warn:.8,enh_ok:.9,enh_fail:.8,enh_break:.95,enh_saved:.85,unlock:.85};
const sfxPool={};let sfxPreloaded=false;
function sfxPreload(){sfxLoadAll();if(sfxPreloaded||typeof Audio==='undefined')return;sfxPreloaded=true;Object.keys(SFXV).forEach(n=>{try{const a=new Audio(sfxUrl(n));a.preload='auto';sfxPool[n]=a}catch(e){}})}
// v3.20 音效改用 Web Audio：音檔先解碼放進記憶體，點擊瞬間就能播放（舊方式手機上會慢 0.1～0.3 秒）
let PTR_DOWN=false,PTR_PEND=false;
// v3.27 音效試用：開發工具可替每個音效切換 A/B/C 試聽版（只存在這台裝置，不改正式音效）
const SFX_NAME={ui_click:'點擊',ui_tab:'分頁',ui_open:'開視窗',ui_close:'關視窗',ui_error:'錯誤',ui_buy:'購買',coin:'金幣／收成',forge_start:'開始鍛造',forge_done:'鍛造完成',deliver:'交付',upgrade:'升級',enchant:'附魔',melt:'熔解',enh_start:'強化開始',enh_spoke:'符文亮起',enh_warn:'危險警告',enh_ok:'強化成功',enh_fail:'強化失敗',enh_break:'爆裝',enh_saved:'防爆生效',unlock:'解鎖村莊'};
const SFX_VAR_KEYS=[],SFX_VARS={},SFX_NO={unlock:11,enchant:13,enh_spoke:16,enh_warn:17,enh_ok:18,enh_fail:19,enh_break:20,enh_saved:21};
let SFX_ALT={};try{SFX_ALT=JSON.parse(localStorage.getItem('nrs-sfxalt')||'{}')||{}}catch(e){}
const sfxUrl=n=>SFX_VAR_KEYS.includes(n)&&SFX_VARS[n].includes(SFX_ALT[n])&&SFX_ALT[n]?`sfx/var/${n}_${SFX_ALT[n]}.mp3?v=1`:'sfx/'+n+'.mp3'+SFX_VER;
function sfxSetAlt(n,v){if(v)SFX_ALT[n]=v;else delete SFX_ALT[n];try{localStorage.setItem('nrs-sfxalt',JSON.stringify(SFX_ALT))}catch(e){}delete SFXBUF[n];delete sfxPool[n];sfxLoadAll()}let ACX=null;const SFXBUF={};
function sfxCtx(){if(!ACX){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ACX=new C()}if(ACX.state==='suspended')ACX.resume();return ACX}
function sfxLoadAll(){const c=sfxCtx();if(!c)return;Object.keys(SFXV).forEach(n=>{if(SFXBUF[n])return;SFXBUF[n]='loading';
  const u=sfxUrl(n);fetch(u).then(r=>r.arrayBuffer()).then(ab=>new Promise((ok,no)=>c.decodeAudioData(ab,ok,no))).then(buf=>{if(sfxUrl(n)===u)SFXBUF[n]=sfxTrim(buf)}).catch(()=>{if(sfxUrl(n)===u)SFXBUF[n]=null})})}
// 去掉 MP3 開頭的靜音（編碼器會補一小段空白）
function sfxTrim(buf){const d=buf.getChannelData(0);let i=0;while(i<d.length&&Math.abs(d[i])<0.004)i++;return{buf,off:Math.max(0,i-32)/buf.sampleRate}}
function snd(n,rate=1,vol){if(QUIET||S.mute||!(n in SFXV))return;vol=(vol??1)*(S.vol??1);if(vol<=0)return;try{const c=sfxCtx(),b=SFXBUF[n];
  if(c&&b&&b!=='loading'){const s=c.createBufferSource(),g=c.createGain();s.buffer=b.buf;s.playbackRate.value=rate;g.gain.value=Math.min(1,(vol??1)*SFXV[n]);s.connect(g).connect(c.destination);s.start(0,b.off);return}
  if(typeof Audio==='undefined')return;const base=sfxPool[n]||(sfxPool[n]=new Audio(sfxUrl(n)));const a=base.cloneNode();a.volume=Math.min(1,(vol??1)*SFXV[n]);a.preservesPitch=false;a.playbackRate=rate;a.play().catch(()=>{})}catch(e){}}
const ENH_SND={ok:'enh_ok',fail:'enh_fail',broke:'enh_break',saved:'enh_saved'};
function playSfx(n){if(n==='sfx_enh_charge')return snd('enh_start');const k=n.replace('sfx_enh_','');snd(ENH_SND[k]||n)}
// 強化舞台（強化頁與動畫測試共用）：固定正方形中心點，所有特效畫格與武器都對齊這個中心
// v3.6 符文石碑強化過場：玩家武器＋程式運鏡；特效素材可替換（RUNE_FX 指向的畫格）
const ENH='art/enh/',VF=(n,i)=>`art/vfx16_${n}_${String(i).padStart(2,'0')}.webp`,rng=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
// 暫代：新素材（rune_*）到之前先用現有 16 格特效；換成新素材只要改這張表
const RN='art/rune/',RS=(n,a,b)=>rng(a,b).map(i=>`${RN}${n}_${i}.webp`);
const RUNE_FX={light:RS('lightning',1,8),eclipse:RS('eclipse',1,8),climax:RS('climax',1,8),ok:RS('success',1,8),broke:RS('shatter',1,8),spark:RS('success',1,3)};
const RUNE_HAS_STONE=true;
const seqHtml=(k,cls)=>`<div class="ly seq ${cls}" data-seq="${k}">${RUNE_FX[k].map(src=>`<img src="${src}" alt="">`).join('')}</div>`;
function stageHtml(o){return `<div class="enh-stage rune ${o.danger?'danger':'safe'} ${o.cls||''}" id="enhStage"><img class="dp dp-sback" src="${A('dp/rune_back')}" alt=""><div class="stage-sq" id="enhSq">
   <div class="ly rn-cam" id="enhCam">
    ${RUNE_HAS_STONE?`<img class="ly rn-stone" src="${RN}stone_dark.webp" alt=""><img class="ly rn-stone glow" id="rnGlow" src="${RN}stone_glow.webp" alt=""><div class="ly rn-spokes" id="rnSpokes">${rng(1,8).map(i=>`<img class="ly rn-stone sp" src="${RN}spoke_${i}.webp" alt="">`).join('')}</div>`:'<div class="ly rn-stone ph"></div><div class="ly rn-stone glow ph" id="rnGlow"></div>'}
    ${seqHtml('light','rn-light')}
    ${o.art?`<div class="ly rn-shadow" id="rnShadow"><img src="${cutArt(o.art)}" alt=""></div>`:''}
    <div class="ly rn-wpn" id="fxW">${o.art?`<img class="wimg" src="${cutArt(o.art)}" alt="">`:''}<div class="fx2-shards" id="fxShards"></div>
      <div class="rn-climb" id="rnClimb"><img src="${RN}climb.webp" alt=""></div></div>
    ${seqHtml('eclipse','rn-eclipse')}${seqHtml('spark','rn-spark')}</div>
   <div class="dp dp-sfog"></div><div class="dp dp-smotes">${[0,1,2,3,4,5].map(k=>`<img class="m${k} gold" src="${A('dp/'+['fx_mote_gold','fx_dust_gold','fx_rune_gold','fx_mote_gold','fx_shard_gold','fx_mote_gold'][k])}" alt=""><img class="m${k} blue" src="${A('dp/'+['fx_mote_blue','fx_mote_blue','fx_rune_blue','fx_mote_blue','fx_mote_blue','fx_mote_blue'][k])}" alt="">`).join('')}</div>
   ${seqHtml('climax','rn-climax')}${seqHtml('ok','rn-res')}${seqHtml('broke','rn-res rn-shatter')}
   <div class="fx2-flash" id="fxFlash"></div></div>
   <div class="enh-top"><span class="enh-zone">${o.zone}</span><span class="enh-lv"><span class="lvt">+${o.from}</span><span class="arrow">${ic('arrow-next')}</span><span class="lvt big">+${o.to}</span></span></div>
   <div class="enh-ribbon k-${o.rk||''} ${o.ribbon?'show':''}" id="enhRibbon">${o.ribbon||''}</div>
   <div class="enh-hint" id="enhHint">點畫面略過</div></div>`}
// 每個圖層只用一條時間軸：stops=[[毫秒,樣式,緩動]]
function tl(el,T,stops){if(!el)return;const kf=stops.map(([t,st,e])=>({...st,offset:Math.min(1,Math.max(0,t/T)),easing:e||'linear'}));
  if(kf[0].offset>0)kf.unshift({...stops[0][1],offset:0});if(kf[kf.length-1].offset<1)kf.push({...stops[stops.length-1][1],offset:1});
  for(let i=1;i<kf.length;i++)if(kf[i].offset<kf[i-1].offset)kf[i].offset=kf[i-1].offset;
  const a=el.animate(kf.map((k,i)=>({...k,easing:(kf[i+1]&&kf[i+1].easing)||'linear'})),{duration:T,fill:'forwards'});fxState.anims.push(a);return a}
function playSeq(k,T,t0,t1,{hold=t1,X=60,peak=1}={}){const box=document.querySelector(`#enhStage [data-seq="${k}"]`);if(!box)return;const im=[...box.children],span=(t1-t0)/im.length;box.style.visibility='visible';
  im.forEach((el,i)=>{const a=t0+span*i,end=i===im.length-1?hold:a+span;tl(el,T,[[0,{opacity:0}],[Math.max(0,a-X/2),{opacity:0}],[a+X/2,{opacity:peak}],[end,{opacity:peak}],[end+X,{opacity:0}]])})}
// 武器預設斜放（圖本身就是左下到右上）；直立＝轉 -45°
const CAM=(s,x=0,y=0,r=0)=>({transform:`translate(${x}%,${y}%) scale(${s}) rotate(${r}deg)`});
function runRune(k,danger){
  const sq=document.getElementById('enhSq'),cam=document.getElementById('enhCam'),W=document.getElementById('fxW'),wi=W.querySelector('.wimg'),glow=document.getElementById('rnGlow'),climb=document.getElementById('rnClimb'),fl=document.getElementById('fxFlash'),rb=document.getElementById('enhRibbon'),hint=document.getElementById('enhHint');
  const N='brightness(1)',shake=(t,p)=>[[t,{transform:'none'}],[t+40,{transform:`translate(${-p}px,${p/2}px)`}],[t+90,{transform:`translate(${p}px,${-p/2}px)`}],[t+140,{transform:`translate(${-p/2}px,0)`}],[t+200,{transform:'none'}]];
  let T,REV;
  if(!danger){ // 安全區約 0.8 秒：符文一閃 → 小星芒 → 結果
    T=800;REV=320;
    tl(cam,T,[[0,CAM(1)],[REV,CAM(1.08),'ease-out'],[T,CAM(1),'ease-in-out']]);
    tl(glow,T,[[0,{opacity:0}],[150,{opacity:1}],[REV+200,{opacity:k==='fail'?.85:.2}],[T,{opacity:0}]]);
    if(k==='fail')later(REV-40,()=>{const st=document.getElementById('enhStage');if(st)st.classList.add('rn-red')});   // 安定區強化失敗：揭曉時石碑由黃光轉紅光
    tl(wi,T,[[0,{filter:N}],[REV-60,{filter:'brightness(1.6) drop-shadow(0 0 12px rgba(255,210,120,.95))'}],[k==='ok'?REV+220:REV+120,{filter:k==='ok'?'brightness(1.9) drop-shadow(0 0 16px rgba(255,220,140,1))':'brightness(.8)'}],[T,{filter:N}]]);
    if(k==='ok')playSeq('spark',T,REV-40,REV+260,{X:50,peak:.9});
    fl.style.background='radial-gradient(closest-side,rgba(255,240,210,.5),rgba(255,240,210,0))';tl(fl,T,[[0,{opacity:0}],[REV-40,{opacity:0}],[REV,{opacity:1}],[REV+200,{opacity:0}]]);
  }else{ // 危險區：八道符文依序亮起（每道 170ms），全亮＝成功；爆裝／失敗／防爆在中途某一道停下
    const S0=520,DT=250,SP=[...document.querySelectorAll('#rnSpokes .sp')];
    const lit=k==='ok'?8:(ui.devStop!=null&&ui.devStop>=0?ui.devStop:2+Math.floor(Math.random()*5));   // 失敗類停在第 3～7 道
    const ts=S0+lit*DT;let C;
    for(let i=0;i<lit;i++)later(S0+i*DT,()=>snd('enh_spoke',.85+i*.09));if(k!=='ok')later(ts,()=>snd('enh_warn'));
    if(k==='ok'){REV=ts+380;T=REV+1150}else{C=ts+300;REV=k==='fail'?ts+220:C;T=REV+(k==='fail'?900:1150)}
    // 鏡頭：暗中推近，符文亮起時慢慢壓近
    tl(cam,T,[[0,{...CAM(.86),filter:'brightness(0)'}],[S0-20,{...CAM(1),filter:'brightness(1)'},'ease-out'],[ts,{...CAM(1.1,0,6),filter:'brightness(1)'}],[REV,{...CAM(1.16,0,8),filter:k==='fail'?'brightness(.8)':'brightness(1.15)'},'ease-out'],[T-150,{...CAM(1.05,0,4),filter:'brightness(1)'},'ease-out']]);
    tl(W,T,[[0,{transform:'rotate(22.5deg)'}]]);
    // 每道符文：一亮（帶一下過曝）就保持；結果揭曉後依結果處理
    SP.forEach((el,i)=>{if(i<lit){const t=S0+i*DT,end=k==='ok'?[[T,{opacity:1,filter:'brightness(1)'}]]:[[REV,{opacity:1,filter:k==='saved'?'brightness(1)':'brightness(1.3)'}],[REV+280,{opacity:k==='saved'?.5:0,filter:'brightness(1)'}]];
        tl(el,T,[[0,{opacity:0,filter:'brightness(1)'}],[t,{opacity:0,filter:'brightness(2.2)'}],[t+50,{opacity:1,filter:'brightness(2.2)'}],[t+160,{opacity:1,filter:'brightness(1)'}],...end])}
      else if(i===lit&&k!=='ok'){ // 下一道：亮不起來
        const red=k==='fail'?'grayscale(1) brightness(.8)':`sepia(1) hue-rotate(${fxState&&fxState.res&&fxState.res.guarded?-235:-50}deg) saturate(5) brightness(1.2)`;   // 防爆中外層有藍色色相旋轉，這裡先反向轉回，仍顯示紅色警告
        tl(el,T,[[0,{opacity:0,filter:red}],[ts,{opacity:0,filter:red}],[ts+50,{opacity:.85,filter:red}],[ts+100,{opacity:.15,filter:red}],[ts+150,{opacity:.9,filter:red}],[ts+210,{opacity:.1,filter:red}],[ts+260,{opacity:k==='fail'?0:.95,filter:red}],[REV+120,{opacity:0,filter:red}]])}
      else tl(el,T,[[0,{opacity:0}]])});
    // 每亮一道，舞台輕震一下
    const shk=[[0,{transform:'none'}]];for(let i=0;i<lit;i++){const t=S0+i*DT;shk.push([t,{transform:'none'}],[t+30,{transform:'translate(-1.5px,1px)'}],[t+70,{transform:'none'}])}
    // 武器：越亮越多
    // 防爆卷保護中：武器光暈改藍色（跟石碑一致）
    const GD=!!(fxState&&fxState.res&&fxState.res.guarded),GC=GD?'110,185,255':'255,200,90',GC2=GD?'150,210,255':'255,220,150';
    const wpre=[[0,{filter:N,opacity:1}],[S0,{filter:N,opacity:1}],[ts,{filter:`brightness(${1+lit*.08}) drop-shadow(0 0 ${4+lit*1.5}px rgba(${GC},.9))`,opacity:1}]];
    fl.style.background='radial-gradient(closest-side,rgba(255,250,235,.95),rgba(255,250,235,0))';
    if(k==='ok'){ // 全亮：整塊石碑亮起、雷擊、閃光、星芒
      tl(glow,T,[[0,{opacity:0}],[ts,{opacity:0}],[ts+120,{opacity:1}],[T,{opacity:.7}]]);
      playSeq('light',T,ts,ts+420,{X:40});playSeq('climax',T,REV-120,REV+300,{X:50});playSeq('ok',T,REV+60,T-120,{X:100});
      tl(wi,T,[...wpre,[REV,{filter:'brightness(2.4)',opacity:1}],[REV+300,{filter:`brightness(1.8) drop-shadow(0 0 18px rgba(${GC2},1))`,opacity:1}],[T,{filter:`brightness(1.15) drop-shadow(0 0 8px rgba(${GC2},.7))`,opacity:1}]]);
      tl(fl,T,[[0,{opacity:0,transform:'scale(.5)'}],[REV-60,{opacity:0,transform:'scale(.5)'}],[REV,{opacity:1,transform:'scale(1.3)'}],[REV+260,{opacity:0,transform:'scale(1.8)'}]]);
      shk.push(...shake(ts+60,4),...shake(REV,6));
    }else{
      // 防爆生效：武器差點碎裂的瞬間，整塊石碑閃一下藍光把它護住（取代舊的紫色護盾動畫）
      if(k==='saved'&&GD)tl(glow,T,[[0,{opacity:0}],[C-20,{opacity:0}],[C+60,{opacity:1}],[C+500,{opacity:.55}],[T,{opacity:.3}]]);else tl(glow,T,[[0,{opacity:0}]]);
      if(k==='fail'){tl(wi,T,[...wpre,[ts+260,{filter:'brightness(.55) saturate(.6)',opacity:1}],[T,{filter:N,opacity:1}]]);shk.push(...shake(ts+60,2))}
      else{ // 爆裝、防爆：下一道閃紅、武器發紅抖動
        tl(W,T,[[0,{transform:'rotate(22.5deg)'}],[ts,{transform:'rotate(22.5deg)'}],[ts+60,{transform:'rotate(22.5deg) translate(-3px,2px)'}],[ts+120,{transform:'rotate(22.5deg) translate(3px,-2px)'}],[ts+180,{transform:'rotate(22.5deg) translate(-3px,1px)'}],[ts+240,{transform:'rotate(22.5deg) translate(2px,-1px)'}],[C,{transform:'rotate(22.5deg)'}]]);
        const redw='sepia(1) hue-rotate(-45deg) saturate(4) brightness(1.8)';
        if(k==='broke'){
          tl(wi,T,[...wpre,[C-10,{filter:redw,opacity:1}],[C+10,{opacity:0}]]);
          {const shd=document.getElementById('rnShadow');if(shd)tl(shd,T,[[0,{opacity:.6}],[C,{opacity:.6}],[C+80,{opacity:0}],[T,{opacity:0}]])}  // 爆裝：武器碎掉時地上的影子一起消失
          const dir=[[-90,-70,-50],[80,-90,60],[-100,50,-80],[95,60,70],[0,110,30]];
          [...W.querySelectorAll('.sh')].forEach((s,i)=>{const[dx,dy,r]=dir[i];tl(s,T,[[0,{opacity:0,transform:'none'}],[C,{opacity:0,transform:'none'}],[C+20,{opacity:1,transform:'none',filter:'brightness(.35)'}],[C+400,{opacity:.85,transform:`translate(${dx*.7}px,${dy*.7}px) rotate(${r*.7}deg)`,filter:'brightness(.25)'},'cubic-bezier(.2,.7,.4,1)'],[T-100,{opacity:0,transform:`translate(${dx*1.2}px,${dy*1.2}px) rotate(${r}deg)`,filter:'brightness(.15)'}]])});
          playSeq('broke',T,C-20,T-150,{X:100});
          tl(fl,T,[[0,{opacity:0,transform:'scale(.5)'}],[C-40,{opacity:0,transform:'scale(.5)'}],[C,{opacity:.9,transform:'scale(1.2)'}],[C+240,{opacity:0,transform:'scale(1.7)'}]]);
          tl(sq,T,[[0,{filter:'none'}],[C+400,{filter:'none'}],[T-200,{filter:'brightness(.5)'}],[T,{filter:'brightness(.6)'}]]);shk.push(...shake(C,8));
        }else{
          tl(wi,T,[...wpre,[C-10,{filter:redw,opacity:1}],[C+200,{filter:`brightness(1.3) drop-shadow(0 0 16px rgba(${GC2},1))`,opacity:1}],[T,{filter:`brightness(1.05) drop-shadow(0 0 8px rgba(${GC2},.6))`,opacity:1}]]);
          fl.style.background=`radial-gradient(closest-side,rgba(${GC2},.85),rgba(${GC2},0))`;tl(fl,T,[[0,{opacity:0,transform:'scale(.5)'}],[C-30,{opacity:0,transform:'scale(.5)'}],[C+20,{opacity:.85,transform:'scale(1.15)'}],[C+320,{opacity:0,transform:'scale(1.6)'}]]);shk.push(...shake(C,5));
        }
      }
    }
    shk.sort((a,b)=>a[0]-b[0]);tl(sq.parentNode,T,shk);
  }
  const R0=REV+(danger?280:80);tl(rb,T,[[0,{opacity:0,transform:'translateY(10px)'}],[R0,{opacity:0,transform:'translateY(10px)'}],[R0+200,{opacity:1,transform:'none'}]]);
  if(hint)tl(hint,T,[[0,{opacity:.75}],[REV-200,{opacity:.75}],[REV,{opacity:0}]]);
  snd('enh_start');later(REV,()=>snd(ENH_SND[k],1,danger?1:.7));
  fxState.timer=setTimeout(finishFx,T+60);
}
function playFx(danger,w,next,res){
  stopFx();let stage=document.getElementById('enhStage');
  if(!stage){ui.sheet={t:'fxt',k:res.k,art:w.art,next,danger};renderLayer();stage=document.getElementById('enhStage')}
  stage.classList.add('playing');stage.dataset.act='fxskip';stage.classList.toggle('danger',!!danger);stage.classList.toggle('safe',!danger);
  stage.classList.toggle('guarded',!!res.guarded);stage.classList.remove('rn-red');   // 防爆卷保護中：石碑亮藍光
  {const sh=document.querySelector('#rnShadow img');if(sh)sh.src=cutArt(w.art)}
  const W0=document.getElementById('fxW');W0.innerHTML=`<img class="wimg" src="${cutArt(w.art)}" alt=""><div class="fx2-shards" id="fxShards">${[0,1,2,3,4].map(i=>`<img class="sh s${i}" src="${cutArt(w.art)}" alt="">`).join('')}</div>`;
  const rb=document.getElementById('enhRibbon');rb.className='enh-ribbon k-'+res.k;rb.innerHTML=`<b>${res.t}</b><span>${res.d}</span>`;rb.style.opacity=0;
  document.querySelectorAll('.sheet [data-act="enhance"]').forEach(b=>{b.disabled=true;b.textContent='強化中…'});
  fxState={res,w,anims:[],raf:0,done:false,timer:0};ui.fxDone=finishFx;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return finishFx();
  runRune(res.k,!!danger);
}
function anim(el,kf,opt){const a=el.animate(kf,{fill:'forwards',easing:'ease-out',...opt});fxState.anims.push(a);return a}
function runTimeline(k,v){
  const T=v.T,W=document.getElementById('fxW'),F=[...document.querySelectorAll('#fxF .vf')],FF=[...document.querySelectorAll('#fxFF .vf')],fl=document.getElementById('fxFlash'),stage=document.querySelector('#enhStage .stage-sq'),aura=stage.querySelector('.fx2-aura'),rb=document.getElementById('enhRibbon');
  // 16 格連續畫格：相鄰兩格透明度交疊（交叉淡化），補足 AI 畫格之間的小落差
  const span=(FX_END-FX_START)/v.N,ov=span*.6,P=peakAt(v);
  F.forEach((f,i)=>{const a=FX_START+span*i,b=a+span;const o=[Math.max(0,a-ov),a,b,Math.min(1,b+ov)];
    const kf=m=>[{opacity:0,offset:0},{opacity:0,offset:o[0]},{opacity:m,transform:'scale(1)',offset:o[1]},{opacity:m,transform:'scale(1.015)',offset:o[2]},{opacity:0,transform:'scale(1.03)',offset:o[3]},{opacity:0,offset:1}];
    anim(f,kf(1),{duration:T,easing:'linear'});if(FF[i])anim(FF[i],kf(k==='fail'?.55:.9),{duration:T,easing:'linear'})});
  // 聚能：所有結果開頭都有能量往武器中心收攏
  burst(v.color,LOW_END?14:28,'in');
  // 衝擊：關鍵瞬間整個舞台頓一下（hit-stop）再彈開，增加重量感
  const punch=k==='ok'?1.05:k==='fail'?1.015:k==='saved'?1.035:1;
  if(punch>1)anim(stage,[{transform:'scale(1)',offset:0},{transform:'scale(1)',offset:Math.max(0,P-.03)},{transform:`scale(${punch})`,offset:P},{transform:`scale(${punch})`,offset:Math.min(.99,P+.04)},{transform:'scale(1)',offset:Math.min(.995,P+.14)},{transform:'scale(1)'}],{duration:T,easing:'linear'});
  anim(aura,[{opacity:0},{opacity:.9,offset:.35},{opacity:.6,offset:.8},{opacity:0}],{duration:T});
  aura.style.background=`radial-gradient(closest-side,rgba(${v.color},.55),transparent)`;
  // 結果文字在關鍵瞬間之後才出現，位置在武器下方
  anim(rb,[{opacity:0,transform:'translateY(10px)',offset:0},{opacity:0,transform:'translateY(10px)',offset:Math.min(.95,P+.1)},{opacity:1,transform:'none',offset:Math.min(.99,P+.2)},{opacity:1,transform:'none'}],{duration:T});
  later(T*P,()=>playSfx('sfx_enh_'+k));
  const hint=document.getElementById('enhHint');if(hint)anim(hint,[{opacity:.75},{opacity:.75,offset:Math.min(.9,P+.05)},{opacity:0,offset:Math.min(.95,P+.1)},{opacity:0}],{duration:T});
  if(k==='ok'){
    anim(W,[{transform:'translateY(6px) scale(.92)',filter:'brightness(1)'},{transform:'translateY(-4px) scale(1.06)',filter:'brightness(1.5) drop-shadow(0 0 14px rgba(255,200,90,.9))',offset:P-.06},{transform:'translateY(-6px) scale(1.1)',filter:'brightness(1.9) drop-shadow(0 0 26px rgba(255,210,120,1))',offset:P},{transform:'translateY(-2px) scale(1.04)',filter:'brightness(1.2) drop-shadow(0 0 16px rgba(255,200,90,.8))'}],{duration:T});
    flash(fl,P,T,'255,236,190',.85);later(T*P,()=>burst(v.color,LOW_END?26:48,'up'));
  }else if(k==='fail'){
    anim(W,[{transform:'translateX(0)'},{transform:'translateX(-4px)',offset:.1},{transform:'translateX(4px)',offset:.2},{transform:'translateX(-3px)',offset:.3},{transform:'translateX(0) scale(.97)',filter:'brightness(.55) saturate(.6)',offset:P+.05},{transform:'scale(1)',filter:'brightness(.85)'}],{duration:T});
    flash(fl,P,T,'140,200,255',.35);later(T*P,()=>burst(v.color,LOW_END?14:26,'fall'));
  }else if(k==='broke'){
    const crack=P; // 對齊爆炸最亮那一格
    anim(W,[{transform:'scale(1)',filter:'brightness(1)'},{transform:'translate(-3px,1px) scale(1.04)',filter:'brightness(1.2) sepia(.4) hue-rotate(-30deg)',offset:.12},{transform:'translate(4px,-2px) scale(1.06)',offset:.2},{transform:'translate(-5px,2px) scale(1.08)',filter:'brightness(1.6) sepia(.8) hue-rotate(-40deg) saturate(2)',offset:.3},{transform:'translate(6px,-3px) scale(1.12)',offset:.38},{transform:'translate(-6px,3px) scale(1.14)',filter:'brightness(2.4) sepia(1) hue-rotate(-45deg) saturate(3)',offset:crack-.01},{opacity:1,offset:crack},{opacity:0,offset:crack+.005},{opacity:0}],{duration:T,easing:'linear'});
    // 關鍵瞬間：武器碎成五塊飛散後消失
    const S=[...document.querySelectorAll('#fxShards .sh')],dir=[[-70,-60,-35],[60,-70,40],[-80,40,-60],[75,50,55],[0,90,20]];
    S.forEach((s,i)=>{const[dx,dy,r]=dir[i];anim(s,[{opacity:0,transform:'translate(0,0) rotate(0)',offset:0},{opacity:0,offset:crack},{opacity:1,transform:'translate(0,0) rotate(0)',offset:crack+.005},{opacity:.9,transform:`translate(${dx*.6}px,${dy*.6}px) rotate(${r*.6}deg)`,offset:crack+.2},{opacity:0,transform:`translate(${dx}px,${dy+40}px) rotate(${r}deg)`}],{duration:T,easing:'cubic-bezier(.2,.7,.4,1)'})});
    flash(fl,crack,T,'255,120,90',.95);later(T*crack,()=>{burst(v.color,LOW_END?36:70,'out');burst('60,30,25',LOW_END?10:20,'out')});
    anim(stage,[{transform:'none',offset:0},{transform:'none',offset:crack},{transform:'translate(-9px,4px)',offset:crack+.03},{transform:'translate(8px,-4px)',offset:crack+.06},{transform:'translate(-5px,2px)',offset:crack+.1},{transform:'none',offset:crack+.15},{transform:'none'}],{duration:T,easing:'linear'});
  }else if(k==='saved'){
    const hit=P; // 對齊紅光撞上護盾那一格
    anim(W,[{transform:'scale(1)',filter:'brightness(1)'},{transform:'translate(-3px,1px) scale(1.04)',filter:'sepia(.5) hue-rotate(-30deg) brightness(1.3)',offset:.15},{transform:'translate(4px,-2px) scale(1.07)',offset:.25},{transform:'translate(-5px,2px) scale(1.09)',filter:'sepia(.9) hue-rotate(-40deg) brightness(1.8) saturate(2)',offset:hit-.02},{transform:'scale(1.02)',filter:'brightness(1.4) drop-shadow(0 0 20px rgba(190,120,255,1))',offset:hit+.04},{transform:'scale(1)',filter:'brightness(1.1) drop-shadow(0 0 10px rgba(190,120,255,.7))'}],{duration:T});
    flash(fl,hit,T,'200,150,255',.8);later(T*hit,()=>{burst('255,80,60',LOW_END?14:26,'deflect');burst(v.color,LOW_END?14:26,'ring')});
  }
  fxState.timer=setTimeout(finishFx,T+60);
}
function later(ms,fn){const id=setTimeout(()=>{if(fxState&&!fxState.done)fn()},ms);fxState.anims.push({cancel:()=>clearTimeout(id),finish:()=>{}})}
function flash(el,at,T,rgb,peak){el.style.background=`radial-gradient(closest-side,rgba(${rgb},${peak}),rgba(${rgb},0))`;anim(el,[{opacity:0,transform:'scale(.6)',offset:0},{opacity:0,transform:'scale(.6)',offset:Math.max(0,at-.02)},{opacity:1,transform:'scale(1.1)',offset:at},{opacity:0,transform:'scale(1.5)',offset:Math.min(1,at+.18)},{opacity:0}],{duration:T,easing:'linear'})}
// 粒子：canvas 繪製，數量依裝置調整，動畫結束自動停止
function burst(rgb,n,mode){
  const cv=document.getElementById('fxCanvas');if(!cv)return;const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H*.48;
  const P=fxState.parts||(fxState.parts=[]);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=mode==='fall'?1+Math.random()*1.5:2+Math.random()*4.5;
    let vx=Math.cos(a)*sp,vy=Math.sin(a)*sp;if(mode==='up'){vy=-Math.abs(vy)-1.5;vx*=.7}if(mode==='fall'){vy=-1.2-Math.random();vx*=.8}
    if(mode==='in'){const r=120+Math.random()*50;P.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,vx:-Math.cos(a)*r/34,vy:-Math.sin(a)*r/34,life:1,decay:.03,size:1.5+Math.random()*2,rgb,g:0});continue}
    if(mode==='ring'){vx=Math.cos(a)*3.2;vy=Math.sin(a)*3.2}
    const r0=mode==='deflect'?62:mode==='ring'?40:14;
    P.push({x:cx+Math.cos(a)*r0*(mode==='deflect'?1.6:1),y:cy+Math.sin(a)*r0*(mode==='deflect'?1.6:1),vx:mode==='deflect'?-vx*.6:vx,vy:mode==='deflect'?-vy*.6:vy,life:1,decay:.012+Math.random()*.02,size:1.5+Math.random()*(mode==='out'?3.5:2.5),rgb,g:mode==='fall'||mode==='out'?.12:mode==='up'?-.02:0,bounce:mode==='deflect'})}
  if(!fxState.raf){const step=()=>{if(!fxState||fxState.done)return;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life-=p.decay;
      if(p.bounce&&Math.hypot(p.x-cx,p.y-cy)<64){p.vx*=-1.2;p.vy*=-1.2}
      if(p.life<=0){P.splice(i,1);continue}ctx.fillStyle=`rgba(${p.rgb},${p.life})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(.5+p.life*.5),0,7);ctx.fill()}
    fxState.raf=P.length?requestAnimationFrame(step):0};fxState.raf=requestAnimationFrame(step)}
}
function stopFx(){if(!fxState)return;fxState.done=true;clearTimeout(fxState.timer);cancelAnimationFrame(fxState.raf);fxState.anims.forEach(a=>{try{a.cancel()}catch(e){}})}
function finishFx(){if(!fxState||fxState.resultShown)return;const{res}=fxState;stopFx();fxState.resultShown=true;ui.fxDone=null;
  const cv=document.getElementById('fxCanvas');if(cv)cv.getContext('2d').clearRect(0,0,cv.width,cv.height); // 不留殘影
  ui.busy=false;ui.lockUntil=Date.now()+350;ui.enhLast={id:res.id,k:res.k,t:res.t,d:res.d,test:!res.id};renderLayer()}
const FXW={axe:['t2_wolfaxe','霜狼戰斧'],sword:['t2_longsword','霜銀長劍'],spear:['t3_halberd','龍鱗戟'],bow:['t2_longbow','霜銀長弓'],shield:['t3_shield','龍鱗塔盾']};
function testFx(k,safe,guarded){const f=FXW[ui.devFxW||'axe'];const art=A(f[0]),name=f[1];
  const t={ok:['強化成功 +8','只播放特效，不影響存檔'],fail:['強化失敗','只播放特效，不影響存檔'],broke:['武器已損毀','只播放特效，武器沒有真的消失'],saved:['防爆卷生效','只播放特效，不影響存檔']}[k];
  const danger=!safe;ui.enhLast=null;ui.sheet={t:'fxt',k,art,next:8,danger};renderLayer();ui.busy=true;playFx(danger,{art,name},8,{k,t:t[0],d:t[1],guarded:!!guarded||(k==='saved'&&!safe)})}   // 防爆生效一定是有勾防爆卷，所以一律藍光
function sheetFxTest(o){const last=ui.enhLast&&ui.enhLast.test?ui.enhLast:null;
  return `<div class="sheet-head"><span style="width:44px"></span><h2>強化動畫測試</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
  ${stageHtml({art:last&&last.k==='broke'?null:o.art,danger:o.danger,from:7,to:8,zone:o.danger?'危險區':'安定區',ribbon:last?`<b>${last.t}</b><span>${last.d}</span>`:'',rk:last&&last.k})}
  <div class="small muted center">使用武器庫裡戰力最高的武器播放，不會改動存檔。動畫中點畫面或按按鈕都能略過。</div>
  <div class="fxt-btns">${[['fxs_ok','安全成功'],['fxs_fail','安全失敗（紅光）'],['fx_ok','危險成功'],['fx_fail','危險失敗'],['fx_broke','爆裝'],['fx_saved','防爆'],['fxg_ok','防爆中・成功（藍光）'],['fxg_fail','防爆中・失敗（藍光）'],['fxg_saved','防爆中・防爆生效（藍光）'],['autoenh','一鍵強化到安定值（新增 +0 鐵錘）']].map(([k,n])=>btn(n,'devdo',{cls:'btn-sec',attrs:`data-k="${k}"`})).join('')}</div>`}

/* ---------- 共用元件 ---------- */

// ===================== UI 皮膚系統（v4.0）=====================
// 皮膚設定在 skin.js（UI_SKIN、UI_ICON）。槽位全部 null 時不產生任何樣式，外觀與 v3.9 相同。
const SKIN_SLOTS=[
 ['btn-primary','主要按鈕','.ui-btn--primary:not(.sm):not(.big)'],['btn-secondary','次要按鈕','.ui-btn--secondary:not(.sm):not(.big):not(.side-btn)'],['btn-danger','危險按鈕（熔解、重置、無保護強化）','.ui-btn--danger:not(.sm):not(.big)'],
 ['btn-primary-big','主要大按鈕（.big：強化、交付等整排按鈕）','.ui-btn--primary.big'],['btn-secondary-big','次要大按鈕（.big）','.ui-btn--secondary.big'],['btn-danger-big','危險大按鈕（.big：無保護強化）','.ui-btn--danger.big'],
 ['btn-primary-compact','主要小按鈕（.sm）','.ui-btn--primary.sm'],['btn-secondary-compact','次要小按鈕（.sm）','.ui-btn--secondary.sm'],['btn-danger-compact','危險小按鈕（.sm）','.ui-btn--danger.sm'],
 ['btn-chip','篩選／數量小鈕','.ui-btn--chip'],['btn-toggle','分類圖示鈕','.ui-btn--toggle'],['btn-accent','收成鈕','.ui-btn--accent'],['btn-icon','圓形圖示鈕（關閉、說明、＋、齒輪、音效）','.ui-iconbtn'],
 ['tab','分頁鈕（鐵匠鋪子分頁、開發工具分頁）','.ui-tab'],
 ['panel','面板','.ui-panel'],['title','面板標題','.ui-title'],['card','卡片（村莊、商品、委託、已選擇圖紙）','.ui-card:not([class*="ui-card--"]):not(.gemcard)'],['card-compact','小卡片（附魔欄位、鑽石商品）','.ui-card--slot,.gemcard'],['card-feature','展示卡（武器詳情）','.ui-card--feature'],
 ['card-option','選項卡（狩獵策略、附魔詞條）','.ui-card--option'],['card-row','清單列（商人、交付、鍛造佇列）','.ui-card--row'],['badge','標籤','.ui-badge'],
 ['prog','進度條底','.ui-prog'],['prog-fill','進度條填滿','.ui-prog>i'],
 ['sheet','底部抽屜','.ui-sheet'],['modal','置中彈窗','.ui-modal'],['toast','提示訊息','.ui-toast'],
 ['topbar','頂部資源列','.ui-topbar'],['navbar','底部分頁列','.ui-navbar'],['navtab','底部分頁按鈕','.ui-navtab'],['page-bg','頁面背景','body']];
const SKIN_STATE={pressed:s=>`${s}:active:not(:disabled),${s}.is-pressed`,disabled:s=>`${s}:disabled,${s}.is-disabled`,on:s=>`${s}.on,${s}.is-on`};
const UI_ICON_GLYPH={'info':'ⓘ','arrow-next':'➜','arrow-left':'‹','arrow-right':'›','clear':'✕','sound-on':'🔊','sound-off':'🔇'};
// 介面圖示：skin.js 有設定圖片就用圖片，否則輸出原本的文字符號
function ic(n){const src=typeof UI_ICON!=='undefined'&&UI_ICON[n];return src?`<img class="ui-ic" src="${src}" alt="">`:UI_ICON_GLYPH[n]}
// 皮膚規則加上 :not(#_)（ID 等級權重），確保蓋過原本樣式（例如 .nav button），但不使用 !important
const boostSel=sel=>sel.split(',').map(x=>x.trim()+':not(#_)').join(',');
function skinCss(){if(typeof UI_SKIN==='undefined')return'';const out=[];
  for(const [key,cfg] of Object.entries(UI_SKIN)){if(!cfg||(!cfg.src&&cfg.mode!=='clear'))continue;const [vslot,state]=key.split(':'),slot=vslot.split('|')[0];const def=SKIN_SLOTS.find(x=>x[0]===slot);if(!def)continue;
    const base=Object.assign({},UI_SKIN[vslot]||{},cfg),sel=boostSel(state?(SKIN_STATE[state]||(x=>x))(def[2]):def[2]);
    if(state&&UI_SKIN[vslot]&&UI_SKIN[vslot].src&&!cfg.slice&&(base.mode||'9slice')==='9slice'){out.push(`${sel}{border-image-source:url("${cfg.src}")${cfg.css?';'+cfg.css:''}}`);continue}
    const ex=`${base.shadow?'':';box-shadow:none'}${base.css?';'+base.css:''}`;
    // clear：拿掉原本的 CSS 外框與背景（素材本身已經含外框時用，例如圓形圖示按鈕）
    if(base.mode==='clear'){out.push(`${sel}{background:none;border-color:transparent${ex}}`);continue}
    if((base.mode||'9slice')==='bg'){out.push(`${sel}{background:url("${cfg.src}") center/100% 100% no-repeat;border-color:transparent${ex}}`);continue}
    // fit：整張等比縮放置中（旗幟、徽章、稀有度框等不能伸縮的素材）
    if(base.mode==='fit'){out.push(`${sel}{background:url("${cfg.src}") center/contain no-repeat;border-color:transparent${ex}}`);continue}
    // width：只設定圖框的繪製寬度（border-image-width），不改元件原本的邊框寬度，所以版面尺寸完全不變。
    //   上下寬度相加 ≥ 元件高度時，瀏覽器會把四邊等比例縮小 → 只能橫向伸縮的素材（3-slice）用這個方式，四角不會變形。
    if(base.width){const sl=(base.slice||[24,24,24,24]).join(' '),iw=base.width.map(v=>typeof v==='number'?v+'px':v).join(' ');
      out.push(`${sel}{border-color:transparent;border-image:url("${cfg.src}") ${sl}${base.fill===false?'':' fill'} / ${iw} / ${base.outset||0} ${base.repeat||'stretch'};background:none${ex}}`);
      // overlay：不能被拉伸的中央裝飾（例如導航列中間的鑽飾）另外疊一層，固定比例置中，不跟著元件寬度變形
      if(base.overlay){const ov=base.overlay;out.push(`${sel.split(',').map(x=>x+'::before').join(',')}{content:"";position:absolute;left:50%;top:0;height:100%;aspect-ratio:${ov.ratio};transform:translateX(-50%);background:url("${ov.src}") center/100% 100% no-repeat;pointer-events:none}`)}
      continue}
    const sl=(base.slice||[24,24,24,24]).join(' '),bw=(base.border||(base.slice||[24,24,24,24]).map(v=>Math.round(v/3))).map(v=>v+'px').join(' ');
    out.push(`${sel}{border-style:solid;border-color:transparent;border-width:${bw};border-image:url("${cfg.src}") ${sl}${base.fill===false?'':' fill'} / ${bw} ${base.repeat||'stretch'};background:none${base.shadow?'':';box-shadow:none'}${base.css?';'+base.css:''}}`)}
  return out.join('\n')}
// minWidth：某些素材在窄螢幕不合用時，只在畫面寬度 ≥ minWidth 才套用（較窄時維持原外觀，同一寬度下所有同類元件仍一致）
// 同一槽位可以有寬度變體：鍵名寫成 'btn-primary|narrow'，並用 maxWidth 指定只在窄螢幕套用（例：maxWidth:360）
function skinCssWrapped(){if(typeof UI_SKIN==='undefined')return'';const groups={};
  for(const [key,cfg] of Object.entries(UI_SKIN)){const vs=key.split(':')[0],b=UI_SKIN[vs]||{},c=cfg||{};const mn=c.minWidth||b.minWidth||0,mx=c.maxWidth||b.maxWidth||0;
    const mq=[mn?`(min-width:${mn}px)`:'',mx?`(max-width:${mx}px)`:''].filter(Boolean).join(' and ');(groups[mq]=groups[mq]||{})[key]=cfg}
  const all=UI_SKIN,out=[];
  for(const [mw,g] of Object.entries(groups)){const saved={};for(const k of Object.keys(all)){saved[k]=all[k];if(!(k in g))all[k]=null}
    // 狀態槽需要知道一般狀態有沒有圖：把同組的一般狀態留著
    for(const k of Object.keys(g)){const sl=k.split(':')[0];if(saved[sl])all[sl]=saved[sl]}
    const css=skinCss();Object.assign(all,saved);if(!css)continue;out.push(mw?`@media ${mw}{\n${css}\n}`:css)}
  return out.join('\n')}
function applySkin(){if(typeof document==='undefined')return;let el=document.getElementById('ui-skin');const css=skinCssWrapped();
  if(!css){if(el)el.remove();return}if(!el){el=document.createElement('style');el.id='ui-skin';document.head.appendChild(el)}el.textContent=css}
// UI 元件總覽（開發工具 → UI 元件）：逐一檢視所有元件與狀態，換上美術後在這裡驗收
// 第二階段候選皮膚預覽：暫時把 UI_SKIN_PREVIEW 等套上，再按一次還原（不存檔）
let P2_BAK=null;
function p2Toggle(){if(typeof UI_SKIN_PREVIEW==='undefined')return;
  if(P2_BAK){for(const k of Object.keys(UI_SKIN))if(!(k in P2_BAK.s))delete UI_SKIN[k];Object.assign(UI_SKIN,P2_BAK.s);Object.assign(UI_ICON,P2_BAK.i);for(const k of Object.keys(UI_ART))delete UI_ART[k];Object.assign(UI_ART,P2_BAK.a);P2_BAK=null}
  else{P2_BAK={s:{...UI_SKIN},i:{...UI_ICON},a:{...UI_ART}};Object.assign(UI_SKIN,UI_SKIN_PREVIEW);Object.assign(UI_ICON,UI_ICON_PREVIEW);Object.assign(UI_ART,UI_ART_PREVIEW)}
  applySkin();render()}
function uiGallery(){
  const st=['一般','按下','停用'],stc=['','is-pressed','is-disabled'];
  const row=(title,html)=>`<div class="uig-row"><div class="uig-k">${title}</div><div class="uig-v">${html}</div></div>`;
  const B3=(v,cls)=>stc.map((c,i)=>`<button class="ui-btn ui-btn--${v} btn ${cls} ${c}" ${c==='is-disabled'?'disabled':''}>${st[i]}</button>`).join('');
  const slots=SKIN_SLOTS.map(([k,n,sel])=>{const on=typeof UI_SKIN!=='undefined'&&UI_SKIN[k]&&(UI_SKIN[k].src||UI_SKIN[k].mode==='clear');const states=Object.keys(UI_SKIN||{}).filter(x=>x.startsWith(k+':')).map(x=>`${x.split(':')[1]}${UI_SKIN[x]&&UI_SKIN[x].src?'✔':''}`).join(' ');
    return `<tr><td>${k}</td><td>${n}</td><td><code>${sel}</code></td><td class="${on?'t-ok':'muted'}">${on?(UI_SKIN[k].src?`<img class="uig-thumb" src="${UI_SKIN[k].src}" alt="">已套用`:'已套用（拿掉外框）'):'未設定（原外觀）'}</td><td class="small">${states}</td></tr>`}).join('');
  const icons=Object.keys(UI_ICON_GLYPH).map(k=>`<span class="uig-ico">${ic(k)}<small>${k}</small></span>`).join('')+['ic_close','ic_back','ic_gear','ic_plus','ic_lock','ic_unlock','ic_check','ic_star'].map(n=>`<span class="uig-ico">${img(n)}<small>${n}</small></span>`).join('');
  const test=typeof UI_SKIN!=='undefined'&&UI_SKIN['btn-primary']&&UI_SKIN['btn-primary']._test;
  return `<div class="uig">
   <div class="label">皮膚系統狀態（skin.js）</div>
   <div class="small muted">槽位 null＝使用目前 CSS 外觀。填入 src 後全遊戲同步更新。狀態欄的 ✔ 表示該狀態已設定圖片。</div>
   <div class="uig-scroll"><table class="uig-tbl"><tr><th>槽位</th><th>元件</th><th>選擇器</th><th>目前</th><th>狀態槽</th></tr>${slots}</table></div>
   <div class="row" style="margin:8px 0">${btn(test?'還原 9-slice 試套':'用現有木紋按鈕圖試套 9-slice','uiskintest',{cls:'btn-sec sm'})}<span class="small muted">只影響畫面，不存檔；重新整理即恢復</span></div>
   ${typeof UI_SKIN_PREVIEW!=='undefined'?`<div class="row" style="margin:0 0 8px">${btn(P2_BAK?'還原原本外觀':'預覽第二階段候選皮膚','uiskinp2',{cls:(P2_BAK?'btn-sec':'btn-primary')+' sm'})}<span class="small muted">套用 skin.js 的 UI_SKIN_PREVIEW（已驗證素材），不存檔</span></div>`:''}
   <div class="row" style="margin:0 0 8px"><span class="small muted">村莊詳細頁</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.villV||'2')===k?'on':''}" data-act="villv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}<span class="small muted">成就</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.achV2||'O')===k?'on':''}" data-act="achv2" data-k="${k}">${k==='O'?'目前':k}</button>`).join('')}<span class="small muted">鐵匠鋪內容</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.forgeV||'O')===k?'on':''}" data-act="forgev" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px"><span class="small muted">強化頁版型</span>${['O','1','2','3'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.enhV||'2')===k?'on':''}" data-act="enhv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px"><span class="small muted">附魔頁版型</span>${['O','1','2'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.enchV||'2')===k?'on':''}" data-act="enchv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px"><span class="small muted">鐵匠鋪版型</span>${['O','A','B','C','D','E','F'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.heroV||'O')===k?'on':''}" data-act="herov" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>
   <div class="row" style="margin:0 0 8px">${btn(document.body.classList.contains('dpv')?'關閉景深圖層（比較用）':'開啟景深圖層','uidpv',{cls:(document.body.classList.contains('dpv')?'btn-sec':'btn-primary')+' sm'})}<span class="small muted">鐵匠鋪、強化石碑的前後景圖層與視差（預設開啟）</span></div>
   <div class="row" style="margin:0 0 8px">${btn(document.body.classList.contains('fpv')?'還原原本外觀（武器框）':'預覽武器框風格','uifpv',{cls:(document.body.classList.contains('fpv')?'btn-sec':'btn-primary')+' sm'})}<span class="small muted">全部框線改成武器框風格（現有武器框換色試套），不存檔</span></div>
   <div class="label">按鈕（一般／按下／停用）</div>
   ${row('主要 btn-primary',B3('primary','btn-primary'))}${row('次要 btn-secondary',B3('secondary','btn-sec'))}${row('危險 btn-danger',B3('danger','btn-danger'))}
   ${row('尺寸',`<button class="ui-btn ui-btn--primary btn btn-primary sm">小 sm</button><button class="ui-btn ui-btn--primary btn btn-primary">一般</button><button class="ui-btn ui-btn--primary btn btn-primary big">大 big</button>`)}
   ${row('小鈕 btn-chip',`<button class="ui-btn ui-btn--chip chipbtn">一般</button><button class="ui-btn ui-btn--chip chipbtn on">選中</button><button class="ui-btn ui-btn--chip qchip">×5</button><button class="ui-btn ui-btn--chip qchip on">×10</button>`)}
   ${row('分類鈕 btn-toggle',`<button class="ui-btn ui-btn--toggle cat">${img('cat_axe')}<span>斧</span></button><button class="ui-btn ui-btn--toggle cat on">${img('cat_sword')}<span>劍</span></button>`)}
   ${row('收成鈕 btn-accent',`<button class="ui-btn ui-btn--accent harvest-btn"><span>收成</span><b>×12</b></button><button class="ui-btn ui-btn--accent harvest-btn is-pressed"><span>收成</span><b>×12</b></button>`)}
   ${row('圖示鈕 btn-icon',`${btn(img('ic_close'),'',{cls:'icon-btn img'})}<span class="uig-ib"><button class="ui-iconbtn info-btn">${ic('info')}</button></span><button class="ui-iconbtn plus">${img('ic_plus')}</button><button class="ui-iconbtn gear">${img('ic_gear')}</button><button class="ui-iconbtn mute">${ic('sound-on')}</button>`)}
   ${row('分頁 tab',`<div class="subtabs uig-inline"><button class="ui-tab on">圖紙</button><button class="ui-tab">材料</button><button class="ui-tab">鍛造中</button></div>`)}
   <div class="label">面板、標題、卡片</div>
   <div class="ui-panel panel">${ptitle('面板標題 ptitle')}${kv('數值列 kv','1,234')}<div class="ui-prog prog"><i style="width:62%"></i></div><span class="ui-badge badge">標籤</span></div>
   <div class="uig-grid"><div class="ui-card pcard"><b>商品卡 card</b><span class="small muted">說明文字</span></div><div class="ui-card ui-card--option strat"><b>選項卡</b><span class="small">一般</span></div><div class="ui-card ui-card--option strat on"><b>選項卡</b><span class="small">選中</span></div></div>
   <div class="ui-card ui-card--row mrow">${img('mat_iron')}<div class="grow"><b>清單列 card-row</b><span class="small muted">商人、交付、佇列</span></div></div>
   <div class="label">武器格與品質框</div>
   <div class="wgrid uig-wgrid">${[0,1,2,3,4].map(q=>`<div class="wt q${q}b"><span class="wt-art">${wArt('t2_longsword',{frame:q})}</span><span class="wt-name q${q}"><span class="wt-lv">+${q*3}</span>${QUAL[q].n}</span></div>`).join('')}</div>
   <div class="label">視窗</div>
   <div class="uig-demo"><div class="ui-sheet sheet uig-static"><div class="sheet-head"><span style="width:44px"></span><h2>底部抽屜 sheet</h2>${btn(img('ic_close'),'',{cls:'icon-btn img'})}</div><div class="small">內容區</div></div></div>
   <div class="uig-demo"><div class="ui-modal modal-card uig-static">${ptitle('置中彈窗 modal')}<div class="small center">說明文字</div>${btn('確定','',{cls:'btn-primary big'})}</div></div>
   <div class="uig-demo"><div class="ui-toast toast uig-static">提示訊息 toast</div><div class="ui-toast toast bad uig-static">錯誤提示 toast.bad</div></div>
   <div class="label">頂部列與底部分頁</div>
   <div class="uig-demo"><div class="ui-topbar bar uig-static"><div class="bar-in"><div class="res">${document.getElementById('res')?document.getElementById('res').innerHTML:''}</div></div></div></div>
   <div class="uig-demo"><nav class="ui-navbar nav uig-static"><div class="nav-in">${document.getElementById('nav')?document.getElementById('nav').innerHTML:''}</div></nav></div>
   <div class="label">介面圖示（文字符號槽位＋現有圖片）</div><div class="uig-icons">${icons}</div>
   <div class="label">品質色與主色</div><div class="uig-icons">${['--q0','--q1','--q2','--q3','--q4','--gold','--gold-hi','--ember','--frost','--ok','--danger','--bone','--ash','--line2'].map(v=>`<span class="uig-sw"><i style="background:var(${v})"></i><small>${v}</small></span>`).join('')}</div>
   <div class="label">字級</div><div>${[12,13,15,17,20,24,32].map(z=>`<div style="font-size:${z}px;line-height:1.3">${z}px 九界鐵匠 Nine Realms</div>`).join('')}</div>
  </div>`}

const img=(n,cls='',alt='')=>`<img class="${cls}" src="${A(n)}" alt="${alt}">`;
const btnVariant=cls=>/btn-primary/.test(cls)?'primary':/btn-danger|btn-risk/.test(cls)?'danger':/icon-btn/.test(cls)?'icon':'secondary';
const btn=(label,act,{cls='btn-sec',attrs='',dis=false}={})=>`<button class="ui-btn ui-btn--${btnVariant(cls)} btn ${cls}" data-act="${act}" ${attrs} ${dis?'disabled':''}>${label}</button>`;
const ptitle=t=>`<div class="ui-title ptitle"><span>${t}</span></div>`;
const kv=(k,v)=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`;
function wTile(w,act,dot){const b=bpOf(w),i=where(w);
  return `<button class="wt q${w.q}b ${i>=0?'posted':''} ${w.lock?'locked-fav':''}" ${act}>${dot?'<i class="dot give-dot" title="可以交付村莊"></i>':''}<span class="wt-art">${wArt(b.id,{frame:w.q})}
   ${i>=0?`<span class="wt-post">駐守 1-${i+1}</span>`:''}${wNew(w)?'<span class="new-tag">NEW</span>':''}</span>
   <span class="wt-name q${w.q}"><span class="wt-lv">+${w.lv}</span>${b.n}${w.lock?img('ic_lock','wt-lk','已收藏'):''}</span><span class="wt-meta"><span class="wt-q q${w.q}">${QUAL[w.q].n}${(w.traits||[]).length?`<span class="wt-tr">特性${w.traits.length}</span>`:''}${w.test?'<span class="wt-tst">測試</span>':''}</span><span class="wt-pow">${fmt(power(w))}</span></span></button>`}
function bpTile(b,on){const l=bpLock(b);return `<button class="wt bp ${on?'on':''} ${l?'locked':''}" data-act="bp" data-k="${b.id}"><span class="wt-art">${wArt(b.id,{frame:TIER_FRAME[b.t]})}${l?`<span class="wt-locktxt">${l}</span>`:''}${bpNew(b)?'<span class="new-tag">NEW</span>':''}</span><span class="wt-name">${b.n}</span><span class="wt-pow">${TIERS[b.t].n}・${CATS[b.cat]}</span></button>`}
const matBox=(k,need)=>need==null?`<button class="matbox mb-tap" data-act="matinfo" data-k="${k}">${img(MATART[k])}<span class="mb-n">${MATS[k]}</span><span class="mb-c">${fmt(S.mats[k])}</span></button>`
  :`<div class="matbox need ${S.mats[k]<need?'lack':'ok'}">${img(MATART[k])}<span class="mb-n">${MATS[k]}</span><span class="mb-have">持有 ${fmt(S.mats[k])}</span><span class="mb-need">需要 ${fmt(need)}</span></div>`;
// v3.61 材料倉庫：點材料顯示用途（哪些材質的圖紙會用到）與取得方式，直接從圖紙配方、村莊掉落、商店資料算出來
function matInfo(k){const tiers=[...new Set(BPS.filter(b=>recipe(b)[k]).map(b=>TIERS[b.t].n))],named=BPS.filter(b=>b.r&&b.r[k]).map(b=>b.n);
  const use=[];if(tiers.length)use.push(`鍛造 <b>${tiers.join('、')}</b> 武器${named.length?`（神器：${named.join('、')}）`:''}`);if(k==='shard')use.push('武器<b>附魔</b>（一般 1 個、指定 4 個）');
  const shop=SHOP_MATS.find(x=>x[0]===k),src=[];if(shop)src.push(`商城旅行商人 ${shop[1]} 金／個`);
  const vs=VILLAGES.map((v,i)=>v.drops.some(d=>d[0]===k)?'1-'+(i+1)+' '+v.name:null).filter(Boolean);if(vs.length)src.push('村莊狩獵：'+vs.join('、'));
  if(SLAG_SHOP.some(x=>x[0]===k))src.push('殘渣兌換');if(k==='shard')src.push('熔解武器有機率得到');
  return {icon:MATART[k],title:MATS[k],html:`持有 <b>${fmt(S.mats[k])}</b> 個<br><br><b>用途</b>：${use.join('；')||'—'}<br><br><b>取得</b>：${src.join('；')||'—'}`}}
const traitHtml=w=>(w.traits||[]).map(t=>`<span class="trait">${TRAITS[t.k].n} +${t.v}%</span>`).join('');
// 上方資源列：10 萬以上縮寫成「12.3萬」，避免手機上擠到玩家暱稱
const fmtS=n=>n>=1e5?(Math.floor(n/1e3)/10).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'萬':fmt(n);
let RES_H='';function renderRes(){const el=document.getElementById('res');if(!el)return;
  const h=`<button class="player" data-act="player" aria-label="鐵匠等級 Lv.${smithLv()}">${img('ui_player_emblem','emblem')}<i class="lvb">Lv${smithLv()}</i><span class="pname"><span class="small muted">Lv.${smithLv()}</span><b>${esc(S.nick||(AUTH?'未命名鐵匠':'訪客鐵匠'))}</b></span></button>
  <button class="ui-iconbtn mute" data-act="mute" aria-label="${S.mute?'開啟音效':'關閉音效'}">${img(S.mute?'ic_sound_off':'ic_sound_on')}</button><span class="chip">${img('it_gold')}<b class="num">${fmtS(S.gold)}</b></span><span class="chip">${img('it_gems')}<b class="num">${fmtS(S.gems)}</b><button class="ui-iconbtn plus" data-act="tab" data-k="shop" aria-label="儲值">${img('ic_plus')}</button></span>${devMode()?`<button class="ui-iconbtn gear" data-act="dev" aria-label="開發工具">${img('ic_gear')}</button>`:''}`;if(h!==RES_H||!el.firstChild){RES_H=h;el.innerHTML=h}}
const ART_HAS_NAV_MARKET=true;    // 交易所分頁圖示（AI 美術）到位後改 true
const TABS=[['village','村莊','nav_village'],['forge','鐵匠鋪','nav_forge'],['armory','武器庫','nav_armory'],['market','交易所',ART_HAS_NAV_MARKET?'nav_market':'it_gold'],['shop','商城','nav_shop']];
let NAV_H='';function renderNav(){const N=document.getElementById('nav'),h=TABS.map(([k,n,ic])=>{const dot=k==='village'?S.villages.some(v=>v.bank.cycles)||anyGive()||achReadyN()>0:k==='armory'?anyGive()||ui.tab!=='armory'&&S.weapons.some(wNew)
    :k==='forge'?forgeIdle()||BPS.some(bpNew):k==='market'?S.mkNew>0&&ui.tab!=='market':k==='shop'?monthlyDot():false,hot=k==='village'&&S.villages.some((st,i)=>vState(i)[0]==='full');
  return `<button data-act="tab" data-k="${k}" class="ui-navtab ${ui.tab===k?'on':''}">${img(ic)}<span>${n}</span>${dot||hot?`<i class="dot give-dot${hot?' hot':''}"></i>`:''}</button>`}).join('');if(h!==NAV_H||!N.firstChild){NAV_H=h;N.innerHTML=h}}

/* ---------- 鐵匠鋪 ---------- */
function commissionCard(){const i=S.villages.findIndex(v=>v.status==='open');
  if(i<0)return `<div class="ui-card comm">${ptitle('目前委託')}<div class="small center">米德加德已全部收復</div></div>`;
  const v=VILLAGES[i],best=S.weapons.filter(w=>bpOf(w).cat===v.cat).reduce((m,w)=>Math.max(m,power(w)),0);
  return `<div class="ui-card comm">${ptitle('目前委託')}<div class="comm-in">${img('v'+(i+1),'comm-img')}<div><b>1-${i+1} ${v.name}</b><div class="small muted">${CATS[v.cat]}類・戰力 ${v.req}${v.need?'＋'+AFFIX[v.need].n:''}</div></div></div>
   <div class="ui-prog prog sm"><i style="width:${Math.min(100,best/v.req*100)}%"></i></div><div class="small muted">最強${CATS[v.cat]} ${best}/${v.req}</div>
   ${btn('前往村莊 »','tab',{cls:'btn-sec sm',attrs:'data-k="village"'})}</div>`}
// 版型 E 場景互動：場景裡的物件本身就是按鈕（炭火桶＝熔解、鐵砧＝工坊升級、工具架＝學徒），委託做成用鐵鍊吊著的告示牌
function heroScene(){const i=S.villages.findIndex(v=>v.status==='open'),D=n=>A('dp/'+n);
  const obj=(cls,src,act,label,ic)=>`<button class="hs-obj ${cls}" data-act="${act}" aria-label="${label}"><img class="hs-img" src="${D(src)}" alt=""><span class="hs-tag">${img(ic)}${label}</span></button>`;
  let board='';if(i>=0){const v=VILLAGES[i],best=S.weapons.filter(w=>bpOf(w).cat===v.cat).reduce((m,w)=>Math.max(m,power(w)),0),f=Math.min(1,best/v.req);
    board=`<button class="hs-board ${f>=1?'ok':''}" data-act="tab" data-k="village"><img class="hs-chain l" src="${D('prop_chains')}" alt=""><img class="hs-chain r" src="${D('prop_chains')}" alt=""><span class="hs-bin"><span class="hs-bt">目前委託</span>${img('v'+(i+1),'hs-vimg')}<b>1-${i+1} ${v.name}</b><span class="small">${CATS[v.cat]}・戰力 ${v.req}</span><i class="cb-bar"><i style="width:${f*100}%"></i></i><span class="small">${f>=1?'可以交付了 ›':'最強 '+best+'/'+v.req}</span></span></button>`}
  return obj('hs-rack','prop_rack','sheetA','學徒管理','nav_armory')+obj('hs-anvil','prop_anvil','sheetW','工坊升級','nav_forge')+obj('hs-coal','prop_coal','sheetM','熔解回收','mat_shard')+board}
// 版型 F 上橫幅＋下工具列：委託一行橫幅貼在上緣，三顆功能鈕排在下緣霧氣上
function heroRibbon(){const i=S.villages.findIndex(v=>v.status==='open');let rb='';
  if(i>=0){const v=VILLAGES[i],best=S.weapons.filter(w=>bpOf(w).cat===v.cat).reduce((m,w)=>Math.max(m,power(w)),0),f=Math.min(1,best/v.req);
    rb=`<button class="hf-rib ${f>=1?'ok':''}" data-act="tab" data-k="village">${img('v'+(i+1),'hf-img')}<span class="hf-t"><span class="small">目前委託</span><b>1-${i+1} ${v.name}・${CATS[v.cat]} ${best}/${v.req}</b></span><i class="cb-bar"><i style="width:${f*100}%"></i></i><span class="hf-go">前往 ›</span></button>`}
  return rb+`<div class="hf-bar">${btn(img('nav_forge')+'<span>工坊升級</span>','sheetW',{cls:'hf-btn'})}${btn(img('nav_armory')+'<span>學徒管理</span>','sheetA',{cls:'hf-btn'})}${btn(img('mat_shard')+'<span>熔解回收</span>','sheetM',{cls:'hf-btn'})}</div>`}
// 委託縮小成徽章（版型 B）：村莊縮圖＋進度，點一下前往村莊
function commBadge(){const i=S.villages.findIndex(v=>v.status==='open');if(i<0)return '';const v=VILLAGES[i],best=S.weapons.filter(w=>bpOf(w).cat===v.cat).reduce((m,w)=>Math.max(m,power(w)),0),f=Math.min(1,best/v.req);
  return `<button class="comm-badge ${f>=1?'ok':''}" data-act="tab" data-k="village">${img('v'+(i+1),'cb-img')}<span class="cb-t"><b>1-${i+1} ${v.name}</b><span class="small">${CATS[v.cat]} ${best}/${v.req}</span></span><i class="cb-bar"><i style="width:${f*100}%"></i></i></button>`}
function viewForge(){
  const done=S.jobs.filter(j=>NOW()>=j.end).length;
  const tabs=[['bp','圖紙'],['mat','材料'],['queue',`鍛造中 (${S.jobs.length}/${S.slots})`]];
  let body='';
  if(ui.ftab==='bp'){
    const cats=['all',...Object.keys(CATS).filter(c=>BPS.some(b=>b.cat===c&&cleared()>=b.unlock))];
    const list=BPS.filter(b=>(ui.cat==='all'||b.cat===ui.cat)&&(cleared()+1>=b.unlock||b.t===0));
    const b=BP[ui.bp],lock=bpLock(b),qty=bulkOn()?Math.min(ui.qty,10):1,c=recipe(b),g=goldOf(b)*qty,free=S.jobs.length<S.slots;
    const need={};for(const k in c)need[k]=c[k]*qty;const full=S.weapons.length+queuedQty()+qty>CAP_WEAPONS;
    const lacks=lackList(need,g),ok=!lock&&free&&!lacks.length&&!full;const est=Math.round(b.base*TIERS[b.t].mult);
    const why=lock||(!free?'學徒都在忙，先等佇列完成':full?'武器庫已滿':lacks.length?'缺 '+lackStr(lacks):'');
    const lackTxt=lacks.map(([k,n])=>`<b>${k==='gold'?'金幣':MATS[k]} ×${fmt(n)}</b>`).join('、'),lackT1=lacks.some(([k])=>SHOP_MATS.some(x=>x[0]===k));
    body=`<div class="catbar">${cats.map(k=>`<button class="ui-btn ui-btn--toggle cat ${ui.cat===k?'on':''}" data-act="cat" data-k="${k}">${img(k==='all'?'nav_armory':CAT_ICON[k])}<span>${k==='all'?'全部':CATS[k]}</span></button>`).join('')}</div>
     <div class="hscroll">${list.map(x=>bpTile(x,x.id===ui.bp)).join('')}</div>
     <div class="ui-panel panel sel-bp">
      <div class="ui-card sel-head"><div class="sel-art">${wArt(b.id,{frame:TIER_FRAME[b.t]})}</div>
       <div class="grow"><div class="label">已選擇</div><h3>${b.n}</h3><div class="small muted">${TIERS[b.t].n}・${CATS[b.cat]}類</div><div class="small">安定值 <b class="${TIERS[b.t].stable?'t-ok':'t-danger'}">+${TIERS[b.t].stable}</b></div>
        <div class="powbox inline"><span class="small muted">基礎戰力</span><b>${est}～${Math.round(est*2.3)}</b></div></div></div>
      ${b.inn?`<div><span class="aff inn">天生・${AFFIX[b.inn[0]].n} +${b.inn[1]}%</span></div>`:''}
      ${lock?`<div class="goal">${lock}</div>`:`
      <div class="label">所需材料（×${qty}）</div><div class="mats">${Object.entries(need).map(([k,n])=>matBox(k,n)).join('')}<div class="matbox need ${S.gold<g?'lack':'ok'}">${img('it_gold')}<span class="mb-n">金幣</span><span class="mb-have">持有 ${fmt(S.gold)}</span><span class="mb-need">需要 ${fmt(g)}</span></div></div>
      <div class="qtyrow"><span class="label">數量</span>${bulkOn()?[1,5,10].map(n=>`<button class="ui-btn ui-btn--chip qchip ${qty===n?'on':''}" data-act="qty" data-k="${n}">×${n}</button>`).join('')+`<button class="ui-btn ui-btn--chip qchip ${qty===maxQty()&&![1,5,10].includes(qty)?'on':''}" data-act="qty" data-k="${maxQty()}">最多 ×${maxQty()}</button>`:'<span class="small muted">收復 1-5 後可一次鍛造多把</span>'}
       <span class="small muted grow right">${fmtT(forgeSec(b)*1000*(qty>1?qty*.6:1)/S.speed)}</span></div>
      ${S.items.blueprint?`<label class="toggle">${img('it_blueprint')}<input type="checkbox" id="usebp" ${ui.useBp?'checked':''}>使用傳說圖紙（剩 ${S.items.blueprint}，第一把保證傳說）</label>`:''}
      ${lackTxt?`<div class="lack-line">缺少：${lackTxt}${lackT1?` ${btn('到商人購買','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}`:''}</div>`:''}
      `}</div>
     ${lock?'':`<div class="ui-card ui-card--bar forge-bar"><div class="fb-info">${wArt(b.id,{cls:'fb-img'})}<span><b>${b.n} ×${qty}</b><span class="small ${ok?'muted':'t-danger'}">${ok?`${fmt(g)} 金・${fmtT(forgeSec(b)*1000*(qty>1?qty*.6:1)/S.speed)}`:why}</span></span></div>
      <button class="ui-btn ui-btn--primary btn btn-primary ${ok?'':'is-disabled'}" data-act="forge" ${ok?'':'aria-disabled="true"'}>開始鍛造</button></div>`}`;
  }else if(ui.ftab==='mat'){
    body=`<div class="ui-panel panel">${ptitle('材料倉庫')}<div class="small muted">點一下材料可以看用途和取得方式。</div><div class="matgrid">${Object.keys(MATS).map(k=>matBox(k)).join('')}</div>
     <div class="row small muted"><span>鍛造殘渣 ${S.slag}</span><span>防爆卷 ${S.items.scroll}</span><span>祝福石 ${S.items.bless}</span><span>傳說圖紙 ${S.items.blueprint}</span></div>
     <div class="small muted">一階材料可以到商城向旅行商人購買或賣出；高階材料靠村莊狩獵取得。</div></div>`;
  }else{
    body=`<div class="ui-panel panel">${ptitle(`鍛造佇列（學徒 ${S.jobs.length}/${S.slots}）`)}${S.jobs.length?S.jobs.map((j,n)=>`<div class="ui-card ui-card--row qrow">${wArt(j.b,{cls:'qimg'})}<div class="grow"><div class="row small"><b class="grow">${BP[j.b].n}${j.qty>1?' ×'+j.qty:''}${j.bp?'・傳說圖紙':''}</b><span class="num" data-jtime="${n}">${NOW()>=j.end?'完成':'剩 '+fmtT(j.end-NOW())}</span></div><div class="ui-prog prog"><i data-jprog="${n}" style="width:${Math.max(0,Math.min(100,(NOW()-j.start)/(j.end-j.start)*100))}%"></i></div></div>${btn('取消','cancelJob',{cls:'btn-sec sm',attrs:`data-i="${n}"`})}</div>`).join('')+'<div class="small muted">取消會全額退回材料與金幣。完成後自動放進武器庫。</div>'
      :'<div class="empty">鐵砧空著。到「圖紙」挑一把開始鍛造。</div>'}
     ${S.slots<4?btn(`雇用學徒（${fmt(SLOT_COST[S.slots])} 金）`,'hire',{dis:S.gold<SLOT_COST[S.slots]}):''}</div>`;
  }
  // v3.17 景深圖層（AI 分層素材 art/dp/）：遠景 → 爐火光暈 → 中景淬火桶＋蒸氣 → 鐵匠 → 地面霧 → 火星 → 前景鐵鍊／炭火桶／鎚子（模糊）
  const D=n=>A('dp/'+n),dpEmb=[0,1,2,3,4,5,6,7].map(k=>`<img class="dp-em e${k}" src="${D(['fx_ember1','fx_ember_trail','fx_ember1','fx_ember_big','fx_ember1','fx_ember_trail','fx_ember_cluster','fx_ember1'][k])}" alt="">`).join('');
  const hv=ui.heroV||'F';   // v3.18 主畫面版型：正式採用 F（上橫幅＋下工具列）；開發模式可切換 O/A～E 比較
  const sideH=`<div class="side">${btn(img('nav_forge')+'<span>工坊升級</span>','sheetW',{cls:'side-btn'})}${btn(img('nav_armory')+'<span>學徒管理</span>','sheetA',{cls:'side-btn'})}${btn(img('mat_shard')+'<span>熔解回收</span>','sheetM',{cls:'side-btn'})}</div>`;
  const fv=ui.forgeV||'O';   // v3.19 鐵匠鋪內容頁預覽：O 原版／1 主畫面縮成橫條／2 主畫面收起（只在鍛造中分頁顯示）
  return `<section class="hero hv-${hv} fv-${fv} ft-${ui.ftab}"><img class="dp dp-far" src="${D('forge_far')}" alt=""><img class="dp dp-glow" src="${D('forge_fireglow')}" alt=""><img class="dp dp-glow g2" src="${D('forge_fireglow')}" alt=""><img class="dp dp-barrel" src="${D('prop_barrel')}" alt=""><img class="dp dp-steam" src="${D('fx_smoke_wisp')}" alt="">${img('smith','smith','鐵匠')}<div class="dp dp-fog"></div><div class="dp dp-embers">${dpEmb}</div><img class="dp dp-fg dp-chains" src="${D('prop_chains')}" alt=""><img class="dp dp-fg dp-coal" src="${D('prop_coal')}" alt=""><img class="dp dp-fg dp-hammer" src="${D('prop_hammer')}" alt="">
   ${hv==='C'||hv==='E'||hv==='F'?'':sideH}${hv==='C'||hv==='E'||hv==='F'?'':hv==='B'?commBadge():commissionCard()}${hv==='E'?heroScene():''}${hv==='F'?heroRibbon():''}</section>${hv==='C'?`<div class="hero-info">${sideH}${commissionCard()}</div>`:''}
  <div class="subtabs">${tabs.map(([k,n])=>`<button class="ui-tab ${ui.ftab===k?'on':''}" data-act="ftab" data-k="${k}">${n}${k==='queue'&&done||k==='bp'&&BPS.some(bpNew)?'<i class="dot"></i>':''}</button>`).join('')}</div>${body}`;
}
function sheetWorkshop(kind){
  const head=t=>`<div class="sheet-head"><h2>${t}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  if(kind==='a')return head('學徒管理')+`<div class="ui-panel panel"><div class="row">${img('nav_armory','big-ico')}<div class="grow"><b>學徒 ${S.slots}/4</b><div class="small muted">每位學徒多一條鍛造佇列，可同時鍛造多批。</div></div></div>
    <div class="row">${[1,2,3,4].map(n=>`<span class="slot-pill ${n<=S.slots?'on':''}">${n<=S.slots?(S.jobs[n-1]?'鍛造中':'閒置'):'未雇用'}</span>`).join('')}</div>
    ${S.slots<4?btn(`雇用第 ${S.slots+1} 位學徒（${fmt(SLOT_COST[S.slots])} 金）`,'hire',{cls:'btn-primary',dis:S.gold<SLOT_COST[S.slots]}):'<div class="small t-ok">學徒已滿</div>'}</div>`;
  if(kind==='m'){const l=cheapList();return head('熔解回收')+`<div class="ui-panel panel"><div class="small">一鍵熔解只會處理：+0、普通或精良、沒有先天特性、沒有收藏、閒置中的武器。</div>
    <div class="kv"><span>符合條件</span><b>${l.length} 把</b></div>${btn(l.length?`熔解 ${l.length} 把`:'沒有可熔解的武器','meltCheap',{cls:'btn-danger',dis:!l.length})}
    <div class="small muted">熔解可回收 30% 材料、一半鍛造金幣，25% 機率得到符文碎片。單把熔解請到武器詳細頁。</div></div>`}
  return head('工坊升級')+`<div class="ui-panel panel"><div class="row">${img('nav_forge','big-ico')}<div class="grow"><b>熔爐 Lv${S.furnace}</b><div class="small muted">Lv2 霜銀、Lv4 龍鱗、Lv5 神器；每級鍛造時間 −10%</div></div></div>
    ${S.furnace<5?btn(`升級熔爐（${fmt(FURNACE_COST[S.furnace])} 金）`,'up',{cls:'btn-primary',attrs:'data-k="furnace"',dis:S.gold<FURNACE_COST[S.furnace]}):'<div class="small t-ok">已滿級</div>'}</div>
   <div class="ui-panel panel"><div class="row">${img('nav_armory','big-ico')}<div class="grow"><b>鐵砧 Lv${S.anvil}</b><div class="small muted">提高高品質機率；Lv3 開附魔第 3 格、Lv5 開第 4 格</div></div></div>
    <div class="qbar">${qualWeights(false,0).map((x,i)=>`<span class="q${i}" style="flex:1">${QUAL[i].n}<br>${x/10}%</span>`).join('')}</div>
    ${S.anvil<5?btn(`升級鐵砧（${fmt(ANVIL_COST[S.anvil])} 金）`,'up',{cls:'btn-primary',attrs:'data-k="anvil"',dis:S.gold<ANVIL_COST[S.anvil]}):'<div class="small t-ok">已滿級</div>'}</div>`;
}

/* ---------- 武器庫 ---------- */
const SORTS={power:['戰力',(a,b)=>power(b)-power(a)],q:['品質',(a,b)=>b.q-a.q||power(b)-power(a)],lv:['強化等級',(a,b)=>b.lv-a.lv||power(b)-power(a)],
  cat:['類別',(a,b)=>bpOf(a).cat.localeCompare(bpOf(b).cat)||power(b)-power(a)],post:['駐守優先',(a,b)=>(where(b)>=0)-(where(a)>=0)||power(b)-power(a)],recent:['取得時間',(a,b)=>b.created-a.created||b.id-a.id]};
function viewArmory(){
  const aq=ui.aq||'all',ast=ui.ast||'all';
  const stOk=w=>ast==='all'||(ast==='idle'&&where(w)<0)||(ast==='post'&&where(w)>=0)||(ast==='lock'&&w.lock)||(ast==='test'&&w.test);
  const ws=S.weapons.filter(w=>(ui.acat==='all'||bpOf(w).cat===ui.acat)&&(aq==='all'||w.q===+aq)&&stOk(w)).sort(SORTS[ui.asort][1]);
  const filtered=ui.acat!=='all'||aq!=='all'||ast!=='all';
  return `<div class="arm-head"><div class="pagehead"><h2>武器庫</h2><span class="num ${S.weapons.length>=CAP_WEAPONS?'t-danger':''}">${S.weapons.length}/${CAP_WEAPONS}</span></div>
  <div class="catbar">${['all',...Object.keys(CATS)].map(k=>`<button class="ui-btn ui-btn--toggle cat ${ui.acat===k?'on':''}" data-act="acat" data-k="${k}">${img(k==='all'?'nav_armory':CAT_ICON[k])}<span>${k==='all'?'全部':CATS[k]}</span></button>`).join('')}</div>
  <div class="filters3"><label class="sel"><span>排序</span><select id="asort">${Object.entries(SORTS).map(([k,[n]])=>`<option value="${k}" ${ui.asort===k?'selected':''}>${n}</option>`).join('')}</select></label>
   <label class="sel"><span>品質</span><select id="aq"><option value="all">全部</option>${QUAL.map((q,i)=>`<option value="${i}" ${aq===String(i)?'selected':''}>${q.n}</option>`).join('')}</select></label>
   <label class="sel"><span>狀態</span><select id="ast">${[['all','全部'],['idle','閒置'],['post','駐守'],['lock','收藏'],['test','測試']].map(([k,n])=>`<option value="${k}" ${ast===k?'selected':''}>${n}</option>`).join('')}</select></label></div>
  ${filtered?`<div class="filterbar"><span>顯示 ${ws.length}／${S.weapons.length} 把</span><button class="ui-btn ui-btn--chip chipbtn on" data-act="aclear">${ic('clear')} 清除篩選，顯示全部</button></div>`:''}</div>
  <div class="wlist">${ws.length?`<div class="wgrid">${(gm=>ws.map(w=>wTile(w,`data-act="wopen" data-id="${w.id}"`,canGive(w,gm))).join(''))(giveMin())}</div>`
   :S.weapons.length?`<div class="empty-state">${img(ui.acat==='all'?'nav_armory':CAT_ICON[ui.acat])}<b>${ui.acat!=='all'?`目前沒有此類武器（${CATS[ui.acat]}）`:'目前沒有符合條件的武器'}</b><span class="small muted">可以返回全部武器，或直接去鍛造。</span>${btn('顯示全部武器','aclear',{cls:'btn-primary'})}${ui.acat!=='all'?btn(`去鍛造${CATS[ui.acat]}`,'forgeCat',{attrs:`data-k="${ui.acat}"`}):''}</div>`
   :`<div class="empty-state">${img('nav_forge')}<b>武器庫是空的</b><span class="small muted">先到鐵匠鋪鍛造第一把武器。</span>${btn('前往鐵匠鋪','tab',{cls:'btn-primary',attrs:'data-k="forge"'})}</div>`}</div>`;
}
function sheetWeapon(id,mode){
  const w=W(id);if(!w){const last=ui.enhLast&&ui.enhLast.id===id&&ui.enhLast.k==='broke'?ui.enhLast:null;
    if(last)return `<div class="sheet-head"><span style="width:44px"></span><h2>強化</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`
      +stageHtml({art:null,danger:true,from:'?',to:'?',zone:'武器已碎裂',ribbon:`<b>${last.t}</b><span>${last.d}</span>`,rk:'broke'})
      +`<div class="acts3">${btn('回武器庫','backArmory',{cls:'btn-primary big'})}${btn('去鐵匠鋪','tab',{cls:'btn-sec big',attrs:'data-k="forge"'})}</div>`;
    return`<div class="sheet-head"><h2>武器詳情</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img'})}</div><div class="empty">這把武器已經不在了。</div>`}
  const b=bpOf(w),i=where(w),highValue=w.lock||w.q>=2||w.lv>=3||b.t>=2||(w.traits||[]).length>=2;
  const title={main:'武器詳情',enh:'強化',ench:'附魔',give:'交給村莊'}[mode];
  const head=`<div class="sheet-head">${mode==='main'?'<span style="width:44px"></span>':btn(img('ic_back'),'wmode',{cls:'icon-btn img',attrs:`data-m="main" data-id="${id}" aria-label="返回"`})}<h2>${title}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  const showcase=(extra='')=>`<div class="ui-card ui-card--feature showcase q${w.q}b ${extra}">
   <div class="sc-top"><div><h2 class="q${w.q}">${b.n} <span class="lvt">+${w.lv}</span></h2><span class="qpill q${w.q}b">${QUAL[w.q].n}</span></div>
    <button class="ui-iconbtn icon-btn img" data-act="lock" data-id="${id}" aria-label="${w.lock?'取消收藏':'收藏'}">${img(w.lock?'ic_lock':'ic_unlock')}</button></div>
   <div class="sc-art">${wArt(b.id,{cls:'sc-w'})}</div>
   <div class="sc-bot"><span class="small">${TIERS[b.t].n}・${CATS[b.cat]}・安定值 <b class="${stable(w)?'t-ok':'t-danger'}">+${stable(w)}</b>${i>=0?`・<span class="t-ok">駐守 1-${i+1}</span>`:''}</span><div class="powbox"><span class="small muted">戰力</span><b>${fmt(power(w))}</b></div></div></div>`;
  if(mode==='main'){
    // v3.15 精簡版：上方橫式武器卡＋特性／附魔一張面板＋按鈕；數值明細收進「詳細資訊」
    const el=affixVal(w,'flame')+affixVal(w,'frost'),s=stable(w),nE=w.ench.filter(Boolean).length;
    const traits=[...(w.traits||[]).map(t=>`<button class="wd-chip tap" data-act="trinfo" data-k="${t.k}" data-v="${t.v}">${img(TRAIT_ICON[t.k])}${TRAITS[t.k].n} <b>+${t.v}%</b><i>ⓘ</i></button>`),
      ...(b.inn?[`<span class="wd-chip inn">${img(AFFIX_ICON[b.inn[0]])}天生・${AFFIX[b.inn[0]].n} <b>+${b.inn[1]}%</b></span>`]:[])];
    const canAuto=i<0&&s>0&&w.lv<s;
    return head+`<div class="ui-card ui-card--feature wd-head q${w.q}b">
      <div class="wd-art">${wArt(b.id,{frame:w.q})}</div>
      <div class="wd-info"><h2 class="q${w.q}">${b.n} <span class="lvt">+${w.lv}</span></h2>
       <div class="wd-tags"><span class="qpill q${w.q}b">${QUAL[w.q].n}</span>${i>=0?`<span class="t-ok small">駐守 1-${i+1}</span>`:''}</div>
       <div class="small muted">${TIERS[b.t].n}・${CATS[b.cat]}・<span class="nw">安定值 <b class="${s?'t-ok':'t-danger'}">+${s}</b></span></div>
       <div class="wd-pow"><span class="small muted">戰力</span><b>${fmt(power(w))}</b></div></div>
      <button class="ui-iconbtn icon-btn img wd-lock" data-act="lock" data-id="${id}" aria-label="${w.lock?'取消收藏':'收藏'}">${img(w.lock?'ic_lock':'ic_unlock')}</button></div>
     <div class="ui-panel panel wd-sub">
      <div class="wd-row"><span class="wd-k">特性</span><div class="wd-chips">${traits.length?traits.join(''):'<span class="small muted">沒有先天特性</span>'}</div></div>
      <div class="wd-row"><span class="wd-k">附魔 ${nE}/4</span><div class="slots wd-slots">${[0,1,2,3].map(x=>slotHtml(w,x,false)).join('')}</div></div>
      <details class="wd-more"><summary>詳細資訊</summary>
       <div class="kvgrid">${kv('基礎戰力',b.base)}${kv('品質倍率','×'+QUAL[w.q].m)}${kv('材質階級',TIERS[b.t].n+' ×'+TIERS[b.t].mult)}${kv('強化倍率','×'+enhMult(w.lv).toFixed(2))}${kv('元素加成',el?'+'+Math.round(el*10)/10+'%':'—')}${kv('最終戰力','<span class="t-gold">'+fmt(power(w))+'</span>')}</div>
       ${(w.traits||[]).map(t=>`<div class="small"><b>${TRAITS[t.k].n}</b>：<span class="muted">${TRAITS[t.k].d}</span></div>`).join('')}
       ${b.inn?'<div class="small"><b>天生詞條</b>：<span class="muted">怪物素材打造的神器詞條</span></div>':''}</details></div>
     ${canAuto?(()=>{const lack=!w.test&&S.gold<enhCost(w);return `<button class="ui-btn ui-btn--accent btn wd-auto" data-act="autoEnh" data-id="${id}" ${lack?'disabled':''}><span>${lack?'金幣不足，無法一鍵強化':'一鍵強化到安定值 <b>+'+s+'</b>'}</span><span class="small">${w.test?'測試武器免費':'約 '+fmt(autoEnhCost(w))+' 金・持有 '+fmt(S.gold)}${lack?'':'・不會爆裝'}</span></button>`})():''}
     <div class="acts2">${btn('強化','wmode',{cls:'btn-primary big',attrs:`data-m="enh" data-id="${id}"`,dis:i>=0})}${btn('附魔','wmode',{cls:'btn-primary big',attrs:`data-m="ench" data-id="${id}"`,dis:i>=0})}</div>
     <div class="acts3">${i>=0?btn('收回','recall',{attrs:`data-i="${i}"`}):btn('交給村莊'+(canGive(w)?'<i class="dot give-dot"></i>':''),'wmode',{attrs:`data-m="give" data-id="${id}"`})}
      ${btn(ui.meltArm===id?'再按一次確認':'熔解','melt',{cls:'btn-danger',attrs:`data-id="${id}"`,dis:i>=0||w.lock})}</div>
     <div class="small muted center">${i>=0?'駐守中的武器要先收回，才能強化、附魔或熔解。':w.lock?'已收藏的武器不能熔解，先點右上角鎖頭解除收藏。':highValue?'高價值武器，熔解後無法復原。':'熔解回收 30% 材料與一半鍛造金幣。'}</div>`;
  }
  if(i>=0&&mode!=='give')return head+showcase()+`<div class="goal">這把武器正在 ${VILLAGES[i].name} 駐守，要先收回。</div>${btn('從村莊收回','recall',{cls:'btn-primary big',attrs:`data-i="${i}"`})}`;
  if(mode==='enh'){
    const last=ui.enhLast&&ui.enhLast.id===id?ui.enhLast:null,rib=last?`<b>${last.t}</b><span>${last.d}</span>`:'';
    const nameRow=`<div class="enh-name"><b class="q${w.q}">${b.n}</b><span class="qpill q${w.q}b">${QUAL[w.q].n}</span>${w.test?'<span class="testtag">測試</span>':''}</div>`;
    if(w.lv>=15)return head+nameRow+stageHtml({art:A(b.id),from:15,to:15,zone:'已達最高等級',ribbon:rib,rk:last&&last.k})+'<div class="goal">已達最高等級 +15。</div>';
    const hasBl=!!w.test||S.items.bless>0,hasSc=!!w.test||S.items.scroll>0;   // 道具用完：不能勾選（保留玩家的勾選偏好，買回來自動恢復）
    const next=w.lv+1,danger=next>stable(w),bl=ui.useBless&&hasBl,sc=ui.useScroll&&danger&&hasSc;
    const r=Math.min(1,RATE[next]+(bl?.1:0)),bc=breakChance(w,next),total=(1-r)*bc,cost=enhCost(w),free=!!w.test;
    const lackGold=!free&&S.gold<cost,lackBless=bl&&!free&&S.items.bless<1,lackScroll=sc&&!free&&S.items.scroll<1;
    const unguarded=danger&&!sc,armed=unguarded&&!w.test&&ui.riskArm===id&&ui.riskOk!==id;
    const label=ui.busy?'強化中…':lackGold?'金幣不足':lackBless?'祝福石不足':lackScroll?'防爆卷不足':armed?`確認強化（可能爆裝 ${pct(total)}）`:`${last?'再次強化':'強化'} +${w.lv} → +${next}`;
    const el=affixVal(w,'flame')+affixVal(w,'frost');
    const ev=ui.enhV||'2';   // v3.19 強化頁版型預覽：O 原版／1 壓縮／2 資訊疊在石碑上／3 左右分欄
    if(ev!=='O'){
      const canAuto=!danger&&w.lv<stable(w),stage=stageHtml({art:A(b.id),danger,from:w.lv,to:next,zone:danger?`危險區`:`安定區`,ribbon:rib,rk:last&&last.k});
      const st=[['成功率',`<b class="t-ok">${pct(r)}</b>`,bl?'含祝福 +10%':''],['爆裝率',`<b class="${danger&&!sc?'t-danger':'t-ok'}">${danger?(sc?'0%':pct(total)):'0%'}</b>`,danger?(sc?'防爆保護':'失敗 '+pct(bc)):'安定區'],
        ['戰力',`<b>${fmt(power(w))}<small>→</small><span class="t-gold">${fmt(power(w,next))}</span></b>`,''],['費用',`<b class="${lackGold?'t-danger':''}">${free?'免費':fmt(cost)}</b>`,'持有 '+fmt(S.gold)]];
      const stats=cls=>`<div class="ev-stats ${cls}">${st.map(([k,v,s])=>`<div class="ev-st ${k==='爆裝率'&&danger?(sc?'guard':'risk'):''}"><span>${k}</span>${v}${s?`<i>${s}</i>`:''}</div>`).join('')}</div>`;
      const tg=`<div class="ev-tgls"><label class="ev-tgl ${bl?'on':''} ${hasBl?'':'off'}">${img('it_bless')}<span>祝福石<i>${hasBl?'剩 '+S.items.bless:'已用完'}</i></span><input type="checkbox" id="usebless" ${bl?'checked':''} ${hasBl?'':'disabled'}></label>
        <label class="ev-tgl ${sc?'on':''} ${danger&&hasSc?'':'off'}">${img('it_scroll')}<span>防爆卷<i>${!danger?'安定區不需要':hasSc?'剩 '+S.items.scroll:'已用完'}</i></span><input type="checkbox" id="usescroll" ${sc?'checked':''} ${danger&&hasSc?'':'disabled'}></label></div>`;
      const warn=danger?(sc?`<div class="ev-warn guard guardline">${img('it_scroll')}防爆卷保護中：爆裝時武器保留</div>`:`<div class="ev-warn risk warn"><span class="grow"><b>沒有防爆卷保護</b>：爆裝會永久失去武器（${pct(total)}）</span>${hasSc?'':btn('去商城','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}</div>`):'';
      const lack=lackScroll||lackBless?`<div class="lack-line">${lackScroll?'防爆卷用完了。':'祝福石用完了。'}${btn(lackScroll?'取消防爆卷':'取消祝福石','noItem',{cls:'btn-sec sm',attrs:`data-k="${lackScroll?'useScroll':'useBless'}"`})}${btn('去商城','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}</div>`:'';
      const lab=ui.busy?'強化中…':lackGold?'金幣不足':lackBless?'祝福石不足':lackScroll?'防爆卷不足':armed?`確認強化（${pct(total)} 爆裝）`:`${last?'再次強化':'強化'} +${w.lv}→+${next}`;
      const bar=`<div class="ev-bar ${canAuto?'two':''}"><button class="ui-btn ${unguarded?'ui-btn--danger':'ui-btn--primary'} btn ${unguarded?'btn-risk':'btn-primary'} big" data-act="enhance" data-id="${id}" ${ui.busy||lackGold||lackBless||lackScroll?'disabled':''}>${lab}</button>
        ${canAuto?`<button class="ui-btn ui-btn--accent btn wd-auto ev-auto" data-act="autoEnh" data-id="${id}" ${ui.busy||lackGold?'disabled':''}><span>${lackGold?'金幣不足':'一鍵到 <b>+'+stable(w)+'</b>'}</span><span class="small">約 ${fmt(autoEnhCost(w))} 金</span></button>`:''}</div>
        ${armed?'<div class="small t-danger center">沒有防爆卷保護，再按一次確認。</div>':''}`;
      const info=`<details class="enh-more ev-more"><summary>ⓘ 規則與戰力明細</summary><div class="kvgrid">${kv('安定值','+'+stable(w)+'（'+TIERS[b.t].n+'）')}${kv('失敗後爆裝率',danger?pct(bc):'0%')}${kv('基礎成功率',pct(RATE[next]))}${kv('失敗率',pct(1-r))}</div>
        <div class="small"><b>規則</b>：失敗不會降級。超過安定值時失敗才會判定爆裝，機率 35% + 5% ×（目標等級 − 安定值 − 1），最高 80%。祝福石與防爆卷：勾選後每次強化消耗 1 張。</div></details>`;
      if(ev==='1')return head+`<div class="ev ev1">`+nameRow+stage+stats('row4')+tg+warn+lack+info+bar+`</div>`;
      if(ev==='2')return head+`<div class="ev ev2">`+nameRow+`<div class="ev2-wrap">${stage}${stats('over')}</div>`+tg+warn+lack+info+bar+`</div>`;
      if(ev==='3')return head+`<div class="ev ev3">`+nameRow+`<div class="ev3-grid">${stage}${stats('col')}</div>`+tg+warn+lack+info+bar+`</div>`;
    }
    return head+nameRow+stageHtml({art:A(b.id),danger,from:w.lv,to:next,zone:danger?`危險區`:`安定區`,ribbon:rib,rk:last&&last.k})
     +`<div class="enh-core"><div><span>成功率</span><b class="t-ok">${pct(r)}</b>${bl?'<i>含祝福石 +10%</i>':''}</div>
       <div class="${danger?(sc?'guard':'risk'):''}"><span>本次爆裝機率</span><b class="${danger&&!sc?'t-danger':'t-ok'}">${danger?(sc?'0%':pct(total)):'0%'}</b><i>${danger?(sc?'防爆卷保護中':'失敗時 '+pct(bc)+' 爆裝'):'安定區不會爆裝'}</i></div>
       <div><span>成功後戰力</span><b>${fmt(power(w))} → <span class="t-gold">${fmt(power(w,next))}</span></b></div>
       <div><span>強化費用</span><b class="${lackGold?'t-danger':''}">${free?'測試免費':fmt(cost)+' 金'}</b><i>持有 ${fmt(S.gold)}</i></div></div>
     ${danger?(sc?`<div class="guardline">${img('it_scroll')}本次已受防爆卷保護：強化會消耗 1 張防爆卷，若判定爆裝，武器保留。</div>`
       :`<div class="warn"><b>武器可能永久消失</b>：本次爆裝機率 ${pct(total)}。勾選防爆卷可以保住武器。</div>`):''}
     <div class="opts"><label class="ui-card optcard ${bl?'on':''} ${lackBless?'lack':''}">${img('it_bless')}<span><b>祝福石</b><span class="small ${S.items.bless?'muted':'t-danger'}">成功率 +10%・剩 ${S.items.bless}</span></span><input type="checkbox" id="usebless" ${bl?'checked':''}></label>
      <label class="ui-card optcard ${sc?'on':''} ${danger?'':'off'} ${lackScroll?'lack':''}">${img('it_scroll')}<span><b>防爆卷</b><span class="small ${S.items.scroll||!danger?'muted':'t-danger'}">${danger?'每次強化消耗 1 張':'安定區不需要'}・剩 ${S.items.scroll}</span></span><input type="checkbox" id="usescroll" ${ui.useScroll?'checked':''} ${danger?'':'disabled'}></label></div>
     <button class="ui-btn ${unguarded?'ui-btn--danger':'ui-btn--primary'} btn ${unguarded?'btn-risk':'btn-primary'} big" data-act="enhance" data-id="${id}" ${ui.busy||lackGold||lackBless||lackScroll?'disabled':''}>${label}</button>
     ${!danger&&w.lv<stable(w)?`<button class="ui-btn ui-btn--accent btn wd-auto" data-act="autoEnh" data-id="${id}" ${ui.busy||lackGold?'disabled':''}><span>${lackGold?'金幣不足，無法一鍵強化':'一鍵強化到安定值 <b>+'+stable(w)+'</b>'}</span><span class="small">${free?'測試武器免費':'約 '+fmt(autoEnhCost(w))+' 金・持有 '+fmt(S.gold)}${lackGold?'':'・不會爆裝'}</span></button>`:''}
     ${lackScroll||lackBless?`<div class="lack-line">${lackScroll?'勾選了防爆卷，但已經用完。':'勾選了祝福石，但已經用完。'}${btn(lackScroll?'取消防爆卷':'取消祝福石','noItem',{cls:'btn-sec sm',attrs:`data-k="${lackScroll?'useScroll':'useBless'}"`})}${btn('去商城補充','tab',{cls:'btn-sec sm',attrs:'data-k="shop"'})}</div>`:''}
     ${armed?'<div class="small t-danger center">沒有防爆卷保護。再按一次確認，本次進入強化頁之後不會再問。</div>':''}
     <details class="enh-more"><summary>詳細說明</summary>
      <div class="kvgrid">${kv('安定值','+'+stable(w)+'（'+TIERS[b.t].n+'）')}${kv('失敗後爆裝率',danger?pct(bc):'0%')}${kv('基礎成功率',pct(RATE[next]))}${kv('失敗率',pct(1-r))}</div>
      <div class="small"><b>戰力組成</b>：基礎 ${b.base} × 材質 ${TIERS[b.t].mult} × 品質 ${QUAL[w.q].m} × 強化 ${enhMult(w.lv).toFixed(2)}${el?` × 元素 ${(1+el/100).toFixed(3)}`:''} ＝ ${fmt(power(w))}</div>
      <div class="small"><b>強化倍率</b>：+0～+6 為 1 + 0.1 × 等級；+7～+15 為 1.6 + 0.18 ×（等級 − 6）。+${next} 倍率 ${enhMult(next).toFixed(2)}。</div>
      <div class="small"><b>規則</b>：失敗不會降級。目標等級超過安定值時，失敗才會判定爆裝，機率為 35% + 5% ×（目標等級 − 安定值 − 1），最高 80%。祝福石與防爆卷：只要勾選，每次強化都會消耗 1 張（防爆卷只在危險區使用）。</div></details>`;
  }
  if(mode==='ench'){const s=ui.enchSlot,open=slotOpen(s),c1=enchCost(w),c2=enchCost(w,true);
    const nv=ui.enchV||'2';   // v3.19 附魔頁版型預覽：O 原版／1 切換一般・指定／2 詞條橫列＋底部雙按鈕
    if(nv!=='O'){const md=ui.enchMode||'r',mini=`<div class="nv-head">${wArt(b.id,{frame:w.q,cls:'nv-art'})}<div class="grow"><b class="q${w.q}">${b.n} +${w.lv}</b><div class="small muted">符文碎片 ${S.mats.shard}・金幣 ${fmt(S.gold)}${traitVal(w,'runic')?`・符文親和 ×${runicMul(w).toFixed(2)}`:''}</div></div></div>`;
      const slots=`<div class="nv-sec"><span class="nv-k">選擇欄位</span><div class="slots nv-slots">${[0,1,2,3].map(k=>slotHtml(w,k,true)).join('')}</div></div>${open?'':`<div class="goal">鐵砧 Lv${SLOT_ANVIL[s]} 才能使用第 ${s+1} 格。</div>`}`;
      const aff=cls=>`<div class="affgrid ${cls}">${Object.entries(AFFIX).map(([k,a])=>`<button class="ui-card ui-card--option affpick ${ui.directKey===k?'on':''}" data-act="dkey" data-k="${k}">${img(AFFIX_ICON[k])}<span>${a.n}</span><span class="small muted">${a.min}～${a.max}%</span></button>`).join('')}</div>`;
      const bR=btn(`${w.ench[s]?'重抽':'一般附魔'}<span class="small">1 碎片＋${fmt(c1)} 金</span>`,'enchant',{cls:'btn-primary big nv-b',attrs:`data-id="${id}" data-s="${s}"`,dis:!open||S.mats.shard<1||S.gold<c1});
      const bD=btn(`指定 ${AFFIX[ui.directKey].n}<span class="small">4 碎片＋${fmt(c2)} 金</span>`,'enchantD',{cls:(nv==='2'?'btn-sec':'btn-primary')+' big nv-b',attrs:`data-id="${id}" data-s="${s}"`,dis:!open||S.mats.shard<4||S.gold<c2});
      if(nv==='1')return head+`<div class="ev nv1">${mini}${slots}<div class="nv-seg"><button class="${md==='r'?'on':''}" data-act="enchmode" data-k="r">一般附魔<i>隨機詞條</i></button><button class="${md==='d'?'on':''}" data-act="enchmode" data-k="d">指定附魔<i>選定詞條</i></button></div>
        ${md==='d'?aff('nv-aff'):`<div class="nv-desc small muted">隨機出現下列其中一種詞條，數值隨機：${Object.values(AFFIX).map(a=>a.n).join('、')}。</div>`}<div class="ev-bar">${md==='d'?bD:bR}</div></div>`;
      if(nv==='2')return head+`<div class="ev nv2">${mini}${slots}<div class="nv-sec col"><span class="nv-k">指定附魔的詞條</span>${aff('nv-row')}</div><div class="ev-bar two">${bR}${bD}</div></div>`;
    }
    return head+showcase('mini')+`<div class="ui-panel panel">${ptitle('選擇欄位')}<div class="slots">${[0,1,2,3].map(k=>slotHtml(w,k,true)).join('')}</div>
     ${traitVal(w,'runic')?`<div class="small t-ok">符文親和：附魔數值 ×${runicMul(w).toFixed(2)}</div>`:''}</div>
     <div class="ui-panel panel">${ptitle(`第 ${s+1} 格`)}${open?'':`<div class="goal">鐵砧 Lv${SLOT_ANVIL[s]} 才能使用這一格。</div>`}
      <div class="row"><div class="grow"><b>一般附魔</b><div class="small muted">隨機詞條・1 符文碎片＋${fmt(c1)} 金</div></div>${btn(w.ench[s]?'重抽':'附魔','enchant',{cls:'btn-primary',attrs:`data-id="${id}" data-s="${s}"`,dis:!open||S.mats.shard<1||S.gold<c1})}</div>
      <div class="row"><div class="grow"><b>指定附魔</b><div class="small muted">選定詞條、數值隨機・4 符文碎片＋${fmt(c2)} 金</div></div>${btn('指定','enchantD',{cls:'btn-sec',attrs:`data-id="${id}" data-s="${s}"`,dis:!open||S.mats.shard<4||S.gold<c2})}</div>
      <div class="affgrid">${Object.entries(AFFIX).map(([k,a])=>`<button class="ui-card ui-card--option affpick ${ui.directKey===k?'on':''}" data-act="dkey" data-k="${k}">${img(AFFIX_ICON[k])}<span>${a.n}</span><span class="small muted">${a.min}～${a.max}%</span></button>`).join('')}</div>
      <div class="small muted">持有符文碎片 ${S.mats.shard}</div></div>`;
  }
  if(mode==='give'){const vs=VILLAGES.map((v,k)=>[v,k]).filter(([v,k])=>v.cat===b.cat&&S.villages[k].status!=='locked');
    return head+showcase('mini')+`<div class="ui-panel panel">${ptitle(`可交付的村莊（${CATS[b.cat]}類）`)}${vs.length?vs.map(([v,k])=>{const ok=eligible(k,w),st=S.villages[k],cur=st.weaponId!=null&&W(st.weaponId);
      return `<button class="ui-card ui-card--row vrow ${ok?'':'dim'}" data-act="deliver" data-i="${k}" data-id="${id}" ${ok?'':'disabled'}>${img('v'+(k+1),'vthumb')}<div class="grow"><b>1-${k+1} ${v.name}</b>
      <div class="small ${ok?'muted':'t-danger'}">${ok?(cur?'替換 '+bpOf(cur).n+'（'+power(cur)+'）':'需求 '+v.req)+'・每輪 '+fmtT(gameDur(k,w,st.strat)):(power(w)<v.req?'戰力不足 '+v.req:'缺少「'+AFFIX[v.need].n+'」')}</div></div><span class="pill ${ok?'gold':''}">${ok?'交付':'不符'}</span></button>`}).join(''):'<div class="empty">目前沒有村莊需要這類武器。</div>'}</div>`;
  }
}
function slotHtml(w,s,pick){const e=w.ench[s],open=slotOpen(s),rm=runicMul(w);
  return `<button class="ui-card ui-card--slot eslot ${pick&&ui.enchSlot===s?'on':''} ${open?'':'locked'}" ${pick?`data-act="eslot" data-k="${s}"`:''}>${!open?`${img('ic_lock','lk')}<span class="small">鐵砧 Lv${SLOT_ANVIL[s]}</span>`:e?`${img(AFFIX_ICON[e.k])}<span>${AFFIX[e.k].n}</span><span class="small t-gold">+${Math.round(e.v*rm*10)/10}%</span>`:'<span class="small muted">空欄位</span>'}</button>`}

/* ---------- 村莊 ---------- */
function betterIdle(i){const st=S.villages[i],cur=st.weaponId!=null&&W(st.weaponId);return S.weapons.some(x=>where(x)<0&&eligible(i,x)&&(!cur||power(x)>power(cur)))}
function vState(i){const st=S.villages[i];if(st.status==='locked')return['locked','未解鎖'];if(st.status==='open')return['open','等待交付'];
  if(st.weaponId==null)return st.bank.cycles?['ready','可收成']:['pause','暫停・無武器'];const w=W(st.weaponId);if(w&&st.bank.cycles>=capCycles(i,w))return['full','倉庫滿'];if(st.bank.cycles)return['ready','可收成'];return['hunt','狩獵中']}
const clock=(ms,ref)=>{const s=Math.max(0,Math.ceil(ms/1000)),long=(ref??ms)>=3600000;return(long?[Math.floor(s/3600),Math.floor(s%3600/60),s%60]:[Math.floor(s/60),s%60]).map(x=>String(x).padStart(2,'0')).join(':')};
function viewVillage(){
  const achReady=ACH.filter(a=>!S.ach[a.id]&&a.test()).length,ready=S.villages.filter(v=>v.bank.cycles).length;
  return `<section class="realm" style="background-image:url(${A('v4')})"><div class="realm-in"><span class="arr off">${ic('arrow-left')}</span><div class="center"><h1>米德加德</h1><div class="small">人類之境</div></div><span class="arr off">${ic('arrow-right')}</span></div>
   <div class="realms">${REALMS.map((r,i)=>`<div class="rlm ${i?'off':'on'}">${img('realm_'+(i+1),i?'locked':'')}${i?img('ic_lock','rl'):''}<span>${r}</span></div>`).join('')}</div></section>
  <div class="row vbar">${btn(`全部收成${ready?` <span class="ui-badge badge">${ready}</span>`:''}`,'collectAll',{cls:'btn-primary grow',dis:!ready})}${btn(`委託成就${achReady?` <span class="ui-badge badge">${achReady}</span>`:''}`,'achopen')}${btn('排行榜','lbopen',{attrs:`data-i="${Math.max(0,cleared()-1)}"`})}</div>
  <div class="vlist">${VILLAGES.map((v,i)=>{const[k,lab]=vState(i),st=S.villages[i],w=st.weaponId!=null&&W(st.weaponId);
   if(k==='locked'){const first=S.villages.findIndex(x=>x.status==='locked')===i;if(!first)return '';const left=S.villages.filter(x=>x.status==='locked').length;
     return `<div class="vlocked">${img('ic_lock','lk')}<div class="grow"><b>1-${i+1} ${v.name}</b>${left>1?` 等 ${left} 座村莊`:''}<div class="small muted">完成 1-${i} ${VILLAGES[i-1].name} 的委託後解鎖</div></div></div>`}
   const drops=v.drops.slice(0,3).map(d=>img(MATART[d[0]],'dico')).join('');
   if(k==='open'){let has;
     has=S.weapons.filter(x=>eligible(i,x)&&where(x)<0).sort((a,b)=>power(b)-power(a))[0]||null;
     return `<div class="ui-card vcard open next" data-act="vopen" data-i="${i}" role="button" tabindex="0"><span class="next-tag">下一個挑戰</span>${has?'<i class="dot give-dot"></i>':''}${img('v'+(i+1),'vthumb')}<div class="grow"><div class="row nowrap"><b class="grow">1-${i+1} ${v.name}</b><span class="vst open">${lab}</span></div>
      <div class="small">${v.who}需要 <b>${CATS[v.cat]}</b>・戰力 ${v.req}${v.need?`＋<b class="t-danger">${AFFIX[v.need].n}</b>`:''}</div>${st.status!=='cleared'&&FIRST_GOLD[i]?`<div class="small t-gold">首次收復獎勵 ${img('it_gold','fg-ic')} ${fmt(FIRST_GOLD[i])} 金幣</div>`:''}
      <div class="small ${has?'t-ok':'muted'}">${has?`可交付 ${S.weapons.filter(x=>eligible(i,x)&&where(x)<0).length} 把，最強：${bpOf(has).n}（${power(has)}）`:'武器庫還沒有符合的武器'}</div></div>
      <div class="vside">${has?btn('交付','deliver',{cls:'btn-primary sm',attrs:`data-i="${i}" data-id="${has.id}"`}):btn('去鍛造','forgeCat',{cls:'btn-sec sm',attrs:`data-k="${v.cat}"`})}</div></div>`}
   return `<div class="ui-card vcard ${k}" data-act="vopen" data-i="${i}" role="button" tabindex="0">${vGiveDot(i)||st.bank.cycles?'<i class="dot give-dot"></i>':''}${img('v'+(i+1),'vthumb')}<div class="grow"><div class="row nowrap"><b class="grow">1-${i+1} ${v.name}</b><span class="vst ${k}">${lab}</span></div>
    ${w?`<div class="row nowrap small"><span class="wchip q${w.q}b">${wArt(w.b,{cls:'wmini'})}<span class="q${w.q}">${bpOf(w).n} +${w.lv}</span></span><span class="num grow right" data-vclock="${i}"></span></div><div class="ui-prog prog"><i data-vprog="${i}"></i></div>
     ${k==='full'?`<div class="small t-danger">已達離線上限 ${S.capH} 小時，暫停累積，請收成</div>`:st.bank.cycles?`<div class="vbank">${harvestMini({gold:st.bank.gold,...st.bank.mats})}</div>`:`<div class="small muted">預估 ${fmt(gph(i,w))} 金／小時</div>`}${betterIdle(i)?'<span class="tag-up">武器庫有更強的可以換</span>':''}`
     :`<div class="small muted">沒有駐守武器，狩獵暫停。點開指派武器。</div>`}</div>
    <div class="vside">${st.bank.cycles?`<button class="ui-btn ui-btn--accent harvest-btn" data-act="collect" data-i="${i}"><span>收成</span><b>×<span data-vpend="${i}">${st.bank.cycles}</span></b></button>`:`<div class="drops">${drops}</div>`}</div></div>`}).join('')}</div>`;
}
// v3.61 從別頁點進村莊：自動捲到目前待交付的關卡（已經看得到就不動，保留上方地圖）
function scrollToNextVillage(){const el=document.querySelector('#view .vcard.next');scrollTo(0,0);if(!el)return;const r=el.getBoundingClientRect(),nav=document.querySelector('.nav'),bar=document.querySelector('.bar');
  if(r.bottom<=innerHeight-(nav?nav.offsetHeight:0))return;scrollTo(0,Math.max(0,r.top-(bar?bar.offsetHeight:0)-12))}
function sheetVillage(i){
  const v=VILLAGES[i],st=S.villages[i],w=st.weaponId!=null&&W(st.weaponId),bk=st.bank;
  const head=`<div class="sheet-head"><span style="width:44px"></span><h2>1-${i+1} ${v.name}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>
   <div class="banner" style="background-image:url(${A('v'+(i+1))})"><span class="small">${v.who}</span><span>${v.txt}</span></div>
   ${st.status!=='locked'?`<button class="lb-link" data-act="lbopen" data-i="${i}">${img('ic_star')}<span class="grow">本村排行榜</span><b>${lbRank(i)?'第 '+lbRank(i)+' 名':'尚未上榜'}</b><span class="muted">›</span></button>`:''}`;
  const drops=s=>`<div class="mats">${v.drops.map(d=>`<div class="matbox">${img(MATART[d[0]])}<span class="mb-n">${MATS[d[0]]}${d[1]<RARE_P?' <span class="ui-badge badge">稀有</span>':''}</span><span class="mb-c">${pct(dropChance(i,w||null,d,s))}</span></div>`).join('')}</div>`;
  const bank=bk.cycles?`<div class="ui-panel panel">${ptitle(`已累積 ${bk.cycles} 輪${bk.events?`（受襲 ${bk.events} 次）`:''}`)}<div class="mats">${harvestIcons({gold:bk.gold,...bk.mats})}</div>${btn('收成','collect',{cls:'btn-primary big',attrs:`data-i="${i}"`})}</div>`:'';
  if(w){const gd=gameDur(i,w),gs=v.tag==='giant'?1+traitVal(w,'giantslayer')/100:1,ev=eventChance(i,w),gph=Math.round(3600000/gd*v.gold*STRATS[st.strat].gold*gs*(1-ev*.5));
    const vv=ui.villV||'2';   // v3.19 村莊詳細頁版型預覽：O 原版／1 分頁／2 精簡一頁
    if(vv!=='O'){const hd=`<div class="sheet-head"><span style="width:44px"></span><h2>1-${i+1} ${v.name}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
      const top=`<div class="vv-top" style="background-image:url(${A('v'+(i+1))})"><div class="vv-w" data-act="wopen" data-id="${w.id}" role="button">${wArt(w.b,{frame:w.q})}</div><div class="grow"><b class="q${w.q}">${bpOf(w).n} +${w.lv}</b><div class="small">戰力 ${fmt(power(w))}・需求 ${v.req}</div><div class="small t-ok">狩獵時間 ${Math.round(gd/(v.sec*1000)*100)}%</div></div>
        <button class="vv-lb" data-act="lbopen" data-i="${i}">${img('ic_star')}<span>${lbRank(i)?'第 '+lbRank(i)+' 名':'排行榜'}</span></button></div>
        ${betterIdle(i)?'<div class="goal">武器庫裡有更強的同類武器，換上來能加快狩獵。</div>':''}
        <div class="row small vv-prog"><span class="muted grow">本輪進度</span><span class="num" data-vtime="${i}"></span></div><div class="ui-prog prog"><i data-vprog="${i}"></i></div>`;
      const kvs=`<div class="vv-kv">${[['每輪',fmtT(gd/(S.speed>1?S.speed:1))],['金幣',fmt(gph)+'/時'],['危險',pct(ev)],['離線',S.capH+'時']].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>`;
      const strat=`<div class="vv-seg">${Object.entries(STRATS).map(([k,s])=>`<button class="${st.strat===k?'on':''}" data-act="strat" data-i="${i}" data-k="${k}">${img(STRAT_ICON[k])}<span><b>${s.n}</b><i>${{normal:'穩定',material:'材料 ×1.5',rare:'稀有 ×1.8'}[k]}</i></span></button>`).join('')}</div>`;
      const dropRow=`<div class="vv-drops">${v.drops.map(d=>`<div class="vv-d ${d[1]<RARE_P?'rare':''}">${img(MATART[d[0]])}<span>${pct(dropChance(i,w,d,st.strat))}</span></div>`).join('')}</div>`;
      const bankRow=bk.cycles?`<div class="vv-bank"><span class="small">已累積 <b>${bk.cycles}</b> 輪${bk.events?`・受襲 ${bk.events}`:''}</span><div class="vv-bi">${harvestMini({gold:bk.gold,...bk.mats})}</div></div>`:'';
      const bar=`<div class="ev-bar two">${btn(bk.cycles?`收成 ${bk.cycles} 輪`:'還沒有收成','collect',{cls:'btn-primary big',attrs:`data-i="${i}"`,dis:!bk.cycles})}${btn('收回武器','recall',{cls:'btn-sec big',attrs:`data-i="${i}"`})}</div>`;
      if(vv==='1'){const t=ui.villTab||'hunt';return hd+`<div class="ev vv1">${top}<div class="subtabs vv-tabs">${[['hunt','狩獵'],['strat','策略'],['drop','掉落']].map(([k,n])=>`<button class="ui-tab ${t===k?'on':''}" data-act="villtab" data-k="${k}">${n}</button>`).join('')}</div>
        ${t==='hunt'?kvs+bankRow:t==='strat'?strat+'<div class="small muted">切換只影響之後的狩獵，本輪重新計時。</div>':dropRow+'<div class="small muted">每輪掉落機率，紫框是稀有材料。</div>'}${bar}</div>`}
      return hd+`<div class="ev vv2">${top}${kvs}<div class="vv-k">狩獵策略</div>${strat}<div class="vv-k">每輪掉落</div>${dropRow}${bankRow}${bar}</div>`}
    return head+`<div class="ui-panel panel"><div class="row nowrap"><div class="tilebox">${wTile(w,`data-act="wopen" data-id="${w.id}"`)}</div><div class="grow"><b class="q${w.q}">${bpOf(w).n} +${w.lv}</b><div class="small muted">戰力 ${fmt(power(w))}・需求 ${v.req}</div>
      <div class="small t-ok">狩獵時間 ${Math.round(gd/(v.sec*1000)*100)}%（越低越快）</div>${traitHtml(w)}</div></div>
      ${betterIdle(i)?'<div class="goal">武器庫裡有更強的同類武器，換上來能加快狩獵。</div>':''}
      <div class="row small"><span class="muted grow">本輪進度</span><span class="num" data-vtime="${i}"></span></div><div class="ui-prog prog"><i data-vprog="${i}"></i></div>
      <div class="kvgrid">${kv('每輪狩獵',fmtT(gd)+(S.speed>1?`<br><span class="small muted">試玩加速 ${fmtT(gd/S.speed)}</span>`:''))}${kv('預估金幣',fmt(gph)+'/小時')}${kv(TAGN[v.tag]+'・危險事件',pct(ev)+'/輪')}${kv('離線上限',S.capH+' 小時')}</div></div>
     <div class="ui-panel panel">${ptitle('村莊狩獵策略')}<div class="strats">${Object.entries(STRATS).map(([k,s])=>`<button class="ui-card ui-card--option strat ${st.strat===k?'on':''}" data-act="strat" data-i="${i}" data-k="${k}"><b>${s.n}</b>${img(STRAT_ICON[k])}<span class="small">${{normal:'正常收益<br>穩定發展',material:'金幣 −40%<br>材料 ×1.5',rare:'時間 ×1.4<br>稀有 ×1.8'}[k]}</span></button>`).join('')}</div>
      <div class="small muted">切換只影響之後開始的狩獵，本輪重新計時，已累積的獎勵不變。</div></div>
     <div class="ui-panel panel">${ptitle('可取得材料（每輪機率）')}${drops(st.strat)}</div>${bank}
     <div class="acts3">${btn('收回武器','recall',{attrs:`data-i="${i}"`})}</div>`;
  }
  const ok=S.weapons.filter(x=>eligible(i,x)&&where(x)<0).sort((a,b)=>power(b)-power(a));
  return head+`<div class="ui-panel panel"><div class="kvgrid">${kv('需要',CATS[v.cat]+'類'+(v.need?'＋'+AFFIX[v.need].n:''))}${kv('需求戰力',v.req)}${kv('每輪金幣',v.gold)}${kv('基礎時間',fmtT(v.sec*1000))}${FIRST_GOLD[i]?kv('首次收復獎勵',st.status==='cleared'?'<span class="muted">已領取</span>':'<span class="t-gold">'+fmt(FIRST_GOLD[i])+' 金</span>'):''}</div></div>
   <div class="ui-panel panel">${ptitle('可取得材料')}${drops('normal')}</div>${bank}
   <div class="ui-panel panel">${ptitle(st.status==='open'?'交付委託':'指派駐守武器')}${ok.length?`<div class="wgrid">${ok.map(x=>wTile(x,`data-act="deliver" data-i="${i}" data-id="${x.id}"`)).join('')}</div><div class="small muted">點武器即可交付。</div>`:`<div class="empty">沒有符合的${CATS[v.cat]}類武器。到鐵匠鋪鍛造，或到武器庫強化、附魔。</div>`}</div>`;
}
const gph=(i,w)=>{const v=VILLAGES[i],st=S.villages[i],gs=v.tag==='giant'?1+traitVal(w,'giantslayer')/100:1;return Math.round(3600000/gameDur(i,w)*v.gold*STRATS[st.strat].gold*gs*(1-eventChance(i,w)*.5))};
const harvestMini=g=>Object.entries(g).filter(([k,n])=>n).slice(0,4).map(([k,n])=>`<span class="hm">${img(k==='gold'?'it_gold':MATART[k])}${fmt(n)}</span>`).join('');
const harvestIcons=g=>Object.entries(g).filter(([k,n])=>n).map(([k,n])=>`<div class="hico">${img(k==='gold'?'it_gold':MATART[k]||ITEMS[k][1])}<span class="num">×${fmt(n)}</span></div>`).join('')||'<div class="small muted">沒有獎勵</div>';
function lbRows(i){const b=S.best[i];return [...lbOthers(i).map(x=>({...x,me:false})),...(b?[{n:S.nick||'你',p:b.p,t:lbMyT(i),w:{b:b.b,q:b.q,lv:b.lv,traits:b.traits||[],ench:b.ench||[]},me:true}]:[])].sort((x,y)=>y.p-x.p||(x.t<y.t?-1:x.t>y.t?1:y.me-x.me)).map((x,k)=>({...x,k}))}
// 排行榜武器詳情（唯讀）：對手或你的紀錄，內容跟武器詳情頁同一套排版
function sheetLbW(i,k){const x=lbRows(i)[k];if(!x)return sheetLb(i);const w=x.w,b=BP[w.b],v=VILLAGES[i],el=affixVal(w,'flame')+affixVal(w,'frost'),rm=runicMul(w),nE=w.ench.filter(Boolean).length;
  const traits=[...(w.traits||[]).map(t=>`<button class="wd-chip tap" data-act="trinfo" data-k="${t.k}" data-v="${t.v}">${img(TRAIT_ICON[t.k])}${TRAITS[t.k].n} <b>+${t.v}%</b><i>ⓘ</i></button>`),...(b.inn?[`<span class="wd-chip inn">${img(AFFIX_ICON[b.inn[0]])}天生・${AFFIX[b.inn[0]].n} <b>+${b.inn[1]}%</b></span>`]:[])];
  const slots=[0,1,2,3].map(s=>{const e=w.ench[s];return `<div class="ui-card ui-card--slot eslot">${e?`${img(AFFIX_ICON[e.k])}<span>${AFFIX[e.k].n}</span><span class="small t-gold">+${Math.round(e.v*rm*10)/10}%</span>`:'<span class="small muted">空欄位</span>'}</div>`}).join('');
  const head=`<div class="sheet-head">${btn(img('ic_back'),'lbopen',{cls:'icon-btn img',attrs:`data-i="${i}" aria-label="返回排行榜"`})}<h2>${x.me?'你的紀錄':'對手武器'}</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  return head+`<div class="lbw-owner"><span class="lb-no r${Math.min(k+1,4)}">${k+1}</span><div class="grow"><b>${x.n}</b><div class="small muted">1-${i+1} ${v.name}排行榜・第 ${k+1} 名</div></div></div>
   <div class="ui-card ui-card--feature wd-head q${w.q}b"><div class="wd-art">${wArt(b.id,{frame:w.q})}</div>
    <div class="wd-info"><h2 class="q${w.q}">${b.n} <span class="lvt">+${w.lv}</span></h2><div class="wd-tags"><span class="qpill q${w.q}b">${QUAL[w.q].n}</span></div>
     <div class="small muted">${TIERS[b.t].n}・${CATS[b.cat]}・<span class="nw">安定值 <b class="${TIERS[b.t].stable?'t-ok':'t-danger'}">+${TIERS[b.t].stable}</b></span></div>
     <div class="wd-pow"><span class="small muted">戰力</span><b>${fmt(x.p)}</b></div></div></div>
   <div class="ui-panel panel wd-sub">
    <div class="wd-row"><span class="wd-k">特性</span><div class="wd-chips">${traits.length?traits.join(''):'<span class="small muted">沒有先天特性</span>'}</div></div>
    <div class="wd-row"><span class="wd-k">附魔 ${nE}/4</span><div class="slots wd-slots">${slots}</div></div>
    <div class="kvgrid">${kv('基礎戰力',b.base)}${kv('品質倍率','×'+QUAL[w.q].m)}${kv('材質階級',TIERS[b.t].n+' ×'+TIERS[b.t].mult)}${kv('強化倍率','×'+enhMult(w.lv).toFixed(2))}${kv('元素加成',el?'+'+Math.round(el*10)/10+'%':'—')}${kv('最終戰力','<span class="t-gold">'+fmt(x.p)+'</span>')}</div>
    ${(w.traits||[]).map(t=>`<div class="small"><b>${TRAITS[t.k].n}</b>：<span class="muted">${TRAITS[t.k].d}</span></div>`).join('')}</div>
   ${x.me?'':`<div class="small muted center">${S.best[i]?(x.p>S.best[i].p?`比你的紀錄高 <b class="t-gold">${fmt(x.p-S.best[i].p)}</b> 戰力`:`你的紀錄比他高 <b class="t-ok">${fmt(S.best[i].p-x.p)}</b> 戰力`):'你還沒有交付武器給這座村莊'}</div>`}
   ${btn('回排行榜','lbopen',{cls:'btn-sec big',attrs:`data-i="${i}"`})}`}
// v3.16 排行榜：每個村莊（委託）一個榜，比的是你交付過最高戰力的武器
function sheetLb(i){i=Math.max(0,Math.min(VILLAGES.length-1,i));const pend=lbReward(i);if(pend.length)setTimeout(()=>toast('上榜獎勵：<br>'+pend.join('<br>'),'ok'),50);   // 舊存檔已駐守的武器：打開排行榜時補發
  if(AUTH)setTimeout(()=>lbFetch(),0);const v=VILLAGES[i],st=S.villages[i],b=S.best[i],rk=lbRank(i),npc=lbOthers(i),got=S.lbRw[i]||[];
  const rows=lbRows(i);
  const head=`<div class="sheet-head"><span style="width:44px"></span><h2>排行榜</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img',attrs:'aria-label="關閉"'})}</div>`;
  const tabs=`<div class="lb-tabs">${VILLAGES.map((x,k)=>{const lk=S.villages[k].status==='locked',r=lbRank(k);return `<button class="lb-tab ${k===i?'on':''} ${lk?'lk':''}" data-act="lbopen" data-i="${k}" ${lk?'disabled':''}><img src="${A('v'+(k+1))}" alt=""><span>1-${k+1}</span>${r&&r<=10?`<i class="lb-rk r${Math.min(r,4)}">${r}</i>`:''}${lk?img('ic_lock','lb-lk'):''}</button>`}).join('')}</div>`;
  const me=b?`<div class="lb-me" data-act="lbw" data-i="${i}" data-k="${rows.findIndex(x=>x.me)}" role="button">${wArt(b.b,{frame:b.q})}<div class="grow"><div class="small muted">你的最佳紀錄</div><b class="q${b.q}">${BP[b.b].n} +${b.lv}</b><div class="small">戰力 <b class="t-gold">${fmt(b.p)}</b></div></div><div class="lb-mypos"><span class="small muted">名次</span><b>${rk||'…'}</b><span class="small muted">／${npc.length+1}</span></div></div>`
    :`<div class="lb-me empty"><div class="grow"><b>還沒有交付武器</b><div class="small muted">交付${CATS[v.cat]}類、戰力 ${v.req} 以上的武器就會上榜</div></div></div>`;
  const nxt=b&&rk>1?npc.filter(x=>x.p>b.p).slice(-1)[0]:null;
  const goal=AUTH&&!LBR.t?'<div class="small muted center lb-goal">讀取排行榜中…</div>':nxt?`<div class="small muted center lb-goal">再提升 <b class="t-gold">${fmt(nxt.p-b.p+1)}</b> 戰力就能超越第 ${rk-1} 名 ${nxt.n}</div>`:b?'<div class="small t-ok center lb-goal">你是這座村莊最強的鐵匠！</div>':'';
  const rws=`<div class="lb-rws">${LB_RW.map(([t,r,n])=>{const ok=got.includes(t);return `<div class="lb-rw ${ok?'ok':''}"><span class="small">${n}</span>${Object.entries(r).map(([k,c])=>`${img(ITEMS[k][1])}<b>×${c}</b>`).join('')}<span class="small ${ok?'t-ok':'muted'}">${ok?'已領取':'未達成'}</span></div>`}).join('')}</div>`;
  const myIx=rows.findIndex(x=>x.me),show=rows.map((x,k)=>({...x,k})).filter(x=>x.k<10||x.me);
  const row=x=>`<button class="lb-row ${x.me?'me':''} ${x.k<3?'top':''}" data-act="lbw" data-i="${i}" data-k="${x.k}"><span class="lb-no r${Math.min(x.k+1,4)}">${x.k+1}</span>${wArt(x.w.b,{frame:x.w.q,cls:'lb-art'})}<div class="grow"><b>${x.n}</b><div class="small q${x.w.q}">${BP[x.w.b].n} +${x.w.lv}</div></div><b class="lb-p">${fmt(x.p)}</b><span class="muted lb-more">›</span></button>`;
  return head+tabs+`<div class="lb-vh"><b>1-${i+1} ${v.name}</b><span class="small muted">${CATS[v.cat]}類・委託需求 ${v.req}${v.need?'・需'+AFFIX[v.need].n:''}</span></div>`+me+goal+rws
    +`<div class="ui-panel panel lb-list">${show.map((x,k)=>(k>0&&x.k-show[k-1].k>1?'<div class="lb-gap">⋯</div>':'')+row(x)).join('')}</div>
    <div class="small muted center">${!AUTH?'登入後才會顯示其他玩家（測試版）':LBR.err?'⚠ '+LBR.err:LBR.loading&&!LBR.t?'讀取中…':'封測玩家真實紀錄，每分鐘更新'}</div>`}
// v3.15 委託成就：正式版型 A（進度清單）；開發模式下可切換原版／B／C／D 比較
const ACH_G={v:['收復村莊','nav_village'],h:['村莊收成','it_gold'],f:['鍛造與強化','nav_forge']};
const achSt=a=>S.ach[a.id]?'done':a.test()?'ready':'todo';
const achP=a=>{const[c,m]=a.p();return{c:Math.min(c,m),m,f:Math.min(1,c/m)}};
const achRw=(a,cls='')=>Object.entries(a.r).map(([k,n])=>`<span class="ach-rw ${cls}">${img(MATS[k]?MATART[k]:ITEMS[k][1])}<b>×${n}</b></span>`).join('');
const achBtn=(a,st,cls='sm')=>btn(st==='done'?'已領取':st==='ready'?'領取':'未達成','ach',{cls:(st==='ready'?'btn-primary ':'btn-sec ')+cls,attrs:`data-k="${a.id}"`,dis:st!=='ready'});
const achOrder=list=>[...list].sort((x,y)=>({ready:0,todo:1,done:2}[achSt(x)]-{ready:0,todo:1,done:2}[achSt(y)]));
function claimAllAch(){let n=0,got={};ACH.forEach(a=>{if(!S.ach[a.id]&&a.test()&&claimAch(a.id)){n++;for(const k in a.r)got[k]=(got[k]||0)+a.r[k]}});
  if(!n)return toast('目前沒有可領取的成就。');snd('coin');toast(`領取 ${n} 項：`+Object.entries(got).map(([k,v])=>itemName(k)+' ×'+v).join('、'),'ok');render()}
function sheetAch(){const v=ui.achV||'A',nDone=ACH.filter(a=>S.ach[a.id]).length,nReady=ACH.filter(a=>achSt(a)==='ready').length;
  const head=`<div class="sheet-head"><span style="width:44px"></span><h2>委託成就</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img'})}</div>`;
  const pick=devMode()?`<div class="ach-vpick"><span class="small muted">版型預覽</span>${['O','A','B','C','D'].map(k=>`<button class="ui-btn ui-btn--chip chipbtn ${v===k?'on':''}" data-act="achv" data-k="${k}">${k==='O'?'原版':k}</button>`).join('')}</div>`:'';
  const sum=`<div class="ach-sum"><div><b>${nDone}</b><span class="small muted">／${ACH.length} 已領取</span></div><div class="grow small muted">免費防爆卷・祝福石</div>${btn(nReady?`一鍵領取（${nReady}）`:'沒有可領取','achAll',{cls:(nReady?'btn-primary':'btn-sec')+' sm',dis:!nReady})}</div>`;
  const bar=(a,cls='')=>{const p=achP(a);return `<div class="ach-bar ${cls}"><div class="prog sm ui-prog"><i style="width:${p.f*100}%"></i></div><span class="small">${fmt(p.c)}／${fmt(p.m)}</span></div>`};
  if(v==='O')return head+pick+`<div class="small muted">免費取得防爆卷與祝福石的途徑。</div>`+ACH.map(a=>{const done=S.ach[a.id],ready=!done&&a.test();return `<div class="ui-panel panel row nowrap"><div class="grow"><b>${a.n}</b><div class="small muted">獎勵：${Object.entries(a.r).map(([k,n])=>itemName(k)+' ×'+n).join('、')}</div></div>
  ${btn(done?'已領取':ready?'領取':'未達成','ach',{cls:ready?'btn-primary sm':'btn-sec sm',attrs:`data-k="${a.id}"`,dis:!ready})}</div>`}).join('');
  // A：進度清單（可領取排最上、已領取沉到最下）
  const v2=ui.achV2||'O';   // v3.19 成就精簡預覽：O 目前 A 版／1 一行一項／2 分類摺疊
  if(v==='A'&&v2==='1')return head+pick+sum+`<div class="ach-1">${achOrder(ACH).map(a=>{const st=achSt(a),p=achP(a);return `<div class="ach1 ${st}">${img(a.ic,'ach1-ic')}<div class="grow"><div class="ach1-t"><b>${a.n}</b><span class="small">${st==='done'?'已完成':fmt(p.c)+'／'+fmt(p.m)}</span></div><i class="cb-bar"><i style="width:${st==='done'?100:p.f*100}%"></i></i></div><span class="ach1-rw">${achRw(a)}</span>${st==='ready'?btn('領取','ach',{cls:'btn-primary sm',attrs:`data-k="${a.id}"`}):''}</div>`}).join('')}</div>`;
  if(v==='A'&&v2==='2')return head+pick+sum+Object.entries(ACH_G).map(([k,[n,ic]])=>{const list=achOrder(ACH.filter(a=>a.g===k)),rd=list.filter(a=>achSt(a)==='ready').length,dn=list.filter(a=>achSt(a)==='done').length,op=(ui.achOpen??Object.keys(ACH_G).find(x=>ACH.some(a=>a.g===x&&achSt(a)==='ready'))??'v')===k;
    return `<div class="ach2 ${op?'open':''}"><button class="ach2-h" data-act="achgrp" data-k="${k}">${img(ic)}<b class="grow">${n}</b><span class="small muted">${dn}/${list.length}</span>${rd?`<i class="ach2-dot">${rd}</i>`:''}<span class="muted">${op?'－':'＋'}</span></button>${op?`<div class="ach2-b">${list.map(a=>{const st=achSt(a),p=achP(a);return `<div class="ach1 ${st}"><div class="grow"><div class="ach1-t"><b>${a.n}</b><span class="small">${st==='done'?'已完成':fmt(p.c)+'／'+fmt(p.m)}</span></div><i class="cb-bar"><i style="width:${st==='done'?100:p.f*100}%"></i></i></div><span class="ach1-rw">${achRw(a)}</span>${st==='ready'?btn('領取','ach',{cls:'btn-primary sm',attrs:`data-k="${a.id}"`}):''}</div>`}).join('')}</div>`:''}</div>`}).join('');
  if(v==='A')return head+pick+sum+`<div class="ach-list">${achOrder(ACH).map(a=>{const st=achSt(a);return `<div class="ach-a ${st}">${img(a.ic,'ach-ic')}<div class="grow"><b>${a.n}</b>${st==='done'?'<div class="small t-ok">已完成</div>':bar(a)}<div class="ach-rws">${achRw(a)}</div></div>${achBtn(a,st)}</div>`}).join('')}</div>`;
  // B：分類分頁（村莊／收成／鍛造），兩欄卡片
  if(v==='B'){const tab=ui.achTab||'v';return head+pick+sum+`<div class="subtabs ach-tabs">${Object.entries(ACH_G).map(([k,[n,ic]])=>{const r=ACH.filter(a=>a.g===k&&achSt(a)==='ready').length;return `<button class="ui-tab ${tab===k?'on':''}" data-act="achtab" data-k="${k}">${n}${r?`<i class="dot">${r}</i>`:''}</button>`}).join('')}</div>
    <div class="ach-grid">${achOrder(ACH.filter(a=>a.g===tab)).map(a=>{const st=achSt(a);return `<div class="ach-b ${st}"><div class="ach-b-top">${img(a.ic,'ach-ic')}<b>${a.n}</b></div>${st==='done'?'<div class="small t-ok center">已完成</div>':bar(a)}<div class="ach-rws center">${achRw(a)}</div>${achBtn(a,st,'ach-fullbtn')}</div>`}).join('')}</div>`}
  // C：里程碑路線（同一類成就串成一條路，下一個目標發亮）
  if(v==='C')return head+pick+sum+Object.entries(ACH_G).map(([k,[n,ic]])=>{const list=ACH.filter(a=>a.g===k);const cur=list.find(a=>achSt(a)!=='done');
    return `<div class="ui-panel panel ach-c">${ptitle(n)}<div class="ach-road">${list.map(a=>{const st=achSt(a);return `<div class="ach-node ${st} ${a===cur?'cur':''}"><div class="ach-dot">${st==='done'?img('ic_check'):img(a.ic)}</div><div class="grow"><b>${a.n}</b>${st==='done'?'':bar(a)}<div class="ach-rws">${achRw(a)}</div></div>${st==='todo'?'':achBtn(a,st)}</div>`}).join('')}</div></div>`}).join('');
  // D：獎勵為主（兩欄大獎勵圖，條件寫在下面）
  if(v==='D')return head+pick+sum+`<div class="ach-grid">${achOrder(ACH).map(a=>{const st=achSt(a),[k,n]=Object.entries(a.r)[0],more=Object.entries(a.r).slice(1);
    return `<div class="ach-d ${st}"><div class="ach-d-rw">${img(MATS[k]?MATART[k]:ITEMS[k][1])}<b>×${n}</b>${more.length?`<span class="ach-d-more">${achRw({r:Object.fromEntries(more)})}</span>`:''}</div><div class="ach-d-name">${itemName(k)}</div><div class="small">${a.n}</div>${st==='done'?'<div class="small t-ok">已領取</div>':bar(a)}${achBtn(a,st,'ach-fullbtn')}</div>`}).join('')}</div>`;
}

/* ---------- 商城 ---------- */
// v3.20 特性說明：武器詳情點特性標籤會跳出
const TRAIT_HELP={
 sharp:'交給<b>野獸類</b>村莊（狼嚎谷、霜溪鎮、鹿角堡、渡鴉灣、雪峰營地等）時，每輪狩獵時間縮短。',
 sturdy:'村莊每跑完一輪狩獵，都有機率<b>受襲</b>：那一輪沒有材料、金幣只拿一半。受襲機率越後面的村莊越高（鐵爐村 0%～世界樹根穴 16%）。<br><br>堅固讓受襲機率降低「數值 × 2」%，最多降 60%。例：堅固 +20% → 灰燼要塞 14% 降到 8.4%。',
 light:'不論交給哪座村莊，每輪狩獵時間都縮短。',
 treasure:'稀有素材（村莊掉落表中標「稀有」的材料）的掉落機率提升，最多 +50%。',
 giantslayer:'交給<b>巨人類</b>村莊（巨人足跡、灰燼要塞）時，每輪狩獵時間縮短，而且每輪金幣增加同樣的百分比。',
 runic:'這把武器上所有<b>附魔</b>的數值都乘上這個加成，最多 +50%。例：烈焰 +10%、符文親和 +20% → 實際烈焰 +12%。'};
function traitInfo(k,v){const t=TRAITS[k];return{icon:TRAIT_ICON[k],title:`${t.n} +${v}%`,html:`${TRAIT_HELP[k]}<br><br><span class="small muted">狩獵時間縮短的加成（迅捷、輕巧、鋒利、巨人獵手）合計最多 50%。<br>特性在鍛造時隨機決定，品質越高越多、數值越高。</span>`}}
const INFO={
  scroll:()=>({icon:'it_scroll',title:'防爆卷',html:'強化進入危險區（超過武器安定值）時勾選防爆卷，每次強化消耗 1 張；如果判定爆裝，武器保住、等級維持不變。<br><br>不論成功、失敗或爆裝都會消耗。安定區強化不需要防爆卷。<br><br>免費取得：委託成就。'}),
  bless:()=>({icon:'it_bless',title:'祝福石',html:'勾選後，該次強化成功率 +10%（最高 100%）。<br><br>每次強化消耗 1 個，不論成功或失敗。'}),
  horn:()=>({icon:'it_horn',title:'狩獵號角',html:'所有有駐守武器的村莊，立即完成 30 分鐘份量的狩獵，獎勵直接放進各村莊的累積獎勵，不會超過離線上限。'}),
  glass:()=>({icon:'it_hourglass',title:'鍛造沙漏',html:'所有正在鍛造的武器立即完成。'}),
  monthly:()=>({icon:'it_monthly',title:'北境月卡（免費）',html:'領取後立即獲得 300 鑽石，30 天內每天可以領 50 鑽石。<br><br>封測期間免費。'}),
  gacha:()=>({icon:'mat_rune',title:'符文祈願機率',html:`<div class="tblwrap"><table class="tbl"><tr><th>獎勵</th><th>數量</th><th>機率</th><th>保底池</th></tr>${GACHA.map(([k,n,p])=>`<tr><td>${itemName(k)}</td><td>×${n}</td><td>${p/10}%</td><td>${p<=PITY_MAX_W?'✓':''}</td></tr>`).join('')}</table></div><div class="small muted" style="margin-top:8px">十連保底：前 9 抽都沒有出現保底池（✓）的獎勵時，第 10 抽改從保底池抽出，取代原本的結果。單抽沒有保底。</div>`}),
  merchant:()=>({icon:'mat_iron',title:'旅行商人',html:`販售一階材料：${SHOP_MATS.map(([k,p])=>MATS[k]+' '+p+' 金').join('、')}。<br><br>也收購多出來的一階材料，每個 ${SELL_PRICE.iron} 金（低於售價，不能套利）。高階材料要靠村莊狩獵取得。`}),
  slag:()=>({icon:'mat_shard',title:'鍛造殘渣',html:'危險區強化爆裝時回收的殘渣，不可交易。<br><br>鐵製 1、霜銀 4、龍鱗 10、神器 25 個。可以兌換少量鐵礦、霜銀或符文碎片。'})
};
function viewShop(){
  const on=monthlyOn(),days=Math.ceil((S.monthly.until-NOW())/864e5);
  const info=k=>`<button class="ui-iconbtn info-btn" data-act="info" data-k="${k}" aria-label="說明">${ic('info')}</button>`;
  const card=(ic,name,sub,price,act,attrs,ik,dis)=>`<div class="ui-card pcard">${info(ik)}${img(ic,'pc-ico')}<b>${name}</b><span class="small muted">${sub}</span><button class="ui-btn ui-btn--secondary btn btn-sec sm pc-buy" data-act="${act}" ${attrs} ${dis?'disabled':''}>${price}</button></div>`;
  return `<div class="pagehead"><h2>商城</h2></div>
  ${BETA?'':`<div class="ui-panel panel">\${ptitle('鑽石（試玩版不扣款）')}<div class="gems3">\${[[60,'NT$30'],[330,'NT$150'],[1280,'NT$590']].map(([g,p])=>\`<button class="ui-card gemcard" data-act="topup" data-n="\${g}">\${img('it_gems')}<b>\${g} 鑽</b><span class="price">\${p}</span></button>\`).join('')}</div></div>`}
  <div class="ui-panel panel month ${on?'on':''}">${info('monthly')}<div class="item">${img('it_monthly')}<div class="grow"><b>北境月卡（免費）</b><div class="small muted">${on?`剩餘 ${days} 天`:'立得 300 鑽＋每天 50 鑽'}</div></div>
   ${on?btn(S.monthly.last===today()?'今日已領':'領 50 鑽<i class="dot give-dot"></i>','claim',{cls:'btn-primary sm',dis:S.monthly.last===today()}):btn(BETA?'免費領取<i class="dot give-dot"></i>':'NT$150','monthly',{cls:'btn-primary sm'})}</div></div>
  <div class="ui-panel panel">${ptitle('特殊道具')}<div class="pgrid">
   ${card('it_scroll','防爆卷',`爆裝時保住武器<br>持有 ${S.items.scroll}`,'30 鑽','item','data-k="scroll" data-n="30"','scroll')}
   ${card('it_bless','祝福石',`成功率 +10%<br>持有 ${S.items.bless}`,'20 鑽','item','data-k="bless" data-n="20"','bless')}
   ${card('it_horn','狩獵號角','村莊立即狩獵<br>30 分鐘','50 鑽','speedHunt','','horn')}
   ${card('it_hourglass','鍛造沙漏','鍛造中的武器<br>立即完成','40 鑽','speedForge','','glass')}</div></div>
  <div class="ui-panel panel">${info('gacha')}${ptitle('符文祈願')}<div class="gacha">${img('mat_rune','g-ico')}<div class="grow small muted">抽稀有材料、怪物素材與傳說圖紙。十連有保底。</div></div>
   <div class="row">${btn('單抽<br><span class="small">100 鑽</span>','pull',{attrs:'data-n="1"',cls:'btn-sec grow'})}${btn('十連<br><span class="small">900 鑽</span>','pull',{attrs:'data-n="10"',cls:'btn-primary grow'})}</div></div>
  <div class="ui-panel panel">${info('merchant')}${ptitle('旅行商人')}<div class="mlist">${SHOP_MATS.map(([k,p])=>`<div class="ui-card ui-card--row mrow">${img(MATART[k])}<div class="grow"><b>${MATS[k]}</b><span class="small muted">持有 ${fmt(S.mats[k])}</span><span class="small muted">單價 ${p} 金・收購 ${SELL_PRICE[k]} 金</span></div>${btn(`買 10 個<br><span class="small">共 ${p*10} 金</span>`,'buy',{attrs:`data-k="${k}" data-p="${p}" data-n="10"`,cls:'btn-sec sm',dis:S.gold<p*10})}${btn(`賣 ${Math.min(50,S.mats[k])||50} 個<br><span class="small">得 ${SELL_PRICE[k]*(Math.min(50,S.mats[k])||50)} 金</span>`,'sell',{attrs:`data-k="${k}" data-n="50"`,cls:'btn-sec sm',dis:S.mats[k]<1})}</div>`).join('')}</div></div>
  <div class="ui-panel panel">${info('slag')}${ptitle(`殘渣兌換（持有 ${S.slag}）`)}<div class="pgrid three">${SLAG_SHOP.map(([k,n,c],ix)=>`<div class="ui-card pcard">${img(MATART[k],'pc-ico')}<b>${MATS[k]} ×${n}</b><button class="ui-btn ui-btn--secondary btn btn-sec sm pc-buy" data-act="slag" data-i="${ix}" ${S.slag<c?'disabled':''}>${c} 殘渣</button></div>`).join('')}</div></div>`;
}
const DEV_TABS=[['res','資源'],['prog','進度'],['enh','強化動畫'],['test','自動測試'],['save','存檔'],['mk','交易所'],['ui','UI 元件']];
function sheetDev(){
  const B=(k,t,c='btn-sec')=>`<button class="ui-btn ui-btn--${btnVariant(c)} btn ${c} sm" data-act="devdo" data-k="${k}">${t}</button>`,tab=ui.devTab||'res';
  const body={
   res:`<div class="label">貨幣</div><div class="devgrid">${B('gold','金幣 +5,000')}${B('gems','鑽石 +1,000')}${B('slag','殘渣 +30')}</div>
     <div class="label">材料與道具</div><div class="devgrid">${B('t1','一階材料 +30')}${B('t2','霜銀、狼牙 +20')}${B('t3','龍鱗、符文石 +10')}${B('mon','怪物素材各 +5')}${B('shard','符文碎片 +10')}${B('items','防爆卷、祝福石 +5')}${B('bp','傳說圖紙 +1')}</div>
     <div class="label">全部武器顯示測試（測試武器：不扣資源、不能交付村莊）</div>
     <div class="small muted">品質</div><div class="row">${[[-1,'輪替'],[0,'普通'],[1,'精良'],[2,'稀有'],[3,'史詩'],[4,'傳說']].map(([v,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devAllQ??-1)===v?'on':''}" data-act="devset" data-k="devAllQ" data-v="${v}">${n}</button>`).join('')}</div>
     <div class="small muted">強化等級</div><div class="row">${[[-1,'輪替'],[0,'+0'],[6,'+6'],[7,'+7'],[10,'+10'],[15,'+15']].map(([v,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devAllLv??-1)===v?'on':''}" data-act="devset" data-k="devAllLv" data-v="${v}">${n}</button>`).join('')}</div>
     <div class="devgrid">${B('allw','產生全部 '+BPS.length+' 把','btn-primary')}${B('regenw','只產生重畫過的 10 把')}${B('cleartest','清除所有測試武器')}</div>
     <div class="label">測試武器</div><div class="devgrid">${B('wt','3 把帶特性的傳說武器')}${B('w6','+6 霜銀長劍（安定 5）')}${B('wm','神器尼德霍格龍矛（安定 0）')}${B('w8','+8 龍鱗戟')}${B('fill','武器庫塞到 195 把')}</div>`,
   prog:`<div class="label">v3.61 介面測試</div><div class="devgrid">${B('uiv','村莊：跳到待交付關卡')}${B('uiarm','武器庫：往下捲看分類置頂')}${B('uiforge','鐵匠鋪：圖紙區上下滑')}${B('uimat','材料倉庫：點材料看用途')}${B('uishop','旅行商人：買賣標示')}</div>
   <div class="label">v3.64 紅點提醒</div><div class="devgrid">${B('uigive','送一把可交付的武器')}${B('uidot_w','武器庫：最新一把標 NEW')}${B('uidot_bp','鐵匠鋪：最新圖紙標 NEW')}${B('uidot_full','村莊倉庫滿（醒目紅點）')}${B('uidot_mk','交易所：模擬有成交')}${B('uidot_mon','商城：月卡今天可領')}${B('uidot_st','目前哪些紅點會亮')}</div>
     <div class="label">時間流速（正式版 1×）</div><div class="row">${[1,10,30,60].map(n=>`<button class="ui-btn ui-btn--chip chipbtn ${S.speed===n?'on':''}" data-act="speed" data-k="${n}">${n}×</button>`).join('')}</div>
     <div class="label">離線累積上限</div><div class="row">${[8,12].map(n=>`<button class="ui-btn ui-btn--chip chipbtn ${S.capH===n?'on':''}" data-act="cap" data-k="${n}">${n} 小時</button>`).join('')}</div>
     <div class="label">村莊與鍛造</div><div class="devgrid">${B('hunt','所有村莊立即 +10 輪')}${B('offline','模擬離線 8 小時')}${B('forge','鍛造立即完成')}${B('unlock','解鎖全部村莊與圖紙')}${B('maxup','工坊、學徒滿級')}${B('danger','1-2 下一輪必定受襲')}${B('tlack','缺料鍛造提示（獵弓）')}${B('tharvest','2 秒後完成一輪（看收成按鈕）')}${B('achall','達成全部成就條件')}${B('daily','重置月卡今日領取')}</div>
     <div class="label">時間防作弊</div><div class="devgrid">${B('back','裝置時間倒退 1 小時')}${B('fwd','裝置時間恢復')}</div>`,
   enh:`<div class="label">1. 送出測試武器（標示「測試」，強化不扣資源、不能交付村莊）</div>
     <div class="row">${['鐵製','霜銀','龍鱗','神器'].map((n,t)=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devTier??0)===t?'on':''}" data-act="devset" data-k="devTier" data-v="${t}">${n}</button>`).join('')}</div>
     <div class="row">${[0,3,5,6,9,12,14].map(l=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devLv??0)===l?'on':''}" data-act="devset" data-k="devLv" data-v="${l}">+${l}</button>`).join('')}</div>
     <div class="devgrid">${B('testw','送出並開啟強化頁','btn-primary')}${B('cleartest','清除所有測試武器')}</div>
     <div class="devgrid">${B('autoenh','一鍵強化到安定值（新增 +0 鐵錘並執行）')}</div>
     <div class="label">音效試聽（目前正式音效）</div><div class="row" style="flex-wrap:wrap;gap:6px">${Object.keys(SFXV).map(n=>`<button class="ui-btn ui-btn--chip chipbtn" data-act="sndtest" data-k="${n}">${SFX_NAME[n]||n}</button>`).join('')}<button class="ui-btn ui-btn--chip chipbtn" data-act="sndtest" data-k="_spokes">8 道符文連續</button></div>
     ${SFX_VAR_KEYS.length?`<div class="label">音效試用（v3.32，只是試聽，選定後再正式換）</div><div class="sfxalt">${SFX_VAR_KEYS.map(n=>`<div class="sfxalt-r"><span>${SFX_NO[n]}. ${SFX_NAME[n]}</span>${SFX_VARS[n].map(v=>`<button class="ui-btn ui-btn--chip chipbtn ${(SFX_VARS[n].includes(SFX_ALT[n])?SFX_ALT[n]||'':'')===v?'on':''}" data-act="sfxalt" data-k="${n}" data-v="${v}">${v||'原'}</button>`).join('')}</div>`).join('')}</div>
     <div class="devgrid">${B('sfxaltclr','全部切回原版')}</div>`:''}
     <div class="label">登入與開場（v3.20）</div><div class="devgrid">${B('gtlogin','顯示登入畫面')}${B('gtstory','播放開場故事')}${B('gtreset','重設「已看過開場」')}</div>
     <div class="label">新手導覽（v3.20）</div><div class="devgrid">${B('tutnew','用新存檔從頭跑導覽（會清空目前進度）')}${B('tutrestart','保留存檔，從第 1 步重看')}${B('tutnext','導覽跳下一步')}${B('tipreset','重設各系統第一次說明')}</div>
     <div class="label">排行榜（v3.46 真人版）</div><div class="devgrid">${B('lbtop','上傳我的紀錄並重新讀取')}${B('lbmid','重新讀取排行榜')}${B('lbreset','清除排行榜紀錄與獎勵')}${B('lbtie','測試同戰力名次（先達成在前）')}</div>
     <div class="label">2. 指定下一次強化結果（只對測試武器有效）</div>
     <div class="row">${[['ok','成功'],['fail','普通失敗'],['break','爆裝'],['saved','防爆'],['','不指定']].map(([k,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(DEV.force||'')===k?'on':''}" data-act="devforce" data-k="${k}">${n}</button>`).join('')}</div>
     <div class="small muted">目前：${DEV.force?{ok:'成功',fail:'普通失敗',break:'爆裝',saved:'防爆'}[DEV.force]:'不指定（照正常機率）'}</div>
     <div class="label">3. 只播放強化動畫（不做任何判定）</div><div class="small muted">爆裝／失敗／防爆時停在第幾道符文</div><div class="row">${[[-1,'隨機'],[0,'第 1 道'],[2,'第 3 道'],[4,'第 5 道'],[6,'第 7 道']].map(([v,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devStop??-1)===v?'on':''}" data-act="devset" data-k="devStop" data-v="${v}">${n}</button>`).join('')}</div><div class="small muted">武器類型</div><div class="row">${Object.entries({axe:'斧',sword:'劍',spear:'長矛',bow:'弓',shield:'盾'}).map(([k,n])=>`<button class="ui-btn ui-btn--chip chipbtn ${(ui.devFxW||'axe')===k?'on':''}" data-act="devsets" data-k="devFxW" data-v="${k}">${n}</button>`).join('')}</div><div class="small muted">安全區（約 0.5 秒）</div><div class="devgrid">${B('fxs_ok','安全區・成功')}${B('fxs_fail','安全區・失敗')}</div>
     <div class="small muted">危險區（約 2.8 秒）</div><div class="devgrid">${B('fx_ok','危險區・成功')}${B('fx_fail','危險區・失敗')}${B('fx_broke','危險區・爆裝')}${B('fx_saved','危險區・防爆')}</div>`,
   test:`<div class="devgrid">${B('tsec','安全設定檢查（v3.65）','btn-primary')}${B('tlbsv','排行榜上傳檢查')}${B('tquick','執行快速測試')}${B('tecon','執行 30 天經濟模擬')}${B('ticon','檢查 App icon')}</div>${ui.testOut?`<div class="test-out">${ui.testOut}</div>`:''}`,
   ui:tab==='ui'?uiGallery():'',
   mk:`<div class="label">交易所（v3.41）</div><div class="small muted" style="margin-bottom:6px">${AUTH?'目前連線真實伺服器（'+esc(S.nick||AUTH.user.email)+'）':'未登入：交易所使用「離線模擬」，只存在這支手機，用來測試畫面與流程'}</div>
     <div class="devgrid">${B('mkopen','開啟交易所')}${B('mksettle','立即結算我的成交／過期')}</div>
     <div class="label">離線模擬專用（未登入時）</div><div class="devgrid">${B('mksold','模擬：我最新的上架被買走')}${B('mkexp','模擬：我的上架全部過期')}${B('mkreset','重設模擬市場')}</div>`,
   save:`<div class="label">取暱稱預覽（v3.38，不用登入、不連伺服器）</div><div class="devgrid">${B('cnameprev','預覽「註冊後取名」流程')}</div><div class="small muted" style="margin:4px 0 8px">輸入「冰脊」或「測試重複」可看重複暱稱的提示；確定後會接著播開場故事。</div>
     <div class="label">雲端存檔（v3.34）</div><div class="small" style="margin-bottom:6px">${AUTH?`帳號：${AUTH.user.email}<br>狀態：${CLOUD.busy?'同步中…':CLOUD.err?'⚠ '+CLOUD.err:CLOUD.last?'已同步 '+new Date(CLOUD.last).toLocaleTimeString():'尚未同步'}${CLOUD.dirty?'（有未上傳的變更）':''}`:'目前是訪客（只存在這支手機）'}</div>
     <div class="devgrid">${AUTH?B('cpush','立即上傳到雲端')+B('cpull','從雲端下載（覆蓋本機）')+B('clogout','登出')+B('cname','開啟取名畫面'):B('gtlogin','開啟登入畫面')}</div>
     <div class="devgrid">${B('v2','載入 v2 測試存檔（遷移）')}${B('reset',ui.confirmReset?'再按一次確認重置':'重置存檔','btn-danger')}</div>
     <div class="label">開發者模式</div><div class="devgrid"><button class="ui-btn ui-btn--secondary btn btn-sec sm" data-act="devoff">關閉開發者模式</button></div><div class="small muted">再次開啟：連點左上角鐵匠徽章 20 下（正式網站只限管理員帳號）。</div>`}[tab];
  return `<div class="sheet-head"><span style="width:44px"></span><h2>開發工具</h2>${btn(img('ic_close'),'close',{cls:'icon-btn img'})}</div>
  <div class="devtabs">${DEV_TABS.map(([k,n])=>`<button class="ui-tab ${tab===k?'on':''}" data-act="devtab" data-k="${k}">${n}</button>`).join('')}</div><div class="dev">${body}</div>`;
}

let forceEvent=-1;
function devdo(k){if(k==='cpush'){toast('上傳中…');cloudPush(true).then(()=>{toast(CLOUD.err?'上傳失敗：'+CLOUD.err:'已上傳到雲端',CLOUD.err?'bad':'ok');render()});return}
  if(k==='cpull'){cloudPull().then(()=>toast('已從雲端下載','ok')).catch(e=>toast('下載失敗：'+SB_ERR(e.message),'bad'));return}
  if(k==='clogout'){ui.sheet=null;return cloudLogout()}
  if(k==='mkopen'){ui.sheet=null;ui.tab='market';mkLoad();return render()}
  if(k==='mksettle'){mkSettle(false).then(()=>mkLoad());return}
  if(k==='mksold'||k==='mkexp'||k==='mkreset'){if(AUTH)return toast('這是離線模擬專用（請先登出）','bad');if(k==='mkreset'){try{localStorage.removeItem('nrs-mkmock')}catch(e){}MK.t=0;return toast('模擬市場已重設','ok')}
    const db=mkMockDB(),mine=db.rows.filter(r=>r.seller==='me'&&r.status==='open');if(!mine.length)return toast('你目前沒有上架中的武器','bad');
    if(k==='mksold'){mine[0].status='sold';mine[0].buyer='npc'}else mine.forEach(r=>r.expires_at=new Date(Date.now()-1000).toISOString());mkMockSave(db);toast(k==='mksold'?'已模擬被買走，按「立即結算」或重新開啟交易所入帳':'已模擬過期','ok');return}
  if(k.startsWith('uidot_')){const t=k.slice(6);ui.sheet=null;ui.result=null;   // v3.64 紅點提醒測試
    if(t==='w'){const w=S.weapons.filter(x=>!x.test).sort((a,c)=>c.id-a.id)[0];if(!w)return toast('武器庫沒有武器','bad');S.seenW=w.id-1;ui.tab='forge';render();return toast('武器庫分頁應該亮紅點；點進去最新那把有 NEW，離開武器庫後消失')}
    if(t==='bp'){const b=BPS.filter(x=>!bpLock(x)).pop();bpSeen();S.bpSeen=S.bpSeen.filter(x=>x!==b.id);ui.tab='village';render();return toast(`鐵匠鋪分頁和「圖紙」小分頁應該亮紅點；${b.n} 有 NEW，點選後消失`)}
    if(t==='full'){const i=S.villages.findIndex(st=>st.weaponId!=null&&W(st.weaponId));if(i<0)return toast('先交付一把武器到村莊','bad');const st=S.villages[i],w=W(st.weaponId);
      st.cycleStart=NOW()-dur(i,w)*(capCycles(i,w)+1);tick();ui.tab='forge';render();return toast('村莊分頁的紅點應該變大、更醒目；收成後恢復')}
    if(t==='mk'){S.mkNew=1;ui.tab='forge';render();return toast('交易所分頁應該亮紅點，點進去後消失')}
    if(t==='mon'){if(!monthlyOn())S.monthly.until=NOW()+30*864e5;S.monthly.last='';ui.tab='forge';render();return toast('商城分頁和「領 50 鑽」按鈕應該亮紅點')}
    const L=[['村莊：可收成',S.villages.some(v=>v.bank.cycles)],['村莊：倉庫滿',S.villages.some((x,i)=>vState(i)[0]==='full')],['村莊／武器庫：可交付或可換更強',anyGive()],['村莊：成就可領 '+achReadyN(),achReadyN()>0],
      ['武器庫：新武器',S.weapons.some(wNew)],['鐵匠鋪：學徒有空可開工',forgeIdle()],['鐵匠鋪：新圖紙',BPS.some(bpNew)],['交易所：有成交／退回',S.mkNew>0],['商城：月卡可領',monthlyDot()]];
    ui.result={t:'info',title:'目前的紅點',html:L.map(([n,v])=>`<div class="kv"><span>${n}</span><b class="${v?'t-danger':'muted'}">${v?'亮':'—'}</b></div>`).join('')};return render()}
  if(k==='uigive'){const gm=giveMin(),nv=gm.map((m,i)=>m===-1?i:-1).filter(i=>i>=0);if(!nv.length)return toast('目前沒有村莊在等武器（全部都有駐守）','bad');   // v3.64 可交付紅點測試
    const i=nv[0],v=VILLAGES[i],b=Object.values(BP).filter(x=>x.cat===v.cat).sort((a,c)=>c.t-a.t)[0],w=makeWeapon(b.id,4,0,[],v.need?[{k:v.need,v:AFFIX[v.need].max},null,null,null]:undefined);
    while(!eligible(i,w)&&w.lv<15)w.lv++;ui.sheet=null;ui.result=null;ui.tab='armory';ui.acat='all';ui.aq=ui.ast='all';save();render();scrollTo(0,0);
    return toast(`已送出 ${b.n} +${w.lv}（可交付 1-${i+1} ${v.name}），武器卡、武器庫和村莊分頁應該都有紅點`,'ok')}
  if(/^ui(v|arm|forge|mat|shop)$/.test(k)){ui.sheet=null;ui.result=null;   // v3.61 介面修正的測試按鈕
    if(k==='uiv'){ui.tab='village';render();return scrollToNextVillage()}
    if(k==='uiarm'){ui.tab='armory';render();return scrollTo(0,500)}
    if(k==='uiforge'){ui.tab='forge';ui.ftab='bp';render();const h=document.querySelector('#view .hscroll');if(h)scrollTo(0,h.getBoundingClientRect().top+scrollY-200);return toast('手指放在圖紙列上直接上下滑，整頁應該會跟著捲')}
    if(k==='uimat'){ui.tab='forge';ui.ftab='mat';ui.result={t:'info',...matInfo('shard')};return render()}
    ui.tab='shop';render();const m=document.querySelector('#view .mlist');if(m)scrollTo(0,m.getBoundingClientRect().top+scrollY-160);return}
  if(k==='cnameprev'){ui.sheet=null;render();return showName(true,true)}
  if(k==='cname'){ui.sheet=null;render();return showName(!S.nick)}if(k==='sfxaltclr'){SFX_VAR_KEYS.forEach(n=>{if(SFX_ALT[n])sfxSetAlt(n,'')});toast('音效已全部切回原版');return render()}
  const m=S.mats,give=(b,q,lv,ench,traits)=>{makeWeapon(b,q,lv,traits,ench);toast('已放入武器庫')};
  if(k.startsWith('fxs_')){if(ui.busy)return;return testFx(k.slice(4),true)}
  if(k.startsWith('fxg_')){if(ui.busy)return;return testFx(k.slice(4),false,true)}
  if(k.startsWith('fx_')){if(ui.busy)return;return testFx(k.slice(3))}
  if(k==='lbtie'){if(!AUTH)return toast('要先登入才能測試','bad');const R=LBR.rows,T=LBR.t,B0=S.best[0],me=AUTH.user.id,w={b:Object.keys(BP)[0],q:0,lv:0};
    S.best[0]={p:5000,...w,traits:[],ench:[],sub:true};LBR.t=1;LBR.rows={0:[{user_id:'a',nick:'早到',p:5000,w,updated_at:'2026-01-01T00:00:00Z'},{user_id:me,nick:'我',p:5000,w,updated_at:'2026-01-02T00:00:00Z'},{user_id:'b',nick:'晚到',p:5000,w,updated_at:'2026-01-03T00:00:00Z'}]};
    const r1=lbRank(0),o1=lbRows(0).map(x=>x.n).join('>');LBR.rows[0][1].p=4000;const r2=lbRank(0);   // 伺服器還沒更新到 5000 → 自己當作最晚
    LBR.rows=R;LBR.t=T;if(B0)S.best[0]=B0;else delete S.best[0];
    const ok=r1===2&&o1==='早到>'+(S.nick||'你')+'>晚到'&&r2===3;return toast(`同戰力測試${ok?'通過':'失敗'}：名次 ${r1}（應為 2）、未上傳 ${r2}（應為 3）<br>${o1}`,ok?'ok':'bad')}
  if(k==='lbtop'||k==='lbmid'){if(k==='lbtop'){lbSync().then(()=>lbFetch(true));toast('已上傳我的紀錄並重新讀取')}else{lbFetch(true);toast('重新讀取排行榜')}ui.sheet={t:'lb',i:0};return render()}
  if(k==='lbreset'){S.best={};S.lbRw={};save();toast('排行榜紀錄已清除');ui.sheet={t:'lb',i:0};return render()}
  if(k==='tutnew'){localStorage.removeItem(KEY);S=fresh();S.tut=0;save();ui.sheet=null;ui.tab='forge';ui.ftab='bp';render();return toast('已換成新存檔，從第 1 步開始導覽')}
  if(k==='tutrestart'){S.tut=0;save();ui.sheet=null;ui.tab='forge';ui.ftab='bp';render();return}
  if(k==='tipreset'){S.tips={};save();return toast('各系統說明已重設，第一次打開時會再出現')}
  if(k==='tutnext'){if(typeof S.tut==='number'&&S.tut<TUT.length)tutStep(S.tut+1);return}
  if(k==='gtlogin'){ui.sheet=null;render();return showLogin()}
  if(k==='gtstory'){ui.sheet=null;render();return showStory()}
  if(k==='gtreset'){S.introSeen=0;save();return toast('下次登入後會再播放開場故事')}
  if(k==='tlack'){DEV_LACK=Date.now()+15000;ui.sheet=null;ui.tab='forge';ui.ftab='bp';ui.cat='all';ui.bp='t1_huntbow';ui.qty=1;render();setTimeout(()=>{startForge();setTimeout(render,15100)},400);return toast('測試：15 秒內當作材料不夠，按「開始鍛造」會顯示缺什麼')}   // v3.59
  if(k==='tharvest'){const i=S.villages.findIndex(st=>st.weaponId!=null&&st.cycleStart!=null&&W(st.weaponId));if(i<0)return toast('先交付一把武器到村莊','bad');const w=W(S.villages[i].weaponId);
    S.villages[i].cycleStart=NOW()-dur(i,w)+2000;ui.sheet=null;ui.tab='village';render();return toast(`1-${i+1} 兩秒後完成一輪，停在這頁看「收成」按鈕會不會自己出現`)}   // v3.59
  if(k==='autoenh'){const w=makeWeapon('t1_ironhammer',1,0);S.gold=Math.max(S.gold,5000);ui.sheet={t:'w',id:w.id,m:'main'};autoEnhance(w.id);return}   // 測試一鍵強化：放一把 +0 鐵錘、補到 5000 金後執行
  
  if(k==='tsec'){ui.testOut='檢查中…';render();   // v3.63 確認開發者工具、伺服器防作弊已更新
    const row=(ok,t)=>`<div>${ok?'✓':'✗'} ${t}</div>`;
    Promise.all([AUTH?adminCheck():Promise.resolve(false),fetch(SB_URL+'/rest/v1/rpc/ac_version',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:'{}'}).then(r=>r.ok?r.json():null).catch(()=>null)]).then(([adm,ver])=>{
      ui.testOut=`<div><b>安全設定檢查</b></div>`+row(true,'網站模式：'+(CLOUD_ONLY?'正式（只能雲端存檔）':'測試版（本機）'))+row(!!AUTH,'登入帳號：'+(AUTH?esc(AUTH.user.email):'未登入'))
        +row(adm||!CLOUD_ONLY,'管理員：'+(adm?'是（可以使用開發者工具）':CLOUD_ONLY?'否（正式網站不能開開發者工具）':'否（測試版不限制）'))
        +row(parseFloat(ver)>=3.63,'伺服器防作弊版本：'+(ver||'讀不到（v3.63 的 SQL 還沒執行）'))+row(parseFloat(ver)>=3.65,'排行榜戰力由伺服器計算：'+(parseFloat(ver)>=3.65?'是':'否（04_leaderboard_v3.65.sql 還沒執行）'))
        +row(true,'一般玩家連點頭像 20 下：'+(CLOUD_ONLY?'不會開啟開發者工具':'測試版會開啟'));render()});return}
  if(k==='tlbsv'){ui.testOut='檢查中…';render();   // v3.65 每座村莊：本機最佳戰力、是否已上傳、伺服器上的戰力
    (async()=>{if(AUTH){await lbSync();LBR.t=0;await lbFetch(true)}
      const me=AUTH&&AUTH.user.id,rows=VILLAGES.map((v,i)=>{const b=S.best[i],r=me&&(LBR.rows[i]||[]).find(x=>x.user_id===me);if(!b&&!r)return'';
        const ok=b&&r&&r.p===b.p;return`<div>${ok?'✓':b&&!b.sub?'…':'✗'} ${esc(v.name)}：本機 ${b?b.p:'—'}${b&&!b.sub?'（等待上傳）':''}・伺服器 ${r?r.p:'—'}</div>`}).join('');
      ui.testOut='<div><b>排行榜上傳檢查</b></div>'+(AUTH?'':'<div>未登入，只顯示本機紀錄</div>')+(rows||'<div>還沒有任何交付紀錄</div>');render()})();return}
  if(k==='ticon'){const ls=[...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')];
    ui.testOut='<div><b>App icon 設定（'+ls.length+'/4）</b></div>'+ls.map(l=>`<div style="display:flex;align-items:center;gap:8px;margin:4px 0">${l.rel==='manifest'?'':`<img src="${l.getAttribute('href')}" style="width:${l.sizes&&l.sizes.value?parseInt(l.sizes.value):48}px;max-width:64px;border-radius:12px">`}<span>${l.rel} ${l.sizes&&l.sizes.value||''} → ${l.getAttribute('href')}</span></div>`).join('');
    fetch('manifest.webmanifest').then(r=>r.json()).then(m=>{ui.testOut+=`<div>manifest：${m.name}，icons ${m.icons.length} 個 ✓</div>`;render()}).catch(()=>{ui.testOut+='<div>manifest 讀取失敗 ✗</div>';render()});render();return}
  if(k==='tquick'||k==='tecon'){if(typeof runTests!=='function'){ui.testOut='載入測試程式中…';render();const sc=document.createElement('script');sc.src='tests.js?v='+BUILD_ID;sc.charset='utf-8';sc.onload=()=>devdo(k);sc.onerror=()=>{ui.testOut='測試程式沒有載入。';render()};document.head.appendChild(sc);return}
    ui.testOut='執行中…';render();setTimeout(()=>{ui.testOut=k==='tquick'?runTests('quick'):runTests('econ');render()},30);return}
  ({gold:()=>S.gold+=5000,gems:()=>S.gems+=1000,t1:()=>{m.iron+=30;m.oak+=30;m.leather+=30},t2:()=>{m.silver+=20;m.fang+=20},t3:()=>{m.scale+=10;m.rune+=10},
   mon:()=>{m.fur+=5;m.icecore+=5;m.fireheart+=5;m.serpent+=5},shard:()=>m.shard+=10,items:()=>{S.items.scroll+=5;S.items.bless+=5},bp:()=>S.items.blueprint++,slag:()=>S.slag+=30,
   hunt:()=>{tick();S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(w)for(let c=0;c<10;c++)rollCycle(i,w,st)})},
   offline:()=>S.villages.forEach(st=>{if(st.cycleStart!=null)st.cycleStart-=8*3600000/S.speed}),
   forge:()=>S.jobs.forEach(j=>j.end=NOW()),unlock:()=>S.villages.forEach(st=>{if(st.status!=='cleared')st.status='cleared'}),
   maxup:()=>{S.furnace=5;S.anvil=5;S.slots=4},w6:()=>give('t2_longsword',2,6),wm:()=>give('m_nidhogg',3,0),w8:()=>give('t3_halberd',3,8,[{k:'dragon',v:30},null,null,null]),
   wt:()=>{['t1_ironsword','t2_warhammer','t3_halberd'].forEach(b=>makeWeapon(b,4,0));toast('已放入 3 把傳說武器，點開看先天特性')},
   danger:()=>{forceEvent=1;toast('1-2 松林哨站下一輪必定受襲（需有駐守武器）')},
   back:()=>{CLOCK.offset-=3600000;toast('模擬裝置時間倒退 1 小時')},fwd:()=>{CLOCK.offset=0;toast('裝置時間已恢復')},
   v2:()=>{const o={gold:999,gems:50,mats:{iron:5,oak:5,leather:5,silver:2,fang:1,scale:0,rune:0,shard:3},items:{scroll:2,bless:0,blueprint:0},furnace:2,anvil:1,slots:1,nextId:4,
     weapons:[{id:1,b:'t1_woodaxe',q:1,lv:3,ench:[{k:'swift',v:8}]},{id:2,b:'t1_farmspear',q:0,lv:2,ench:[]},{id:3,b:'t1_ironsword',q:2,lv:6,ench:[]}],jobs:[],
     villages:VILLAGES.map((v,i)=>({status:i<2?'cleared':i===2?'open':'locked',weaponId:i===0?1:i===1?2:null,cycleStart:i<2?NOW()-60000:null,pending:i===0?5:0})),monthly:{until:0,last:''}};
     S=sanitize(migrateV2(o));S.villages.forEach((st,i)=>{const n=st._pending||0;delete st._pending;const w=st.weaponId!=null&&W(st.weaponId);for(let c=0;c<n;c++)rollCycle(i,w,st)});ui.sheet=null;toast('已載入 v2 測試存檔並遷移成 v3（1-1 累積 5 輪）')},
   achall:()=>{S.stats.harvest=Math.max(S.stats.harvest,300);S.stats.enhOk=Math.max(S.stats.enhOk,50);S.stats.melted=Math.max(S.stats.melted,30);S.stats.forged[0]+=50},
   testw:()=>{const bp=['t1_ironsword','t2_longsword','t3_greatsword','m_firegiant'][ui.devTier??0];const w=makeWeapon(bp,ui.devTier===3?3:2,ui.devLv??0,[]);w.test=true;ui.enhLast=null;ui.riskArm=ui.riskOk=null;ui.sheet={t:'w',id:w.id,m:'enh'};toast('已送出測試武器')},
   allw:()=>devAllWeapons(BPS.map(b=>b.id)),regenw:()=>devAllWeapons(WREGEN),
   cleartest:()=>{const n=S.weapons.filter(w=>w.test&&where(w)<0).length;S.weapons=S.weapons.filter(w=>!w.test||where(w)>=0);toast('已清除 '+n+' 把測試武器')},
   daily:()=>S.monthly.last='',fill:()=>{while(S.weapons.length<195)makeWeapon('t1_woodaxe',0,0,[]);toast('武器庫已塞到 195 把，試試容量上限')},
   reset:()=>{if(!ui.confirmReset){ui.confirmReset=true;return}S=fresh();ui.confirmReset=false;ui.sheet=null;toast('存檔已重置。')}})[k]();
  if(k!=='reset')ui.confirmReset=false;tick();save();if(k==='testw')ui._lastSheet=null;render();
}
// 測試用：強制下一輪受襲（只影響 1-2）
const _eventChance=eventChance;
eventChance=function(i,w){if(forceEvent===i){forceEvent=-1;return 1}return _eventChance(i,w)};

function render(){
  if(QUIET)return;renderRes();renderNav();
  const hs=[...document.querySelectorAll('#view .hscroll,#view .catbar')].map(e=>e.scrollLeft);   // 保留橫向捲動位置（點圖紙不會跳回最前面）
  const V=document.getElementById('view'),y=scrollY,oldHero=V.querySelector(':scope > section.hero'),html=({forge:viewForge,armory:viewArmory,village:viewVillage,shop:viewShop,market:viewMarketPage})[ui.tab]();
  // v3.26 鐵匠鋪上方區塊整塊留在原地（搬動節點也會讓動畫重跑），只更新裡面的委託橫條、工具列等
  let kept=false;if(oldHero){const T=document.createElement('div');T.innerHTML=html;const nh=T.querySelector(':scope > section.hero');
    if(nh){kept=true;oldHero.className=nh.className;[...oldHero.children].forEach(c=>{if(!c.matches('.dp,.smith'))c.remove()});[...nh.children].forEach(c=>{if(!c.matches('.dp,.smith'))oldHero.appendChild(c)});
      [...V.childNodes].forEach(c=>{if(c!==oldHero)c.remove()});let before=true;[...T.childNodes].forEach(c=>{if(c===nh){before=false;return}before?V.insertBefore(c,oldHero):V.appendChild(c)})}}
  if(!kept)V.innerHTML=html;
  if(ui.tab==='armory'){const b=document.querySelector('.bar');if(b)document.documentElement.style.setProperty('--barh',b.offsetHeight+'px')}   // v3.61 武器庫分類列貼在上方資源列下面
  document.body.classList.toggle('bpc',!!V.querySelector(':scope > section.hero.ft-bp.fv-1,:scope > section.hero.ft-bp.fv-2'));   // v3.56 取代 CSS :has()（:has 掛在 body 上，每次 DOM 變動都要整頁重算）
  if(Math.abs(scrollY-y)>2)scrollTo(0,y); // 切換篩選時保持捲動位置
  {const els=[...document.querySelectorAll('#view .hscroll,#view .catbar')];if(els.length===hs.length)els.forEach((e,i)=>e.scrollLeft=hs[i])}
  if(!ui.busy)renderLayer();updateLive();fitNames();
}
// 武器名稱過長時逐步縮小字級（最小 11px），讓 +N 與完整名稱都顯示，不用「…」截斷
// v3.56 效能：先全部讀、再全部寫（舊版每個名稱各自觸發好幾次版面重算，武器庫一多就卡）
function fitNames(){const els=[...document.querySelectorAll('.wt-name')];if(!els.length)return;els.forEach(el=>{if(el.style.fontSize)el.style.fontSize=''});
  const m=els.map(el=>el.scrollWidth>el.clientWidth+.5?[el,el.clientWidth/el.scrollWidth]:null).filter(Boolean);if(!m.length)return;
  const base=parseFloat(getComputedStyle(m[0][0]).fontSize)||14;m.forEach(([el,r])=>{el.style.fontSize=Math.max(11,Math.floor(base*r*2)/2)+'px'});
  m.forEach(([el])=>{let f=parseFloat(el.style.fontSize);if(el.scrollWidth>el.clientWidth+.5&&f>11)el.style.fontSize=Math.max(11,f-1)+'px'})}
if(typeof window!=='undefined')window.addEventListener('resize',()=>fitNames());
function renderLayer(){
  const L=document.getElementById('layer');const s=ui.sheet;let h='';
  const sc=document.querySelector('.sheet'),st=sc?sc.scrollTop:0,same=sc&&ui._lastSheet===JSON.stringify(s);
  if(s){const full=s.t==='w'||s.t==='fxt';h+=`<div class="scrim ${same?'still':''}" data-act="scrim"><div class="ui-sheet sheet ${full?'full':''} ${same?'still':''}">${s.t==='w'?sheetWeapon(s.id,s.m):s.t==='v'?sheetVillage(s.i):s.t==='a'?sheetAch():s.t==='lb'?sheetLb(s.i):s.t==='lbw'?sheetLbW(s.i,s.k):s.t==='ws'?sheetWorkshop(s.k):s.t==='fxt'?sheetFxTest(s):/^mk/.test(s.t)?sheetMk(s):sheetDev()}</div></div>`}
  const r=ui.result;
  if(r&&r.t==='h')h+=`<div class="modal" data-act="rclose"><div class="ui-modal modal-card">${ptitle(r.title)}${r.ev?`<div class="small t-danger center">其中 ${r.ev} 輪受襲：沒有材料、金幣減半</div>`:''}<div class="hgrid">${harvestIcons(r.got)}</div>${btn('確定','rclose',{cls:'btn-primary big'})}</div></div>`;
  if(r&&r.t==='info')h+=`<div class="modal" data-act="rclose"><div class="ui-modal modal-card">${r.icon?`<div class="info-ico">${img(r.icon)}</div>`:''}${ptitle(r.title)}<div class="info-body">${r.html}</div>${btn('知道了','rclose',{cls:'btn-primary big'})}</div></div>`;
  L.innerHTML=h;ui._lastSheet=JSON.stringify(s);document.documentElement.classList.toggle('scrimmed',!!s);
  if(same){const n=document.querySelector('.sheet');if(n)n.scrollTop=st};fitNames()
}
function updateLive(){
  if(QUIET)return;const t=NOW();renderRes();
  S.villages.forEach((st,i)=>{const w=st.weaponId!=null&&W(st.weaponId);if(!w)return;const d=dur(i,w),full=st.bank.cycles>=capCycles(i,w),el=Math.max(0,t-st.cycleStart);
    document.querySelectorAll(`[data-vprog="${i}"]`).forEach(e=>{e.style.width=(full?100:Math.min(100,el/d*100))+'%';e.classList.toggle('full',full)});
    document.querySelectorAll(`[data-vtime="${i}"]`).forEach(e=>e.textContent=full?'倉庫已滿，請收成':S.clockWarn?'時間倒退，暫停中':'剩 '+fmtT(d-el));
    document.querySelectorAll(`[data-vclock="${i}"]`).forEach(e=>e.innerHTML=full?'':`剩 ${clock(d-el,d)}`);
    document.querySelectorAll(`[data-vpend="${i}"]`).forEach(e=>e.textContent=st.bank.cycles)});
  S.jobs.forEach((j,n)=>{document.querySelectorAll(`[data-jprog="${n}"]`).forEach(e=>e.style.width=Math.max(0,Math.min(100,(t-j.start)/(j.end-j.start)*100))+'%');
    document.querySelectorAll(`[data-jtime="${n}"]`).forEach(e=>e.textContent=t>=j.end?'完成':'剩 '+fmtT(j.end-t))});
}
function toast(html,kind){if(QUIET)return;if(kind==='bad')snd('ui_error');const box=document.getElementById('toasts');if(!box)return;const d=document.createElement('div');d.className='ui-toast toast '+(kind||'');d.innerHTML=html;box.appendChild(d);setTimeout(()=>d.remove(),2600);while(box.children.length>2)box.firstChild.remove()}

function bindUI(){
['pointerdown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{sfxPreload()},{passive:true,once:false}));
const uiSndOf=a=>a==='tab'||a==='ftab'||a==='cat'||a==='acat'?'ui_tab':['close','scrim','rclose','backArmory'].includes(a)?'ui_close':['wopen','vopen','sheetW','sheetA','sheetM','dev','achopen','wmode','player'].includes(a)?'ui_open':'ui_click';
let PD_SND=0;
// v3.25 橫向捲動列（圖紙、分類）在 iPhone 上：慣性滑動中的第一下、或手指微晃，系統會把點擊吃掉 → 自己判斷「點一下」
let TAP0=null,TAP_EL=null,TAP_T=0,TAP_XY=[0,0];
const TAP_SEL='.hscroll [data-act],.catbar [data-act],#nav [data-act],#res [data-act]';
document.addEventListener('touchstart',e=>{const b=e.target.closest(TAP_SEL);const t=e.touches[0];TAP0=b&&e.touches.length===1?{b,x:t.clientX,y:t.clientY,t:Date.now()}:null},{passive:true,capture:true});
document.addEventListener('touchend',e=>{const o=TAP0;TAP0=null;if(!o||o.b.disabled||!o.b.isConnected)return;const t=e.changedTouches[0];
  if(Math.abs(t.clientX-o.x)<12&&Math.abs(t.clientY-o.y)<12&&Date.now()-o.t<600){if(e.cancelable)e.preventDefault();TAP_EL=o.b;TAP_T=Date.now();TAP_XY=[t.clientX,t.clientY];o.b.click()}},{passive:false,capture:true});
// v3.23 手指按住按鈕的期間暫停定時重畫，避免按鈕在按下與放開之間被換掉而吃掉點擊（需要按兩次的原因）
document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-act],button,input,select,label'))PTR_DOWN=true},{passive:true,capture:true});
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>{if(!PTR_DOWN)return;setTimeout(()=>{PTR_DOWN=false;if(PTR_PEND){PTR_PEND=false;render()}},60)},{passive:true,capture:true}));   // 介面音效在手指按下的瞬間就播放，不等放開
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act;if(['enhance','fxskip','devdo','mute','sndtest','sfxalt','scrim','sndvol'].includes(a)||b.closest('.hscroll,.catbar')||(a==='rclose'&&e.target!==b))return;snd(uiSndOf(a));PD_SND=Date.now()},{passive:true});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;if(e.isTrusted&&TAP_EL&&Date.now()-TAP_T<700&&(b===TAP_EL||Math.abs(e.clientX-TAP_XY[0])<30&&Math.abs(e.clientY-TAP_XY[1])<30))return;const a=b.dataset.act,d=b.dataset;sfxPreload();
  if(!['enhance','fxskip','devdo','mute','sndtest','sfxalt'].includes(a)&&Date.now()-PD_SND>700)snd(uiSndOf(a));
  if((a==='scrim'||a==='rclose')&&e.target!==b&&!e.target.matches('button'))return;
  if(a!=='melt')ui.meltArm=null;
  ({tab:()=>{if(ui.busy&&ui.fxDone)ui.fxDone();if(ui.tab==='armory'&&d.k!=='armory'&&S.weapons.some(wNew)){S.seenW=S.nextId-1;save()}if(d.k==='market'&&S.mkNew){S.mkNew=0;save()}ui.tab=d.k;if(d.k==='market'&&(AUTH||mkMock())&&Date.now()-MK.t>20000)setTimeout(mkLoad,0);ui.sheet=null;ui.enhLast=null;render();d.k==='village'?scrollToNextVillage():scrollTo(0,0)},close:()=>{if(ui.busy)return;ui.sheet=null;ui.enhLast=null;ui.riskArm=null;ui.riskOk=null;render()},scrim:()=>{if(ui.busy)return;ui.sheet=null;ui.enhLast=null;render()},dev:()=>{ui.sheet={t:'d'};render()},achopen:()=>{ui.sheet={t:'a'};render()},
   sheetW:()=>{ui.sheet={t:'ws',k:'w'};render()},sheetA:()=>{ui.sheet={t:'ws',k:'a'};render()},sheetM:()=>{ui.sheet={t:'ws',k:'m'};render()},
   devdo:()=>devdo(d.k),speed:()=>{tick();const t=NOW(),old=S.speed,nw=+d.k;
     S.villages.forEach(st=>{if(st.cycleStart!=null)st.cycleStart=t-(t-st.cycleStart)*old/nw});S.jobs.forEach(j=>{j.start=t-(t-j.start)*old/nw;j.end=t+(j.end-t)*old/nw});S.speed=nw;save();render()},
   cap:()=>{S.capH=+d.k;save();render()},ftab:()=>{ui.tab='forge';ui.ftab=d.k;ui.sheet=null;render()},cat:()=>{ui.cat=d.k;render()},acat:()=>{ui.acat=d.k;render()},
   aidle:()=>{ui.aidle=!ui.aidle;render()},alock:()=>{ui.alock=!ui.alock;render()},bp:()=>{ui.bp=d.k;ui.qty=1;if(!bpSeen().includes(d.k)){S.bpSeen.push(d.k);save()}render()},qty:()=>{ui.qty=Math.max(1,Math.min(10,+d.k));render()},forge:startForge,
   cancelJob:()=>{if(cancelJob(+d.i))toast('已取消，材料與金幣全額退回。');render()},
   wopen:()=>{ui.sheet={t:'w',id:+d.id,m:'main'};render()},wmode:()=>{if(ui.busy)return;ui.enhLast=null;ui.riskArm=null;ui.riskOk=null;ui.sheet={t:'w',id:+d.id,m:d.m};render()},vopen:()=>{ui.sheet={t:'v',i:+d.i};render()},
   lock:()=>{const w=W(+d.id);if(w){w.lock=!w.lock;save();toast(w.lock?'已收藏，這把武器不會被熔解。':'已取消收藏。')}render()},eslot:()=>{ui.enchSlot=+d.k;render()},
   collect:()=>{tick();collect(+d.i);render()},collectAll,deliver:()=>deliver(+d.i,+d.id),recall:()=>recall(+d.i),strat:()=>{if(setStrategy(+d.i,d.k))toast('已切換為「'+STRATS[d.k].n+'」');render()},
   melt:()=>{const id=+d.id;if(ui.meltArm!==id){ui.meltArm=id;return render()}ui.meltArm=null;const g=meltCore(id);if(g){snd('melt');toast('熔解完成：'+gotText(g),'ok');ui.sheet=null}render()},meltCheap,
   enhance:()=>enhance(+d.id),achv:()=>{ui.achV=d.k;render()},lbw:()=>{ui.sheet={t:'lbw',i:+d.i,k:+d.k};render()},lbopen:()=>{ui.sheet={t:'lb',i:+(d.i??S.villages.findIndex(v=>v.status!=='cleared')-1)};render()},achtab:()=>{ui.achTab=d.k;render()},achAll:claimAllAch,autoEnh:()=>autoEnhance(+d.id),enchant:()=>enchant(+d.id,+d.s,false),enchantD:()=>enchant(+d.id,+d.s,true),dkey:()=>{ui.directKey=d.k;render()},
   ach:()=>{if(claimAch(d.k))toast('成就獎勵已領取','ok');render()},slag:()=>{if(slagTrade(+d.i))toast('兌換完成','ok');render()},rclose:()=>{ui.result=null;render()},
   fxskip:()=>{ui.fxDone&&ui.fxDone()},fxclose:()=>{ui.busy=false;render()},backArmory:()=>{ui.sheet=null;ui.enhLast=null;ui.tab='armory';render()},
   uiskinp2:()=>p2Toggle(),
   trinfo:()=>{ui.result=Object.assign({t:'info'},traitInfo(d.k,d.v));render()},
   sfxalt:()=>{sfxSetAlt(d.k,d.v);const was=S.mute;S.mute=false;setTimeout(()=>{d.k==='enh_spoke'?[0,1,2,3].forEach(i=>setTimeout(()=>snd('enh_spoke',.85+i*.09),i*250)):snd(d.k);S.mute=was},250);render()},
   sndtest:()=>{const was=S.mute;S.mute=false;if(d.k==='_spokes'){for(let i=0;i<8;i++)setTimeout(()=>snd('enh_spoke',.85+i*.09),i*250)}else snd(d.k);S.mute=was},
   herov:()=>{ui.heroV=d.k;render()},villv:()=>{ui.villV=d.k;render()},villtab:()=>{ui.villTab=d.k;render()},achv2:()=>{ui.achV2=d.k;render()},forgev:()=>{ui.forgeV=d.k;render()},achgrp:()=>{ui.achOpen=ui.achOpen===d.k?null:d.k;render()},enhv:()=>{ui.enhV=d.k;render()},enchv:()=>{ui.enchV=d.k;render()},enchmode:()=>{ui.enchMode=d.k;render()},
   uidpv:()=>{const on=document.body.classList.toggle('dpv');try{localStorage.setItem('nrs-dpv',on?'1':'0')}catch(e){}render()},
   uifpv:()=>{document.body.classList.toggle('fpv');render()},
   uiskintest:()=>{if(UI_SKIN['btn-primary']&&UI_SKIN['btn-primary']._test){UI_SKIN['btn-primary']=null}else{UI_SKIN['btn-primary']={src:'art/ui_btn_wood.webp',slice:[40,70,40,70],border:[12,24,12,24],css:'padding:2px 10px',_test:true}}applySkin();render()},
   devoff:()=>setDev(false),mute:()=>sndSettings(),sndmute:()=>{S.mute=!S.mute;save();if(!S.mute)snd('ui_click');sndSettings()},devset:()=>{ui[d.k]=+d.v;render()},devsets:()=>{ui[d.k]=d.v;render()},noItem:()=>{ui[d.k]=false;ui.riskArm=null;render()},devforce:()=>{DEV.force=d.k||null;toast(DEV.force?'下一次強化測試武器時會套用指定結果':'已取消指定');render()},forgeCat:()=>{ui.tab='forge';ui.ftab='bp';ui.cat=d.k;const f=BPS.find(b=>b.cat===d.k&&!bpLock(b));if(f)ui.bp=f.id;render();scrollTo(0,0)},matinfo:()=>{ui.result={t:'info',...matInfo(d.k)};render()},aclear:()=>{ui.acat='all';ui.aq='all';ui.ast='all';render()},info:()=>{ui.result={t:'info',...INFO[d.k]()};render()},devtab:()=>{ui.devTab=d.k;render()},
   shoptab:()=>{ui.shopTab=d.k;if(d.k==='mk'&&(AUTH||mkMock()))mkLoad();render()},mktab:()=>{MK.tab=d.k;render()},mkcat:()=>{MK.cat=d.k;render()},mkcur:()=>{MK.cur=d.k;render()},mksort:()=>{MK.sort=d.k;render()},mkref:()=>mkLoad(),
   mkview:()=>{ui.sheet={t:'mkw',id:+d.id};render()},mkbuy:()=>mkBuy(+d.id),mkcancel:()=>mkCancel(+d.id),mksellw:()=>{ui.mkPrice='';ui.sheet={t:'mks',id:+d.id};render()},mkscur:()=>{MK.sellCur=d.k;render()},
   mksell:()=>{const v=document.getElementById('mkprice');if(v)ui.mkPrice=v.value;mkList(+d.id,MK.sellCur,ui.mkPrice)},mklogin:()=>showLogin(),
   rename:()=>{ui.result=null;render();showName(!S.nick)},
   player:()=>{const t=Date.now();ui.tapN=(t-(ui.tapT||0)<1500?(ui.tapN||0):0)+1;ui.tapT=t;if(ui.tapN>=20&&(!CLOUD_ONLY||CLOUD.admin)){ui.tapN=0;clearTimeout(ui.lvT);ui.result=null;setDev(!devMode());toast(devMode()?'已開啟開發者模式，右上角出現齒輪。':'已關閉開發者模式。')}else{clearTimeout(ui.lvT);const n=ui.tapN;ui.lvT=setTimeout(()=>{if(ui.tapN===n)showLevel()},300)}},
   buy:()=>buyMat(d.k,+d.p,+d.n),sell:()=>sellMat(d.k,+d.n),up:()=>upgrade(d.k),hire,topup:()=>{S.gems+=+d.n;toast('測試儲值：鑽石 +'+d.n,'ok');save();render()},
   monthly,claim:claimMonthly,item:()=>buyItem(d.k,+d.n),speedHunt,speedForge,pull:()=>pull(+d.n)
  })[a]?.();
});
document.addEventListener('wheel',e=>{const h=e.target.closest('.hscroll,.catbar,.realms,.devtabs');if(h&&Math.abs(e.deltaY)>Math.abs(e.deltaX)&&h.scrollWidth>h.clientWidth){h.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-act]')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{if(e.target.id!=='mkprice')return;ui.mkPrice=e.target.value;const p=Math.max(0,Math.floor(+e.target.value||0)),net=Math.floor(p*(1-MK_FEE)),q=x=>document.querySelector(x);
  if(q('.mk-fee'))q('.mk-fee').textContent=p?'-'+fmt(p-net):'—';if(q('.mk-net'))q('.mk-net').textContent=p?fmt(net)+' '+MK_CUR[MK.sellCur][1]:'—';const bt=q('[data-act=mksell]');if(bt)bt.disabled=p<MK_MIN});
document.addEventListener('input',e=>{if(e.target.id!=='sndvol')return;S.vol=+e.target.value/100;const o=document.querySelector('.snd-v');if(o)o.textContent=e.target.value+'%'});
document.addEventListener('change',e=>{const id=e.target.id;if(id==='mkprice')return;if(id==='sndvol'){save();snd('ui_click');return sndSettings()}if(id==='usescroll'||id==='usebless'){ui.riskArm=null}if(id==='aq')ui.aq=e.target.value;if(id==='ast')ui.ast=e.target.value;if(id==='usescroll')ui.useScroll=e.target.checked;if(id==='usebless')ui.useBless=e.target.checked;if(id==='usebp')ui.useBp=e.target.checked;if(id==='asort')ui.asort=e.target.value;render()});
}

// v3.17 景深視差：把指標位置／手機傾斜換成 -1～1 的 --mx --my，前後景依深度反向位移
// v3.56 只在正式網站註冊快取（Claude 測試版是沙盒，不用）
if(typeof navigator!=='undefined'&&'serviceWorker' in navigator&&/github\.io$/.test(location.hostname))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
function dpInit(){if(typeof window==='undefined'||window._dpOn)return;window._dpOn=1;const R=document.documentElement;let tx=0,ty=0,x=0,y=0;
  let set=(a,b)=>{tx=Math.max(-1,Math.min(1,a));ty=Math.max(-1,Math.min(1,b))};
  addEventListener('pointermove',e=>set(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1),{passive:true});
  addEventListener('deviceorientation',e=>{if(e.gamma!=null)set(e.gamma/25,(e.beta-40)/25)},{passive:true});
  // v3.56 省電：數值收斂後停掉 rAF，只在指標／陀螺儀有變化時才重新啟動；數值沒變就不寫 CSS 變數（避免整頁重算樣式）
  let run=0,lx='',ly='';const loop=()=>{const b=document.body.classList;if(!b.contains('dpv')&&!b.contains('gating')||document.hidden){run=0;return}
    x+=(tx-x)*.06;y+=(ty-y)*.06;const sx=x.toFixed(2),sy=y.toFixed(2);if(sx!==lx){R.style.setProperty('--mx',sx);lx=sx}if(sy!==ly){R.style.setProperty('--my',sy);ly=sy}
    if(Math.abs(tx-x)<.005&&Math.abs(ty-y)<.005){run=0;return}requestAnimationFrame(loop)};
  window._dpKick=()=>{if(!run){run=1;requestAnimationFrame(loop)}};const _set=set;set=(a,b)=>{_set(a,b);window._dpKick()}}

/* ---------- v3.20 登入畫面＋開場故事（景深圖層；雲端帳號尚未接上前，登入／註冊先提示，用訪客進入） ---------- */
const STORY=[['story_1','世界樹的枝幹開始枯裂，黑暗吞沒了九界，巨人與惡龍從迷霧中甦醒。','s1'],
 ['story_2','人類之境米德加德，村莊被狼群與巨人包圍，手上只剩生鏽的斧頭和斷弦的弓。','s2'],
 ['story_3','一名流浪的鐵匠，揹著鐵砧與鐵鎚，在黎明時走進了鐵爐村。','s3'],
 ['story_4','熄滅多年的熔爐再次燃起──為村莊打造武器，奪回九界，從這一鎚開始。','s4']];
const STORY_HAS={story_1:1,story_2:1,story_3:1,story_4:1};
const LG=n=>'art/login/'+n+'.webp';
function gateEl(){let g=document.getElementById('gate');if(!g){g=document.createElement('div');g.id='gate';document.body.appendChild(g)}return g}
function gateClose(){const g=document.getElementById('gate');if(g){g.classList.add('out');setTimeout(()=>{if(g.classList.contains('out'))g.remove()},450)}document.body.classList.remove('gating')}
const gEmb=(n,cls)=>Array.from({length:n},(_,k)=>`<img class="gt-em e${k} ${cls||''}" src="${A('dp/'+['fx_ember1','fx_ember_trail','fx_ember1','fx_ember_big','fx_ember_cluster','fx_ember1','fx_ember_trail','fx_ember1','fx_ember1','fx_ember_big'][k%10])}" alt="">`).join('');
// v3.47 只允許玩最新版：網站上的 version.json 跟遊戲版本不同 → 先把進度存到雲端，再擋住畫面要求更新
async function verCheck(){if(!CLOUD_ONLY||CLOUD.outdated)return false;try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return false;const j=await r.json();
  if(j&&j.v&&j.v!==BUILD_ID){if(CLOUD.ready)await cloudPush(true).catch(()=>{});CLOUD.outdated=j.v;showUpdate(j.v);return true}}catch(e){}return false}
function showUpdate(v){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-loading';g.onclick=e=>{if(e.target.closest('[data-gu]'))location.replace(location.pathname+'?v='+encodeURIComponent(v)+'&t='+Date.now())};
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key_bg')}" alt=""><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo')}" alt="九界鐵匠"><div class="gt-box gt-load"><div class="gt-ttl">有新版本 v${esc(v)}</div><div class="small muted center">目前是 v${BUILD_ID}，需要更新才能繼續玩。你的進度已存到雲端，不會遺失。</div><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gu="1">立即更新</button></div>`}
if(typeof window!=='undefined'){setInterval(()=>{if(!document.hidden)verCheck()},60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')verCheck()});
  window.addEventListener('pagehide',()=>{if(AUTH&&CLOUD.ready){save();cloudPush(true,true)}CLOUD.leaving=true});window.addEventListener('pageshow',e=>{if(e.persisted)CLOUD.leaving=false})}
function showLoading(t){document.body.classList.add('gating');const g=gateEl();g.className='gate-login gate-loading';g.onclick=null;
  g.innerHTML=`<div class="gt-scene"><img class="gt-ly gt-bg" src="${LG('key_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key_glow')}" alt=""><div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div><img class="gt-logo" src="${LG('logo')}" alt="九界鐵匠"><div class="gt-box gt-load"><div class="gt-ttl">${t}</div></div>`}
function showLogin(msg){document.body.classList.add('gating');const g=gateEl();g.className='gate-login';
  g.innerHTML=`<div class="gt-scene">
    <img class="gt-ly gt-bg" src="${LG('key_bg')}" alt=""><img class="gt-ly gt-glow" src="${LG('key_glow')}" alt="">
    <img class="gt-fg" src="${LG('key_fg')}" alt="">
    <div class="gt-fog"></div><div class="gt-embers">${gEmb(10)}</div><div class="gt-vig"></div></div>
   <img class="gt-logo" src="${LG('logo')}" alt="九界鐵匠">
   <form class="gt-box" onsubmit="return false">
    <input id="gtMail" type="email" inputmode="email" autocomplete="username" placeholder="Email">
    <input id="gtPw" type="password" autocomplete="current-password" placeholder="密碼">
    <div class="gt-row"><button type="button" class="ui-btn ui-btn--primary btn btn-primary big" data-gt="login">登入</button><button type="button" class="ui-btn ui-btn--secondary btn btn-sec big" data-gt="signup">註冊</button></div>
    <div class="gt-msg small ${msg?'bad':''}">${msg?esc(msg):''}</div>${CLOUD_ONLY?'':'<button type="button" class="gt-guest" data-gt="guest">訪客進入（測試版，存檔只在這支手機）</button>'}
    <div class="gt-ver small"><button type="button" class="gt-replay" data-gt="story">重看開場故事</button>・${typeof BUILD!=='undefined'?BUILD:'v3.20'}</div></form>`;
  g.onclick=e=>{const b=e.target.closest('[data-gt]');if(!b)return;const k=b.dataset.gt;snd('ui_click');
    if(k==='guest'){if(!S.introSeen)return showStory();gateClose();return}
    if(k==='story'){return showStory()}
    if(k==='login'||k==='signup'){const em=(g.querySelector('#gtMail').value||'').trim(),pw=g.querySelector('#gtPw').value||'',msg=g.querySelector('.gt-msg');
      const say=(t,bad)=>{if(msg){msg.textContent=t;msg.className='gt-msg'+(bad?' bad':'')}};
      if(!/^\S+@\S+\.\S+$/.test(em))return say('請輸入正確的 Email',1);if(pw.length<6)return say('密碼至少要 6 碼',1);
      if(g.dataset.busy)return;g.dataset.busy='1';g.querySelectorAll('[data-gt]').forEach(x=>x.disabled=true);say(k==='login'?'登入中…':'建立帳號中…');verCheck();
      (k==='login'?cloudLogin(em,pw):cloudSignup(em,pw)).then(r=>{toast(r==='cloud'?'已讀取雲端進度，歡迎回來！':k==='signup'?'帳號建立完成，進度會自動存到雲端。':'登入成功，進度會自動存到雲端。','ok');afterAuthEnter()})
        .catch(e=>{say(SB_ERR(e.message),1)}).finally(()=>{delete g.dataset.busy;g.querySelectorAll('[data-gt]').forEach(x=>x.disabled=false)});return}}}
function showStory(){document.body.classList.add('gating');const list=STORY.filter(s=>STORY_HAS[s[0]]);let i=0;const g=gateEl();g.className='gate-story';
  const draw=()=>{const [img,txt,cls]=list[i];
    g.innerHTML=`<div class="st-scene ${cls}" data-gt="next"><img class="st-bg" src="${LG(img)}" alt=""><div class="st-fx">${cls==='s4'?gEmb(10,'big'):cls==='s1'?[0,1,2,3,4,5].map(k=>`<img class="st-mote m${k}" src="${A('dp/'+(k%2?'fx_mote_gold':'fx_dust_gold'))}" alt="">`).join(''):[0,1,2,3,4,5].map(k=>`<img class="st-mote m${k}" src="${A('dp/fx_mote_gold')}" alt="">`).join('')}</div><div class="st-fog"></div><div class="gt-vig"></div>
     <div class="st-txt"><p>${txt}</p><div class="st-dots">${list.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><span class="small">點畫面繼續</span></div></div>
     <button class="st-skip" data-gt="skip">略過 ›</button>`};
  draw();g.onclick=e=>{const b=e.target.closest('[data-gt]');if(!b)return;if(b.dataset.gt==='skip'||i>=list.length-1){S.introSeen=1;save();gateClose();return}i++;snd('ui_click');draw()}}

/* ---------- v3.20 新手導覽：光圈框住要點的地方＋鐵匠提示；不擋操作，條件達成自動下一步 ---------- */
const tutW=()=>S.weapons.filter(w=>!w.test&&where(w)<0).sort((a,b)=>a.id-b.id)[0];   // 導覽用：第一把沒有駐守的武器
const TUT=[
 // 一、鍛造與交付
 {t:'歡迎來到鐵爐村！先幫伐木工打一把<b>伐木斧</b>。按「開始鍛造」。',sel:()=>ui.tab!=='forge'?'.nav [data-act=tab][data-k=forge]':ui.ftab!=='bp'?'[data-act=ftab][data-k=bp]':ui.bp!=='t1_woodaxe'?'[data-act=bp][data-k=t1_woodaxe]':'[data-act=forge]',done:()=>S.jobs.length>0||S.weapons.length>0},
 {t:'鍛造需要一點時間，完成的武器會自動放進<b>武器庫</b>。打出來的<b>品質</b>（普通～傳說）是隨機的，品質越高戰力越強。',tf:()=>{const j=S.jobs[0];return `鍛造中${j?`…剩 <b>${Math.max(0,Math.ceil((j.end-NOW())/1000))} 秒</b>`:''}，完成的武器會自動放進<b>武器庫</b>。打出來的<b>品質</b>（普通～傳說）是隨機的，品質越高戰力越強。`},sel:()=>ui.tab!=='forge'?'.nav [data-act=tab][data-k=forge]':ui.ftab!=='queue'?'[data-act=ftab][data-k=queue]':S.jobs.length?'.qrow .prog':null,done:()=>S.weapons.some(w=>!w.test)},
 {t:'武器打好了！到<b>村莊</b>把它交給委託人。',sel:()=>'.nav [data-act=tab][data-k=village]',done:()=>ui.tab==='village'||S.villages[0].weaponId!=null},
 {t:'點 <b>1-1 鐵爐村</b>。卡片上寫著需要的<b>武器類別</b>和<b>戰力</b>。',sel:()=>ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'[data-act=vopen][data-i="0"]',done:()=>(ui.sheet&&ui.sheet.t==='v')||S.villages[0].weaponId!=null},
 {t:'點武器就能<b>交付</b>。武器會留在村莊幫忙狩獵，完成委託會解鎖下一座村莊和新圖紙。',sel:()=>ui.sheet&&ui.sheet.t==='v'?'.sheet [data-act=deliver]':ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'[data-act=vopen][data-i="0"]',done:()=>S.villages[0].weaponId!=null},
 // 二、狩獵與收成
 {t:'委託完成！村莊開始<b>自動狩獵</b>，帶回金幣和材料。導覽先幫你把第一輪跑完了，按「<b>全部收成</b>」領取！',go:()=>{const st=S.villages[0],w=st.weaponId!=null&&W(st.weaponId);if(w&&st.cycleStart!=null&&!st.bank.cycles){st.cycleStart=NOW()-dur(0,w)-500;tick()}},sel:()=>ui.sheet?'.sheet [data-act=close]':ui.tab!=='village'?'.nav [data-act=tab][data-k=village]':'[data-act=collectAll]',done:()=>S.stats.harvest>0},
 {t:'收成會一直累積，<b>離線</b>也照樣狩獵（最多 8 小時）。之後記得常回來收成。',sel:()=>null,ok:'知道了'},
 // 三、重型／輕型
 {t:'回<b>鐵匠鋪</b>再打一把<b>伐木斧</b>，這把拿來練習<b>強化</b>。',sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.sheet?'.sheet [data-act=close]':ui.tab!=='forge'?'.nav [data-act=tab][data-k=forge]':ui.ftab!=='bp'?'[data-act=ftab][data-k=bp]':ui.bp!=='t1_woodaxe'?'[data-act=bp][data-k=t1_woodaxe]':'[data-act=forge]',done:()=>S.jobs.length>0||!!tutW()},
 {t:'鍛造中…看下方的<b>進度條</b>，打好後會自動放進武器庫。',tf:()=>{const j=S.jobs[0];return j&&!tutW()?`鍛造中…剩 <b>${Math.max(0,Math.ceil((j.end-NOW())/1000))} 秒</b>。看下方的<b>進度條</b>，打好後會自動放進武器庫。`:'打好了！打開<b>武器庫</b>看看這把新的伐木斧。'},
  sel:()=>{if(!tutW()&&!S.jobs.length&&tutOn()){setTimeout(()=>{if(!tutW()&&!S.jobs.length)tutStep(S.tut-1)},0);return null}return !tutW()?(ui.tab!=='forge'?'.nav [data-act=tab][data-k=forge]':ui.ftab!=='queue'?'[data-act=ftab][data-k=queue]':'.qrow .prog'):'.nav [data-act=tab][data-k=armory]'},done:()=>!!tutW()&&ui.tab==='armory'},
 // 四、強化
 {t:'點這把<b>新的伐木斧</b>打開武器詳情。',sel:()=>ui.tab!=='armory'?'.nav [data-act=tab][data-k=armory]':tutW()?`[data-act=wopen][data-id="${tutW().id}"]`:null,done:()=>ui.sheet&&ui.sheet.t==='w'},
 {t:'這裡看得到武器的<b>戰力、特性、附魔</b>。按「<b>強化</b>」。',sel:()=>ui.sheet&&ui.sheet.t==='w'?'.sheet [data-act=wmode][data-m=enh]':null,done:()=>ui.sheet&&ui.sheet.t==='w'&&ui.sheet.m==='enh'},
 {t:'石碑左上角寫著<b>安定區</b>：在<b>安定值</b>以內強化，失敗也不會壞。按下強化試試看！',sel:()=>ui.sheet&&ui.sheet.m==='enh'?'.sheet [data-act=enhance]':null,done:()=>S.stats.enhTry>0},
 {t:'超過安定值就是<b>危險區</b>，失敗可能<b>爆裝</b>（武器消失）。勾選<b>防爆卷</b>可以保住武器；<b>祝福石</b>能提高成功率。安定區內可以用「<b>一鍵強化</b>」直接衝到安定值。',sel:()=>ui.busy?null:'.sheet .ev-tgls',ok:'知道了'},
 {t:'<b>附魔</b>用符文碎片幫武器加詞條：烈焰、霜寒加戰力，<b>剋巨人</b>、<b>剋龍</b>是後期委託必備。鐵砧升級會開放更多附魔欄。',go:()=>{const w=tutW();if(w){ui.enhLast=null;ui.sheet={t:'w',id:w.id,m:'main'}}},sel:()=>'.sheet [data-act=wmode][data-m=ench]',ok:'知道了'},
 // 五、其他系統
 {t:'鐵匠鋪的<b>工坊升級</b>：熔爐越高能打越高階的材質，鐵砧越高品質越好。<b>學徒</b>可以同時鍛造多把，<b>熔解</b>能把不要的武器換回材料。',go:()=>{ui.sheet=null;ui.tab='forge';scrollTo(0,0)},sel:()=>'.hf-bar',ok:'知道了'},
 {t:'缺材料時到<b>商城</b>：旅行商人用金幣賣一階材料；鑽石可以買防爆卷、祝福石和加速道具。',go:()=>{ui.sheet=null;ui.tab='shop';scrollTo(0,0)},sel:()=>'.nav [data-act=tab][data-k=shop]',ok:'知道了'},
 {t:'封測期間<b>北境月卡免費</b>！按「<b>免費領取</b>」立刻拿 <b>300 鑽石</b>，之後 30 天每天回來還能再領 50 鑽。',go:()=>{ui.sheet=null;ui.result=null;ui.tab='shop';scrollTo(0,0)},sel:()=>ui.result?'.modal-card [data-act=rclose]':ui.tab!=='shop'?'.nav [data-act=tab][data-k=shop]':monthlyOn()?null:'[data-act=monthly]',done:()=>monthlyOn()},
 {t:'村莊頁的<b>委託成就</b>可以免費領防爆卷和祝福石；<b>排行榜</b>比你交給每座村莊最強的武器，衝進前 10 名有獎勵。',go:()=>{ui.sheet=null;ui.tab='village';scrollTo(0,0)},sel:()=>'.vbar',ok:'知道了'},
 {go:()=>{ui.sheet=null;ui.tab='forge';scrollTo(0,0)},t:'基本就是這樣：<b>鍛造 → 交付 → 收成 → 強化 → 附魔</b>，一路收復九界！送你 <b>防爆卷 ×1、祝福石 ×1</b> 當開工禮。',sel:()=>null,ok:'開始冒險',end:1}];
// 各系統第一次打開時的說明（導覽結束後才會出現，每個只出現一次）
const TIPS={
 mat:['材料倉庫','一階材料（鐵礦、橡木、皮革）可以在商城向商人購買；霜銀、狼牙、龍鱗等高階材料要靠村莊狩獵掉落。'],
 armory:['武器庫','點武器看詳情、強化、附魔。上方可依類別篩選與排序；點鎖頭「收藏」的武器不會被熔解。'],
 shop:['商城','旅行商人用金幣買賣一階材料；鑽石可以買防爆卷、祝福石、狩獵號角與鍛造沙漏。'],
 danger:['危險區','這次強化超過安定值：失敗會有機率爆裝，武器會永久消失。沒有防爆卷時會要你再確認一次。'],
 ench:['附魔','選一格欄位：一般附魔隨機出詞條；指定附魔可以選詞條，但要 4 個符文碎片。已經有詞條的欄位可以重抽。'],
 vdetail:['狩獵策略','一般狩獵收益穩定；素材追獵金幣少、材料多；稀有追蹤時間較長，但稀有材料掉落大幅提升。'],
 lb:['排行榜','比的是你交給這座村莊「最強的那把武器」。第一次衝進前 10、前 3、第 1 名各有一次獎勵。'],
 ach:['委託成就','達成條件就能免費領防爆卷和祝福石，記得常回來看。'],
 ws_w:['工坊升級','熔爐：解鎖更高階材質的圖紙、縮短鍛造時間。鐵砧：提高打出高品質的機率，並開放更多附魔欄。'],
 ws_a:['學徒管理','每多一位學徒，就能同時多鍛造一把武器。'],
 ws_m:['熔解回收','不要的武器可以熔解，退回部分材料和一半鍛造金幣。一鍵熔解只會熔掉普通、精良、+0、沒有特性的武器。'],
 need:['特殊委託','這座村莊要的武器必須帶有指定附魔（例如剋巨人）。先到武器庫幫武器附魔，再來交付。']};
function tipKey(){const s=ui.sheet;if(s){if(s.t==='w'&&s.m==='enh'){const w=W(s.id);return w&&w.lv+1>stable(w)&&w.lv<15?'danger':null}if(s.t==='w'&&s.m==='ench')return'ench';if(s.t==='v'){const v=VILLAGES[s.i];return v.need&&S.villages[s.i].status!=='cleared'?'need':S.villages[s.i].weaponId!=null?'vdetail':null}
  if(s.t==='lb')return'lb';if(s.t==='a')return'ach';if(s.t==='ws')return'ws_'+s.k;return null}
  return ui.tab==='forge'&&ui.ftab==='mat'?'mat':ui.tab==='armory'&&S.weapons.length?'armory':ui.tab==='shop'?'shop':null}
function tipDraw(){let o=document.getElementById('tip');const k=!document.body.classList.contains('gating')&&!ui.busy&&!ui.result&&S.tut>=TUT.length?tipKey():null;
  if(!k||(S.tips||{})[k]){if(o&&(!k||o.dataset.k!==k))o.remove();return}
  if(o&&o.dataset.k===k)return;if(o)o.remove();
  o=document.createElement('div');o.id='tip';o.dataset.k=k;o.innerHTML=`<div class="tut-box tip-box"><img class="tut-face" src="${A('smith')}" alt=""><div class="tut-body"><div class="tut-txt"><b>${TIPS[k][0]}</b>｜${TIPS[k][1]}</div><div class="tut-btns"><button class="ui-btn ui-btn--primary btn btn-primary sm" data-tip="ok">知道了</button></div></div></div>`;
  o.addEventListener('click',e=>{if(!e.target.closest('[data-tip]'))return;e.stopPropagation();S.tips=S.tips||{};S.tips[k]=1;save();o.remove();snd('ui_click')});document.body.appendChild(o)}
const tutOn=()=>typeof S.tut==='number'&&S.tut<TUT.length&&!document.body.classList.contains('gating');
function tutStep(n){S.tut=n;const nx=TUT[n];if(nx&&nx.go&&!ui.busy){nx.go();render()}if(n>=TUT.length&&!S.tutRw){S.tutRw=1;S.items.bless+=1;S.items.scroll+=1;toast('新手導覽完成：防爆卷 +1、祝福石 +1','ok')}save();tutDraw(true)}
function tutDraw(force){let o=document.getElementById('tut');document.body.classList.toggle('tutoring',tutOn());
  if(!tutOn()){if(o)o.remove();return}
  const st=TUT[S.tut];if(!st.ok&&st.done&&st.done()){return tutStep(S.tut+1)}
  if(!o){o=document.createElement('div');o.id='tut';o.innerHTML='<div class="tut-ring"></div><div class="tut-box"><img class="tut-face" src="'+A('smith')+'" alt=""><div class="tut-body"><div class="tut-txt"></div><div class="tut-btns"></div></div></div>';document.body.appendChild(o);
    o.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(!b)return;e.stopPropagation();snd('ui_click');if(b.dataset.tut==='skip'){S.tut=99;save();tutDraw()}else tutStep(S.tut+1)})}
  if(force||o.dataset.k!==String(S.tut)){o.dataset.k=S.tut;o.querySelector('.tut-txt').innerHTML=st.t;
    o.querySelector('.tut-btns').innerHTML=`<span class="small muted">${S.tut+1}／${TUT.length}</span>${st.ok?`<button class="ui-btn ui-btn--primary btn btn-primary sm" data-tut="next">${st.ok}</button>`:''}${st.end?'':'<button class="tut-skip" data-tut="skip">略過導覽</button>'}`}
  if(st.tf){const x=st.tf();if(o.dataset.tx!==x){o.dataset.tx=x;o.querySelector('.tut-txt').innerHTML=x}}   // v3.52 動態說明（例如鍛造倒數）
  const sel=st.sel&&st.sel(),el=sel&&[...document.querySelectorAll(sel)].find(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}),ring=o.querySelector('.tut-ring'),box=o.querySelector('.tut-box');
  if(el&&!el.closest('nav,.nav,#res,.ui-topbar,.sheet,.modal,#gate')){   // v3.54 要框的東西被上方資源列或底部分頁列擋住 → 捲到畫面中間（矮螢幕手機）；每個目標只捲一次，避免來回跳
    const r0=el.getBoundingClientRect(),nv=document.querySelector('nav.nav'),navTop=nv?nv.getBoundingClientRect().top:innerHeight,rs=document.getElementById('res'),topLim=(rs?rs.getBoundingClientRect().bottom:60)+8,key=S.tut+'|'+sel;
    if((r0.bottom>navTop-50||r0.top<topLim)&&o.dataset.sc!==key){o.dataset.sc=key;el.scrollIntoView({block:'center'})}}
  else if(el&&el.closest('.sheet')){   // v3.55 彈出視窗裡的目標：沒有完整露出就捲到視窗中間（每個目標只捲一次）
    const sh=el.closest('.sheet'),r0=el.getBoundingClientRect(),rs=sh.getBoundingClientRect(),key=S.tut+'|'+sel;
    if((r0.top<rs.top+60||r0.bottom>rs.bottom-20)&&o.dataset.sc!==key){o.dataset.sc=key;el.scrollIntoView({block:'center'})}}
  if(el){const r=el.getBoundingClientRect(),p=6;Object.assign(ring.style,{display:'block',left:r.left-p+'px',top:r.top-p+'px',width:r.width+p*2+'px',height:r.height+p*2+'px'});
    const below=r.top+r.height/2<innerHeight/2;box.style.top=below?Math.min(innerHeight-170,r.bottom+14)+'px':'auto';box.style.bottom=below?'auto':Math.max(90,innerHeight-r.top+14)+'px';o.classList.remove('nohole')}
  else{ring.style.display='none';box.style.top='auto';box.style.bottom='120px';o.classList.add('nohole')}}
// v3.55 捲動時金框立即跟著移動
if(typeof window!=='undefined')document.addEventListener('scroll',()=>{if(tutOn()&&!tutDraw._raf)tutDraw._raf=requestAnimationFrame(()=>{tutDraw._raf=0;tutDraw()})},{passive:true,capture:true});
function tutInit(){if(S.tut==null)S.tut=(!S.weapons.length&&!S.jobs.length&&cleared()===0)?0:99;
  if(navigator.webdriver&&!/tut/.test(location.hash)){if(S.tut<TUT.length)S.tut=99;S.tips=Object.fromEntries(Object.keys(TIPS).map(k=>[k,1]))}   // 自動測試預設不跑導覽，網址加 #tut 才顯示
  setInterval(()=>{nickGuard();tutDraw();tipDraw()},250)}
// v3.37 保險：只要是登入帳號、還沒取暱稱、目前沒有其他全螢幕畫面，就跳出取名（不管是從哪條路徑進遊戲）
let NICK_ASK=0;function nickGuard(){if(S._fcMsg&&!document.body.classList.contains('gating')){toast(`改版補發：已收復村莊的首次收復獎勵 ${fmt(S._fcMsg)} 金幣`,'ok');delete S._fcMsg;save()}if(!AUTH||!AUTH.user||S.nick||document.body.classList.contains('gating')||Date.now()-NICK_ASK<4000)return;NICK_ASK=Date.now();showName(true)}
function start(){try{if(localStorage.getItem('nrs-dpv')!=='0')document.body.classList.add('dpv')}catch(e){document.body.classList.add('dpv')}dpInit();
  const migrated=loadState();applySkin();
  if(typeof window!=='undefined')window.claude?.hot?.snapshot?.(()=>({S}));
  const before=S.villages.reduce((s,v)=>s+v.bank.cycles,0);tick();const after=S.villages.reduce((s,v)=>s+v.bank.cycles,0);
  bindUI();preloadVfx();render();save();
  tutInit();
  try{if(/gate/.test(location.hash)||!(navigator.webdriver||/nogate/.test(location.hash))){   // 自動測試（webdriver）預設跳過登入，網址加 #gate 才顯示
    showLoading('檢查版本…');verCheck().then(old=>{if(old)return;
    if(AUTH&&AUTH.user&&!/forcelogin/.test(location.hash)){showLoading('讀取雲端存檔…');cloudAfterLogin().then(()=>afterAuthEnter()).catch(e=>showLogin('讀取雲端存檔失敗：'+SB_ERR(e.message)+'，請重新登入'))}
    else showLogin()})}}catch(e){}
  if(migrated)toast('已把 v2 存檔升級成 v3。');
  if(after>before)toast(`離線期間村莊狩獵了 ${after-before} 輪，記得收成！`);
  else if(!S.weapons.length&&!S.jobs.length&&!(S.tut<TUT.length))toast('歡迎來到米德加德。先鍛造一把伐木斧，交給鐵爐村的伐木工。');
  // v3.59 村莊分頁也要重畫：以前停在村莊分頁時，狩獵完成一輪不會出現「收成」按鈕（要切分頁才看得到）
  setInterval(()=>{if(tick()){if(PTR_DOWN)PTR_PEND=true;else render()}updateLive()},250);setInterval(save,3000);
  try{if(/dev-ui/.test(location.hash)&&devMode()){ui.sheet={t:'d'};ui.devTab='ui';render()}}catch(e){}  // 網址加 #dev-ui 直接開啟 UI 元件總覽
}
