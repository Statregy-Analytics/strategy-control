<template>
  <q-page class="client-profile-page">
    <header class="client-profile-header">
      <q-btn flat round dense icon="arrow_back" aria-label="Voltar para clientes" @click="router.push({ name: 'Clientes' })" />
      <q-avatar size="52px" class="client-profile-avatar" icon="person" />
      <div class="client-profile-identity">
        <div class="row items-center q-gutter-sm">
          <h1>{{ displayName }}</h1>
          <q-badge v-if="header?.status" :color="statusColor" outline>{{ statusLabel(header.status) }}</q-badge>
        </div>
        <div class="client-profile-meta">
          <span v-if="kindText">{{ kindText }}</span>
          <span v-if="header?.maskedDocument">{{ header.maskedDocument }}</span>
          <span v-if="header?.primaryContact">{{ header.primaryContact }}</span>
        </div>
      </div>
      <q-space />
      <q-btn
        outline
        no-caps
        :icon="registrationEditing ? 'close' : 'edit'"
        :label="registrationEditing ? 'Fechar edição' : 'Editar dados'"
        class="client-profile-action"
        @click="toggleRegistrationEdit"
      />
    </header>

    <div v-if="loading" class="client-profile-state"><q-spinner color="primary" size="48px" /></div>
    <q-banner v-else-if="notFound" rounded class="client-profile-message">
      <template #avatar><q-icon name="person_off" size="30px" /></template>
      <div class="text-subtitle1 text-weight-medium">Cliente não encontrado</div>
      <div>O registro não existe ou não está disponível no workspace selecionado.</div>
      <template #action><q-btn flat color="primary" label="Voltar" @click="router.push({ name: 'Clientes' })" /></template>
    </q-banner>
    <q-banner v-else-if="errorMessage" rounded class="client-profile-message client-profile-message--error">
      {{ errorMessage }}
      <template #action><q-btn flat color="negative" label="Tentar novamente" @click="loadCustomer()" /></template>
    </q-banner>

    <template v-else>
      <q-banner v-if="partialWarning" rounded class="client-profile-warning">
        <template #avatar><q-icon name="warning_amber" /></template>
        {{ partialWarning }}
        <template #action><q-btn flat color="warning" label="Tentar novamente" @click="loadCustomer()" /></template>
      </q-banner>

      <main class="client-profile-grid">
        <div class="client-profile-main">
          <section class="profile-surface profile-summary">
            <div class="profile-section-heading">
              <div>
                <h2>Informações pessoais e cadastrais</h2>
                <p>Dados de identificação e contato disponíveis no cadastro.</p>
              </div>
              <div class="row q-gutter-xs no-wrap">
                <q-btn v-if="registrationEditing" flat dense no-caps color="grey-5" label="Cancelar" @click="cancelRegistrationEdit" />
                <q-btn flat dense no-caps color="primary" :icon="registrationEditing ? 'close' : 'edit'" :label="registrationEditing ? 'Fechar edição' : 'Editar'" @click="toggleRegistrationEdit" />
              </div>
            </div>
            <q-slide-transition>
              <div v-if="registrationEditing" class="inline-editor">
                <client-registration-editor
                  :key="`registration-${registrationEditSession}`"
                  embedded
                  :customer-id="route.params.id"
                  :identification="identification"
                  @updated="onRegistrationUpdated"
                />
              </div>
              <div v-else class="profile-data-grid">
                <div><span>Nome</span><strong>{{ displayName }}</strong></div>
                <div><span>Tipo de cliente</span><strong>{{ kindText || 'Não informado' }}</strong></div>
                <div><span>E-mail</span><strong>{{ primaryEmail }}</strong></div>
                <div><span>Telefone</span><strong>{{ primaryPhone }}</strong></div>
                <div><span>Documento</span><strong>{{ header?.maskedDocument || 'Não informado' }}</strong></div>
                <div><span>Cliente desde</span><strong>{{ formatDate(header?.customerSince || header?.createdAtUtc) }}</strong></div>
              </div>
            </q-slide-transition>
          </section>

          <section class="profile-surface portfolio-section">
            <div class="profile-section-heading">
              <div>
                <h2>Visão consolidada da carteira</h2>
                <p>Estrutura preparada para os saldos e movimentações consolidados do cliente.</p>
              </div>
              <q-badge outline color="info" class="integration-badge">Integração pendente</q-badge>
            </div>
            <div class="portfolio-metrics">
              <article v-for="metric in balanceMetrics" :key="metric.label" class="portfolio-metric">
                <div class="portfolio-metric__head"><span>{{ metric.label }}</span><q-icon :name="metric.icon" size="18px" /></div>
                <strong>—</strong>
                <small>Saldo ainda não fornecido pela API</small>
              </article>
            </div>
            <div v-if="financialProfile?.declaredNetWorth != null" class="declared-worth">
              <q-icon name="account_balance_wallet" size="18px" />
              <div><span>Patrimônio declarado</span><strong>{{ money(financialProfile.declaredNetWorth, financialProfile.currencyCode) }}</strong></div>
              <small>Informação declarada pelo cliente; não representa saldo consolidado.</small>
            </div>
            <div class="portfolio-empty-grid">
              <div class="portfolio-empty">
                <q-icon name="donut_large" size="28px" /><strong>Composição da carteira</strong>
                <span>Classes e origens serão exibidas quando a integração financeira estiver disponível.</span>
              </div>
              <div class="portfolio-empty">
                <q-icon name="receipt_long" size="28px" /><strong>Extrato da conta</strong>
                <span>As movimentações ainda não fazem parte do contrato atual da API.</span>
              </div>
            </div>
          </section>

          <section class="profile-surface embedded-panel">
            <client-bank-accounts-panel :customer-id="route.params.id" @updated="refreshCustomer" />
          </section>

          <section v-if="documentsOpen" class="profile-surface embedded-panel inline-management-section">
            <q-btn flat round dense icon="close" class="inline-management-section__close" aria-label="Fechar gerenciamento de documentos" @click="documentsOpen = false" />
            <client-documents-panel :customer-id="route.params.id" @updated="refreshCustomer" />
          </section>

          <section v-if="complianceOpen" class="profile-surface embedded-panel inline-management-section">
            <q-btn flat round dense icon="close" class="inline-management-section__close" aria-label="Fechar gerenciamento de compliance" @click="complianceOpen = false" />
            <client-compliance-panel :customer-id="route.params.id" @updated="refreshCustomer" />
          </section>
        </div>

        <aside class="client-profile-aside">
          <section class="profile-surface compact-surface">
            <div class="profile-section-heading"><div><h2>Documentação</h2><p>Situação consolidada dos documentos.</p></div></div>
            <div class="document-totals">
              <div v-for="metric in documentMetrics" :key="metric.label">
                <span class="document-dot" :class="`document-dot--${metric.tone}`" />
                <strong>{{ metric.value }}</strong><small>{{ metric.label }}</small>
              </div>
            </div>
            <q-btn flat no-caps color="primary" icon-right="arrow_forward" :label="documentsOpen ? 'Ocultar documentos' : 'Gerenciar documentos'" class="full-width q-mt-md" @click="documentsOpen = !documentsOpen" />
          </section>
          <section class="profile-surface compact-surface">
            <div class="profile-section-heading"><div><h2>Compliance e observações</h2><p>Condição atual retornada pela API.</p></div></div>
            <div class="compliance-status">
              <q-icon name="verified_user" size="22px" />
              <div><strong>{{ complianceLabel }}</strong><span>{{ complianceDescription }}</span></div>
            </div>
            <q-btn flat no-caps color="primary" icon-right="arrow_forward" :label="complianceOpen ? 'Ocultar controles' : 'Gerenciar compliance'" class="full-width q-mt-md" @click="complianceOpen = !complianceOpen" />
          </section>
          <section class="profile-surface compact-surface">
            <div class="profile-section-heading"><div><h2>Resumo operacional</h2><p>Controles disponíveis para este cliente.</p></div></div>
            <div class="operational-list">
              <div><span>E-mail confirmado</span><strong>{{ booleanLabel(summary?.accountSecurity?.emailConfirmed) }}</strong></div>
              <div><span>Contas bancárias</span><strong>{{ summary?.bankAccounts?.total ?? 0 }}</strong></div>
              <div><span>Nível documental</span><strong>{{ header?.documentLevel || 'Não informado' }}</strong></div>
            </div>
          </section>
        </aside>
      </main>
    </template>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClientBankAccountsPanel from 'src/components/Clients/ClientBankAccountsPanel.vue'
import ClientCompliancePanel from 'src/components/Clients/ClientCompliancePanel.vue'
import ClientDocumentsPanel from 'src/components/Clients/ClientDocumentsPanel.vue'
import ClientRegistrationEditor from 'src/components/Clients/ClientRegistrationEditor.vue'
import { getCustomer, getCustomerCurrentFinancialProfile, getCustomerDocumentSummary, getCustomerSummary } from 'src/services/customerService'
import { getApiErrorMessage } from 'src/services/apiError'

const route = useRoute()
const router = useRouter()
const summary = ref(null)
const header = ref(null)
const identification = ref(null)
const financialProfile = ref(null)
const documentSummary = ref(null)
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')
const partialWarning = ref('')
const registrationEditing = ref(false)
const registrationEditSession = ref(0)
const documentsOpen = ref(false)
const complianceOpen = ref(false)
const displayName = computed(() => header.value?.displayName || header.value?.primaryName || summary.value?.header?.displayName || summary.value?.header?.primaryName || identification.value?.names?.find((name) => name.isPrimary)?.displayName || identification.value?.primaryName?.displayName || 'Cliente')
const primaryEmail = computed(() => identification.value?.primaryEmail?.value || identification.value?.primaryEmail || 'Não informado')
const primaryPhone = computed(() => identification.value?.primaryPhone?.value || identification.value?.primaryPhone || 'Não informado')
const kindText = computed(() => kindLabel(header.value?.kind || header.value?.customerKind))
const documents = computed(() => documentSummary.value ?? summary.value?.documentSummary ?? {})
const documentMetrics = computed(() => [
  { label: 'Aprovados', value: documents.value.approved ?? 0, tone: 'positive' },
  { label: 'Pendentes', value: Number(documents.value.pending ?? 0) + Number(documents.value.inReview ?? 0) + Number(documents.value.missing ?? 0), tone: 'warning' },
  { label: 'Rejeitados', value: documents.value.rejected ?? 0, tone: 'negative' },
])
const complianceLabel = computed(() => summary.value?.compliance?.primaryAlert?.title || summary.value?.compliance?.status || 'Sem alertas registrados')
const complianceDescription = computed(() => summary.value?.compliance?.primaryAlert?.description || 'Nenhuma observação adicional foi retornada.')
const statusColor = computed(() => header.value?.status === 'Active' ? 'positive' : 'grey')
const balanceMetrics = [
  { label: 'Saldo base (patrimônio)', icon: 'account_balance' },
  { label: 'Saldo investido', icon: 'trending_up' },
  { label: 'Saldo investível', icon: 'savings' },
  { label: 'Carteira total', icon: 'pie_chart' },
]
const statusLabel = (value) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[value] || value
const kindLabel = (value) => ({ Person: 'Pessoa física', Organization: 'Pessoa jurídica' })[value] || value || ''
const booleanLabel = (value) => value === true ? 'Sim' : value === false ? 'Não' : 'Não informado'
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : 'Não informado'
const money = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(Number(value))
const cancelRegistrationEdit = () => { registrationEditing.value = false; registrationEditSession.value += 1 }
const toggleRegistrationEdit = () => {
  if (registrationEditing.value) cancelRegistrationEdit()
  else registrationEditing.value = true
}
const onRegistrationUpdated = async () => { await refreshCustomer(); registrationEditSession.value += 1 }
const loadCustomer = async (silent = false) => {
  if (!silent) loading.value = true
  notFound.value = false
  errorMessage.value = ''
  partialWarning.value = ''
  const [summaryResult, customerResult, financialResult, documentResult] = await Promise.allSettled([
    getCustomerSummary(route.params.id), getCustomer(route.params.id), getCustomerCurrentFinancialProfile(route.params.id), getCustomerDocumentSummary(route.params.id),
  ])
  if (summaryResult.status === 'fulfilled') summary.value = summaryResult.value
  else { summary.value = null; partialWarning.value = 'Parte do resumo operacional está temporariamente indisponível.' }
  financialProfile.value = financialResult.status === 'fulfilled' ? financialResult.value : null
  documentSummary.value = documentResult.status === 'fulfilled' ? documentResult.value : null
  if (customerResult.status === 'fulfilled') {
    header.value = customerResult.value
    identification.value = customerResult.value
  } else {
    header.value = null
    identification.value = null
    notFound.value = customerResult.reason?.response?.status === 404
    if (!notFound.value) errorMessage.value = getApiErrorMessage(customerResult.reason, 'Não foi possível carregar os dados do cliente.')
  }
  if (!silent) loading.value = false
}
const refreshCustomer = () => loadCustomer(true)
onMounted(loadCustomer)
</script>

<style scoped>
.client-profile-page { min-height: 100vh; color: #fff; }
.client-profile-header { position: sticky; top: 0; z-index: 4; display: flex; align-items: center; gap: 14px; min-height: 88px; padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,.14); background: linear-gradient(180deg, rgba(8,11,22,.88), rgba(8,11,22,.68)); box-shadow: 4px 4px 12px rgba(0,0,0,.13); backdrop-filter: blur(20px); }
.client-profile-avatar { flex: 0 0 auto; color: rgba(255,255,255,.9); border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.07); }
.client-profile-identity { min-width: 0; }
.client-profile-identity h1 { overflow: hidden; margin: 0; font-size: 20px; font-weight: 650; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
.client-profile-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 5px; color: rgba(224,238,255,.62); font-size: 12px; }
.client-profile-meta span + span::before { margin-right: 14px; color: rgba(255,255,255,.25); content: '•'; }
.client-profile-action { border-color: rgba(255,255,255,.32); border-radius: 8px; }
.client-profile-state { display: grid; min-height: 55vh; place-items: center; }
.client-profile-message, .client-profile-warning { margin: 24px 32px; color: #fff; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.07); }
.client-profile-message--error { color: #ffb9b9; border-color: rgba(255,108,108,.35); }
.client-profile-grid { display: grid; grid-template-columns: minmax(0, 1fr) 368px; gap: 24px; width: min(100%, 1600px); margin: 0 auto; padding: 32px; }
.client-profile-main, .client-profile-aside { display: flex; min-width: 0; flex-direction: column; gap: 24px; }
.profile-surface { overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; background: linear-gradient(150deg, rgba(5,8,18,.76), rgba(5,20,36,.58)); box-shadow: 4px 4px 12px rgba(0,0,0,.13); backdrop-filter: blur(20px); }
.profile-summary, .portfolio-section, .embedded-panel, .compact-surface { padding: 24px; }
.profile-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.profile-section-heading h2 { margin: 0; font-size: 16px; font-weight: 650; line-height: 1.35; }
.profile-section-heading p { max-width: 68ch; margin: 5px 0 0; color: rgba(224,238,255,.58); font-size: 12px; line-height: 1.55; }
.profile-data-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; overflow: hidden; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; background: rgba(255,255,255,.1); }
.profile-data-grid > div { min-width: 0; padding: 16px; background: rgba(9,15,28,.8); }
.profile-data-grid span, .operational-list span { display: block; margin-bottom: 5px; color: rgba(224,238,255,.52); font-size: 10px; text-transform: uppercase; letter-spacing: .045em; }
.profile-data-grid strong { display: block; overflow: hidden; font-size: 13px; font-weight: 550; text-overflow: ellipsis; white-space: nowrap; }
.inline-editor { padding-top: 4px; }
.inline-editor :deep(.q-card) { color: #fff; background: transparent; }
.inline-editor :deep(.text-grey-7) { color: rgba(224,238,255,.62) !important; }
.inline-management-section { position: relative; scroll-margin-top: 104px; }
.inline-management-section__close { position: absolute; top: 16px; right: 16px; z-index: 2; }
.inline-management-section :deep(.text-grey-7) { color: rgba(224,238,255,.62) !important; }
.integration-badge { flex: 0 0 auto; padding: 6px 9px; }
.portfolio-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.portfolio-metric { min-width: 0; padding: 18px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: rgba(255,255,255,.045); }
.portfolio-metric__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: rgba(224,238,255,.62); font-size: 11px; }
.portfolio-metric > strong { display: block; margin: 14px 0 5px; font-size: 25px; font-weight: 600; font-variant-numeric: tabular-nums; }
.portfolio-metric small { color: rgba(224,238,255,.48); font-size: 10px; line-height: 1.4; }
.declared-worth { display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: 12px; margin-top: 16px; padding: 14px 16px; border-radius: 10px; background: rgba(66,178,255,.08); }
.declared-worth span, .declared-worth strong { display: block; }
.declared-worth span { color: rgba(224,238,255,.58); font-size: 10px; text-transform: uppercase; }
.declared-worth strong { margin-top: 2px; font-size: 15px; font-variant-numeric: tabular-nums; }
.declared-worth small { justify-self: end; color: rgba(224,238,255,.52); font-size: 11px; text-align: right; }
.portfolio-empty-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
.portfolio-empty { display: flex; min-height: 160px; align-items: center; justify-content: center; flex-direction: column; padding: 24px; border: 1px dashed rgba(255,255,255,.18); border-radius: 12px; color: rgba(224,238,255,.5); text-align: center; }
.portfolio-empty strong { margin-top: 12px; color: rgba(255,255,255,.86); font-size: 13px; }
.portfolio-empty span { max-width: 48ch; margin-top: 6px; font-size: 11px; line-height: 1.55; }
.document-totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.document-totals > div { display: grid; grid-template-columns: auto 1fr; gap: 1px 7px; padding: 12px 8px; border-radius: 9px; background: rgba(255,255,255,.045); }
.document-totals strong { font-size: 17px; font-variant-numeric: tabular-nums; }
.document-totals small { grid-column: 2; color: rgba(224,238,255,.52); font-size: 9px; }
.document-dot { width: 7px; height: 7px; align-self: center; border-radius: 50%; background: #78909c; }
.document-dot--positive { background: #49c78e; }.document-dot--warning { background: #f1b84b; }.document-dot--negative { background: #ef6d78; }
.compliance-status { display: flex; align-items: flex-start; gap: 12px; padding: 15px; border-radius: 10px; background: rgba(255,255,255,.045); }
.compliance-status strong, .compliance-status span { display: block; }
.compliance-status strong { font-size: 13px; }.compliance-status span { margin-top: 5px; color: rgba(224,238,255,.56); font-size: 11px; line-height: 1.5; }
.operational-list { display: grid; gap: 1px; overflow: hidden; border-radius: 10px; background: rgba(255,255,255,.1); }
.operational-list > div { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 14px; background: rgba(9,15,28,.82); }
.operational-list span { margin: 0; }.operational-list strong { font-size: 12px; font-weight: 600; text-align: right; }
.embedded-panel :deep(.text-grey-7) { color: rgba(224,238,255,.56) !important; }
.embedded-panel :deep(.q-table__container) { color: #fff; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.025); }
.client-profile-page :deep(*:focus-visible) { outline: 2px solid #51b8ff; outline-offset: 2px; }
.client-profile-page ::selection { color: #fff; background: rgba(20,151,223,.65); }
@media (max-width: 1180px) { .client-profile-grid { grid-template-columns: 1fr; }.client-profile-aside { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }.portfolio-metrics { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 780px) { .client-profile-header { padding: 12px 14px; }.client-profile-action :deep(.q-btn__content) { font-size: 0; }.client-profile-action :deep(.q-icon) { margin: 0; font-size: 20px; }.client-profile-grid { gap: 16px; padding: 16px; }.client-profile-aside { display: flex; }.profile-summary, .portfolio-section, .embedded-panel, .compact-surface { padding: 18px; }.profile-data-grid, .portfolio-empty-grid, .portfolio-metrics { grid-template-columns: 1fr; }.declared-worth { grid-template-columns: auto 1fr; }.declared-worth small { grid-column: 1 / -1; justify-self: start; text-align: left; } }
@media (max-width: 520px) { .client-profile-avatar { display: none; }.client-profile-meta span + span::before { display: none; }.client-profile-meta { display: grid; gap: 2px; }.document-totals { grid-template-columns: 1fr; } }
</style>
