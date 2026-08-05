<template>
  <q-card class="EditClientLayout">
    <title-card title="Cliente" @on-close="emit('close')" />
    <q-separator />

    <q-card-section v-if="headerLoading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="36px" />
    </q-card-section>
    <q-banner v-else-if="headerError" rounded class="bg-red-1 text-negative q-ma-md">
      {{ headerError }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadHeader" /></template>
    </q-banner>
    <template v-else>
      <entity-header :id="customerId" :name="displayName" :options="customerOptions" short-id switch-label="Trocar cliente" @select="selectCustomer">
        <template #status>
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            class="client-header__status q-ml-lg"
            aria-label="Status do cliente"
            :loading="savingStatus"
            @update:model-value="saveStatus"
          />
        </template>
      </entity-header>

      <q-card-section class="client-sections">
        <form-section title="Informações pessoais e cadastrais" caption="Nomes, contatos e endereços do cliente">
          <div v-if="registrationLoading" class="row justify-center q-pa-xl"><q-spinner color="primary" size="32px" /></div>
          <q-banner v-else-if="registrationError" class="bg-red-1 text-negative q-mt-md">
            {{ registrationError }}
            <template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadIdentification" /></template>
          </q-banner>
          <client-registration-editor
            v-else
            :key="`registration-${customerId}`"
            embedded
            :customer-id="customerId"
            :identification="identification"
            class="q-mt-md"
            @updated="onSectionUpdated"
          />
        </form-section>

        <q-separator />

        <form-section>
          <client-professional-panel
            :key="`professional-${customerId}`"
            embedded
            :customer-id="customerId"
            @updated="onSectionUpdated"
          />
        </form-section>

        <q-separator />

        <form-section>
          <client-financial-security-panel :key="`financial-${customerId}`" :customer-id="customerId" @updated="onSectionUpdated" />
        </form-section>

        <q-separator />

        <form-section>
          <client-bank-accounts-panel :key="`banks-${customerId}`" :customer-id="customerId" @updated="onSectionUpdated" />
        </form-section>

        <q-separator />

        <form-section>
          <client-preferences-panel
            :key="`settings-${customerId}`"
            embedded
            hide-status
            :customer-id="customerId"
            @updated="onSectionUpdated"
          />
        </form-section>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import TitleCard from 'src/components/Card/TitleCard.vue'
import ClientRegistrationEditor from 'src/components/Clients/ClientRegistrationEditor.vue'
import ClientPreferencesPanel from 'src/components/Clients/ClientPreferencesPanel.vue'
import ClientProfessionalPanel from 'src/components/Clients/ClientProfessionalPanel.vue'
import ClientFinancialSecurityPanel from 'src/components/Clients/ClientFinancialSecurityPanel.vue'
import ClientBankAccountsPanel from 'src/components/Clients/ClientBankAccountsPanel.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import { useClientStore } from 'src/stores/client'
import { changeCustomerStatus, getCustomerHeader, getCustomerIdentification } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true } })
const emit = defineEmits(['close', 'select', 'updated'])
const clientStore = useClientStore()
const { successNotify, errorNotify } = useNotification()
const { data: availableCustomers } = storeToRefs(clientStore)
const header = ref(null)
const identification = ref(null)
const headerLoading = ref(true)
const registrationLoading = ref(true)
const headerError = ref('')
const registrationError = ref('')
const selectedStatus = ref('')
const savingStatus = ref(false)
const displayName = computed(() => header.value?.displayName || header.value?.primaryName || 'Cliente')
const customerOptions = computed(() => availableCustomers.value.map((customer) => ({
  id: customer.id, name: customer.primaryName || 'Sem nome', caption: customer.primaryContact || 'Sem contato principal',
})))
const statusOptions = [
  { label: 'Prospect', value: 'Prospect' }, { label: 'Ativo', value: 'Active' },
  { label: 'Suspenso', value: 'Suspended' }, { label: 'Arquivado', value: 'Archived' },
]

const loadHeader = async () => {
  headerLoading.value = true
  headerError.value = ''
  try { header.value = await getCustomerHeader(props.customerId); selectedStatus.value = header.value?.status || '' }
  catch (error) { headerError.value = getApiErrorMessage(error, 'Não foi possível carregar o cliente.') }
  finally { headerLoading.value = false }
}
const loadIdentification = async () => {
  registrationLoading.value = true
  registrationError.value = ''
  try { identification.value = await getCustomerIdentification(props.customerId) }
  catch (error) { registrationError.value = getApiErrorMessage(error, 'Não foi possível carregar os dados cadastrais.') }
  finally { registrationLoading.value = false }
}
const load = () => {
  header.value = null
  identification.value = null
  loadHeader()
  loadIdentification()
}
const selectCustomer = (id) => { if (id !== props.customerId) emit('select', id) }
const saveStatus = async (status) => {
  if (!status || status === header.value?.status) return
  try {
    savingStatus.value = true
    await changeCustomerStatus(props.customerId, status)
    header.value = { ...header.value, status }
    successNotify('Status atualizado.')
    emit('updated')
  } catch (error) {
    selectedStatus.value = header.value?.status || ''
    errorNotify(getApiErrorMessage(error, 'Não foi possível alterar o status.'))
  } finally { savingStatus.value = false }
}
const onSectionUpdated = () => { loadHeader(); loadIdentification(); emit('updated') }

watch(() => props.customerId, load, { immediate: true })
</script>

<style scoped>
.client-header__status { width: 118px; }
.client-sections { padding: 12px 20px 40px; }
</style>
