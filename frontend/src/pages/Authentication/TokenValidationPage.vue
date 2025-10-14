<template>
  <card-authentication-layout class="TokenPage">
    <title-auth
      title="Informe o token de validação"
      @actionEmit="backRouter()"
      subTitle="Enviamos no seu email um token de validação"
    />
    <q-form class="q-gutter-sm row q-mt-md" @submit.prevent.stop="onSubmit()">
      <label-form className="col-12" textLabel="Token de validação">
        <q-input
          outlined
          v-model="auth.token"
          ref="tokenRef"
          type="text"
          :aria-autocomplete="false"
          dense
          placeholder="Informe o token recebido"
          reverse-fill-mask
          unmasked-value
          class="q-my-sm"
          bg-color="white"
          :rules="[(v) => !!v || 'Campo obrigatório']"
          no-error-icon
          :error="msgError.length > 0"
          :error-message="msgError"
        />
      </label-form>
      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Validar token"
          type="submit"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
          v-if="!validation"
        />
        <q-btn
          v-else
          color="positive"
          label="Token validado"
          icon="check"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
        />
        <resend-token :token="auth.validationToken" />
        <!-- <q-btn
          color="primary"
          flat
          label="Não recebeu token? Clique aqui para reenviar"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
        /> -->
      </div>
    </q-form>
  </card-authentication-layout>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleAuth from 'src/components/Auth/TitleAuth.vue'
import CardAuthenticationLayout from 'src/layouts/Auth/CardAuthenticationLayout.vue'
import useNotification from 'src/composables/global/useNotification'
import ResendToken from 'src/components/Form/ResendToken.vue'

const { successNotify } = useNotification()
const storeLogin = useAuthStore()
const { auth } = storeToRefs(storeLogin)
const tokenRef = ref(null)
const validation = ref(false)
const route = useRoute()
const msgError = ref('')
const onSubmit = () => {
  if (auth.value.token !== '123456') {
    msgError.value = 'Token incorreto. Digite novamente ou peça para reenviar.'
    // Força exibir erro no campo
    tokenRef.value.validate()
    return
  }
  if (tokenRef.value.validate()) {
    validation.value = true
    successNotify('Acesso validado com sucesso! Voce será redirecionado...')
  }

  if (route.query.email && !route.query.register) {
    storeLogin.setValidateToken(true)

    if (!auth.value.email) {
      storeLogin.setAuthEmail(route.query.email)
    }
    storeLogin.setPasswordReset(true)
    router.push({
      name: 'Auth',
      query: {
        email: auth.value.email,
        token: auth.value.token,
      },
    })
    return
  }
  if (route.query.register) {
    storeLogin.setValidateToken(true)
    storeLogin.setAuthEmail(route.query.email)
    router.push({
      name: 'Register',
      query: {
        email: auth.value.email,
        token: auth.value.token,
        register: true,
      },
    })
  }

  setTimeout(() => {
    validation.value = false
    if (tokenRef.value.validate() && auth.value.token && auth.value.password && auth.value.email) {
      console.log('Token validado com sucesso!')
      router.replace({
        name: 'Selected',
      })
    }
  }, 2000)
}
defineComponent({
  name: 'TokenPage',
})

const router = useRouter()
const backRouter = () => {
  router.push({
    name: 'Auth',
  })
}
</script>
