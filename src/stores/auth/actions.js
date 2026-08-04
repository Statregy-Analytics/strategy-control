import {
  login as loginRequest,
  logout as logoutRequest,
  getCurrentUser,
  isAuthenticated,
  clearSession,
} from 'src/services/authService'

const actions = {
  setPasswordReset(payload) {
    this.passwordReset = payload
  },
  setValidateToken(payload) {
    this.auth.validateToken = payload
  },
  setAuthEmail(payload) {
    this.auth.email = payload
  },
  setAuth(payload) {
    this.auth = payload
  },
  setFineshed(payload) {
    this.finished = payload
  },
  /**
   * Autentica na API, persiste os tokens e popula o estado da sessão.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<object>} payload de login (accessToken, refreshToken, user...)
   */
  async loginAction({ email, password }) {
    const payload = await loginRequest({ email, password })
    this.authenticated = true
    this.auth.token = payload?.accessToken ?? null
    this.user = payload?.user ?? null
    return payload
  },
  /** Encerra a sessão na API e limpa o estado local. */
  async logoutAction() {
    try {
      await logoutRequest()
    } finally {
      this.authenticated = false
      this.auth.token = null
      this.user = null
    }
  },
  /** Recarrega o usuário autenticado a partir da API (GET /auth/me). */
  async fetchCurrentUser() {
    this.user = await getCurrentUser()
    return this.user
  },
  /** Sincroniza o flag de autenticação com o token persistido (ex.: ao iniciar o app). */
  hydrateAuth() {
    this.authenticated = isAuthenticated()
    return this.authenticated
  },
  /** Limpa apenas os tokens locais (sem chamar a API). */
  clearAuth() {
    clearSession()
    this.authenticated = false
    this.auth.token = null
    this.user = null
  },
}
export default { ...actions }
