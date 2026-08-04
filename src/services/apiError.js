/**
 * Extrai uma mensagem legível a partir de um erro do axios.
 * A API responde no formato { success, errors: [{ code, message, field }], ... }.
 *
 * @param {unknown} error erro capturado de uma chamada axios
 * @param {string} fallback mensagem padrão caso nada seja encontrado
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  const errors = error?.response?.data?.errors
  if (Array.isArray(errors) && errors.length) {
    return errors.map((e) => e.message).filter(Boolean).join(' ') || fallback
  }
  return error?.response?.data?.message || error?.message || fallback
}

/**
 * Retorna a lista bruta de erros da API (com code/field), útil para destacar campos.
 * @param {unknown} error
 * @returns {Array<{code: string, message: string, field: string|null}>}
 */
export function getApiErrors(error) {
  const errors = error?.response?.data?.errors
  return Array.isArray(errors) ? errors : []
}
