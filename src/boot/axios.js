import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { LocalStorage } from 'quasar'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

// Chaves usadas para persistir os tokens no LocalStorage
export const TOKEN_KEY = 'sa_access_token'
export const REFRESH_TOKEN_KEY = 'sa_refresh_token'

const baseURL = import.meta.env.VITE_API_URL || 'https://strategyanalytics.codebiz.com.br'

const api = axios.create({ baseURL })

// Gera um UUID v4 para o header Idempotency-Key
const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Anexa o Bearer token (quando autenticado) e o Idempotency-Key
// obrigatório pela API em toda operação de escrita (POST/PUT/PATCH/DELETE).
api.interceptors.request.use((config) => {
  const token = LocalStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method) && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = generateIdempotencyKey()
  }

  return config
})

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
