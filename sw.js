var CACHE_NAME = 'static-v' + 2;

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(staticCache) {
            staticCache.addAll([
                '/'
            ])
        })
    )
})

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(allCaches) {
            return Promise.all(allCaches.filter(c => c !== CACHE_NAME).map(c => caches.delete(c)));
        })
    )
})

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
        	return response || fetch(event.request).then(function(r) {
        		var resCopy = r.clone();
        		caches.open(CACHE_NAME).then(function(staticCache){        			
        			staticCache.put(event.request, resCopy);
        		});
        		return r;
        	})
        })
    )
})