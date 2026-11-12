<template>
  <router-view />
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { isAuthenticationFailure } from 'src/services/authFailure'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const onExpired = () => {
  authStore.clearAuth()
  $q.notify({ type: 'warning', message: 'Sua sessão expirou. Entre novamente.' })
  router.replace({ name: 'Auth', query: { session: 'expired' } })
}
onMounted(async () => {
  window.addEventListener('auth:expired', onExpired)
  if (authStore.hydrateAuth()) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      if (isAuthenticationFailure(error)) onExpired()
      else
        $q.notify({
          type: 'warning',
          message: 'Não foi possível verificar sua sessão. Tente novamente.',
        })
    }
  }
})
onBeforeUnmount(() => window.removeEventListener('auth:expired', onExpired))
</script>
