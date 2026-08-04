<template>
  <div :class="embedded ? 'q-gutter-lg' : 'q-gutter-md'">
    <q-card flat :bordered="!embedded">
      <q-card-section class="row items-center q-px-none q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Nomes</div><q-space />
        <q-btn flat dense size="sm" color="primary" icon="add" label="Adicionar" no-caps @click="addName" />
      </q-card-section>
      <q-separator v-if="!embedded" />
      <q-card-section v-for="(item, index) in names" :key="item.id || index" class="row q-col-gutter-sm items-end q-px-none q-py-sm">
        <label-form class-name="col-12 col-md-4" text-label="Nome"><q-input v-model="item.displayName" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-6 col-md-3" text-label="Tipo"><q-select v-model="item.kind" :options="nameKinds" outlined dense /></label-form>
        <label-form class-name="col-6 col-md-3" text-label="Válido desde"><q-input v-model="item.validFrom" type="date" outlined dense /></label-form>
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col-auto q-mb-xs" @update:model-value="setPrimary(names, index)" />
        <q-btn flat round dense color="negative" icon="delete" class="q-mb-xs" :disable="names.length === 1" @click="names.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right" class="q-pa-none"><q-btn flat dense size="sm" color="primary" icon="save" label="Salvar nomes" no-caps :loading="saving === 'names'" @click="saveNames" /></q-card-actions>
    </q-card>

    <q-card flat :bordered="!embedded">
      <q-card-section class="row items-center q-px-none q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Contatos</div><q-space />
        <q-btn flat dense size="sm" color="primary" icon="add" label="Adicionar" no-caps @click="addContact" />
      </q-card-section>
      <q-separator v-if="!embedded" />
      <q-card-section v-for="(item, index) in contacts" :key="item.id || index" class="row q-col-gutter-sm items-end q-px-none q-py-sm">
        <label-form class-name="col-12 col-md-3" text-label="Tipo"><q-select v-model="item.kind" :options="contactKinds" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-6" text-label="Contato"><q-input v-model="item.value" placeholder="value" outlined dense /></label-form>
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col q-mb-xs" @update:model-value="setPrimary(contacts, index)" />
        <q-btn flat round dense color="negative" icon="delete" class="q-mb-xs" :disable="contacts.length === 1" @click="contacts.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right" class="q-pa-none"><q-btn flat dense size="sm" color="primary" icon="save" label="Salvar contatos" no-caps :loading="saving === 'contacts'" @click="saveContacts" /></q-card-actions>
    </q-card>

    <q-card flat :bordered="!embedded">
      <q-card-section class="row items-center q-px-none q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Endereços</div><q-space />
        <q-btn flat dense size="sm" color="primary" icon="add" label="Adicionar" no-caps @click="addAddress" />
      </q-card-section>
      <q-separator v-if="!embedded" />
      <q-card-section v-if="!addresses.length" class="text-grey-7 q-px-none">Nenhum endereço cadastrado.</q-card-section>
      <q-card-section v-for="(item, index) in addresses" :key="item.id || index" class="row q-col-gutter-sm items-end q-px-none q-py-sm">
        <label-form class-name="col-12 col-md-3" text-label="Tipo"><q-select v-model="item.kind" :options="addressKinds" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-6" text-label="Endereço"><q-input v-model="item.line1" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-3" text-label="Complemento"><q-input v-model="item.line2" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Cidade"><q-input v-model="item.city" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-6 col-md-3" text-label="Estado/Província"><q-input v-model="item.stateOrProvince" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-6 col-md-2" text-label="CEP"><q-input v-model="item.postalCode" placeholder="value" outlined dense /></label-form>
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col" @update:model-value="setPrimary(addresses, index)" />
        <q-btn flat round color="negative" icon="delete" @click="addresses.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right" class="q-pa-none"><q-btn flat dense size="sm" color="primary" icon="save" label="Salvar endereços" no-caps :loading="saving === 'addresses'" @click="saveAddresses" /></q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { replaceCustomerAddresses, replaceCustomerContacts, replaceCustomerNames } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import LabelForm from 'src/components/Form/LabelForm.vue'

const props = defineProps({
  customerId: { type: String, required: true },
  identification: { type: Object, default: () => ({}) },
  embedded: { type: Boolean, default: false },
})
const emit = defineEmits(['updated'])
const { successNotify, errorNotify } = useNotification()
const today = () => new Date().toISOString().slice(0, 10)
const names = ref([])
const contacts = ref([])
const addresses = ref([])
const saving = ref('')
const nameKinds = ['Legal', 'Preferred', 'Social']
const contactKinds = ['Email', 'Phone', 'Mobile']
const addressKinds = ['Residential', 'Commercial', 'Correspondence']
const cloneCollection = (items) => items.map((item) => ({ ...item }))

const normalize = () => {
  const source = props.identification || {}
  const fallbackName = source.primaryName
    ? [source.primaryName]
    : source.fullName
      ? [{
          id: null,
          kind: 'Legal',
          displayName: source.fullName,
          validFrom: source.createdAtUtc?.slice(0, 10) || today(),
          validTo: null,
          isPrimary: true,
        }]
      : []
  names.value = cloneCollection(source.names || fallbackName)
  contacts.value = cloneCollection(source.contacts || [])
  addresses.value = cloneCollection(source.addresses || (source.residentialAddress ? [source.residentialAddress] : []))
  if (!names.value.length) addName()
  if (!contacts.value.length) {
    if (source.primaryEmail) contacts.value.push({ id: source.primaryEmail.id || null, kind: 'Email', value: source.primaryEmail.value || '', isPrimary: true })
    else addContact()
  }
}
const addName = () => names.value.push({ id: null, kind: 'Legal', displayName: '', validFrom: today(), validTo: null, isPrimary: names.value.length === 0 })
const addContact = () => contacts.value.push({ id: null, kind: 'Email', value: '', isPrimary: contacts.value.length === 0 })
const addAddress = () => addresses.value.push({ id: null, kind: 'Residential', line1: '', line2: null, city: '', stateOrProvince: null, postalCode: null, countryId: null, isPrimary: addresses.value.length === 0 })
watch(() => props.identification, normalize, { immediate: true, deep: true })
const setPrimary = (collection, index) => { if (collection[index].isPrimary) collection.forEach((item, i) => { if (i !== index) item.isPrimary = false }) }
const execute = async (section, request, successMessage) => {
  try { saving.value = section; await request(); successNotify(successMessage); emit('updated') }
  catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível salvar as alterações.')) }
  finally { saving.value = '' }
}
const saveNames = () => execute('names', () => replaceCustomerNames(props.customerId, names.value), 'Nomes atualizados.')
const saveContacts = () => execute('contacts', () => replaceCustomerContacts(props.customerId, contacts.value), 'Contatos atualizados.')
const saveAddresses = () => execute('addresses', () => replaceCustomerAddresses(props.customerId, addresses.value), 'Endereços atualizados.')
</script>
