// v3.67 九界鐵匠 Service Worker：圖片／音效先用手機裡的快取（秒開），背景再跟網站比對更新
// index.html、version.json、雲端資料一律走網路，確保永遠是最新版
// v3.67 同一張圖每次開 App 只跟網站比對一次（舊版每次切分頁都對每張圖重新下載比對，iPhone 上會拖慢出圖）
const C='nr-assets-1',checked=new Set();
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin||!/\/(art|sfx)\//.test(u.pathname))return;
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r);
    if(hit&&checked.has(r.url))return hit;checked.add(r.url);
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
    if(hit){e.waitUntil(net.then(()=>{}));return hit}return net}))});
