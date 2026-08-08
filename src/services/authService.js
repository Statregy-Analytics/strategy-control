import { api, TOKEN_KEY, REFRESH_TOKEN_KEY, WORKSPACE_KEY, LEGACY_WORKSPACE_KEY } from 'src/boot/axios'
import { LocalStorage } from 'quasar'

export async function login({ email, password }) {
  const { data } = await api.post('/api/v1/auth/login', { email, password })
  const payload = data?.data ?? data
  if (payload?.accessToken) LocalStorage.set(TOKEN_KEY, payload.accessToken)
  if (payload?.refreshToken) LocalStorage.set(REFRESH_TOKEN_KEY, payload.refreshToken)
  return payload
}

export async function refresh() {
  const refreshToken = LocalStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null
  const { data } = await api.post('/api/v1/auth/refresh', { refreshToken })
  const payload = data?.data ?? data
  if (payload?.accessToken) LocalStorage.set(TOKEN_KEY, payload.accessToken)
  if (payload?.refreshToken) LocalStorage.set(REFRESH_TOKEN_KEY, payload.refreshToken)
  return payload
}

export async function getCurrentUser() {
  const { data } = await api.get('/api/v1/auth/me')
  return data?.data ?? data
}

export async function getMySystems() {
  const { data } = await api.get('/api/v1/me/systems')
  return data?.data ?? data
}

export async function logout() {
  const refreshToken = LocalStorage.getItem(REFRESH_TOKEN_KEY)
  try {
    if (refreshToken) await api.post('/api/v1/auth/logout', { refreshToken })
  } finally {
    clearSession()
  }
}

export function clearSession() {
  LocalStorage.remove(TOKEN_KEY)
  LocalStorage.remove(REFRESH_TOKEN_KEY)
  LocalStorage.remove(WORKSPACE_KEY)
  LocalStorage.remove(LEGACY_WORKSPACE_KEY)
}

export function selectWorkspace(workspaceId) {
  if (workspaceId) LocalStorage.set(WORKSPACE_KEY, workspaceId)
  else LocalStorage.remove(WORKSPACE_KEY)
}

export function isAuthenticated() {
  return !!LocalStorage.getItem(TOKEN_KEY)
}
