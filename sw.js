const CACHE = "loci-shell-v1";
const SHELL = ["./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// 壳资源缓存优先；API 请求永不缓存
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (url.includes("api.github.com")) return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((r) => {
          if (r.ok && SHELL.some((s) => url.endsWith(s.replace("./", "/")) || url.endsWith(s.slice(2)))) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return r;
        })
    )
  );
});
