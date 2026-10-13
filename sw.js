// فونٹس ہمیشہ کے لیے اور صفحے تیزی سے کھولنے کے لیے کیش (ایڈمن صفحہ شامل نہیں)
const V = "mn-v1";
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(["./", "index.html", "MuhammadiQuranic.woff2"])).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || /\/admin(\.html)?$/.test(u.pathname)) return;
  if (u.pathname.endsWith(".woff2")) {   // فونٹ: پہلے کیش (صرف کامیاب جواب محفوظ ہوتا ہے، خرابی والا نہیں)
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(e.request, c)); } return res; })));
    return;
  }
  e.respondWith(caches.open(V).then(async c => {   // باقی: کیش سے فوراً، پیچھے سے تازہ
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit);
    if (hit) e.waitUntil(net);   // پیچھے کی تازگی پوری ہونے تک سروس ورکر بند نہ ہو
    return hit || net;
  }));
});
