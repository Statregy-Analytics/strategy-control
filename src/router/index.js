import { defineRouter } from '#q-app'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { LocalStorage, Notify } from 'quasar'
import routes from './routes'
import { TOKEN_KEY } from 'src/boot/axios'
import { getCurrentUser } from 'src/services/authService'
import { isAuthenticationFailure } from 'src/services/authFailure'
import { clearRouteChunkRetry, recoverRouteChunk } from 'src/services/routeChunkRecovery'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })
  let verifiedAdminToken = null
  const notifyChunkError = () =>
    Notify.create({
      type: 'warning',
      message: 'Não foi possível carregar a tela. Atualize a página e tente novamente.',
    })
  Router.onError((error, to) => {
    if (typeof window === 'undefined') return
    try {
      const recovered = recoverRouteChunk(error, to, {
        resolve: (target) => Router.resolve(target).href,
        storage: window.sessionStorage,
        location: window.location,
        notify: notifyChunkError,
      })
      if (!recovered) console.error(error)
    } catch {
      notifyChunkError()
    }
  })
  if (typeof window !== 'undefined')
    Router.isReady()
      .then(() => {
        try {
          clearRouteChunkRetry(window.sessionStorage)
        } catch {
          /* Storage may be unavailable. */
        }
      })
      .catch(() => {})
  Router.beforeEach(async (to, from, next) => {
    document.title = to.name != undefined ? 'Strategy Analytics - ' + to.name : 'Strategy Analytics'
    const isAuthenticated = !!LocalStorage.getItem(TOKEN_KEY)

    if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
      verifiedAdminToken = null
      next({ name: 'Auth' }) // Redirect to login page if not authenticated
    } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      const token = LocalStorage.getItem(TOKEN_KEY)
      if (
        token &&
        token === verifiedAdminToken &&
        to.path &&
        to.path === from.path &&
        from.matched?.some((record) => record.meta.requiresAdmin)
      ) {
        next()
        return
      }
      try {
        const user = await getCurrentUser()
        if (Array.isArray(user?.roles) && user.roles.includes('Admin')) {
          verifiedAdminToken = token
          next()
        } else {
          verifiedAdminToken = null
          Notify.create({ type: 'negative', message: 'Acesso restrito a administradores.' })
          next({ name: 'Auth' })
        }
      } catch (error) {
        verifiedAdminToken = null
        if (isAuthenticationFailure(error)) next({ name: 'Auth' })
        else {
          Notify.create({
            type: 'warning',
            message: 'Não foi possível verificar o acesso. Tente novamente.',
          })
          next(false)
        }
      }
    } else {
      next() // Proceed to the route
    }
  })

  return Router
})
