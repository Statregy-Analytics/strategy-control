import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { LocalStorage } from 'quasar'

export const TOKEN_KEY = 'sa_access_token'
export const REFRESH_TOKEN_KEY = 'sa_refresh_token'
export const WORKSPACE_KEY = 'sa_selected_workspace_id'
export const LEGACY_WORKSPACE_KEY = 'sa_workspace_id'

// A versão anterior selecionava automaticamente o workspace padrão.
// Remova essa seleção implícita para evitar preflight CORS desnecessário.
LocalStorage.remove(LEGACY_WORKSPACE_KEY)

const baseURL = import.meta.env.VITE_API_URL || 'https://strategyanalytics.codebiz.com.br'
const api = axios.create({ baseURL })
const refreshClient = axios.create({ baseURL })
let refreshPromise = null

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

api.interceptors.request.use((config) => {
  const token = LocalStorage.getItem(TOKEN_KEY)
  const workspaceId = LocalStorage.getItem(WORKSPACE_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (workspaceId && !config.headers['X-Workspace-Id']) {
    config.headers['X-Workspace-Id'] = workspaceId
  }
  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method) && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = generateIdempotencyKey()
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = LocalStorage.getItem(REFRESH_TOKEN_KEY)
    if (error.response?.status !== 401 || originalRequest?._retry || !refreshToken) {
      return Promise.reject(error)
    }
    originalRequest._retry = true
    refreshPromise ??= refreshClient
      .post('/api/v1/auth/refresh', { refreshToken })
      .then(({ data }) => {
        const payload = data?.data ?? data
        if (!payload?.accessToken) throw new Error('A API não retornou um novo access token.')
        LocalStorage.set(TOKEN_KEY, payload.accessToken)
        if (payload.refreshToken) LocalStorage.set(REFRESH_TOKEN_KEY, payload.refreshToken)
        return payload.accessToken
      })
      .catch((refreshError) => {
        LocalStorage.remove(TOKEN_KEY)
        LocalStorage.remove(REFRESH_TOKEN_KEY)
        LocalStorage.remove(WORKSPACE_KEY)
        LocalStorage.remove(LEGACY_WORKSPACE_KEY)
        window.dispatchEvent(new CustomEvent('auth:expired'))
        throw refreshError
      })
      .finally(() => { refreshPromise = null })
    const accessToken = await refreshPromise
    originalRequest.headers.Authorization = `Bearer ${accessToken}`
    return api(originalRequest)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
