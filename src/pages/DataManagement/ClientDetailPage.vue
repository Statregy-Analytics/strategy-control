<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" aria-label="Voltar para clientes" @click="router.back()" />
      <div class="q-ml-sm">
        <div class="text-caption text-grey-7">Gestão de clientes</div>
        <div class="text-h5 text-weight-bold">{{ displayName }}</div>
      </div>
      <q-space />
      <q-badge v-if="summary?.header?.status" :color="statusColor" class="q-pa-sm">
        {{ statusLabel(summary.header.status) }}
      </q-badge>
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="48px" />
    </div>

    <q-banner v-else-if="notFound" rounded class="bg-grey-2 q-pa-lg">
      <template #avatar><q-icon name="person_off" color="grey-7" size="32px" /></template>
      <div class="text-subtitle1 text-weight-medium">Cliente não encontrado</div>
      <div class="text-grey-7">O registro não existe ou não está disponível no workspace selecionado.</div>
      <template #action><q-btn flat color="primary" label="Voltar" @click="router.push({ name: 'Clientes' })" /></template>
    </q-banner>

    <q-banner v-else-if="errorMessage" rounded class="bg-red-1 text-negative q-pa-lg">
      <template #avatar><q-icon name="error_outline" size="32px" /></template>
      {{ errorMessage }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadSummary" /></template>
    </q-banner>

    <template v-else-if="summary">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Identificação e contato</div>
              <q-separator class="q-my-md" />
              <div class="row q-col-gutter-lg">
                <info-field label="Nome" :value="summary.header?.displayName" />
                <info-field label="E-mail principal" :value="summary.identification?.primaryEmail?.value" />
                <info-field label="Telefone principal" :value="summary.identification?.primaryPhone?.value" />
                <info-field label="Tipo" :value="kindLabel(summary.header?.kind)" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Documentos</div>
              <q-separator class="q-my-md" />
              <div class="row q-col-gutter-md">
                <metric-card label="Aprovados" :value="documents.approved" color="positive" />
                <metric-card label="Pendentes" :value="documents.pending" color="warning" />
                <metric-card label="Rejeitados" :value="documents.rejected" color="negative" />
                <metric-card label="Em análise" :value="documents.inReview" color="info" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Resumo operacional</div>
              <q-list separator class="q-mt-sm">
                <q-item>
                  <q-item-section><q-item-label caption>Compliance</q-item-label><q-item-label>{{ complianceLabel }}</q-item-label></q-item-section>
                </q-item>
                <q-item>
                  <q-item-section><q-item-label caption>E-mail confirmado</q-item-label><q-item-label>{{ booleanLabel(summary.accountSecurity?.emailConfirmed) }}</q-item-label></q-item-section>
                </q-item>
                <q-item>
                  <q-item-section><q-item-label caption>Contas bancárias</q-item-label><q-item-label>{{ summary.bankAccounts?.total ?? 0 }}</q-item-label></q-item-section>
                </q-item>
                <q-item>
                  <q-item-section><q-item-label caption>Conta principal</q-item-label><q-item-label>{{ summary.bankAccounts?.primary?.accountNumberMasked || 'Não cadastrada' }}</q-item-label></q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <q-banner v-else rounded class="bg-grey-2 q-pa-lg">Nenhum dado disponível para este cliente.</q-banner>
  </q-page>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCustomerSummary } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'

const InfoField = defineComponent({
  props: { label: String, value: [String, Number] },
  setup: (props) => () => h('div', { class: 'col-12 col-sm-6' }, [
    h('div', { class: 'text-caption text-grey-7' }, props.label),
    h('div', { class: 'text-body1' }, props.value || 'Não informado'),
  ]),
})
const MetricCard = defineComponent({
  props: { label: String, value: [String, Number], color: String },
  setup: (props) => () => h('div', { class: 'col-6 col-sm-3' }, [
    h('div', { class: 'rounded-borders bg-grey-1 q-pa-md text-center' }, [
      h('div', { class: `text-h5 text-${props.color}` }, String(props.value ?? 0)),
      h('div', { class: 'text-caption text-grey-8' }, props.label),
    ]),
  ]),
})

const route = useRoute()
const router = useRouter()
const summary = ref(null)
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')

const displayName = computed(() => summary.value?.header?.displayName || 'Detalhe do cliente')
const documents = computed(() => summary.value?.documentSummary ?? {})
const complianceLabel = computed(() => summary.value?.compliance?.primaryAlert?.title || summary.value?.compliance?.status || 'Sem alertas')
const statusColor = computed(() => summary.value?.header?.status === 'Active' ? 'positive' : 'grey')
const statusLabel = (value) => ({ Active: 'Ativo', Inactive: 'Inativo', Blocked: 'Bloqueado', Pending: 'Pendente' })[value] || value
const kindLabel = (value) => ({ Individual: 'Pessoa física', Organization: 'Pessoa jurídica' })[value] || value
const booleanLabel = (value) => value === true ? 'Sim' : value === false ? 'Não' : 'Não informado'

const loadSummary = async () => {
  loading.value = true
  notFound.value = false
  errorMessage.value = ''
  try {
    summary.value = await getCustomerSummary(route.params.id)
  } catch (error) {
    summary.value = null
    if (error.response?.status === 404) notFound.value = true
    else errorMessage.value = getApiErrorMessage(error, 'Não foi possível carregar o cliente.')
  } finally {
    loading.value = false
  }
}
onMounted(loadSummary)
</script>
