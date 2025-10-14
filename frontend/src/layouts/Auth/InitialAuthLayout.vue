<template>
  <div class="q-ma-sm row justify-center align-center items-center card-authentication">
    <div class="col-sm-12 col-12 col-md-12 text-center">
      <p class="text-h4 text-bold text-white">
        Boas Vindas aos Sistemas<br />
        Strategy Analytics
      </p>
      <p class="text-grey-5">Crie uma conta ou acesse com suas credencias</p>
    </div>
    <div class="col-3">
      <q-btn
        color="primary"
        label="Acessar Conta"
        @click="sendSelected('Auth')"
        padding="md lg"
        size="lg"
        class="text-h7"
        no-caps
        style="width: 100%; border-radius: 8px"
      />
      <q-btn
        color="primary"
        label="Criar Conta"
        flat
        no-caps
        @click="sendSelected('Register')"
        class="text-h7"
        size="lg"
        style="width: 100%; border-radius: 8px"
      />
    </div>
  </div>
</template>
<script setup>
import { defineComponent, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
defineComponent({
  name: 'InitialAuthLayout',
})

const storeLogin = useAuthStore()
const { selectedInitial, passwordReset } = storeToRefs(storeLogin)
const router = useRouter()

const sendSelected = (toRouter) => {
  storeLogin.selectedInitial = true
  router.push({
    name: toRouter,
  })
}
const route = useRoute()
onMounted(() => {
  if (route.query.token && route.query.email) {
    console.log('Token de validação enviado')
    passwordReset.value = null
    selectedInitial.value = null
    storeLogin.setValidateToken(route.query.token)
  }
})
</script>
