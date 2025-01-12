const CACHE_NAME = 'verson-1.11';
const urlsToCache = ['index.html'];

const ASSETS = [
    './',
    'index.html',
    'version2.html',
    'css/styles.css',
    'assets/icons/icon-192x192.png', 
    'assets/icons/icon-512x512.png', 
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'

];

// Install SW


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
            .catch(error => console.error('Error en instalación:', error))
    );
});

// Activate SW

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys()
                .then(keys => Promise.all(
                    keys.filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )),
            self.clients.claim()
        ])
    );
});



// Fetch SW


{
    // 1. Intercepción de solicitudes de navegación: El Service Worker intercepta las solicitudes de navegación (solicitudes cuyo modo es 'navigate').

    // 2. Búsqueda en la caché: Intenta encontrar una respuesta en la caché que coincida con la solicitud interceptada.

    // 3. Respuesta desde la caché: Si encuentra una respuesta en la caché, la devuelve inmediatamente.

    // 4. Solicitud de red: Si no encuentra una respuesta en la caché, realiza una solicitud de red para obtener la respuesta.

    // 5. Validación de la respuesta: Verifica que la respuesta de la red sea válida (que tenga un estado 200 y que su tipo sea 'basic').

    // 6. Clonación de la respuesta: Clona la respuesta de la red para poder usarla tanto en la caché como en la respuesta al navegador.

    // 7. Almacenamiento en la caché: Abre la caché y almacena la solicitud y la respuesta clonada en la caché para futuras solicitudes.

    // 8. Respuesta al navegador: Devuelve la respuesta original de la red al navegador.
}

self.addEventListener('fetch', (event) => {
    // Verifica si el modo de la solicitud no es 'navigate' (navegación de página)
    if(event.request.mode !== 'navigate'){
        return; // Si no es una solicitud de navegación, no hace nada y retorna
    }

    // Intercepta la solicitud y responde con el contenido de la caché o realiza una solicitud de red
    event.respondWith(
        caches.match(event.request) // Busca en la caché una respuesta que coincida con la solicitud
            .then(cached => {
                if(cached) return cached; // Si se encuentra en la caché, devuelve la respuesta en caché

                // Si no se encuentra en la caché, realiza una solicitud de red
                return fetch(event.request)
                    .then(response => {
                        // Verifica si la respuesta es válida
                        if(!response || response.status !== 200 || response.type !== 'basic'){
                            return response; // Si la respuesta no es válida, la devuelve tal cual
                        }

                        // Clona la respuesta para poder usarla tanto en la caché como en la respuesta al navegador
                        const responseToCache = response.clone();

                        // Abre la caché y almacena la solicitud y la respuesta clonada
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache); // Almacena la solicitud y la respuesta en la caché
                            })
                            .catch(console.error);

                        return response; // Devuelve la respuesta original al navegador
                    })
            })
            .catch(() => new Response('Sin conexión')) // Maneja cualquier error que ocurra durante el proceso
    );
});



