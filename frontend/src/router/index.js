import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })
  Router.beforeEach((to, from, next) => {
    document.title = to.name != undefined ? 'Strategy Analytics - ' + to.name : 'Strategy Analytics'
    console.log('[DEBUG][router.beforeEach] navigating from', from.fullPath, 'to', to.fullPath)
    // Add your authentication logic here
    const isAuthenticated = true // Replace with your authentication check

    if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
      console.log('[DEBUG][router.beforeEach] blocked navigation to', to.fullPath, 'user not authenticated')
      next({ name: 'Auth' }) // Redirect to login page if not authenticated
    } else {
      next() // Proceed to the route
    }
  })
  Router.beforeResolve((to, from) => {
    console.log('[DEBUG][router.beforeResolve] resolving from', from.fullPath, 'to', to.fullPath)
  })
  Router.afterEach((to, from) => {
    console.log('[DEBUG][router.afterEach] navigated from', from.fullPath, 'to', to.fullPath)
  })

  Router.onError((error) => {
    console.error('[DEBUG][router.onError] router error:', error)
    // Se for um erro de carregamento de chunk (ex.: deploy com assets antigos em cache),
    // forçar reload para tentar recuperar os novos arquivos.
    try {
      const msg = error && error.message ? error.message : ''
      if (/loading chunk|chunkloaderror/i.test(msg)) {
        console.warn('[DEBUG][router.onError] ChunkLoadError detected, reloading page to recover assets')
        // reload full page to fetch latest assets from server
        window.location.reload()
      }
    } catch (e) {
      console.error('[DEBUG][router.onError] error handling router error', e)
    }
  })

  return Router
})
