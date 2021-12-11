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

//install
self.addEventListener('install', function (event) {
	//pre cache data
	event.waitUntil(
		caches.open(DATA_CACHE_NAME).then((cache) => {
			console.log('Files were cached!');
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

// activate
self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log('Removing old cache data', key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

// fetch
self.addEventListener('fetch', function (event) {
	if (event.request.url.includes('/api/')) {
		event.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(event.request)
						.then((response) => {
							// If the response was good, clone it and store it in the cache.
							if (response.status === 200) {
								cache.put(event.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							// Network request failed, try to get it from the cache.
							return cache.match(event.request);
						});
				})
				.catch((err) => console.log(err))
		);

		return;
	}

	event.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(event.request).then((response) => {
				return response || fetch(event.request);
			});
		})
	);
});
