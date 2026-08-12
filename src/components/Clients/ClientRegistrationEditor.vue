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
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col-auto q-mb-xs" dense size="sm" @update:model-value="setPrimary(names, index)" />
        <q-btn v-if="names.length > 1" flat round dense color="negative" icon="delete" class="q-mb-xs" aria-label="Remover nome" @click="names.splice(index, 1)" />
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
        <q-checkbox v-model="item.isPrimary" label="Principal" class="col-auto q-mb-xs" dense size="sm" @update:model-value="setPrimary(contacts, index)" />
        <q-btn v-if="contacts.length > 1" flat round dense color="negative" icon="delete" class="q-mb-xs" aria-label="Remover contato" @click="contacts.splice(index, 1)" />
      </q-card-section>
      <q-card-actions align="right" class="q-pa-none"><q-btn flat dense size="sm" color="primary" icon="save" label="Salvar contatos" no-caps :loading="saving === 'contacts'" @click="saveContacts" /></q-card-actions>
    </q-card>

    <q-card flat :bordered="!embedded">
      <q-card-section class="row items-center q-px-none q-py-sm">
        <div class="text-subtitle1 text-weight-bold">Endereços</div><q-space />
        <q-btn flat dense size="sm" color="primary" icon="add" label="Adicionar" no-caps :disable="addressDraft !== null" @click="addAddress" />
      </q-card-section>
      <q-separator v-if="!embedded" />

      <q-table
        v-if="addresses.length"
        flat
        dense
        hide-pagination
        row-key="_rowKey"
        :rows="addressRows"
        :columns="addressColumns"
      >
        <template #body-cell-address="tableProps">
          <q-td :props="tableProps">
            <div>{{ tableProps.row.line1 || 'Não informado' }}</div>
            <div v-if="tableProps.row.line2" class="text-caption text-grey-7">{{ tableProps.row.line2 }}</div>
          </q-td>
        </template>
        <template #body-cell-city="tableProps">
          <q-td :props="tableProps">{{ formatCity(tableProps.row) }}</q-td>
        </template>
        <template #body-cell-primary="tableProps">
          <q-td :props="tableProps"><q-badge v-if="tableProps.row.isPrimary" outline color="primary" label="Principal" /></q-td>
        </template>
        <template #body-cell-actions="tableProps">
          <q-td :props="tableProps">
            <row-actions :actions="addressActions" aria-label="Opções do endereço" @select="handleAddressAction($event, tableProps.row._index)" />
          </q-td>
        </template>
      </q-table>
      <div v-else-if="addressDraft === null" class="text-caption text-grey-7 q-py-sm">Nenhum endereço cadastrado.</div>

      <div v-if="addressDraft" class="row q-col-gutter-sm items-end q-py-md">
        <label-form class-name="col-12 col-md-3" text-label="Tipo"><q-select v-model="addressDraft.kind" :options="addressKinds" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-6" text-label="Endereço"><q-input v-model="addressDraft.line1" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-3" text-label="Complemento"><q-input v-model="addressDraft.line2" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-12 col-md-4" text-label="Cidade"><q-input v-model="addressDraft.city" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-6 col-md-3" text-label="Estado/Província"><q-input v-model="addressDraft.stateOrProvince" placeholder="value" outlined dense /></label-form>
        <label-form class-name="col-6 col-md-2" text-label="CEP"><q-input v-model="addressDraft.postalCode" placeholder="value" outlined dense /></label-form>
        <q-checkbox v-model="addressDraft.isPrimary" label="Principal" class="col-auto q-mb-xs" dense size="sm" />
      </div>
      <div v-if="addressDraft || addressesDirty" class="row justify-end q-gutter-sm q-mt-sm">
        <q-btn v-if="addressDraft" flat dense size="sm" color="grey-7" label="Cancelar" no-caps @click="cancelAddressEdit" />
        <q-btn flat dense size="sm" color="primary" icon="save" label="Salvar endereços" no-caps :loading="saving === 'addresses'" @click="saveAddresses" />
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { replaceCustomerAddresses, replaceCustomerContacts, replaceCustomerNames } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import LabelForm from 'src/components/Form/LabelForm.vue'
import RowActions from 'src/components/Entity/RowActions.vue'

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
const addressDraft = ref(null)
const editingAddressIndex = ref(null)
const addressesDirty = ref(false)
const saving = ref('')
const nameKinds = ['Legal', 'Preferred', 'Social']
const contactKinds = ['Email', 'Phone', 'Mobile']
const addressKinds = ['Residential', 'Commercial', 'Correspondence']
const addressColumns = [
  { name: 'address', label: 'Logradouro', field: 'line1', align: 'left' },
  { name: 'city', label: 'Cidade', field: 'city', align: 'left' },
  { name: 'postalCode', label: 'CEP', field: 'postalCode', align: 'left' },
  { name: 'primary', label: '', field: 'isPrimary', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right', headerStyle: 'width: 40px' },
]
const addressActions = [
  { name: 'edit', label: 'Editar', icon: 'edit', color: 'grey-7' },
  { name: 'remove', label: 'Remover', icon: 'delete', color: 'negative' },
]
const cloneCollection = (items) => items.map((item) => ({ ...item }))
const addressRows = computed(() => addresses.value.map((item, index) => ({ ...item, _index: index, _rowKey: item.id || 'address-' + index })))
const formatCity = (address) => [address.city, address.stateOrProvince].filter(Boolean).join('/') || 'Não informado'

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
  addressDraft.value = null
  editingAddressIndex.value = null
  addressesDirty.value = false
  if (!names.value.length) addName()
  if (!contacts.value.length) {
    if (source.primaryEmail) contacts.value.push({ id: source.primaryEmail.id || null, kind: 'Email', value: source.primaryEmail.value || '', isPrimary: true })
    else addContact()
  }
}
const addName = () => names.value.push({ id: null, kind: 'Legal', displayName: '', validFrom: today(), validTo: null, isPrimary: names.value.length === 0 })
const addContact = () => contacts.value.push({ id: null, kind: 'Email', value: '', isPrimary: contacts.value.length === 0 })
const newAddress = () => ({ id: null, kind: 'Residential', line1: '', line2: null, city: '', stateOrProvince: null, postalCode: null, countryId: null, isPrimary: addresses.value.length === 0 })
const addAddress = () => { editingAddressIndex.value = -1; addressDraft.value = newAddress() }
const editAddress = (index) => { editingAddressIndex.value = index; addressDraft.value = { ...addresses.value[index] } }
const cancelAddressEdit = () => { editingAddressIndex.value = null; addressDraft.value = null }
const removeAddress = (index) => { addresses.value.splice(index, 1); addressesDirty.value = true; cancelAddressEdit() }
const handleAddressAction = (action, index) => { if (action === 'edit') editAddress(index); else if (action === 'remove') removeAddress(index) }
watch(() => props.identification, normalize, { immediate: true, deep: true })
const setPrimary = (collection, index) => { if (collection[index].isPrimary) collection.forEach((item, i) => { if (i !== index) item.isPrimary = false }) }
const execute = async (section, request, successMessage) => {
  try { saving.value = section; await request(); successNotify(successMessage); emit('updated') }
  catch (error) { errorNotify(getApiErrorMessage(error, 'Não foi possível salvar as alterações.')) }
  finally { saving.value = '' }
}
const saveNames = () => execute('names', () => replaceCustomerNames(props.customerId, names.value), 'Nomes atualizados.')
const saveContacts = () => execute('contacts', () => replaceCustomerContacts(props.customerId, contacts.value), 'Contatos atualizados.')
const saveAddresses = async () => {
  const nextAddresses = cloneCollection(addresses.value)
  if (addressDraft.value) {
    const nextAddress = { ...addressDraft.value }
    if (nextAddress.isPrimary) nextAddresses.forEach((item) => { item.isPrimary = false })
    if (editingAddressIndex.value === -1) nextAddresses.push(nextAddress)
    else nextAddresses.splice(editingAddressIndex.value, 1, nextAddress)
  }
  try {
    saving.value = 'addresses'
    await replaceCustomerAddresses(props.customerId, nextAddresses)
    addresses.value = nextAddresses
    addressesDirty.value = false
    cancelAddressEdit()
    successNotify('Endereços atualizados.')
    emit('updated')
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível salvar as alterações.'))
  } finally {
    saving.value = ''
  }
}
</script>
