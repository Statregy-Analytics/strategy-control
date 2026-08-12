<template>
  <q-card class="EditClientLayout">
    <title-card title="Cliente" @on-close="emit('close')" />
    <q-separator />

    <q-card-section v-if="customerLoading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="36px" />
    </q-card-section>
    <q-banner v-else-if="customerError" rounded class="bg-red-1 text-negative q-ma-md">
      {{ customerError }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadCustomer" /></template>
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
          <client-registration-editor
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
          <client-documents-panel :key="`documents-${customerId}`" :customer-id="customerId" @updated="onSectionUpdated" />
        </form-section>

        <q-separator />

        <form-section>
          <client-compliance-panel :key="`compliance-${customerId}`" :customer-id="customerId" @updated="onSectionUpdated" />
        </form-section>

        <q-separator />

        <form-section>
          <client-verification-timeline-panel :key="`verification-${customerId}`" :customer-id="customerId" @updated="onSectionUpdated" />
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
import ClientDocumentsPanel from 'src/components/Clients/ClientDocumentsPanel.vue'
import ClientCompliancePanel from 'src/components/Clients/ClientCompliancePanel.vue'
import ClientVerificationTimelinePanel from 'src/components/Clients/ClientVerificationTimelinePanel.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import { useClientStore } from 'src/stores/client'
import { changeCustomerStatus, getCustomer } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const props = defineProps({ customerId: { type: String, required: true } })
const emit = defineEmits(['close', 'select', 'updated'])
const clientStore = useClientStore()
const { successNotify, errorNotify } = useNotification()
const { data: availableCustomers } = storeToRefs(clientStore)
const header = ref(null)
const identification = ref(null)
const customerLoading = ref(true)
const customerError = ref('')
const selectedStatus = ref('')
const savingStatus = ref(false)
const displayName = computed(() =>
  header.value?.displayName
  || header.value?.primaryName
  || header.value?.names?.find((name) => name.isPrimary)?.displayName
  || header.value?.names?.[0]?.displayName
  || 'Cliente',
)
const customerOptions = computed(() => availableCustomers.value.map((customer) => ({
  id: customer.id, name: customer.primaryName || 'Sem nome', caption: customer.primaryContact || 'Sem contato principal',
})))
const statusOptions = [
  { label: 'Prospect', value: 'Prospect' }, { label: 'Ativo', value: 'Active' },
  { label: 'Suspenso', value: 'Suspended' }, { label: 'Arquivado', value: 'Archived' },
]

const loadCustomer = async () => {
  customerLoading.value = true
  customerError.value = ''
  header.value = null
  identification.value = null
  try {
    const customer = await getCustomer(props.customerId)
    header.value = customer
    identification.value = customer
    selectedStatus.value = customer?.status || ''
  } catch (error) {
    customerError.value = getApiErrorMessage(error, 'Não foi possível carregar os dados do cliente.')
  } finally {
    customerLoading.value = false
  }
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
const onSectionUpdated = () => { loadCustomer(); emit('updated') }

watch(() => props.customerId, loadCustomer, { immediate: true })
</script>

<style scoped>
.client-header__status { width: 118px; }
.client-sections { padding: 12px 20px 40px; }
</style>
