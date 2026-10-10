/* global self, caches, clients */

const CACHE_NAME = 'allbox-offline-v2'
const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = [OFFLINE_URL, '/images/logo.svg']

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            return cacheName !== CACHE_NAME
          })
          .map(function (cacheName) {
            return caches.delete(cacheName)
          }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener('fetch', function (event) {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(OFFLINE_URL)
    }),
  )
})

self.addEventListener('push', function (event) {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: data.icon || '/icons/192.png',
    badge: data.badge || '/icons/192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const urlToOpen =
    (event.notification &&
      event.notification.data &&
      event.notification.data.url) ||
    '/'

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }

        return null
      }),
  )
})
