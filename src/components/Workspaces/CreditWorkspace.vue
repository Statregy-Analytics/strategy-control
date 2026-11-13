<template>
  <q-dialog :model-value="true" @update:model-value="!$event && $emit('close')"
    ><q-card
      class="workspace-modal"
      :class="{ 'workspace-modal--wide': recordId || (partner && step === 2) }"
      ><div class="workspace-modal-heading">
        <h2>
          {{
            recordId
              ? 'Detalhes da Operação'
              : partner
                ? step === 1
                  ? 'Criar Novo Parceiro - Dados Básicos'
                  : 'Criar Novo Parceiro - Regras de Negócio'
                : 'Nova Operação de Crédito'
          }}
        </h2>
        <q-btn flat dense icon="close" aria-label="Fechar" @click="$emit('close')" />
      </div>
      <p>
        {{
          partner
            ? 'Preencha os dados básicos e selecione os produtos do parceiro'
            : recordId
              ? ''
              : 'Selecione o cliente para esta operação'
        }}
      </p>
      <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
      <template v-if="recordId"
        ><resource-state :state="detail.state" @retry="load"
          ><h3>{{ detail.state.data?.publicCode }}</h3>
          <dl class="credit-summary">
            <template v-for="item in summary" :key="item.label"
              ><dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd></template
            >
          </dl>
          <div class="workspace-tabs">
            <q-badge v-for="stage in stages" :key="stage" outline>{{ stage }}</q-badge>
          </div>
          <div class="workspace-actions">
            <q-btn
              v-for="action in [
                'Editar Operação',
                'Solicitar Documento',
                'Inserir Proposta Final',
                'Alterar Status',
              ]"
              :key="action"
              outline
              no-caps
              :label="action"
              disable
            />
          </div>
          <h3>Informações da Operação</h3>
          <div class="workspace-form-grid">
            <workspace-field
              v-for="field in detailFields"
              :key="field.key"
              :model-value="detail.state.data?.[field.key]"
              :field="{ ...field, disabled: true }"
            />
          </div>
          <h3>Documentos da Etapa</h3>
          <resource-state :state="documents.state" @retry="loadDocuments"
            ><p v-if="!documents.state.data?.length">Nenhum documento enviado.</p>
            <div v-for="doc in documents.state.data || []" :key="doc.documentId">
              {{ doc.fileName || doc.documentTypeName || 'Documento' }}
            </div></resource-state
          >
          <h3>Pré-propostas por Parceiro</h3>
          <p>Consulta indisponível.</p>
          <h3>Propostas Finais por Parceiro</h3>
          <p>Consulta indisponível.</p>
          <h3>Comparativo de Propostas</h3>
          <q-table
            dark
            flat
            dense
            :rows="[]"
            :columns="proposalColumns"
            hide-pagination
            no-data-label="Nenhuma proposta disponível." />
          <h3>Histórico da Operação</h3>
          <resource-state :state="history.state" @retry="loadHistory"
            ><q-table
              dark
              flat
              dense
              :rows="history.state.data || []"
              :columns="historyColumns"
              hide-pagination
              no-data-label="Nenhuma alteração registrada." /></resource-state></resource-state
      ></template>
      <template v-else-if="!partner"
        ><div class="credit-steps">
          <span>1 · Tipo</span><q-separator /><strong>2 · Cliente</strong>
        </div>
        <h3>Selecione o cliente</h3>
        <q-input
          v-model="search"
          outlined
          dark
          dense
          debounce="350"
          placeholder="Buscar cliente por nome, CPF ou CNPJ..."
          aria-label="Buscar cliente por nome, CPF ou CNPJ"
          @update:model-value="lookup" /><resource-state :state="customers.state" @retry="lookup"
          ><button
            v-for="customer in customers.state.data || []"
            :key="customer.customerId"
            class="workspace-choice"
            :aria-pressed="selectedClient?.customerId === customer.customerId"
            @click="selectedClient = customer"
          >
            <strong>{{ customer.displayName }}</strong
            ><small v-if="customer.maskedDocument">{{ customer.maskedDocument }}</small>
          </button>
          <p v-if="!customers.state.data?.length">Nenhum cliente encontrado.</p></resource-state
        ><q-btn
          outline
          no-caps
          label="Criar novo cliente"
          class="full-width q-mt-lg"
          @click="newClient" />
        <div class="workspace-actions">
          <q-btn outline no-caps label="Voltar" @click="$emit('back')" /><q-btn
            outline
            no-caps
            label="Criar Operação"
            :disable="!selectedClient"
            @click="createOperation"
          /></div
      ></template>
      <template v-else-if="step === 1"
        ><label-form text-label="Foto / Logo do Parceiro"
          ><q-file
            v-model="logo"
            outlined
            dark
            dense
            accept="image/png,image/jpeg,image/svg+xml"
            max-file-size="2097152"
            label="Upload"
            @rejected="error = 'Selecione PNG, JPG ou SVG até 2MB.'"
          /><small>PNG, JPG ou SVG até 2MB</small></label-form
        ><workspace-field
          v-model="partnerForm.name"
          :field="{
            label: 'Nome do Parceiro *',
            placeholder: 'Ex: Creditas, C6 Bank, Porto Seguro...',
          }" />
        <h3>Tipo de Parceiro *</h3>
        <button
          v-for="type in partnerTypes"
          :key="type"
          class="workspace-choice"
          :aria-pressed="partnerForm.type === type"
          @click="partnerForm.type = type"
        >
          {{ type }}
        </button>
        <h3>Serviços/Produtos Oferecidos pelo Parceiro *</h3>
        <p>Produtos que o parceiro possui em seu portfólio</p>
        <q-list
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
            @click="nextPartner"
          /></div
      ></template>
      <template v-else
        ><h3>{{ partnerForm.name }}</h3>
        <p>{{ partnerForm.type }} · {{ partnerForm.products.length }} oferecidos</p>
        <q-banner class="bg-transparent"
          >Configure as regras de negócio apenas para os produtos habilitados para a Strategy
          Analytics.</q-banner
        >
        <section v-for="product in partnerForm.products" :key="product" class="credit-product">
          <h3>{{ product }}</h3>
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
            <q-btn outline no-caps label="Adicionar tipo" @click="addCollateral(product)" />
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
                  ><q-input
                    v-model="p.row.name"
                    outlined
                    dense
                    dark
                    aria-label="Tipo de Garantia" /></q-td
                ><q-td
                  ><glass-select
                    v-model="p.row.accepted"
                    :options="['Sim', 'Sob análise', 'Não']"
                    aria-label="Aceito?" /></q-td
                ><q-td
                  ><q-input
                    v-model="p.row.ltv"
                    type="number"
                    min="0"
                    max="100"
                    outlined
                    dense
                    dark
                    aria-label="LTV Máximo (%)" /></q-td
                ><q-td
                  ><q-input
                    v-model="p.row.min"
                    type="number"
                    min="0"
                    outlined
                    dense
                    dark
                    aria-label="Valor Min. Imóvel" /></q-td
                ><q-td
                  ><q-input
                    v-model="p.row.max"
                    type="number"
                    min="0"
                    outlined
                    dense
                    dark
                    aria-label="Valor Max. Imóvel" /></q-td
                ><q-td
                  ><q-input
                    v-model="p.row.notes"
                    outlined
                    dense
                    dark
                    aria-label="Observação" /></q-td></q-tr></template
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
          <div class="workspace-form-grid">
            <workspace-field
              v-for="field in regionFields"
              :key="field.key"
              v-model="rules[product][field.key]"
              :field="field"
            />
          </div>
        </section>
        <div class="workspace-actions">
          <q-btn outline no-caps label="Voltar" @click="step = 1" /><q-btn
            outline
            no-caps
            label="Criar Parceiro"
            @click="savePartner"
          /></div
      ></template> </q-card
  ></q-dialog>
</template>
<script setup>
import { computed, onScopeDispose, ref } from 'vue'
import { useRouter } from 'vue-router'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceField from './WorkspaceField.vue'
import { partnerTypes, partnerProducts, workspaceStatus } from 'src/services/adminWorkspaceModel'
import { lookupCustomers } from 'src/services/customerService'
import { financeGet, columns, dateLabel, money } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
const props = defineProps({
    recordId: { type: String, default: null },
    operationType: { type: String, default: null },
    partner: Boolean,
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
  partnerForm = ref({ name: '', type: null, products: [] }),
  rules = ref({})
let active = true,
  sequence = 0
const stages = [
  'Iniciada',
  'Pendente',
  'Pré-proposta',
  'Documentação',
  'Proposta Final',
  'Assinatura',
  'Contratada',
]
const summary = computed(() => {
  const d = detail.state.data
  return d
    ? [
        { label: 'Cliente', value: d.client?.displayName || '—' },
        { label: 'Tipo', value: workspaceStatus(d.kind) },
        { label: 'Valor solicitado', value: money(d.principalAmount, d.currencyIsoCode) },
        { label: 'Garantia', value: d.collateral || '—' },
        { label: 'Status', value: workspaceStatus(d.status) },
        { label: 'Criado em', value: dateLabel(d.createdAtUtc) },
        { label: 'Atualizado', value: dateLabel(d.updatedAtUtc) },
      ]
    : []
})
const detailFields = [
  { key: 'termMonths', label: 'Prazo desejado', kind: 'number' },
  { key: 'purpose', label: 'Finalidade' },
]
const proposalColumns = columns(
    [
      'Parceiro',
      'Valor Aprovado',
      'Valor Líquido',
      'Parcela',
      'Prazo',
      'Taxa a.m.',
      'CET a.m.',
      'Validade',
      'Status',
    ].map((x) => [x, x]),
  ),
  historyColumns = columns([
    ['occurredAtUtc', 'Data/Hora', (r) => dateLabel(r.occurredAtUtc)],
    ['action', 'Alteração', (r) => workspaceStatus(r.action)],
  ])
const collateralColumns = columns(
  [
    'Tipo de Garantia',
    'Aceito?',
    'LTV Máximo (%)',
    'Valor Min. Imóvel',
    'Valor Max. Imóvel',
    'Observação',
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
async function lookup() {
  const r = ++sequence
  await customers.load(async () => {
    const x = await lookupCustomers({ search: search.value, limit: 20 })
    return active && r === sequence ? x.customers || [] : []
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
  error.value = 'Não foi possível criar a operação. Serviço indisponível no momento.'
}
function newClient() {
  emit('close')
  router.push({ name: 'Clientes', query: { new: '1' } })
}
function nextPartner() {
  if (
    !partnerForm.value.name.trim() ||
    !partnerForm.value.type ||
    !partnerForm.value.products.length
  ) {
    error.value = 'Informe nome, tipo e pelo menos um produto.'
    return
  }
  for (const product of partnerForm.value.products) rules.value[product] ??= { collaterals: [] }
  error.value = ''
  step.value = 2
}
function addCollateral(product) {
  rules.value[product].collaterals.push({
    key: crypto.randomUUID(),
    name: '',
    accepted: null,
    ltv: null,
    min: null,
    max: null,
    notes: '',
  })
}
function savePartner() {
  for (const r of Object.values(rules.value)) {
    if (r.minAmount != null && r.maxAmount != null && Number(r.minAmount) > Number(r.maxAmount)) {
      error.value = 'O valor máximo deve ser maior ou igual ao mínimo.'
      return
    }
    if (
      r.collaterals.some(
        (c) =>
          !c.name.trim() ||
          !c.accepted ||
          c.ltv == null ||
          Number(c.ltv) < 0 ||
          Number(c.ltv) > 100,
      )
    ) {
      error.value = 'Revise tipo de garantia, aceite e LTV entre 0 e 100%.'
      return
    }
  }
  error.value = 'Não foi possível salvar o parceiro. Serviço indisponível no momento.'
}
if (props.recordId) {
  load()
  loadDocuments()
  loadHistory()
} else if (!props.partner) lookup()
onScopeDispose(() => {
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
