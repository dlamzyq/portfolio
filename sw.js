// Service Worker for 郑博作品展示站 — 离线缓存
const CACHE_NAME = 'portfolio-v2';

const PRE_CACHE = [
  '/portfolio/',
  '/portfolio/index.html',
  '/portfolio/media/场景.jpg',
  '/portfolio/media/影魔.jpeg',
  '/portfolio/media/玄.jpeg',
  '/portfolio/media/故事板1.jpg',
  '/portfolio/media/故事板2.jpg',
  '/portfolio/media/故事板3.jpg',
  '/portfolio/media/故事板4.jpg',
  '/portfolio/media/开头背景音乐3_s.mp3',
  '/portfolio/media/中间打斗背景音乐_s.mp3',
  '/portfolio/media/结尾音乐2_s.mp3',
  '/portfolio/media/film.mp4',
];

// Install: pre-cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: 开始缓存...');
      return Promise.allSettled(
        PRE_CACHE.map(url =>
          cache.add(url).catch(err =>
            console.log('SW: 缓存失败（非致命）', url, err)
          )
        )
      );
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only cache same-origin assets and Google Fonts
  if (!url.hostname.includes('dlamzyq.github.io') &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Return cached, update from network in background
      const fetchPromise = fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {});
      return cached || fetchPromise;
    })
  );
});
