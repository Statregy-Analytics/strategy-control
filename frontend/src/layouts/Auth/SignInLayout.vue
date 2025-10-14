<template>
  <div class="">
    <title-auth @actionEmit="backRouter()" />
    <q-form class="q-gutter-sm row q-mt-md" @submit.prevent.stop="onSubmit">
      <label-form className="col-12" textLabel="E-mail ou CPF">
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
          :rules="[(val) => (val && val.length > 0) || 'Campo obrigatório']"
        />
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
          bg-color="white"
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

      <div class="col-12" style="text-align-last: end">
        <q-btn
          padding="none"
          flat
          label="Esquece minha senha"
          size="12px"
          class="text-grey-5"
          no-caps
          @click="passwordReset = true"
        />
      </div>
      <q-checkbox size="xs" v-model="auth.conectetion" label="Manter conectado" keep-color />
      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Acessar Conta"
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
          label="Ainda não tem uma conta? Cadastre aqui"
          padding="md lg"
          size="lg"
          class="text-h7"
          no-caps
          style="width: 100%; border-radius: 8px"
          @click.prevent.stop="router.push({ name: 'Register' })"
        />
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import TitleAuth from 'src/components/Auth/TitleAuth.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'

const storeAuth = useAuthStore()
const { selectedInitial, auth, passwordReset } = storeToRefs(storeAuth)
const router = useRouter()
const emailRef = ref(null)
const passwordRef = ref(null)
defineComponent({
  name: 'SignInLayout',
})
const backRouter = () => {
  selectedInitial.value = false
  router.push({ name: 'Selected' })
}
const isPwd = ref(true)
const onSubmit = async () => {
  emailRef.value.validate()
  passwordRef.value.validate()
  if (!emailRef.value.hasError || !passwordRef.value.hasError) {
    // await authAction();
    // Aqui vai ser feito a logica de envio de authenticação
    router.push({ name: 'TokenValidation' })
  }
}
</script>
