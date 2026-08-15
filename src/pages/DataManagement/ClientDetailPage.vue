<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" aria-label="Voltar para clientes" @click="router.back()" />
      <div class="q-ml-sm">
        <div class="text-caption text-grey-7">Gestão de clientes</div>
        <div class="text-h5 text-weight-bold">{{ displayName }}</div>
        <div v-if="header?.primaryContact" class="text-caption text-grey-7">{{ header.primaryContact }}</div>
      </div>
      <q-space />
      <q-badge v-if="header?.status" :color="statusColor" class="q-pa-sm">{{ statusLabel(header.status) }}</q-badge>
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl"><q-spinner color="primary" size="48px" /></div>
    <q-banner v-else-if="notFound" rounded class="bg-grey-2 q-pa-lg">
      <template #avatar><q-icon name="person_off" color="grey-7" size="32px" /></template>
      <div class="text-subtitle1 text-weight-medium">Cliente não encontrado</div>
      <div class="text-grey-7">O registro não existe ou não está disponível no workspace selecionado.</div>
      <template #action><q-btn flat color="primary" label="Voltar" @click="router.push({ name: 'Clientes' })" /></template>
    </q-banner>
    <q-banner v-else-if="errorMessage" rounded class="bg-red-1 text-negative q-pa-lg">
      {{ errorMessage }}<template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadCustomer" /></template>
    </q-banner>

    <q-tabs v-else v-model="tab" align="left" active-color="primary" indicator-color="primary" class="q-mb-md">
      <q-tab name="overview" label="Visão geral" no-caps />
      <q-tab name="registration" label="Dados cadastrais" no-caps />
      <q-tab name="settings" label="Status e preferências" no-caps />
    </q-tabs>
    <q-tab-panels v-if="!loading && !errorMessage && !notFound" v-model="tab" animated>
      <q-tab-panel name="overview" class="q-pa-none">
        <q-banner v-if="partialWarning" rounded class="bg-orange-1 text-warning q-mb-md">
          <template #avatar><q-icon name="warning_amber" /></template>
          {{ partialWarning }}
          <template #action><q-btn flat color="warning" label="Tentar novamente" @click="loadCustomer" /></template>
        </q-banner>
        <div class="client-overview">
          <form-section title="Identificação e contato" caption="Dados principais do cadastro do cliente">
            <q-list bordered separator class="rounded-borders">
              <q-item><q-item-section><q-item-label caption>Nome</q-item-label><q-item-label>{{ displayName }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>E-mail</q-item-label><q-item-label>{{ identification?.primaryEmail?.value || 'Não informado' }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Telefone</q-item-label><q-item-label>{{ identification?.primaryPhone?.value || 'Não informado' }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Tipo</q-item-label><q-item-label>{{ kindLabel(header?.kind) }}</q-item-label></q-item-section></q-item>
            </q-list>
          </form-section>
          <q-separator />
          <form-section title="Documentos" caption="Situação documental consolidada">
            <q-list bordered separator class="rounded-borders">
              <q-item v-for="metric in documentMetrics" :key="metric.label">
                <q-item-section><q-item-label>{{ metric.label }}</q-item-label></q-item-section>
                <q-item-section side><q-badge :color="metric.color">{{ metric.value }}</q-badge></q-item-section>
              </q-item>
            </q-list>
          </form-section>
          <q-separator />
          <form-section title="Resumo operacional" caption="Controles e vínculos atuais do cliente">
            <q-list bordered separator class="rounded-borders">
              <q-item><q-item-section><q-item-label caption>Compliance</q-item-label><q-item-label>{{ complianceLabel }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>E-mail confirmado</q-item-label><q-item-label>{{ booleanLabel(summary?.accountSecurity?.emailConfirmed) }}</q-item-label></q-item-section></q-item>
              <q-item><q-item-section><q-item-label caption>Contas bancárias</q-item-label><q-item-label>{{ summary?.bankAccounts?.total ?? 0 }}</q-item-label></q-item-section></q-item>
            </q-list>
          </form-section>
        </div>
      </q-tab-panel>
      <q-tab-panel name="registration" class="q-pa-none">
        <client-registration-editor :customer-id="route.params.id" :identification="identification" @updated="loadCustomer" />
      </q-tab-panel>
      <q-tab-panel name="settings" class="q-pa-none">
        <client-preferences-panel :customer-id="route.params.id" @updated="loadCustomer" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClientRegistrationEditor from 'src/components/Clients/ClientRegistrationEditor.vue'
import ClientPreferencesPanel from 'src/components/Clients/ClientPreferencesPanel.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import { getCustomer, getCustomerSummary } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'

const route = useRoute(), router = useRouter()
const summary = ref(null), header = ref(null), identification = ref(null)
const loading = ref(true), notFound = ref(false), errorMessage = ref(''), partialWarning = ref(''), tab = ref('overview')
const displayName = computed(() =>
  header.value?.displayName
  || header.value?.primaryName
  || summary.value?.header?.displayName
  || summary.value?.header?.primaryName
  || identification.value?.names?.find((name) => name.isPrimary)?.displayName
  || identification.value?.primaryName?.displayName
  || 'Detalhe do cliente',
)
const documents = computed(() => summary.value?.documentSummary ?? {})
const documentMetrics = computed(() => [
  { label: 'Aprovados', value: documents.value.approved ?? 0, color: 'positive' },
  { label: 'Pendentes', value: documents.value.pending ?? 0, color: 'warning' },
  { label: 'Rejeitados', value: documents.value.rejected ?? 0, color: 'negative' },
  { label: 'Em análise', value: documents.value.inReview ?? 0, color: 'info' },
])
const complianceLabel = computed(() => summary.value?.compliance?.primaryAlert?.title || summary.value?.compliance?.status || 'Sem alertas')
const statusColor = computed(() => header.value?.status === 'Active' ? 'positive' : 'grey')
const statusLabel = (v) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[v] || v
const kindLabel = (v) => ({ Person: 'Pessoa física', Organization: 'Pessoa jurídica' })[v] || v || 'Não informado'
const booleanLabel = (v) => v === true ? 'Sim' : v === false ? 'Não' : 'Não informado'
const loadCustomer = async () => {
  loading.value = true; notFound.value = false; errorMessage.value = ''; partialWarning.value = ''
  const [summaryResult, customerResult] = await Promise.allSettled([
    getCustomerSummary(route.params.id), getCustomer(route.params.id),
  ])
  if (summaryResult.status === 'fulfilled') summary.value = summaryResult.value
  else {
    summary.value = null
    partialWarning.value = 'O resumo operacional está temporariamente indisponível. Os dados cadastrais disponíveis continuam acessíveis.'
  }
  if (customerResult.status === 'fulfilled') {
    header.value = customerResult.value
    identification.value = customerResult.value
  } else {
    header.value = null
    identification.value = null
    notFound.value = customerResult.reason?.response?.status === 404
    if (!notFound.value) errorMessage.value = getApiErrorMessage(customerResult.reason, 'Não foi possível carregar os dados do cliente.')
  }
  loading.value = false
}
onMounted(loadCustomer)
</script>
