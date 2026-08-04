<template>
  <q-card class="CreateClientLayout">
    <title-card title="Criar Novo Cliente" @on-close="onClose" />
    <q-separator />
    <q-form ref="formRef" class="q-pa-md" @submit.prevent.stop="onSubmit">
      <label-form textLabel="Tipo de cliente">
        <q-select
          v-model="form.kind"
          :options="kindOptions"
          emit-value
          map-options
          outlined
          dense
          class="q-my-sm"
        />
      </label-form>
      <label-form textLabel="Nome">
        <q-input v-model="form.name" outlined dense class="q-my-sm"
          :rules="[(value) => !!value || 'Campo obrigatório']" />
      </label-form>
      <label-form textLabel="E-mail">
        <q-input v-model="form.email" type="email" outlined dense class="q-my-sm"
          :rules="[(value) => !!value || 'Campo obrigatório', (value) => /.+@.+\..+/.test(value) || 'E-mail inválido']" />
      </label-form>
      <label-form textLabel="Data de nascimento">
        <q-input v-model="form.birthDate" type="date" outlined dense class="q-my-sm"
          :disable="form.kind === 'Organization'" />
      </label-form>
      <q-btn type="submit" color="primary" label="Criar Cliente" no-caps class="full-width q-mt-lg"
        :loading="loading" />
    </q-form>
  </q-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { useClientStore } from 'src/stores/client'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import { createCustomer } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const layoutStore = useLayoutStore()
const clientStore = useClientStore()
const { successNotify, errorNotify } = useNotification()
const formRef = ref(null)
const loading = ref(false)
const kindOptions = [
  { label: 'Pessoa física', value: 'Individual' },
  { label: 'Pessoa jurídica', value: 'Organization' },
]
const form = reactive({ kind: 'Individual', name: '', email: '', birthDate: '' })

const resetForm = () => {
  Object.assign(form, { kind: 'Individual', name: '', email: '', birthDate: '' })
  formRef.value?.resetValidation()
}
const onClose = () => {
  resetForm()
  layoutStore.setCreateClientDialog(false)
}
const onSubmit = async () => {
  if (!(await formRef.value.validate())) return
  try {
    loading.value = true
    await createCustomer({
      kind: form.kind,
      status: 'Active',
      birthDate: form.kind === 'Individual' && form.birthDate ? form.birthDate : null,
      names: [{ id: null, kind: 'Legal', displayName: form.name, validFrom: new Date().toISOString().slice(0, 10), validTo: null, isPrimary: true }],
      contacts: [{ id: null, kind: 'Email', value: form.email, isPrimary: true }],
      addresses: [],
    })
    await clientStore.fetchCustomers({ page: 1, pageSize: clientStore.pagination.pageSize })
    successNotify('Cliente criado com sucesso!')
    onClose()
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível criar o cliente.'))
  } finally {
    loading.value = false
  }
}
</script>
