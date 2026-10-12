import { reactive } from 'vue'

export function useFinanceResource() {
  let sequence = 0
  const state = reactive({ data: null, loading: false, error: '' })
  async function load(request) {
    const current = ++sequence
    state.loading = true
    state.error = ''
    state.data = null
    try {
      const data = await request()
      if (current === sequence) {
        state.data = data
        return data
      }
    } catch (error) {
      if (current === sequence) {
        const messages = {
          401: 'Sua sessão expirou. Entre novamente.',
          403: 'Você não tem permissão para consultar esta seção.',
          404: 'O registro não está mais disponível.',
          429: 'Muitas consultas em pouco tempo. Aguarde e tente novamente.',
        }
        state.error =
          messages[error?.response?.status] ||
          'Não foi possível carregar esta seção. Tente novamente.'
      }
    } finally {
      if (current === sequence) state.loading = false
    }
  }
  const reset = () => {
    sequence++
    state.data = null
    state.loading = false
    state.error = ''
  }
  return { state, load, reset }
}
