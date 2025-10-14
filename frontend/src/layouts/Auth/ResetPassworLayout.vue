<template>
  <div class="ResetPasswordLayout">
    <title-auth
      title="Redefine sua Senha"
      @actionEmit="passwordReset = false"
      subTitle="Informe seu email para redefinir sua senha"
    />
    <q-form
      class="q-gutter-sm row q-mt-md"
      @submit.prevent.stop="onSubmit"
      v-if="!auth.validateToken"
    >
      <label-form className="col-12" textLabel="Email">
        <q-input
          outlined
          v-model="auth.email"
          ref="emailRef"
          type="text"
          :aria-autocomplete="false"
          dense
          reverse-fill-mask
          unmasked-value
          class="q-my-sm"
          bg-color="white"
          no-error-icon
          :rules="emailRules"
          :error="msgError.length > 0"
          :error-message="msgError"
        >
        </q-input>
      </label-form>
      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Enviar instruções para redefinir senha"
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
          label="Email enviado"
          icon="check"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
        />
      </div>
    </q-form>
    <q-form v-else class="row q-mt-md justify-between" @submit.prevent.stop="onSubmitReset">
      <div class="col-6">
        <label-form textLabel="Senha">
          <q-input
            outlined
            ref="passwordRef"
            v-model="auth.password"
            dense
            reverse-fill-mask
            aria-placeholder="Digiter a senha"
            unmasked-value
            class="q-my-sm"
            bg-color="white"
            :type="isPwd ? 'password' : 'text'"
            :error="msgErrorReset.length > 0"
            :error-message="msgErrorReset"
          >
            <template v-slot:append>
              <q-icon
                color="grey-5"
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </label-form>
      </div>
      <div class="col-6 q-pl-md">
        <label-form textLabel="Confirme sua Senha">
          <q-input
            outlined
            ref="passwordConfirm"
            v-model="auth.passwordConfirm"
            dense
            reverse-fill-mask
            aria-placeholder="Digiter a senha"
            unmasked-value
            class="q-my-sm"
            bg-color="white"
            :type="isPwd ? 'password' : 'text'"
            :error="msgErrorReset.length > 0"
            :error-message="msgErrorReset"
          >
            <template v-slot:append>
              <q-icon
                color="grey-5"
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </label-form>
      </div>
      <span style="color: #81888f">
        A senha deve conter no mínimo 8 caracteres, dentre eles:
        <li>Letras maiúsculas e minúsculas; Números; Carecteres especiais (@#$%&*)</li>
      </span>
      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Redefinir senha"
          type="submit"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleAuth from 'src/components/Auth/TitleAuth.vue'
import useNotification from 'src/composables/global/useNotification'
defineComponent({
  name: 'ResetPasswordLayout',
})
const authStore = useAuthStore()
const { passwordReset, auth } = storeToRefs(authStore)
const { successNotify } = useNotification()
const emailRef = ref(null)
// import router from 'src/router'
const isPwd = ref(false)
const validation = ref(false)
const msgError = ref('')
const msgErrorReset = ref('')
const emailRules = [(val) => (val && val.length > 0) || 'Campo obrigatório']
const router = useRouter()
const onSubmit = () => {
  msgError.value = '' // Limpa mensagem de erro anterior
  if (auth.value.email !== 'jlbnunes@live.com') {
    msgError.value = 'Email não presente em nossa base. Tente fazer cadastro'
    // Força exibir erro no campo
    emailRef.value.validate()
    return
  }
  if (emailRef.value.validate()) {
    validation.value = true
    router.replace({
      name: 'TokenValidation',
      query: {
        email: auth.value.email,
      },
    })
    successNotify('Enviado email para você...')
  }
  setTimeout(() => {
    validation.value = false
    console.log('Token de validação enviado')
  }, 2000)
}
const onSubmitReset = () => {
  msgErrorReset.value = '' // Limpa mensagem de erro anterior do reset
  if (auth.value.password !== auth.value.passwordConfirm) {
    msgErrorReset.value = 'As senhas não conferem. Tente novamente.'
    return
  }
  if (auth.value.password.length < 8) {
    msgErrorReset.value = 'A senha deve conter no mínimo 8 caracteres.'
    return
  }
  if (auth.value.passwordConfirm.length < 8) {
    msgErrorReset.value = 'A senha deve conter no mínimo 8 caracteres.'
    return
  }
  successNotify('Senha redefinida! Você será direcinado para o Login', 1500)
  setTimeout(() => {
    authStore.setPasswordReset(false)
    authStore.setAuthEmail('')
    authStore.setValidateToken(false)
    router.push({
      name: 'Auth',
    })
  }, 1500)
}
// const route = useRoute()
// const backRouter = () => {
//   router.push({
//     name: 'Auth',
//   })
// }
</script>
