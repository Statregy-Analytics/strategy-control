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
  Router.beforeEach(async (to, from, next) => {
    document.title = to.name != undefined ? 'Strategy Analytics - ' + to.name : 'Strategy Analytics'
    const isAuthenticated = !!LocalStorage.getItem(TOKEN_KEY)

    if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
      next({ name: 'Auth' }) // Redirect to login page if not authenticated
    } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      try {
        const user = await getCurrentUser()
        if (Array.isArray(user?.roles) && user.roles.includes('Admin')) next()
        else {
          Notify.create({ type: 'negative', message: 'Acesso restrito a administradores.' })
          next({ name: 'Auth' })
        }
      } catch {
        next({ name: 'Auth' })
      }
    } else {
      next() // Proceed to the route
    }
  })

  return Router
})
