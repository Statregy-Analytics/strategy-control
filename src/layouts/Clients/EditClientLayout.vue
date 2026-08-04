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
      <q-banner inline-actions rounded class="client-header q-ma-md border-pattern">
        <div class="row items-center no-wrap">
          <q-avatar size="38px" color="blue-grey-1" text-color="blue-grey-7" icon="person" />
          <div class="q-ml-md client-header__identity">
            <span class="text-muted client-header__id">ID #{{ shortId }}</span>
            <div class="text-subtitle1 text-weight-medium ellipsis">{{ displayName }}</div>
          </div>
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
          <q-btn flat round dense color="grey-6" icon="keyboard_arrow_down" aria-label="Trocar cliente">
            <q-menu self="top middle" square>
              <q-list class="client-switcher">
                <q-item
                  v-for="customer in availableCustomers"
                  :key="customer.id"
                  clickable
                  v-close-popup
                  :active="customer.id === customerId"
                  active-class="bg-blue-1 text-primary"
                  @click="selectCustomer(customer.id)"
                >
                  <q-item-section avatar>
                    <q-avatar size="32px" color="blue-grey-1" text-color="blue-grey-7" icon="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ customer.primaryName || 'Sem nome' }}</q-item-label>
                    <q-item-label caption>{{ customer.primaryContact || 'Sem contato principal' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-banner>

      <q-card-section class="client-sections">
        <section class="client-section">
          <div class="client-section__title">Informações pessoais e cadastrais</div>
          <div class="client-section__caption">Nomes, contatos e endereços do cliente</div>
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
        </section>

        <q-separator />

        <section class="client-section">
          <client-professional-panel
            :key="`professional-${customerId}`"
            embedded
            :customer-id="customerId"
            @updated="onSectionUpdated"
          />
        </section>

        <q-separator />

        <section class="client-section">
          <client-preferences-panel
            :key="`settings-${customerId}`"
            embedded
            hide-status
            :customer-id="customerId"
            @updated="onSectionUpdated"
          />
        </section>
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
const shortId = computed(() => props.customerId.slice(0, 8))
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
.client-header { min-height: 74px; }
.client-header__identity { min-width: 170px; max-width: 280px; }
.client-header__id { font-size: 12px; }
.client-header__status { width: 118px; }
.client-switcher { min-width: 360px; max-height: 480px; overflow-y: auto; padding: 4px; }
.client-sections { padding: 12px 20px 40px; }
.client-section { padding: 28px 0; }
.client-section:first-child { padding-top: 12px; }
.client-section__title { font-size: 18px; font-weight: 700; }
.client-section__caption { color: #757575; font-size: 13px; margin-top: 2px; }
</style>
