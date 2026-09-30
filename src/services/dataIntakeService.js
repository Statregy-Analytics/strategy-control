import { api } from 'src/boot/axios'

const base = '/api/v1/data-intake'
const unwrap = (response) => response.data?.data ?? response.data
export const listIntakeForms = async () => unwrap(await api.get(`${base}/forms`))
export const getActiveIntakeForm = async (code) => unwrap(await api.get(`${base}/forms/${encodeURIComponent(code)}/active`))
export const getIntakeDefinition = async (id) => unwrap(await api.get(`/api/v1/admin/data-intake/forms/${encodeURIComponent(id)}`))
export const listIntakeSubmissions = async (params) => (await api.get(`${base}/submissions`, { params })).data
export const getIntakeSubmission = async (id) => unwrap(await api.get(`${base}/submissions/${encodeURIComponent(id)}`))
export const getIntakeHistory = async (id) => unwrap(await api.get(`${base}/submissions/${encodeURIComponent(id)}/history`))

// Retain an operation's key across retries, including when the response was lost.
// Nothing is stored in localStorage: payloads and files stay in the open editor.
export function createIntakeWriter() {
  const attempts = new Map()
  return async (method, path, payload, operation = JSON.stringify([method, path, payload])) => {
    if (!attempts.has(operation)) attempts.set(operation, crypto.randomUUID())
    try {
      const result = unwrap(await api.request({ method, url: path, data: payload, headers: { 'Idempotency-Key': attempts.get(operation) } }))
      attempts.delete(operation)
      return result
    } catch (error) {
      // Definitive validation errors may be corrected and retried as a new action.
      if ([400, 403, 404, 422].includes(error.response?.status)) attempts.delete(operation)
      throw error
    }
  }
}

export const intakePath = (id = '', action = '') => `${base}/submissions${id ? `/${encodeURIComponent(id)}` : ''}${action ? `/${action}` : ''}`

export function intakeError(error) {
  const codes = error?.response?.data?.errors?.map((item) => item.code) || []
  if (codes.includes('data_intake_submission.action_handler_not_found')) return 'Este formulário ainda não possui uma ação de aprovação disponível no servidor. A submissão foi mantida para análise.'
  if (codes.includes('data_intake_submission.version_conflict')) return 'Esta submissão foi alterada por outra pessoa. Reabra o registro antes de salvar; suas alterações ainda estão neste painel.'
  if (codes.includes('data_intake_submission.required_attachment_missing')) return 'Faltam documentos obrigatórios. Confira os tipos e requisitos dos anexos antes de enviar.'
  if (codes.includes('data_intake.title_not_unique')) return 'Já existe uma submissão enviada com esse título. Informe outro título.'
  if (codes.includes('data_intake_submission.form_permission_denied')) return 'A versão deste formulário não permite esta ação para o seu perfil.'
  return ({ 400: 'Revise os campos e documentos informados.', 401: 'Sua sessão expirou. Entre novamente.', 403: 'Seu perfil não possui permissão para esta ação.', 404: 'Registro ou versão de formulário indisponível neste ambiente.', 409: 'A operação conflita com o estado atual. Reabra o registro para conferir.', 422: 'Revise os campos informados.', 429: 'Muitas solicitações. Aguarde um momento e tente novamente.' })[error?.response?.status] || 'Não foi possível concluir a operação. Seus dados foram mantidos; tente novamente.'
}
