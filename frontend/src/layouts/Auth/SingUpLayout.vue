<template>
  <div class="SingUpLayout">
    <title-auth
      :title="!registerFinished ? 'Informe seu e-mail' : 'Finalize seu cadastro'"
      @actionEmit="router.push({ name: 'Auth' })"
    />

    <q-form
      class="q-gutter-sm row q-mt-md"
      @submit.prevent.stop="onSubmit"
      v-if="!registerFinished"
    >
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
          bg-color="white"
        />
        <div class="col-12 q-mt-lg">
          <q-btn
            color="primary"
            label="Enviar token de validação de e-mail"
            type="submit"
            padding="md lg"
            size="lg"
            class="text-h7"
            no-caps
            style="width: 100%; border-radius: 8px"
          />
          <q-btn
            color="primary"
            flat
            label="Já tem uma conta? clique para entrar"
            padding="none"
            size="lg"
            class="text-h7 q-mt-md"
            no-caps
            style="width: 100%; border-radius: 8px"
            @click.prevent.stop="router.push({ name: 'Auth' })"
          />
        </div>
      </label-form>
    </q-form>
    <q-form class="q-gutter-sm row q-mt-md" v-else @submit.prevent.stop="onSubmitFinished">
      <label-form className="col-12" textLabel="Nome Completo">
        <q-input
          outlined
          v-model="auth.name"
          type="text"
          dense
          class="q-my-sm"
          bg-color="white"
          ref="nameRef"
          :rules="nameRule"
        />
      </label-form>
      <div class="col-12 row">
        <label-form className="q-pr-sm col-6" textLabel="CPF">
          <q-input
            outlined
            v-model="auth.person"
            type="text"
            ref="personRef"
            dense
            class="q-my-sm"
            bg-color="white"
            mask="###.###.###-##"
            :rules="personRule"
          />
        </label-form>
        <label-form className="q-pl-sm col-6" textLabel="Data de Nascimento">
          <q-input
            outlined
            v-model="auth.nascimento"
            dense
            class="q-my-sm"
            bg-color="white"
            navigation-min-year-month="1990/07"
            type="date"
            ref="birthdayRef"
            :rules="requiredRole"
          />
        </label-form>
      </div>
      <div class="row col-12">
        <label-form textLabel="Senha" className="q-pr-sm col-6">
          <q-input
            outlined
            ref="passwordRef"
            v-model="auth.password"
            dense
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
        <label-form textLabel="Confirme sua Senha" className="q-pl-sm col-6">
          <q-input
            outlined
            v-model="auth.passwordConfirm"
            dense
            aria-placeholder="Digiter a senha"
            ref="passwordConfirmRef"
            class="q-my-sm"
            bg-color="white"
            :rules="passwordConfirmRule"
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
        <span style="color: #81888f">
          A senha deve conter no mínimo 8 caracteres, dentre eles:
          <li>Letras maiúsculas e minúsculas; Números; Carecteres especiais (@#$%&*)</li>
        </span>
      </div>
      <div class="col-12 q-mt-lg">
        <q-btn
          color="primary"
          label="Criar Conta"
          type="submit"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
        />
        <q-btn
          color="primary"
          flat
          label="Já tem uma conta? clique para entrar"
          padding="none"
          size="lg"
          class="text-h7 q-mt-md"
          no-caps
          style="width: 100%; border-radius: 8px"
          @click.prevent.stop="router.push({ name: 'Auth' })"
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import TitleAuth from 'src/components/Auth/TitleAuth.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import useRules from 'src/composables/global/useRules'
import useRefForm from 'src/composables/global/useRefForm'
import useNotification from 'src/composables/global/useNotification'

import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const storeLogin = useAuthStore()
const { auth } = storeToRefs(storeLogin)
const router = useRouter()
const route = useRoute()

const registerFinished = ref(false)
const msgErrorReset = ref('')
const isPwd = ref(false)

const { nameRule, personRule, requiredRole, passwordConfirmRule } = useRules()
const {
  nameRef,
  emailRef,
  passwordRef,
  birthdayRef,
  personRef,
  passwordConfirmRef,
  validateDataErrorMsg,
} = useRefForm()
const { successNotify } = useNotification()
const onSubmit = async () => {
  router.push({ name: 'TokenValidation', query: { email: auth.value.email, register: true } })
  console.log('Form submitted')
}
const isFieldValid = (rules, value) => {
  if (!rules || !Array.isArray(rules)) return true
  for (const r of rules) {
    try {
      const res = r(value)
      if (res !== true) return false
    } catch {
      return false
    }
  }
  return true
}

const onSubmitFinished = async () => {
  validateDataErrorMsg()
  // validação de nome completo
  if (!isFieldValid(nameRule, auth.value.name)) {
    msgErrorReset.value = 'Informe nome completo (nome e sobrenome).'
    // força a validação visual do campo
    if (nameRef && nameRef.value && typeof nameRef.value.validate === 'function')
      nameRef.value.validate()
    return
  }
  if (auth.value.password !== auth.value.passwordConfirm) {
    msgErrorReset.value = 'As senhas não conferem'
    passwordRef.value.validate()
    passwordConfirmRef.value.validate()
    return
  }
  successNotify('Cadastro realizado com sucesso! Você será redirecionado...')

  setTimeout(() => {
    registerFinished.value = false
    storeLogin.setAuth({
      conectetion: false,
      token: null,
      validateToken: false,
    })
    router.replace({
      name: 'Auth',
    })
  }, 2000)

  // if (passwordRef.value.validate() && passwordConfirm.value.validate()) {
  //   registerFinished.value = true
  // }
}
onMounted(() => {
  if (route.query.email && !auth.value.email) {
    storeLogin.setAuthEmail(route.query.email)
    registerFinished.value = true
  }
  if (auth.value.email && route.query.register) {
    registerFinished.value = true
  }
})
</script>
