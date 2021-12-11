console.log('Hello from service worker!');
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';
const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/index.js',
	'/manifest.webmanifest',
	'/styles.css',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png',
];

// INSTALL
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(FILES_TO_CACHE))
			.then(() => self.skipWaiting())
	);
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
	const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				// return array of cache names that are old to delete
				return cacheNames.filter(
					(cacheName) => !currentCaches.includes(cacheName)
				);
			})
			.then((cachesToDelete) => {
				return Promise.all(
					cachesToDelete.map((cacheToDelete) => {
						return caches.delete(cacheToDelete);
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	// non-GET requests are filtered out and not cached
	if (
		event.request.method !== 'GET' ||
		!event.request.url.startsWith(self.location.origin)
	) {
		console.log(event);
		event.respondWith(
			fetch(event.request).catch((err) => {
				console.log('inside catch ', err);
			})
		);
		return;
	}

	// handle DATA_CACHE_NAME GET requests for the data in the /api routes
	if (event.request.url.includes('/api/transaction')) {
		console.log(event);
		event.respondWith(
			caches.open(DATA_CACHE_NAME).then((cache) => {
				return fetch(event.request)
					.then((response) => {
						cache.put(event.request, response.clone());
						return response;
					})
					.catch(() => caches.match(event.request));
			})
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return caches.open(DATA_CACHE_NAME).then((cache) => {
				return fetch(event.request).then((response) => {
					return cache.put(event.request, response.clone()).then(() => {
						return response;
					});
				});
			});
		})
	);
});
