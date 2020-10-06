importScripts('/js/utility/idb.js');
importScripts('/js/utility/utility.js');

var CACHE_NAME = 'GC-v027';

self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        //cache.add('/index.html')
        cache.addAll([
          '/',
          '/index.html',
          '/offline.html',
          '/html/plan-growth.html',
          '/js/app.js',
          '/js/arc-gis-script.js',
          '/js/base-script.js',
          '/js/amp.js',
          '/js/plan-growth.js',
          '/js/utility/utility.js',
          '/css/arc-gis-style.css',
          '/css/style.css',
          '/images/logo.png',
          'https://code.jquery.com/jquery-3.3.1.slim.min.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css',
          'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
          'https://js.arcgis.com/4.10/esri/themes/dark/main.css',
          'https://js.arcgis.com/4.10/esri/views/support/layerViewUtils.js',
          'https://js.arcgis.com/4.10/esri/widgets/support/GoTo.js',
          'https://js.arcgis.com/4.10/esri/views/MapView.js',
          'https://js.arcgis.com/4.10/esri/widgets/Locate.js',
          'https://js.arcgis.com/4.10/esri/widgets/Search.js',
        ]);
      })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});



self.addEventListener('fetch', function (event) {

  // var url = 'https://geo-tracking-dc7aa.firebaseio.com/plan-growth/plan-growth';
  // if (event.request.url.indexOf(url) > -1) {
  //   event.respondWith(fetch(event.request)
  //     .then(function (res) {
  //       var clonedRes = res.clone();
  //       clearAllData('plan-growth')
  //         .then(function () {
  //           return clonedRes.json();
  //         })
  //         .then(function (data) {
  //           for (var key in data) {
  //             writeData('plan-growth', data[key])
  //           }
  //         });
  //       return res;
  //     })
  //   );
  // } else {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_NAME)
                .then(function (cache) {
                  // trimCache(CACHE_DYNAMIC_NAME, 3);
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function (err) {
              return caches.open(CACHE_NAME)
                .then(function (cache) {
                  if (event.request.headers.get('accept').includes('text/html')) {
                    return cache.match('/offline.html');
                  }
                  else {

                  }
                });
            });
        }
      })
  );
  //}
});

// self.addEventListener('fetch', function (event) {

//   console.log('face event calling')
//   //setTimeout(function () {
//   event.respondWith(
//     fetch(event.request)
//       .then(function (res) {
//         caches.open(CACHE_NAME).then(function (cache) {
//           console.log('dynamic cache putting')
//           cache.put(event.request.url, res.clone());
//           return res;
//         })
//       }).catch(function (error) {
//         caches.match(event.request)
//           .then(function (response) {
//             if (response) {
//               return response;
//             } else {
//               if (event.request.headers.get('accept').includes('text/html')) {
//                 return cache.match('/offline.html');
//               }
//             }
//           })
//       })
//   )
// });

self.addEventListener('sync', function (event) {
  console.log('[Service Worker] Background syncing', event);
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts')
        .then(function (data) {
          for (var dt of data) {
            fetch('https://geo-tracking-dc7aa.firebaseio.com/plan-growth/plan-growth.json', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                year: dt.year,
                count: dt.count
              })
            })
              .then(function (res) {
                console.log('Sent data', res);
                if (res.ok) {
                  res.json()
                    .then(function (resData) {
                      deleteItemFromData('sync-posts', resData.id);
                    });
                }
              })
              .catch(function (err) {
                console.log('Error while sending data', err);
              });
          }

        })
    );
  }
});


self.addEventListener('notificationclick', function (event) {
  var notification = event.notification;
  var action = event.action;
  console.log(notification);
  if (action === 'confirm') {
    console.log('confirm was chosen');
    notification.close();
  }
  else {
    console.log(action);
    notification.close();
  }
});

self.addEventListener('notificationclose', function (event) {
  console.log('Notification was closed', event);
});








