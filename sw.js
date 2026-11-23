/* 极简离线缓存：首屏三个文件缓存到本地，断网也能开。
   不做花活：不预缓存第三方、不做后台同步。 */
const CACHE = 'cat-timer-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // 导航请求（HTML）走「网络优先 → 断网回落缓存」：
  // 曾因「缓存优先」让改过的 index.html 在已注册客户端里一直是旧版，
  // 修好的 bug 在浏览器里看不见，白查一小时。静态资源仍缓存优先。
  // 照片这类可替换素材也必须网络优先：缓存优先会让「换了图还是旧图」，
  // 和 HTML 那次是同一个坑（改了看不见）。
  var isPhoto = e.request.destination === 'image' || /\/assets\//.test(new URL(e.request.url).pathname);
  if (e.request.mode === 'navigate' || isPhoto) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => hit)
    )
  );
});
