<template>
  <div class="q-gutter-md">
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-subtitle1 text-weight-bold">Nomes</div><q-space />
        <q-btn flat color="primary" icon="add" label="Adicionar" no-caps @click="addName" />
      </q-card-section>
      <q-separator />
      <q-card-section v-for="(item, index) in names" :key="item.id || index" class="row q-col-gutter-sm">
        <q-input v-model="item.displayName" label="Nome" outlined dense class="col-12 col-md-5" />
        <q-select v-model="item.kind" :options="nameKinds" label="Tipo" outlined dense class="col-6 col-md-2" />
        <q-input v-model="item.validFrom" type="date" label="Válido desde" outlined dense class="col-6 col-md-2" />
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col" @update:model-value="setPrimary(names, index)" />
        <q-btn flat round color="negative" icon="delete" :disable="names.length === 1" @click="names.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right"><q-btn color="primary" label="Salvar nomes" no-caps :loading="saving === 'names'" @click="saveNames" /></q-card-actions>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-subtitle1 text-weight-bold">Contatos</div><q-space />
        <q-btn flat color="primary" icon="add" label="Adicionar" no-caps @click="addContact" />
      </q-card-section>
      <q-separator />
      <q-card-section v-for="(item, index) in contacts" :key="item.id || index" class="row q-col-gutter-sm">
        <q-select v-model="item.kind" :options="contactKinds" label="Tipo" outlined dense class="col-12 col-md-3" />
        <q-input v-model="item.value" label="Contato" outlined dense class="col-12 col-md-6" />
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col" @update:model-value="setPrimary(contacts, index)" />
        <q-btn flat round color="negative" icon="delete" :disable="contacts.length === 1" @click="contacts.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right"><q-btn color="primary" label="Salvar contatos" no-caps :loading="saving === 'contacts'" @click="saveContacts" /></q-card-actions>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-subtitle1 text-weight-bold">Endereços</div><q-space />
        <q-btn flat color="primary" icon="add" label="Adicionar" no-caps @click="addAddress" />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="!addresses.length" class="text-grey-7">Nenhum endereço cadastrado.</q-card-section>
      <q-card-section v-for="(item, index) in addresses" :key="item.id || index" class="row q-col-gutter-sm">
        <q-select v-model="item.kind" :options="addressKinds" label="Tipo" outlined dense class="col-12 col-md-3" />
        <q-input v-model="item.line1" label="Endereço" outlined dense class="col-12 col-md-6" />
        <q-input v-model="item.line2" label="Complemento" outlined dense class="col-12 col-md-3" />
        <q-input v-model="item.city" label="Cidade" outlined dense class="col-12 col-md-4" />
        <q-input v-model="item.stateOrProvince" label="Estado/Província" outlined dense class="col-6 col-md-3" />
        <q-input v-model="item.postalCode" label="CEP" outlined dense class="col-6 col-md-2" />
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col" @update:model-value="setPrimary(addresses, index)" />
        <q-btn flat round color="negative" icon="delete" @click="addresses.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right"><q-btn color="primary" label="Salvar endereços" no-caps :loading="saving === 'addresses'" @click="saveAddresses" /></q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { replaceCustomerAddresses, replaceCustomerContacts, replaceCustomerNames } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true }, identification: { type: Object, default: () => ({}) } })
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
  names.value = structuredClone(source.names || fallbackName)
  contacts.value = structuredClone(source.contacts || [])
  addresses.value = structuredClone(source.addresses || (source.residentialAddress ? [source.residentialAddress] : []))
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
