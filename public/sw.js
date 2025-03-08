const CACHE_NAME = 'cache_pwa_v3'
const OFFLINE_URL = '/offline.html'
const broadcast = new BroadcastChannel('recipe-updates')

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/'])
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      }),
    ]),
  )
  console.log('Service Worker Activated')
})

async function checkForUpdate() {
  try {
    console.log('check for update')

    const response = await fetch('/version.json', { cache: 'no-store' })
    const { version: newVersion } = await response.json()

    console.log('response version:', newVersion)

    const versionCache = await caches.open('current_version')
    const storedVersionResponse = await versionCache.match('version')

    let storedVersion = null

    if (storedVersionResponse) {
      storedVersion = await storedVersionResponse.json()
      console.log('stored version:', storedVersion.version)
    } else {
      console.log('no stored version')
      await versionCache.put(
        'version',
        new Response(JSON.stringify({ version: newVersion }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      return
    }

    if (!storedVersion || storedVersion.version !== newVersion) {
      console.log('New version detected, updating cache...')
      await versionCache.put(
        'version',
        new Response(JSON.stringify({ version: newVersion }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      const activeClients = clientsList.find(
        (client) => client.visibilityState === 'visible' && client.focused,
      )

      if (activeClients) {
        activeClients.postMessage({
          type: 'SEND_TOAST',
          message: 'New version of the app available, refresh your page!',
        })
      } else {
        sendMessageToClients({
          type: 'NEW_VERSION_AVAILABLE',
          message: 'New version of the app available, refresh your page!',
        })
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de la mise à jour :', error)
  }
}

setInterval(
  () => {
    checkForUpdate()
  },
  1 * 30 * 1000,
)

async function handlePostRequest(event) {
  const cache = await caches.open(CACHE_NAME)
  const response = await fetch(event.request)
  const newRecipe = await response.clone().json()

  if (!newRecipe || typeof newRecipe !== 'object' || !newRecipe.id) {
    return response
  }

  const cachedResponse = await cache.match('/api/recipe')
  let recipes = cachedResponse ? await cachedResponse.json() : []

  const existingIndex = recipes.findIndex(
    (recipe) => recipe.id === newRecipe.id,
  )

  if (existingIndex !== -1) {
    recipes[existingIndex] = newRecipe
  } else {
    // Ajouter la nouvelle recette en début de liste
    recipes.unshift(newRecipe)
  }

  // Mettre à jour le cache
  await cache.put('/api/recipe', new Response(JSON.stringify(recipes)))

  return response
}

async function handleDeleteRequest(event) {
  const cache = await caches.open(CACHE_NAME)
  const url = new URL(event.request.url)

  // Extraction manuelle de l'ID avec une RegExp
  const idMatch = url.search.match(/[?&]id=(\d+)/)
  const idToDelete = idMatch ? Number(idMatch[1]) : NaN

  if (isNaN(idToDelete)) {
    return new Response('ID invalide', { status: 400 })
  }

  // Récupérer les recettes en cache
  const cachedResponse = await cache.match('/api/recipe')
  let recipes = cachedResponse ? await cachedResponse.json() : []

  console.log('Avant suppression, recettes en cache:', recipes)

  // Filtrer la recette à supprimer
  const updatedRecipes = recipes.filter((recipe) => recipe.id !== idToDelete)

  console.log('Après suppression, recettes mises à jour:', updatedRecipes)

  // Mettre à jour le cache
  await cache.put('/api/recipe', new Response(JSON.stringify(updatedRecipes)))

  // Effectuer la requête DELETE vers le serveur
  return fetch(event.request)
}

async function handlePostFavorite(event) {
  const cache = await caches.open(CACHE_NAME)
  const response = await fetch(event.request)
  const newRecipe = await response.clone().json()

  if (!newRecipe || typeof newRecipe !== 'object' || !newRecipe.id) {
    return response
  }

  const cachedResponse = await cache.match('/api/recipe')
  let recipes = cachedResponse ? await cachedResponse.json() : []

  // Vérifier si la recette existe déjà
  const existingIndex = recipes.findIndex(
    (recipe) => recipe.id === newRecipe.id,
  )

  if (existingIndex !== -1) {
    // Mettre à jour la recette existante
    recipes[existingIndex] = newRecipe
  }

  // Mettre à jour le cache
  await cache.put('/api/recipe', new Response(JSON.stringify(recipes)))

  return response
}

async function handlePostComment(event) {
  const cache = await caches.open(CACHE_NAME)
  const response = await fetch(event.request)
  const newComment = await response.clone().json()

  if (!newComment || typeof newComment !== 'object' || !newComment.id) {
    return response
  }

  // Mettre à jour le cache avec la nouvelle version de la recette renvoyée par l'API
  const cachedResponse = await cache.match('/api/recipe')
  let recipes = cachedResponse ? await cachedResponse.json() : []

  // Trouver l'index de la recette à mettre à jour
  const existingIndex = recipes.findIndex(
    (recipe) => recipe.id === newComment.recipeId,
  )

  if (existingIndex !== -1) {
    // Remplacer la recette existante par la version mise à jour du serveur
    recipes[existingIndex].comments = [
      ...recipes[existingIndex].comments,
      newComment,
    ]
  }

  // Mettre à jour le cache avec la version correcte
  await cache.put('/api/recipe', new Response(JSON.stringify(recipes)))

  return response
}

async function handlePutComment(event) {
  const cache = await caches.open(CACHE_NAME)
  const response = await fetch(event.request)
  const newComment = await response.clone().json()

  if (!newComment || typeof newComment !== 'object' || !newComment.id) {
    return response
  }

  // Mettre à jour le cache avec la nouvelle version de la recette renvoyée par l'API
  const cachedResponse = await cache.match('/api/recipe')
  let recipes = cachedResponse ? await cachedResponse.json() : []

  // Trouver l'index de la recette à mettre à jour
  const existingIndex = recipes.findIndex(
    (recipe) => recipe.id === newComment.recipeId,
  )

  if (existingIndex !== -1) {
    const existingIndexComment = recipes[existingIndex].comments.findIndex(
      (comment) => comment.id === newComment.id,
    )

    if (existingIndexComment !== -1) {
      // Remplacer la recette existante par la version mise à jour du serveur
      recipes[existingIndex].comments[existingIndexComment] = newComment
    }
  }

  // Mettre à jour le cache avec la version correcte
  await cache.put('/api/recipe', new Response(JSON.stringify(recipes)))

  return response
}

async function handleDeleteComment(event) {
  const cache = await caches.open(CACHE_NAME)
  const response = await fetch(event.request)
  const newComment = await response.clone().json()

  if (!newComment || typeof newComment !== 'object' || !newComment.id) {
    return response
  }

  const cachedResponse = await cache.match('/api/recipe')
  let recipes = cachedResponse ? await cachedResponse.json() : []

  const existingIndex = recipes.findIndex(
    (recipe) => recipe.id === newComment.recipeId,
  )

  if (existingIndex !== -1) {
    const existingIndexComment = recipes[existingIndex].comments.findIndex(
      (comment) => comment.id === newComment.id,
    )

    if (existingIndexComment !== -1) {
      recipes[existingIndex].comments.splice(existingIndexComment, 1)
    }
  }

  await cache.put('/api/recipe', new Response(JSON.stringify(recipes)))

  return response
}

function isValidPath(url) {
  const pathname = new URL(url).pathname
  const validPaths = ['/', '/favorite']

  // Vérifie si c'est un chemin exact
  if (validPaths.includes(pathname)) {
    return true
  }

  return false
}

function deleteCache() {
  console.log('delete Cache')
  caches.open(CACHE_NAME).then((cache) => {
    cache.keys().then((keys) => {
      keys.forEach((key) => {
        cache.delete(key)
      })
    })
  })
}

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-48x48.png',
      badge: '/icons/icon-48x48.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  const urlToOpen = event.notification.data.url || '/'
  console.log('urlToOpen', urlToOpen)
  console.log('event', event)
  event.waitUntil(clients.openWindow(urlToOpen))
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  console.log('URL', url.pathname)

  if (
    event.request.mode === 'navigate' &&
    !navigator.onLine &&
    !isValidPath(url)
  ) {
    event.respondWith(
      caches.match('/'), // Retourne la page d'accueil déjà mise en cache
    )
    return
  }

  if (url.pathname.startsWith('/login')) {
    if (event.request.method === 'POST') {
      deleteCache()
    }
  }

  if (url.pathname.startsWith('/api/ingredients')) {
    if (event.request.method === 'GET') {
      event.respondWith(cacheFirst(event))
    }
    return
  }

  if (url.pathname.startsWith('/api/recipe')) {
    if (event.request.method === 'GET') {
      event.respondWith(
        staleWhileRevalidateWithNotification(event, NotifyNewRecipes),
      )
    } else if (event.request.method === 'POST') {
      event.respondWith(handlePostRequest(event))
    } else if (event.request.method === 'DELETE') {
      event.respondWith(handleDeleteRequest(event))
    }
    return
  }

  if (url.pathname.startsWith('/api/favorite')) {
    if (event.request.method === 'POST') {
      event.respondWith(handlePostFavorite(event))
    }
    return
  }

  if (url.pathname.startsWith('/api/comments')) {
    if (event.request.method === 'POST') {
      event.respondWith(handlePostComment(event))
    } else if (event.request.method === 'PUT') {
      event.respondWith(handlePutComment(event))
    } else if (event.request.method === 'DELETE') {
      event.respondWith(handleDeleteComment(event))
    }
    return
  }

  // Gestion des pages HTML : retourner la version cache si disponible
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          console.log('Network response succeeded for navigation')
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        })
        .catch(async () => {
          console.log('Network failed, trying cache...')
          const cachedPage = await caches.match(event.request)
          if (cachedPage) {
            console.log('Found page in cache')
            return cachedPage
          }

          console.log('Checking for cached recipes...')
          const recipesResponse = await caches.match('/api/recipe')
          if (recipesResponse) {
            console.log('Found recipes in cache')
            const mainPage = await caches.match('/')
            if (mainPage) {
              console.log('Returning cached main page')
              return mainPage
            }
          }

          console.log('Falling back to offline page')
          return caches.match(OFFLINE_URL)
        }),
    )
    return
  }

  // Gestion du cache pour les fichiers Next.js (_next/static/)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone())
              return networkResponse
            })
          })
        )
      }),
    )
    return
  }

  // Pour toutes les autres requêtes (images, CSS, etc.), essayer d'abord le cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        })
      )
    }),
  )
})

async function NotifyNewRecipes(recipes, cacheRecipes) {
  // uncomment next line to test notification
  // await new Promise(resolve => setTimeout(resolve, 5000))

  const recipeIds = recipes ? recipes.map((recipe) => recipe.id) : []
  const cacheRecipeIds = cacheRecipes
    ? cacheRecipes.map((recipe) => recipe.id)
    : []

  const isSameRecipes =
    recipeIds.length === cacheRecipeIds.length &&
    new Set(recipeIds).size === recipeIds.length &&
    recipeIds.every((id) => cacheRecipeIds.includes(id))

  console.log('recipes: ', recipes)
  console.log('cacheRecipes: ', cacheRecipes)

  console.log('recipeIds: ', recipeIds)
  console.log('cacheRecipeIds: ', cacheRecipeIds)

  console.log('isSameRecipes: ', isSameRecipes)

  if (!isSameRecipes) {
    const clientsList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    const activeClients = clientsList.find(
      (client) => client.visibilityState === 'visible' && client.focused,
    )

    if (activeClients) {
      console.log('post message to client')
      activeClients.postMessage({
        type: 'SEND_TOAST',
        message: 'New recipes available, refresh your page !',
      })
    } else {
      console.log('sending notification to client')
      sendMessageToClients({
        type: 'NEW_DATA_AVAILABLE',
        message: 'New recipes available, refresh your page !',
      })
    }
  } else {
    console.log('data.recipes is empty')
  }
}

async function cacheFirst(event) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(event.request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(event.request)
    cache.put(event.request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    return new Response('Impossible de récupérer les données', { status: 503 })
  }
}

async function staleWhileRevalidateWithNotification(event, callback) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(event.request)
  if (cachedResponse) {
    const cachedClone = cachedResponse.clone()
    const cachedData = await cachedClone.json()

    void fetch(event.request).then(async (networkResponse) => {
      cache.put(event.request, networkResponse.clone())
      const recipes = await networkResponse.json()
      if (callback) {
        callback(recipes, cachedData)
      }
    })
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(event.request)
    cache.put(event.request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    return new Response('Impossible de récupérer les données', {
      status: 503,
    })
  }
}

function sendMessageToClients(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message)
    })
  })
}
