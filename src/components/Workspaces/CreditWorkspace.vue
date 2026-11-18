<template>
  <credit-operation-details
    v-if="recordId"
    :detail="detail.state"
    :documents="documents.state"
    :history="history.state"
    @close="$emit('close')"
    @retry-detail="load"
    @retry-documents="loadDocuments"
    @retry-history="loadHistory"
  />
  <q-dialog v-else :model-value="true" @update:model-value="!$event && $emit('close')"
    ><q-card
      class="workspace-modal"
      :class="[
        partner ? 'credit-partner-form' : 'credit-customer-modal',
        { 'workspace-modal--wide': recordId || (partner && step === 2) },
      ]"
      ><div class="workspace-modal-heading">
        <h2>
          {{
            recordId
              ? 'Detalhes da Operação'
              : partner
                ? step === 1
                  ? initialPartner
                    ? 'Editar Parceiro - Dados Básicos'
                    : 'Criar Novo Parceiro - Dados Básicos'
                  : initialPartner
                    ? 'Editar Parceiro - Regras de Negócio'
                    : 'Criar Novo Parceiro - Regras de Negócio'
                : 'Nova Operação de Crédito'
          }}
        </h2>
        <q-btn flat dense aria-label="Fechar" @click="$emit('close')"
          ><span v-if="partner" class="partner-form-close"
            ><img src="/icons/partners/form-close-a.svg" alt="" /><img
              src="/icons/partners/form-close-b.svg"
              alt="" /></span
          ><img v-else src="/icons/workspace-review/credit-close.svg" alt=""
        /></q-btn>
      </div>
      <p>
        {{
          partner
            ? step === 1
              ? 'Preencha os dados básicos e selecione os produtos do parceiro'
              : 'Configure as regras de negócio para os produtos habilitados'
            : recordId
              ? ''
              : 'Selecione o cliente para esta operação'
        }}
      </p>
      <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
      <template v-if="!partner"
        ><credit-wizard-steps :step="2" />
        <h3>Selecione o cliente</h3>
        <q-input
          v-model="search"
          outlined
          dark
          dense
          debounce="350"
          placeholder="Buscar cliente por nome, CPF ou CNPJ..."
          aria-label="Buscar cliente por nome, CPF ou CNPJ"
          @update:model-value="lookup"
          ><template #prepend
            ><img
              src="/icons/workspace-review/credit-customer-search.svg"
              alt="" /></template></q-input
        ><resource-state :state="customers.state" @retry="lookup"
          ><button
            v-for="customer in customers.state.data || []"
            :key="customer.customerId"
            class="workspace-choice credit-customer-choice"
            :aria-pressed="selectedClient?.customerId === customer.customerId"
            @click="selectedClient = customer"
          >
            <strong>{{ customer.displayName }}</strong
            ><small v-if="customer.maskedDocument">{{ customer.maskedDocument }}</small
            ><small v-if="customer.primaryContact">{{ customer.primaryContact }}</small>
          </button>
          <p v-if="!customers.state.data?.length">Nenhum cliente encontrado.</p></resource-state
        ><q-btn
          outline
          no-caps
          label="Criar novo cliente"
          class="full-width q-mt-lg credit-create-client"
          @click="newClient"
          ><img src="/icons/workspace-review/credit-plus.svg" alt=""
        /></q-btn>
        <div class="workspace-actions">
          <q-btn outline no-caps label="Voltar" @click="$emit('back')" /><q-btn
            outline
            no-caps
            label="Criar Operação"
            :disable="!selectedClient"
            @click="createOperation"
          /></div
      ></template>
      <div v-if="partner" class="partner-progress" aria-label="Etapas do parceiro">
        <span :class="{ current: step === 1 }"></span><span :class="{ current: step === 2 }"></span>
      </div>
      <template v-if="partner && step === 1"
        ><label-form text-label="Foto / Logo do Parceiro" class="partner-logo-field">
          <div class="partner-upload">
            <label class="partner-upload-trigger"
              ><img src="/icons/partners/form-upload.svg" alt="" /><span>Upload</span
              ><input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                aria-label="Upload do logo do parceiro"
                @change="chooseLogo" /></label
            ><small>{{ logo?.name || 'PNG, JPG ou SVG até 2MB' }}</small>
          </div> </label-form
        ><workspace-field
          v-model="partnerForm.name"
          :field="{
            label: 'Nome do Parceiro *',
            placeholder: 'Ex: Creditas, C6 Bank, Porto Seguro...',
          }" />
        <h3>Tipo de Parceiro *</h3>
        <button
          v-for="(type, index) in partnerTypes"
          :key="type"
          class="workspace-choice partner-type"
          :aria-pressed="partnerForm.type === type"
          @click="partnerForm.type = type"
        >
          <img :src="'/icons/partners/' + partnerTypeIcons[index] + '.svg'" alt="" />{{ type }}
        </button>
        <h3>Serviços/Produtos Oferecidos pelo Parceiro *</h3>
        <p>Produtos que o parceiro possui em seu portfólio</p>
        <q-list class="partner-products-list"
          ><q-item v-for="product in partnerProducts" :key="product"
            ><q-item-section
              ><q-checkbox
                v-model="partnerForm.products"
                :val="product"
                :label="product" /></q-item-section></q-item
        ></q-list>
        <div class="workspace-actions">
          <q-btn outline no-caps label="Cancelar" @click="$emit('close')" /><q-btn
            outline
            no-caps
            label="Continuar"
            :disable="!basicsValid"
            @click="nextPartner"
          /></div
      ></template>
      <template v-else-if="partner && step === 2"
        ><div class="partner-form-summary">
          <div class="partner-summary-avatar">
            <img
              v-if="logoPreview || initialPartner?.logoUrl"
              :src="logoPreview || initialPartner.logoUrl"
              alt="Logo do parceiro"
            /><span v-else>{{ partnerForm.name.charAt(0) }}</span>
          </div>
          <div>
            <strong>{{ partnerForm.name }}</strong
            ><small>{{ partnerForm.type }}</small>
          </div>
          <div class="partner-summary-counts">
            <small>{{ partnerForm.products.length }} oferecido(s)</small
            ><span>— habilitado(s)</span>
          </div>
        </div>
        <q-banner class="partner-rules-notice"
          >Configure as regras de negócio apenas para os produtos habilitados para a Strategy
          Analytics.<small
            >Produtos oferecidos mas não habilitados não precisam de regras neste momento.</small
          ></q-banner
        >
        <section v-for="product in partnerForm.products" :key="product" class="credit-product">
          <h3>
            <img
              v-if="product === partnerProducts[0]"
              src="/icons/partners/rules-house.svg"
              alt=""
            />{{ product }}
          </h3>
          <template v-if="product === partnerProducts[0]"
            ><div class="credit-product-body">
              <h4>Regras Gerais do Produto</h4>
              <div class="workspace-form-grid">
                <workspace-field
                  v-for="field in ruleFields"
                  :key="field.key"
                  v-model="rules[product][field.key]"
                  :field="field"
                />
              </div>
              <div class="workspace-actions">
                <h4>LTV por Tipo de Garantia</h4>
                <q-btn outline no-caps label="Adicionar tipo" @click="addCollateral(product)"
                  ><img src="/icons/partners/rules-plus.svg" alt=""
                /></q-btn>
              </div>
              <q-table
                dark
                flat
                dense
                :rows="rules[product].collaterals"
                :columns="collateralColumns"
                row-key="key"
                hide-pagination
                ><template #body="p"
                  ><q-tr :props="p"
                    ><q-td
                      ><span v-if="!p.row.editing">{{ p.row.name || '—' }}</span
                      ><q-input
                        v-else
                        v-model="p.row.name"
                        outlined
                        dense
                        dark
                        aria-label="Tipo de Garantia" /></q-td
                    ><q-td
                      ><partner-acceptance-badge
                        v-if="!p.row.editing"
                        :value="p.row.accepted" /><glass-select
                        v-else
                        v-model="p.row.accepted"
                        :options="['Sim', 'Sob análise', 'Não']"
                        dropdown-icon="img:/icons/partners/rules-chevron.svg"
                        aria-label="Aceito?" /></q-td
                    ><q-td
                      ><span v-if="!p.row.editing">{{
                        p.row.accepted === 'Não' ? '—' : (p.row.ltv ?? '—')
                      }}</span
                      ><q-input
                        v-else
                        v-model="p.row.ltv"
                        type="text"
                        min="0"
                        max="100"
                        outlined
                        dense
                        dark
                        aria-label="LTV Máximo (%)" /></q-td
                    ><q-td
                      ><span v-if="!p.row.editing">{{
                        p.row.accepted === 'Não' ? '—' : (p.row.min ?? '—')
                      }}</span
                      ><q-input
                        v-else
                        v-model="p.row.min"
                        type="number"
                        min="0"
                        outlined
                        dense
                        dark
                        aria-label="Valor Min. Imóvel" /></q-td
                    ><q-td
                      ><span v-if="!p.row.editing">{{
                        p.row.accepted === 'Não' ? '—' : (p.row.max ?? '—')
                      }}</span
                      ><q-input
                        v-else
                        v-model="p.row.max"
                        type="number"
                        min="0"
                        outlined
                        dense
                        dark
                        aria-label="Valor Max. Imóvel" /></q-td
                    ><q-td
                      ><span v-if="!p.row.editing">{{ p.row.notes ?? '—' }}</span
                      ><q-input
                        v-else
                        v-model="p.row.notes"
                        outlined
                        dense
                        dark
                        aria-label="Observação" /></q-td
                    ><q-td
                      ><q-btn
                        flat
                        dense
                        :aria-label="'Editar garantia ' + (p.row.name || 'nova')"
                        :aria-pressed="p.row.editing"
                        @click="p.row.editing = !p.row.editing"
                        ><img
                          src="/icons/partners/rules-edit.svg"
                          alt="" /></q-btn></q-td></q-tr></template
              ></q-table>
              <h4>Carência / Início de Pagamento</h4>
              <div class="workspace-form-grid">
                <workspace-field
                  v-for="field in graceFields"
                  :key="field.key"
                  v-model="rules[product][field.key]"
                  :field="field"
                />
              </div>
              <h4>Regiões e Imóveis</h4>
              <div class="workspace-form-grid partner-region-grid">
                <workspace-field
                  v-for="field in regionFields"
                  :key="field.key"
                  v-model="rules[product][field.key]"
                  :field="field"
                />
              </div></div
          ></template>
          <p v-else role="status">Configuração de regras indisponível para este produto.</p>
        </section>
        <div class="workspace-actions">
          <q-btn outline no-caps label="Voltar" @click="step = 1" /><q-btn
            outline
            no-caps
            :label="initialPartner ? 'Salvar Parceiro' : 'Criar Parceiro'"
            @click="savePartner"
          /></div
      ></template> </q-card
  ></q-dialog>
</template>
<script setup>
import CreditWizardSteps from './CreditWizardSteps.vue'
import { computed, watch, onScopeDispose, ref } from 'vue'
import PartnerAcceptanceBadge from './PartnerAcceptanceBadge.vue'
import {
  initialPartnerForm,
  validPartnerBasics,
  partnerRuleError,
  validPartnerLogo,
  partnerTypeIcons,
} from 'src/services/creditPartnerForm'
import { useRouter } from 'vue-router'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceField from './WorkspaceField.vue'
import CreditOperationDetails from './CreditOperationDetails.vue'
import { partnerTypes, partnerProducts } from 'src/services/adminWorkspaceModel'
import { listCustomerCards } from 'src/services/customerService'
import { readCurrentPages } from 'src/services/requestContext'
import { financeGet, columns } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
const props = defineProps({
    recordId: { type: String, default: null },
    operationType: { type: String, default: null },
    partner: Boolean,
    initialPartner: { type: Object, default: null },
  }),
  emit = defineEmits(['close', 'back']),
  router = useRouter()
const error = ref(''),
  step = ref(1),
  search = ref(''),
  selectedClient = ref(null),
  customers = useFinanceResource(),
  detail = useFinanceResource(),
  documents = useFinanceResource(),
  history = useFinanceResource(),
  logo = ref(null),
  partnerForm = ref(initialPartnerForm(props.initialPartner)),
  rules = ref({})
const basicsValid = computed(() => validPartnerBasics(partnerForm.value))
const logoPreview = ref(null)
watch(logo, (file) => {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
  logoPreview.value = file ? URL.createObjectURL(file) : null
})
function chooseLogo(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!validPartnerLogo(file)) {
    error.value = 'Selecione PNG, JPG ou SVG até 2MB.'
    event.target.value = ''
    return
  }
  logo.value = file
  error.value = ''
}
let active = true,
  sequence = 0
const collateralColumns = columns(
  [
    'Tipo de Garantia',
    'Aceito?',
    'LTV Máximo (%)',
    'Valor Min. Imóvel',
    'Valor Max. Imóvel',
    'Observação',
    '',
  ].map((x) => [x, x]),
)
const ruleFields = [
  ['minAmount', 'Valor mínimo da operação'],
  ['maxAmount', 'Valor máximo da operação'],
  ['incomeCommitment', 'Comprometimento máximo da renda (%)'],
  ['minTerm', 'Prazo mínimo (meses)'],
  ['maxTerm', 'Prazo máximo (meses)'],
  ['monthlyRate', 'Taxa estimada (% a.m.)'],
  ['annualRate', 'Taxa estimada (% a.a.)'],
]
  .map(([key, label]) => ({ key, label, kind: 'number', min: 0 }))
  .concat([
    {
      key: 'amortization',
      label: 'Sistema de amortização',
      kind: 'select',
      options: [],
      disabled: true,
    },
    { key: 'audience', label: 'Público aceito', kind: 'select', options: [], disabled: true },
  ])
const graceFields = [
  { key: 'grace', label: 'Possui carência?', kind: 'select', options: ['Sim', 'Não'] },
  { key: 'gracePeriod', label: 'Prazo de carência padrão', kind: 'number' },
  { key: 'graceUnit', label: 'Unidade', kind: 'select', options: [], disabled: true },
  { key: 'minGrace', label: 'Prazo mínimo de carência', kind: 'number' },
  { key: 'maxGrace', label: 'Prazo máximo de carência', kind: 'number' },
  { key: 'firstInstallment', label: 'Regra da primeira parcela' },
  { key: 'graceNotes', label: 'Observação sobre carência', wide: true },
]
const regionFields = [
  { key: 'region', label: 'Região de atuação' },
  { key: 'cities', label: 'Cidades/estados aceitos' },
  { key: 'excludedProperties', label: 'Imóveis não aceitos', wide: true },
  { key: 'exceptions', label: 'Exceções operacionais', wide: true },
  { key: 'notes', label: 'Observações internas', kind: 'textarea', wide: true },
]
for (const field of [...ruleFields, ...graceFields, ...regionFields])
  if (field.kind === 'select') field.dropdownIcon = 'img:/icons/partners/rules-chevron.svg'
async function lookup() {
  const r = ++sequence
  await customers.load(async () => {
    selectedClient.value = null
    const rows = await readCurrentPages(
      (page) =>
        listCustomerCards({ search: search.value.trim() || undefined, page, pageSize: 100 }),
      () => active && r === sequence,
    )
    return rows || []
  })
}
async function load() {
  await detail.load(async () => (await financeGet('admin/loans/' + props.recordId)).data)
}
const loadDocuments = () =>
  documents.load(
    async () => (await financeGet('admin/loans/' + props.recordId + '/documents')).data || [],
  )
const loadHistory = () =>
  history.load(
    async () => (await financeGet('admin/loans/' + props.recordId + '/history')).data || [],
  )
function createOperation() {
  if (!selectedClient.value) return
  error.value = 'Não foi possível criar a operação com os dados disponíveis.'
}
function newClient() {
  emit('close')
  router.push({ name: 'Clientes', query: { new: '1' } })
}
function nextPartner() {
  if (!basicsValid.value) {
    error.value = 'Informe nome, tipo e pelo menos um produto.'
    return
  }
  rules.value = Object.fromEntries(
    partnerForm.value.products.map((product) => [
      product,
      rules.value[product] || { collaterals: [] },
    ]),
  )
  error.value = ''
  step.value = 2
}
function addCollateral(product) {
  rules.value[product].collaterals.push({
    key: crypto.randomUUID(),
    editing: true,
    name: '',
    accepted: null,
    ltv: null,
    min: null,
    max: null,
    notes: '',
  })
}
function savePartner() {
  const validation = partnerRuleError(rules.value)
  if (validation) {
    error.value = validation
    return
  }
  error.value = 'Não foi possível salvar o parceiro. Serviço indisponível no momento.'
}
if (props.recordId) {
  load()
  loadDocuments()
  loadHistory()
} else if (!props.partner) lookup()
onScopeDispose(() => {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
  active = false
  sequence++
  customers.reset()
  detail.reset()
  documents.reset()
  history.reset()
})
</script>
<style scoped>
.credit-steps {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.credit-steps .q-separator {
  flex: 1;
  height: 3px;
}
.workspace-choice small {
  display: block;
}
.credit-product {
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  margin: 24px 0;
}
.credit-summary {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}
.credit-summary dd {
  margin: 0;
}
.credit-summary dt {
  color: rgba(255, 255, 255, 0.65);
}
.workspace-modal :deep(.q-table__container) {
  max-width: 100%;
  overflow: auto;
}
</style>

<style scoped>
.workspace-choice strong,
.workspace-choice small {
  display: block;
  overflow-wrap: anywhere;
}
.workspace-choice small {
  margin-top: 4px;
  color: #ffffffb8;
  font-size: 12px;
}
</style>

<style scoped>
.credit-create-client :deep(.q-btn__content) {
  gap: 8px;
  flex-direction: row-reverse;
}
</style>

<style scoped src="./creditPartnerForm.scss"></style>

<style scoped>
.credit-customer-choice {
  padding: 17px 17px 17px 45px;
  min-height: 83.575px;
  border-color: #ffffff33;
  background: #ffffff0d;
  border-radius: 10px;
}
.credit-customer-choice strong {
  font:
    600 14px/14px Inter,
    sans-serif;
}
.credit-customer-choice small {
  font:
    500 12px/16px Inter,
    sans-serif;
}
.credit-customer-choice[aria-pressed='true'] {
  border-color: #ffffff80;
  background: #ffffff1f;
}
.credit-customer-modal {
  max-width: calc(100vw - 32px) !important;
}
.credit-customer-modal .workspace-actions > .q-btn {
  flex: 1;
}
.credit-customer-choice:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
</style>
