/**
 *
 * @param {*} value
 * Remove tudo que não é número
 * Se estiver vazio, define como zero
 * Remove zeros à esquerda, exceto se for apenas zero
 * Garante que temos pelo menos 3 dígitos para os centavos
 * Separa centavos (últimos 2 dígitos) e reais
 * Se reais estiver vazio após separar os centavos, define como "0"
 * Formata os reais com separadores de milhar
 * @returns String
 */
const formatCurrency = (value) => {
  if (!value) return '0,00'


  let onlyNumbers = String(value).replace(/[^\d]/g, '')


  if (onlyNumbers.length === 0) return '0,00'


  onlyNumbers = onlyNumbers.replace(/^0+/, '') || '0'


  onlyNumbers = onlyNumbers.padStart(3, '0')


  const cents = onlyNumbers.slice(-2)
  let reais = onlyNumbers.slice(0, -2)


  if (reais === '') reais = '0'


  const reaisFormatados = parseInt(reais, 10).toLocaleString('pt-BR')

  return `${reaisFormatados},${cents}`
}
/**
 *
 * @param {*} formattedValue
 * Remove pontos e substitui vírgula por ponto para número decimal
 * @returns string
 */
const parseCurrency = (formattedValue) => {
  if (!formattedValue) return 0
  const number = parseFloat(
    formattedValue.replace(/\./g, '').replace(',', '.')
  )
  return isNaN(number) ? 0 : number
}
/**
 * Emite evento para atualizar o v-model
 * Formata o valor inicial se necessário
 */
export const currencyMask = {
  mounted(el, binding) {
    const input = el.querySelector('input') || el

    const updateValue = (value) => {
      const formatted = formatCurrency(value)
      if (input.value !== formatted) {
        input.value = formatted
      }

      if (binding.instance) {
        const modelValue = parseCurrency(formatted)
        binding.instance[binding.arg] = modelValue
      }
    }

    input.addEventListener('input', (e) => {
      updateValue(e.target.value)
    })

    input.addEventListener('blur', (e) => {
      updateValue(e.target.value)
    })

    if (binding.value !== undefined) {
      updateValue(binding.value)
    }
  },

  updated(el, binding) {
    const input = el.querySelector('input') || el
    if (binding.value !== undefined) {
      const formatted = formatCurrency(binding.value)
      if (input.value !== formatted) {
        input.value = formatted
      }
    }
  }
}
