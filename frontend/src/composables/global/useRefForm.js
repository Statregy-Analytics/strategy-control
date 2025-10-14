import { ref } from 'vue'

export default function useRefForm() {
  const nameRef = ref(null)
  const lastnameRef = ref(null)
  const emailRef = ref(null)
  const birthdayRef = ref(null)
  const personRef = ref(null)
  const phoneRef = ref(null)
  const roleRef = ref(null)
  const telephoneRef = ref(null)
  const streetRef = ref(null)
  const numberstreetRef = ref(null)
  const districtRef = ref(null)
  const zipcodeRef = ref(null)
  const cityRef = ref(null)
  const countryRef = ref(null)
  const statestreetRef = ref(null)
  const uploadRef = ref(null)
  const transactionRef = ref(null)
  const passwordRef = ref(null)
  const passwordConfirmRef = ref(null)
  const validateInput = () => {
    nameRef.value.validate()
    lastnameRef.value.validate()
    emailRef.value.validate()
    birthdayRef.value.validate()
    personRef.value.validate()
    phoneRef.value.validate()
    roleRef.value.validate()
  }
  const validateDataInitial = () => {
    nameRef.value.validate()
    personRef.value.validate()
    emailRef.value.validate()
    birthdayRef.value.validate()
    passwordRef.value.validate()
    passwordConfirmRef.value.validate()
    phoneRef.value.validate()
  }
  const validateRegisterAddress = () => {
    zipcodeRef.value.validate()
    streetRef.value.validate()
    districtRef.value.validate()
    statestreetRef.value.validate()
    cityRef.value.validate()
    numberstreetRef.value.validate()
  }
  const validateDataAddresMsg = () => {
    return (
      zipcodeRef.value.hasError ||
      streetRef.value.hasError ||
      districtRef.value.hasError ||
      statestreetRef.value.hasError ||
      cityRef.value.hasError ||
      numberstreetRef.value.hasError
    )
  }
  const validateDataErrorMsg = () => {
    return (
      nameRef.value.hasError ||
      personRef.value.hasError ||
      birthdayRef.value.hasError ||
      passwordRef.value.hasError ||
      passwordConfirmRef.value.hasError
    )
  }
  const validateErrorMsg = () => {
    return (
      nameRef.value.hasError ||
      lastnameRef.value.hasError ||
      emailRef.value.hasError ||
      birthdayRef.value.hasError ||
      personRef.value.hasError ||
      phoneRef.value.hasError ||
      roleRef.value.hasError
    )
  }
  const validateInitialReceipt = () => {
    transactionRef.value.validate()
    uploadRef.value.validate()
  }
  const validateReceipt = () => {
    return uploadRef.value.hasError || transactionRef.value.hasError
  }
  const optionGenre = [
    { label: 'Homem', value: 'M', id: 0 },
    { label: 'Mulher', value: 'W', id: 1 },
    { label: 'LGBTQIAP+', value: 'L', id: 2 },
    { label: 'Não informa', value: 'O', id: 3 },
  ]
  const optionRole = [
    { label: 'Master', value: '1', id: 1 },
    { label: 'Funcionário', value: '2', id: 2 },
  ]
  const optionNot = [
    // "accepted", "refused"
    { label: 'Aceitar', value: 'accepted', id: 'accepted' },
    { label: 'recusar', value: 'refused', id: 'refused' },
  ]
  return {
    validateInput,
    validateErrorMsg,
    validateDataInitial,
    validateDataErrorMsg,
    validateRegisterAddress,
    validateDataAddresMsg,
    validateReceipt,
    validateInitialReceipt,
    nameRef,
    lastnameRef,
    emailRef,
    birthdayRef,
    personRef,
    passwordRef,
    passwordConfirmRef,
    phoneRef,
    roleRef,
    optionGenre,
    optionRole,
    optionNot,
    telephoneRef,
    streetRef,
    numberstreetRef,
    districtRef,
    zipcodeRef,
    cityRef,
    countryRef,
    statestreetRef,
    transactionRef,
    uploadRef,
  }
}
