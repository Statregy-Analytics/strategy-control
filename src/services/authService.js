import { api, TOKEN_KEY, REFRESH_TOKEN_KEY } from 'src/boot/axios'
import { LocalStorage } from 'quasar'

/**
 * Realiza login na API e persiste os tokens no LocalStorage.
 * Endpoint: POST /api/v1/auth/login
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, refreshToken: string, expiresAt: string, user: object }>}
 */
export async function login({ email, password }) {
  const { data } = await api.post('/api/v1/auth/login', { email, password })
  const payload = data?.data ?? data

  if (payload?.accessToken) LocalStorage.set(TOKEN_KEY, payload.accessToken)
  if (payload?.refreshToken) LocalStorage.set(REFRESH_TOKEN_KEY, payload.refreshToken)

  return payload
}

/**
 * Renova o access token a partir do refresh token armazenado.
 * Endpoint: POST /api/v1/auth/refresh
 *
 * @returns {Promise<object|null>}
 */
export async function refresh() {
  const refreshToken = LocalStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null

  const { data } = await api.post('/api/v1/auth/refresh', { refreshToken })
  const payload = data?.data ?? data

  if (payload?.accessToken) LocalStorage.set(TOKEN_KEY, payload.accessToken)
  if (payload?.refreshToken) LocalStorage.set(REFRESH_TOKEN_KEY, payload.refreshToken)

  return payload
}

/**
 * Retorna o usuário autenticado.
 * Endpoint: GET /api/v1/auth/me
 *
 * @returns {Promise<object>}
 */
export async function getCurrentUser() {
  const { data } = await api.get('/api/v1/auth/me')
  return data?.data ?? data
}

/**
 * Encerra a sessão na API e limpa os tokens locais.
 * Endpoint: POST /api/v1/auth/logout
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  const refreshToken = LocalStorage.getItem(REFRESH_TOKEN_KEY)
  try {
    if (refreshToken) {
      await api.post('/api/v1/auth/logout', { refreshToken })
    }
  } finally {
    clearSession()
  }
}

/** Remove os tokens persistidos. */
export function clearSession() {
  LocalStorage.remove(TOKEN_KEY)
  LocalStorage.remove(REFRESH_TOKEN_KEY)
}

/** Indica se há um access token armazenado. */
export function isAuthenticated() {
  return !!LocalStorage.getItem(TOKEN_KEY)
}
