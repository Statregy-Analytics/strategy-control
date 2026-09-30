<template>
  <div class="sa-sign-in">
    <div class="sa-sign-in__brand">Strategy Analytics</div>
    <div class="sa-sign-in__subtitle">Sistema de Gestão Financeira</div>
    <q-form class="q-gutter-sm row q-mt-xl" @submit.prevent.stop="onSubmit">
      <label-form className="col-12" textLabel="E-mail">
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
          dark
          placeholder="seu@email.com"
          :rules="[(val) => (val && val.length > 0) || 'Campo obrigatório']"
        ><template #prepend><q-icon name="mail_outline" size="20px" /></template></q-input>
      </label-form>
      <label-form className="col-12" textLabel="Senha">
        <q-input
          outlined
          ref="passwordRef"
          v-model="auth.password"
          dense
          reverse-fill-mask
          unmasked-value
          class="q-my-sm"
          dark
          placeholder="••••••••"
          :rules="[(val) => (val && val.length > 0) || 'Campo obrigatório']"
          :type="isPwd ? 'password' : 'text'"
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

      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Entrar"
          type="submit"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
        />
        <q-btn flat label="Esqueceu sua senha?" size="12px" class="full-width q-mt-sm text-grey-5" no-caps @click="passwordReset = true" />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import useNotification from 'src/composables/global/useNotification'
import { getApiErrorMessage } from 'src/services/apiError'

const storeAuth = useAuthStore()
const { auth, passwordReset } = storeToRefs(storeAuth)
const router = useRouter()
const { showLoading, hideLoading, successNotify, errorNotify } = useNotification()
const emailRef = ref(null)
const passwordRef = ref(null)
defineComponent({
  name: 'SignInLayout',
})
const isPwd = ref(true)
const onSubmit = async () => {
  emailRef.value.validate()
  passwordRef.value.validate()
  if (emailRef.value.hasError || passwordRef.value.hasError) return

  try {
    showLoading('Autenticando...')
    await storeAuth.loginAction({ email: auth.value.email, password: auth.value.password })
    successNotify('Bem-vindo!')
    router.push({ name: 'Clientes' })
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível entrar. Verifique suas credenciais.'))
  } finally {
    hideLoading()
  }
}
</script>
<style scoped>
.sa-sign-in__brand { text-align: center; font-size: 28px; font-weight: 700; }
.sa-sign-in__subtitle { margin-top: 6px; text-align: center; color: rgba(255,255,255,.58); font-size: 13px; }
</style>
