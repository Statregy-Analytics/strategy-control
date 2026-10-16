<template>
  <q-page class="client-profile-page">
    <header class="client-profile-header">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        aria-label="Voltar para clientes"
        @click="router.push({ name: 'Clientes' })"
      />
      <entity-header :id="customerId" :name="displayName" short-id class="profile-identity">
        <template #identity>
          <div class="profile-name">
            <h1>{{ displayName }}</h1>
            <q-badge outline>{{ kindLabel(customer.kind) }}</q-badge>
          </div>
          <div class="profile-meta">
            <span>ID: {{ customerId.slice(0, 8) }}</span
            ><span>Desde: {{ date(customer.createdAtUtc) }}</span
            ><span v-if="operational.advisorName">Assessor: {{ operational.advisorName }}</span>
          </div>
        </template>
      </entity-header>
      <customer-select
        class="profile-switcher"
        :model-value="customerId"
        :current="{ customerId, displayName }"
        aria-label="Trocar cliente"
        @update:model-value="switchCustomer"
      />
      <div class="profile-header-status">
        <span>Risco</span
        ><q-badge outline>{{ operational.riskClassification || 'Não informado' }}</q-badge>
      </div>
      <div class="profile-header-status">
        <span>Compliance</span
        ><q-badge outline>{{
          { Pending: 'Pendente', Clear: 'OK', Approved: 'OK' }[operational.complianceStatus] ||
          operational.complianceStatus ||
          'Não informado'
        }}</q-badge>
      </div>
      <div class="profile-header-status">
        <span>Status</span
        ><q-badge outline :color="customer.status === 'Active' ? 'positive' : 'grey-5'">{{
          statusLabel(customer.status)
        }}</q-badge>
      </div>
      <q-btn
        outline
        dense
        no-caps
        :icon="inlineEditing ? 'close' : 'edit'"
        :label="inlineEditing ? 'Fechar edição' : 'Editar'"
        :aria-label="inlineEditing ? 'Fechar edição do cliente' : 'Editar cliente'"
        :disable="!customerResource.state.data"
        @click="toggleInlineEditing"
      />
    </header>
    <resource-state
      :state="customerResource.state"
      class="profile-customer-state"
      @retry="loadCustomer"
    />
    <main v-if="customerResource.state.data" :key="customerId" class="client-profile-grid">
      <div class="client-profile-main">
        <profile-section
          title="Identificação e contato"
          icon-src="/icons/client-profile/identification.svg"
        >
          <div v-if="editingRegistration" class="profile-inline-editor">
            <p class="text-caption">Salve as alterações de cada grupo antes de fechar a edição.</p>
            <client-registration-editor
              embedded
              :customer-id="customerId"
              :identification="customer"
              @updated="registrationUpdated"
            />
            <form-section title="Status do cliente">
              <q-select
                :model-value="customer.status"
                :options="statusOptions"
                emit-value
                map-options
                outlined
                dense
                aria-label="Status do cliente"
                :loading="savingStatus"
                :disable="savingStatus"
                @update:model-value="saveStatus"
              />
            </form-section>
          </div>
          <resource-state v-else :state="identificationResource.state" @retry="loadIdentification">
            <profile-fields :fields="personalFields" />
            <div v-if="documentFields.length" class="profile-divider">
              <profile-fields :fields="documentFields" />
            </div>
            <div class="profile-divider"><profile-fields :fields="contactFields" /></div>
            <div class="profile-divider"><profile-fields :fields="addressFields" /></div>
          </resource-state>
        </profile-section>
        <profile-section
          title="Profissional e financeiro"
          icon-src="/icons/client-profile/professional.svg"
        >
          <div v-if="editingProfessional" class="profile-inline-editor">
            <p class="text-caption">Salve as alterações de cada grupo antes de fechar a edição.</p>
            <client-professional-panel
              embedded
              :customer-id="customerId"
              @updated="loadProfessional"
            />
            <div class="profile-divider">
              <client-financial-security-panel
                hide-security
                :customer-id="customerId"
                @updated="loadFinancial"
              />
            </div>
          </div>
          <template v-else>
            <resource-state :state="professional.state" @retry="loadProfessional"
              ><profile-fields :columns="2" :fields="professionalFields"
            /></resource-state>
            <div class="q-mt-lg">
              <resource-state :state="financial.state" @retry="loadFinancial"
                ><profile-fields :columns="3" :fields="financialFields"
              /></resource-state>
            </div>
          </template>
        </profile-section>
        <profile-section title="Segurança da conta" icon-src="/icons/client-profile/security.svg">
          <resource-state :state="security.state" @retry="loadSecurity">
            <p v-if="security.state.data?.hasUserAccount === false" class="profile-empty">
              Nenhuma conta de acesso vinculada.
            </p>
            <template v-else>
              <profile-fields :columns="5" :fields="securityFields" />
              <q-expansion-item
                dense
                label="Gerenciamento de status de login"
                icon="manage_accounts"
                class="login-management q-mt-lg"
              >
                <p class="profile-empty q-pa-md">
                  O histórico de sessões deste cliente ainda não está disponível.
                </p>
              </q-expansion-item>
            </template>
          </resource-state>
        </profile-section>
        <profile-section
          title="Preferências do sistema"
          icon-src="/icons/client-profile/preferences.svg"
          ><client-preferences-panel
            :key="customerId"
            embedded
            hide-status
            profile-layout
            :customer-id="customerId"
        /></profile-section>
        <profile-section
          title="Visão consolidada (carteira)"
          icon-src="/icons/client-profile/portfolio.svg"
          ><customer-portfolio
            ref="portfolioRef"
            embedded
            :customer-id="customerId"
            @currencies="currencies = $event"
        /></profile-section>
        <profile-section title="Dados bancários" icon-src="/icons/client-profile/bank.svg"
          ><template #actions
            ><q-btn
              flat
              dense
              no-caps
              size="sm"
              icon="add"
              color="primary"
              label="Adicionar conta"
              @click="bankPanel?.addAccount()"
          /></template>
          <client-bank-accounts-panel
            ref="bankPanel"
            embedded
            :customer-id="customerId"
            class="profile-bank-panel"
        /></profile-section>
        <profile-section
          title="Registro de patrimônio"
          icon-src="/icons/client-profile/assets.svg"
          caption="Ativos, bens e participações declarados pelo cliente."
          ><client-asset-registry
            :customer-id="customerId"
            :currencies="currencies"
            @changed="portfolioRef?.refresh()"
        /></profile-section>
      </div>
      <aside class="client-profile-aside">
        <profile-section
          title="Documentação pessoal"
          icon-src="/icons/client-profile/documents.svg"
        >
          <resource-state :state="documentOverview.state" @retry="loadDocuments"
            ><div class="document-totals">
              <span v-for="item in documentMetrics" :key="item.label" :class="`text-${item.color}`"
                >{{ item.value }} {{ item.label }}</span
              >
            </div>
            <div v-if="!documentSections.length" class="profile-empty">
              Nenhum documento cadastrado.
            </div>
            <q-expansion-item
              v-for="section in documentSections"
              :key="section.code || section.name"
              :label="section.label"
              :default-opened="section.order < 3"
              dense
              class="document-category"
            >
              <p v-if="!section.items.length" class="profile-empty">Nenhum documento cadastrado.</p>
              <profile-document-item
                v-for="item in section.items"
                :key="item.documentId || item.documentTypeId"
                :item="item"
                :customer-id="customerId"
                @updated="documentsUpdated"
              />
            </q-expansion-item>
          </resource-state>
        </profile-section>
        <profile-section
          title="Compliance e observações"
          icon-src="/icons/client-profile/compliance.svg"
        >
          <resource-state :state="compliance.state" @retry="loadCompliance"
            ><div
              class="compliance-note"
              :class="{ 'compliance-note--warning': complianceView.activeCount > 0 }"
            >
              <strong>{{ complianceView.status }}</strong>
              <p v-for="note in complianceNotes" :key="note">
                {{ note }}
              </p>
            </div></resource-state
          >
          <div class="profile-divider">
            <h3>Histórico recente</h3>
            <resource-state :state="timeline.state" @retry="loadTimeline"
              ><ol v-if="recentEvents.length" class="profile-timeline">
                <li v-for="event in recentEvents" :key="event.id">
                  <strong>{{ event.title || event.eventType }}</strong
                  ><small
                    >{{ event.actorName || 'Sistema' }} · {{ date(event.occurredAtUtc) }}</small
                  >
                </li>
              </ol>
              <p v-else class="profile-empty">Nenhum evento registrado.</p></resource-state
            >
            <q-btn
              flat
              dense
              no-caps
              :label="showHistory ? 'Recolher histórico' : 'Ver todo o histórico'"
              :aria-expanded="showHistory"
              class="full-width"
              @click="toggleHistory"
            />
          </div>
        </profile-section>
      </aside>
    </main>
  </q-page>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import ProfileFields from 'src/components/Entity/ProfileFields.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import CustomerSelect from 'src/components/Finance/CustomerSelect.vue'
import CustomerPortfolio from 'src/components/Finance/CustomerPortfolio.vue'
import ClientAssetRegistry from 'src/components/Clients/ClientAssetRegistry.vue'
import ClientBankAccountsPanel from 'src/components/Clients/ClientBankAccountsPanel.vue'
import ProfileDocumentItem from 'src/components/Clients/ProfileDocumentItem.vue'
import ClientRegistrationEditor from 'src/components/Clients/ClientRegistrationEditor.vue'
import ClientProfessionalPanel from 'src/components/Clients/ClientProfessionalPanel.vue'
import ClientFinancialSecurityPanel from 'src/components/Clients/ClientFinancialSecurityPanel.vue'
import ClientPreferencesPanel from 'src/components/Clients/ClientPreferencesPanel.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import useNotification from 'src/composables/global/useNotification'
import {
  getCustomer,
  getCustomerIdentification,
  getCustomerProfessionalProfile,
  getCustomerCurrentFinancialProfile,
  getCustomerAccountSecurity,
  changeCustomerStatus,
} from 'src/services/customerService'
import { getCustomerDocumentOverview } from 'src/services/documentAdminService'
import { getComplianceAlerts } from 'src/services/complianceService'
import { summarizeCompliance } from 'src/services/complianceSummary'
import { getCustomerTimeline, getCustomerTimelinePage } from 'src/services/verificationService'
import { money } from 'src/services/financeService'
import {
  profileDocumentSections,
  profileDocumentMetrics,
} from 'src/services/clientProfileProjection'
import { getApiErrorMessage } from 'src/services/apiError'
const route = useRoute(),
  router = useRouter()
const { successNotify, errorNotify } = useNotification()
const customerId = computed(() => String(route.params.id))
const customerResource = useFinanceResource(),
  identificationResource = useFinanceResource(),
  professional = useFinanceResource(),
  financial = useFinanceResource(),
  security = useFinanceResource(),
  documentOverview = useFinanceResource(),
  compliance = useFinanceResource(),
  timeline = useFinanceResource()
const showHistory = ref(false),
  savingStatus = ref(false),
  currencies = ref([]),
  portfolioRef = ref(null),
  bankPanel = ref(null)
const editingRegistration = ref(false)
const editingProfessional = ref(false)
const inlineEditing = computed(() => editingRegistration.value || editingProfessional.value)
const toggleInlineEditing = () => {
  const editing = !inlineEditing.value
  editingRegistration.value = editing
  editingProfessional.value = editing
}
const customer = computed(() => customerResource.state.data || {})
const identification = computed(() => identificationResource.state.data || {})
const operational = computed(() => customer.value.operationalSummary || {})
const displayName = computed(
  () =>
    customer.value.names?.find((n) => n.isPrimary)?.displayName ||
    customer.value.names?.[0]?.displayName ||
    identification.value.fullName ||
    customer.value.primaryName ||
    'Cliente',
)
const statusOptions = [
  { label: 'Prospect', value: 'Prospect' },
  { label: 'Ativo', value: 'Active' },
  { label: 'Suspenso', value: 'Suspended' },
  { label: 'Arquivado', value: 'Archived' },
]
const statusLabel = (value) =>
  statusOptions.find((s) => s.value === value)?.label || value || 'Não informado'
const kindLabel = (value) =>
  ({ Person: 'Pessoa física', Organization: 'Pessoa jurídica' })[value] || value || 'Cliente'
const date = (value) => {
  if (!value) return 'Não informado'
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  return Number.isNaN(parsed.getTime())
    ? 'Não informado'
    : new Intl.DateTimeFormat('pt-BR').format(parsed)
}
const dateTime = (value) => {
  if (!value) return 'Não informado'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Não informado'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed)
}
const field = (label, value, wide = false) => ({ label, value: value === '' ? null : value, wide })
const personalDocuments = computed(() => identification.value.documents || [])
const documentOf = (code) =>
  personalDocuments.value.find((d) => d.documentCode?.toUpperCase() === code) || {}
const personalFields = computed(() => [
  field('Nome completo', displayName.value),
  field(
    customer.value.kind === 'Organization' ? 'CNPJ' : 'CPF',
    documentOf(customer.value.kind === 'Organization' ? 'CNPJ' : 'CPF').numberMasked,
  ),
  field('Data de nascimento', date(identification.value.birthDate || customer.value.birthDate)),
  ...(customer.value.kind !== 'Organization'
    ? [
        field('Estado civil', null),
        field('Nacionalidade', identification.value.nationality),
        field('Nome da mãe', null),
        field('Nome do pai', null),
      ]
    : []),
])
const documentFields = computed(() =>
  customer.value.kind === 'Organization'
    ? []
    : [
        field('RG', documentOf('RG').numberMasked),
        field('Órgão emissor', documentOf('RG').issuer),
        field('UF emissão', documentOf('RG').issuerState),
        field('Data emissão', date(documentOf('RG').issuedOn)),
        field('CNH', documentOf('CNH').numberMasked),
        field('Categoria', documentOf('CNH').category),
        field('Validade CNH', date(documentOf('CNH').expiresOn)),
      ],
)
const maskedContact = (contact) => {
  if (!contact) return null
  if (contact.valueMasked) return contact.valueMasked
  const value = typeof contact === 'string' ? contact : contact.value
  if (!value) return null
  if (value.includes('@')) {
    const [local, domain] = value.split('@')
    return `${local.slice(0, 2)}•••@${domain}`
  }
  return `•••• ${value.slice(-4)}`
}
const contact = (...kinds) => {
  const matches = (customer.value.contacts || []).filter((c) => kinds.includes(c.kind))
  return matches.find((c) => c.isPrimary) || matches[0]
}
const contactFields = computed(() => [
  field('E-mail principal', maskedContact(identification.value.primaryEmail || contact('Email'))),
  field(
    'Celular',
    maskedContact(identification.value.mobilePhone || contact('MobilePhone', 'Mobile')),
  ),
  field(
    'Telefone secundário',
    maskedContact(identification.value.secondaryPhone || contact('SecondaryPhone', 'Phone')),
  ),
  field(
    'Preferência',
    { Email: 'E-mail', Phone: 'Telefone', MobilePhone: 'Celular' }[
      identification.value.contactPreference
    ] || identification.value.contactPreference,
  ),
])
const addressFields = computed(() => {
  const a =
    identification.value.residentialAddress ||
    customer.value.addresses?.find((a) => a.isPrimary) ||
    customer.value.addresses?.[0] ||
    {}
  return [
    field('Endereço residencial', a.line1, true),
    field('Complemento', a.line2),
    field('Bairro', null),
    field('Município / UF', [a.city, a.stateOrProvince].filter(Boolean).join(' / ')),
    field('CEP', a.postalCode),
  ]
})
const professionalFields = computed(() => [
  field('Profissão', professional.state.data?.occupation),
  field('Empresa', professional.state.data?.employerName),
])
const financialFields = computed(() => {
  const f = financial.state.data || {}
  return [
    field(
      'Renda mensal individual',
      f.individualMonthlyIncome == null ? null : money(f.individualMonthlyIncome, f.currencyCode),
    ),
    field(
      'Renda familiar',
      f.householdMonthlyIncome == null ? null : money(f.householdMonthlyIncome, f.currencyCode),
    ),
    field(
      'Patrimônio declarado',
      f.declaredNetWorth == null ? null : money(f.declaredNetWorth, f.currencyCode),
    ),
  ]
})
const securityFields = computed(() => {
  const s = security.state.data?.accountSecurity || security.state.data || {}
  return [
    field('Usuário', s.userName),
    field('Senha', s.passwordStatus ? '••••••••' : null),
    field(
      'Status da senha',
      { Active: 'Ativa', ResetRequired: 'Redefinição necessária' }[s.passwordStatus] ||
        s.passwordStatus,
    ),
    field('Último login', dateTime(s.lastLoginAtUtc)),
    field(
      '2FA',
      s.twoFactorEnabled === true ? 'Ativa' : s.twoFactorEnabled === false ? 'Inativa' : null,
    ),
  ]
})
const documentMetrics = computed(() => profileDocumentMetrics(documentOverview.state.data))
const documentSections = computed(() => profileDocumentSections(documentOverview.state.data))
const complianceView = computed(() => summarizeCompliance(null, compliance.state.data))
const complianceNotes = computed(() =>
  [
    ...new Set(
      complianceView.value.recentAlerts
        .slice(0, 2)
        .map((alert) => alert.description || alert.title),
    ),
  ].filter((note) => note && note !== complianceView.value.status),
)
const recentEvents = computed(() => {
  const result = timeline.state.data
  const events = Array.isArray(result)
    ? result
    : result?.data || result?.items || result?.events || []
  return [...events]
    .sort((a, b) => new Date(b.occurredAtUtc) - new Date(a.occurredAtUtc))
    .slice(0, showHistory.value ? undefined : 2)
})
const optional = async (request) => {
  try {
    return await request()
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}
const loadCustomer = () => customerResource.load(() => getCustomer(customerId.value))
const loadIdentification = () =>
  identificationResource.load(() => getCustomerIdentification(customerId.value))
const loadProfessional = () =>
  professional.load(() => optional(() => getCustomerProfessionalProfile(customerId.value)))
const loadFinancial = () =>
  financial.load(() => optional(() => getCustomerCurrentFinancialProfile(customerId.value)))
const loadSecurity = () => security.load(() => getCustomerAccountSecurity(customerId.value))
const loadDocuments = () =>
  documentOverview.load(() => getCustomerDocumentOverview(customerId.value))
const loadCompliance = () => compliance.load(() => getComplianceAlerts(customerId.value))
const loadTimeline = () => {
  const id = customerId.value
  const expanded = showHistory.value
  return timeline.load(async () => {
    if (!expanded) return getCustomerTimeline(id, { page: 1, pageSize: 2 })
    const events = []
    let page = 1
    let totalPages = 1
    do {
      const result = await getCustomerTimelinePage(id, { page, pageSize: 100 })
      events.push(
        ...(Array.isArray(result.data) ? result.data : result.data?.items || result.items || []),
      )
      totalPages = Number(result.pagination?.totalPages || 1)
      page += 1
    } while (page <= totalPages)
    return events
  })
}
const toggleHistory = () => {
  showHistory.value = !showHistory.value
  loadTimeline()
}
const refreshCustomer = async () => {
  const id = customerId.value
  try {
    const result = await getCustomer(id)
    if (id === customerId.value) customerResource.state.data = result
  } catch (error) {
    errorNotify(
      getApiErrorMessage(
        error,
        'As alterações foram salvas, mas não foi possível atualizar o resumo.',
      ),
    )
  }
}
const registrationUpdated = () => {
  refreshCustomer()
  loadIdentification()
  loadTimeline()
}
const documentsUpdated = () => {
  loadDocuments()
  loadIdentification()
  loadTimeline()
}
const switchCustomer = (id) => {
  if (id && id !== customerId.value) router.push({ name: 'ClienteDetalhe', params: { id } })
}
const saveStatus = async (status) => {
  if (status === customer.value.status) return
  savingStatus.value = true
  try {
    await changeCustomerStatus(customerId.value, status)
    successNotify('Status atualizado.')
    await refreshCustomer()
    loadTimeline()
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível alterar o status.'))
  } finally {
    savingStatus.value = false
  }
}
watch(
  customerId,
  () => {
    showHistory.value = false
    editingRegistration.value = false
    editingProfessional.value = false
    currencies.value = []
    loadCustomer()
    loadIdentification()
    loadProfessional()
    loadFinancial()
    loadSecurity()
    loadDocuments()
    loadCompliance()
    loadTimeline()
  },
  { immediate: true },
)
</script>

<style scoped>
.client-profile-page {
  color: var(--sa-text);
  min-height: 100vh;
}
.client-profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--sa-border);
  background: rgba(17, 21, 34, 0.6);
  backdrop-filter: blur(20px);
}
.profile-identity {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  min-height: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.profile-identity :deep(.entity-header__identity) {
  min-width: 0;
  max-width: none;
}
.profile-identity :deep(.q-avatar) {
  width: 52px;
  height: 52px;
  color: #fff !important;
  background: var(--sa-surface-soft) !important;
  border: 1px solid var(--sa-border);
}
.profile-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 27px;
  overflow-wrap: anywhere;
}
.profile-name .q-badge {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.72);
}
.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
}
.profile-switcher {
  width: 256px;
  margin-right: auto;
}
.profile-header-status {
  display: grid;
  gap: 4px;
  justify-items: center;
  margin: 0 12px;
}
.profile-header-status > span {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--sa-muted);
}
.profile-customer-state {
  margin: 0 32px;
}
.client-profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 368px;
  gap: 20px;
  padding: 20px;
}
.client-profile-main,
.client-profile-aside {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}
.profile-divider {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.profile-empty {
  margin: 0;
  padding: 16px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.68);
}
.document-totals {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding-bottom: 20px;
  font-size: 12px;
  border-bottom: 1px solid var(--sa-border);
}
.document-totals .text-positive {
  color: #8cdca8 !important;
}
.document-totals .text-negative {
  color: #ff9ea7 !important;
}
.document-totals .text-warning {
  color: #ffe19a !important;
}
.document-category {
  margin-top: 16px;
}
.document-category :deep(.q-item) {
  padding-left: 0;
  padding-right: 0;
  font-size: 12px;
}
.document-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  margin-top: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: inherit;
  background: var(--sa-surface-soft);
  text-align: left;
  cursor: pointer;
}
.document-row:hover {
  background: rgba(255, 255, 255, 0.1);
}
.document-row > span {
  min-width: 0;
  flex: 1;
}
.document-row strong,
.document-row small {
  display: block;
  overflow-wrap: anywhere;
}
.document-row strong {
  font-size: 13px;
  font-weight: 500;
}
.document-row small {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.68);
}
.compliance-note {
  padding: 16px;
  border: 1px solid var(--sa-border);
  border-radius: 8px;
  font-size: 13px;
}
.compliance-note--warning {
  color: #ffe19a;
  border-color: rgba(241, 184, 75, 0.4);
  background: rgba(241, 184, 75, 0.08);
}
.compliance-note p {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.6;
}
h3 {
  margin: 0 0 20px;
  font-size: 13px;
  font-weight: 600;
}
.profile-timeline {
  list-style: none;
  margin: 0 0 16px 5px;
  padding: 0 0 0 18px;
  border-left: 1px solid var(--sa-border);
}
.profile-timeline li {
  position: relative;
  padding-bottom: 20px;
}
.profile-timeline li::before {
  position: absolute;
  left: -22px;
  top: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #bbc6d4;
  content: '';
}
.profile-timeline strong,
.profile-timeline small {
  display: block;
}
.profile-timeline strong {
  font-size: 13px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.profile-timeline small {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
}
.profile-management {
  min-width: 0;
  border-top: 1px solid var(--sa-border);
  padding-top: 16px;
}
.profile-management :deep(.panel-metrics) {
  grid-template-columns: 1fr;
  gap: 8px;
}
.profile-management :deep(.panel-metric) {
  min-height: 0;
  padding: 12px;
}
.profile-management :deep(.panel-section) {
  margin-top: 16px;
}
.profile-management :deep(.q-table td) {
  white-space: normal;
  overflow-wrap: anywhere;
}
.profile-inline-editor :deep(.q-card) {
  color: inherit;
  background: transparent;
}
.profile-inline-editor :deep(.q-separator) {
  background: var(--sa-border);
}
.profile-inline-editor :deep(.form-section) {
  padding-bottom: 0;
}
.profile-bank-panel > :deep(.text-subtitle1),
.profile-bank-panel > :deep(.text-caption) {
  display: none;
}
.client-profile-page :deep(.q-table__container) {
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
}
.client-profile-page :deep(th),
.client-profile-page :deep(td) {
  border-color: rgba(255, 255, 255, 0.1);
}
.client-profile-page :deep(.text-grey-7) {
  color: rgba(255, 255, 255, 0.68) !important;
}
.client-profile-page :deep(*:focus-visible) {
  outline: 2px solid #51b8ff;
  outline-offset: 3px;
}
.client-profile-page ::selection {
  background: #175b7d;
  color: white;
}
@media (max-width: 1400px) {
  .client-profile-grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 16px;
    padding: 20px;
  }
  .profile-switcher {
    width: 210px;
  }
}
@media (max-width: 1100px) {
  .client-profile-grid {
    grid-template-columns: 1fr;
  }
  .client-profile-header {
    flex-wrap: wrap;
  }
  .profile-switcher {
    order: 5;
    width: 100%;
  }
  .client-profile-aside {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
@media (max-width: 700px) {
  .client-profile-header {
    padding: 12px;
    gap: 8px;
  }
  h1 {
    font-size: 17px;
  }
  .profile-identity {
    flex: 1 1 calc(100% - 48px);
  }
  .profile-name .q-badge {
    display: none;
  }
  .profile-meta {
    font-size: 10px;
  }
  .profile-header-status {
    margin: 0;
  }
  .client-profile-grid {
    padding: 16px;
    gap: 16px;
  }
  .client-profile-aside {
    display: flex;
  }
  .profile-identity :deep(.q-avatar) {
    display: none;
  }
  .profile-identity :deep(.entity-header__identity) {
    margin-left: 0;
  }
  .client-profile-main {
    gap: 16px;
  }
}
</style>
