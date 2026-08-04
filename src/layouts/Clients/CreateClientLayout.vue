<template>
  <q-card class="CreateClientLayout">
    <title-card title="Criar Novo Cliente" @on-close="onClose" />
    <q-separator />
    <q-form ref="formRef" @submit.prevent.stop="onSubmit" class="q-pa-md">
      <label-form textLabel="Nome">
        <q-input
          outlined
          dense
          v-model="form.name"
          bg-color="white"
          class="q-my-sm"
          :rules="[(val) => (val && val.length > 0) || 'Campo obrigatório']"
        />
      </label-form>

      <label-form textLabel="E-mail">
        <q-input
          outlined
          dense
          type="email"
          v-model="form.email"
          bg-color="white"
          class="q-my-sm"
          :rules="[
            (val) => (val && val.length > 0) || 'Campo obrigatório',
            (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
          ]"
        />
      </label-form>

      <label-form textLabel="Senha">
        <q-input
          outlined
          dense
          :type="isPwd ? 'password' : 'text'"
          v-model="form.password"
          bg-color="white"
          class="q-my-sm"
          :rules="[
            (val) => (val && val.length > 0) || 'Campo obrigatório',
            (val) => (val && val.length >= 8) || 'Mínimo de 8 caracteres',
          ]"
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

      <label-form textLabel="Confirmar Senha">
        <q-input
          outlined
          dense
          :type="isPwdConfirm ? 'password' : 'text'"
          v-model="form.passwordConfirm"
          bg-color="white"
          class="q-my-sm"
          :rules="[
            (val) => (val && val.length > 0) || 'Campo obrigatório',
            (val) => val === form.password || 'As senhas não conferem',
          ]"
        >
          <template v-slot:append>
            <q-icon
              color="grey-5"
              :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwdConfirm = !isPwdConfirm"
            />
          </template>
        </q-input>
      </label-form>

      <div class="q-mt-lg">
        <q-btn
          type="submit"
          color="primary"
          label="Criar Cliente"
          padding="md"
          no-caps
          :loading="loading"
          style="width: 100%; border-radius: 8px"
        />
      </div>
    </q-form>
  </q-card>
</template>
<script setup>
import { defineComponent, ref, reactive } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import { createClientUser } from 'src/services/userService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

defineComponent({
  name: 'CreateClientLayout',
})

const layoutStore = useLayoutStore()
const { successNotify, errorNotify } = useNotification()

const formRef = ref(null)
const isPwd = ref(true)
const isPwdConfirm = ref(true)
const loading = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.passwordConfirm = ''
  formRef.value?.resetValidation()
}

const onClose = () => {
  resetForm()
  layoutStore.setCreateClientDialog(false)
}

const onSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    await createClientUser({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    successNotify('Cliente criado com sucesso!')
    onClose()
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível criar o cliente.'))
  } finally {
    loading.value = false
  }
}
</script>
