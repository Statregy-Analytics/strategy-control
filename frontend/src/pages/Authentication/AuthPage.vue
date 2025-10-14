<template>
  <card-authentication-layout class="auth-page">
    <sign-in-layout v-if="!passwordReset" />
    <reset-passwor-layout v-else />
  </card-authentication-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import SignInLayout from 'src/layouts/Auth/SignInLayout.vue'
import CardAuthenticationLayout from 'src/layouts/Auth/CardAuthenticationLayout.vue'
import ResetPassworLayout from 'src/layouts/Auth/ResetPassworLayout.vue'
const storeAuth = useAuthStore()
const { passwordReset } = storeToRefs(storeAuth)
const loaded = ref(false)
onMounted(() => {
  // Aguarda o próximo tick para garantir que o valor reativo esteja resolvido
  requestAnimationFrame(() => {
    loaded.value = true
  })
})
</script>
<style lang="sass">


.my-input
  padding-left: 12rem
@keyframes autofill
  100%
    background-color: transparent

.q-input,
.q-select
  .q-field__native
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active
      -webkit-background-clip: text
      animation: autofill 0s forwards

  &.q-field--dark .q-field__native
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active
      -webkit-text-fill-color: transparent
</style>
