import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { ref, computed, watch } from 'vue'
import { isFullName } from 'src/utils/validators/nameValidator'

export default function useRules() {
  const personRef = ref(null)
  const passwordRef = ref(null)
  const passwordConfirmRef = ref(null)
  const authStore = useAuthStore()
  const { auth } = storeToRefs(authStore)
  const emailRe =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const stringSerialize = (string) => {
    return string.replace(/[^0-9]/g, '')
  }
  const fiedValidate = ref([
    { id: 1, name: 'Contém letra maiuscula', status: false },
    { id: 2, name: 'Contém letra minuscula', status: false },
    { id: 3, name: 'Contém caracters Especiais', status: false },
    { id: 4, name: 'Contém números', status: false },
    { id: 5, name: 'Contém tamanho superior a 8', status: false },
  ])

  const patternsRules = {
    length20: (val) => val.length < 20 || 'Tem que ser maior que 20 caracetres',
  }
  const verifyExist = (value) => {
    return value != null && value != undefined && value != ''
  }

  const cnpjRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => val.length == 18 || 'Campo incompleto',
  ]
  // CPF validation (simple digits-only length and checksum)
  const isValidCPF = (str) => {
    if (!str) return false
    const s = String(str).replace(/\D/g, '')
    if (!/^\d{11}$/.test(s)) return false
    if (/^(\d)\1+$/.test(s)) return false
    let sum = 0
    for (let i = 0; i < 9; i++) sum += Number(s.charAt(i)) * (10 - i)
    let rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== Number(s.charAt(9))) return false
    sum = 0
    for (let i = 0; i < 10; i++) sum += Number(s.charAt(i)) * (11 - i)
    rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== Number(s.charAt(10))) return false
    return true
  }
  const cpfRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => isValidCPF(val) || 'CPF inválido',
  ]
  // CNPJ validation (basic checksum)
  const isValidCNPJ = (str) => {
    if (!str) return false
    const s = String(str).replace(/\D/g, '')
    if (!/^\d{14}$/.test(s)) return false
    if (/^(\d)\1+$/.test(s)) return false
    const calc = (n) => {
      let size = n.length - 2
      let numbers = n.substring(0, size)
      let digits = n.substring(size)
      let sum = 0
      let pos = size - 7
      for (let i = size; i >= 1; i--) {
        sum += Number(numbers.charAt(size - i)) * pos--
        if (pos < 2) pos = 9
      }
      let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
      if (result != Number(digits.charAt(0))) return false
      size = size + 1
      numbers = n.substring(0, size)
      sum = 0
      pos = size - 7
      for (let i = size; i >= 1; i--) {
        sum += Number(numbers.charAt(size - i)) * pos--
        if (pos < 2) pos = 9
      }
      result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
      return result == Number(digits.charAt(1))
    }
    return calc(s)
  }
  const cpfOrCnpjRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => {
      const clean = String(val || '').replace(/\D/g, '')
      if (clean.length === 11) return isValidCPF(clean) || 'CPF inválido'
      if (clean.length === 14) return isValidCNPJ(clean) || 'CNPJ inválido'
      return 'CPF ou CNPJ inválido'
    },
  ]
  const nameRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => val.length >= 3 || 'Campo não tem mímino',
    (val) => !/\d/.test(val) || 'Adicione um Nome válido!',
    // exige nome completo: pelo menos duas palavras (nome e sobrenome)
    (val) => (val ? isFullName(val) || 'Informe nome completo (nome e sobrenome)' : true),
  ]
  const emailRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => emailRe.test(val) || 'Campo invalido!',
  ]
  const requiredRole = [(val) => !!val || 'Campo é obrigatorio.']
  const phoneRole = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => val.length == 16 || 'Campo incompleto',
  ]
  const zipCodeRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => val.length == 9 || 'Campo incompleto',
  ]
  const passwordConfirmRule = [
    (value) => !!value || 'Campo é obrigatorio',
    (value) => value == auth.value.password || 'Senhas não conferem',
  ]
  const personRule = [
    (val) => !!val || 'Campo é obrigatorio.',
    (val) => val.length == 14 || 'Campo incompleto',
  ]
  const validateID = (e) => {
    if (verifyExist(e)) {
      if (patternsRules['length20'](e)) {
        return false
      }
    }
    return true
  }

  // password
  const verifyValue = computed(() => auth.value.password)

  watch(verifyValue, (n) => {
    ;/\d/.test(n) ? (fiedValidate.value[3].status = true) : (fiedValidate.value[3].status = false)
    ;/[^\w\s]/.test(n)
      ? (fiedValidate.value[2].status = true)
      : (fiedValidate.value[2].status = false)
    ;/[A-Z]/.test(n)
      ? (fiedValidate.value[1].status = true)
      : (fiedValidate.value[1].status = false)
    ;/[a-z]/.test(n)
      ? (fiedValidate.value[0].status = true)
      : (fiedValidate.value[0].status = false)
    n.length > 8 ? (fiedValidate.value[4].status = true) : (fiedValidate.value[4].status = false)
  })

  return {
    personRule,
    personRef,
    passwordRef,
    passwordConfirmRef,
    cnpjRule,
    cpfRule,
    cpfOrCnpjRule,
    fiedValidate,
    requiredRole,
    nameRule,
    emailRule,
    phoneRole,
    zipCodeRule,
    stringSerialize,
    validateID,
    passwordConfirmRule,
  }
}
