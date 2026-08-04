const messagesByCode = {
  internal_server_error: 'O servidor não conseguiu concluir a operação. Tente novamente mais tarde.',
  validation_error: 'Revise os campos informados.',
  invalid_request: 'Os dados enviados não são válidos.',
  conflict: 'A operação conflita com o estado atual do cadastro.',
  not_found: 'O registro solicitado não foi encontrado.',
  unauthorized: 'Sua sessão expirou. Entre novamente.',
  forbidden: 'Você não possui permissão para realizar esta operação.',
}

export function getApiErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  const errors = error?.response?.data?.errors
  if (Array.isArray(errors) && errors.length) {
    const messages = errors.map((item) => messagesByCode[item.code] || item.message).filter(Boolean)
    if (errors.some((item) => item.code === 'internal_server_error')) return fallback
    return messages.join(' ') || fallback
  }
  if (error?.message === 'Network Error') {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  }
  return error?.response?.data?.message || error?.message || fallback
}

export function getApiErrors(error) {
  const errors = error?.response?.data?.errors
  return Array.isArray(errors) ? errors : []
}
