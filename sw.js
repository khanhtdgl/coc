const CACHE_NAME = 'coc-tracker-v2'; // Đổi tên phiên bản để ép trình duyệt nhận diện
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon.png'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Ép bản mới cài đặt ngay lập tức
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Xóa bộ nhớ đệm (cache) của các phiên bản cũ
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Luôn ưu tiên lấy dữ liệu từ mạng trước, nếu mất mạng mới dùng Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
