import { useRouter } from 'vue-router'

const router = useRouter()

// Log detalhado de erros de navegação. Mantemos apenas o parâmetro `error` para
// evitar avisos do linter (variáveis como `to`/`from` não usadas geravam errors).
router.onError((error) => {
  console.error('[DEBUG][router.onError] Erro de navegação', error)
  try {
    const msg = error && error.message ? error.message : ''
    if (/loading chunk|chunkloaderror/i.test(msg) || (error && error.name === 'ChunkLoadError')) {
      console.warn('[DEBUG][router.onError] ChunkLoadError detectado, recarregando a página para recuperar assets')
      window.location.reload()
    }
  } catch (e) {
    console.error('[DEBUG][router.onError] falha ao tratar erro do router', e)
  }
})

// Captura erros globais não tratados e promessas rejeitadas para identificar falhas silenciosas
window.addEventListener('error', (evt) => {
  try {
    console.error('[DEBUG][global.error] Uncaught error', evt.error || evt)
  } catch (e) {
    console.error('[DEBUG][global.error] falha ao logar erro global', e)
  }
})

window.addEventListener('unhandledrejection', (evt) => {
  try {
    console.error('[DEBUG][global.unhandledrejection] Promise rejected', evt.reason)
  } catch (e) {
    console.error('[DEBUG][global.unhandledrejection] falha ao logar rejection', e)
  }
})
