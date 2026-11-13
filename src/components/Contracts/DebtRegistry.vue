<template>
  <section class="debt-registry workspace">
    <div class="debt-registry__toolbar">
      <q-btn v-if="editing" outline no-caps label="Adicionar Dívida" @click="openEditor()"
        ><img src="/icons/contracts/plus.svg" alt=""
      /></q-btn>
      <p v-else>
        <img src="/icons/contracts/info.svg" alt="" />Para inserir, editar ou remover dívidas,
        clique em <strong>Editar Contrato</strong> no topo da página.
      </p>
    </div>
    <resource-state :state="state" @retry="$emit('retry')"
      ><q-table
        dark
        dense
        flat
        :rows="rows"
        :columns="debtColumns"
        row-key="id"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        no-data-label="Nenhuma dívida vinculada."
      >
        <template #body-cell-name="s"
          ><q-td :props="s"
            ><strong>{{ s.row.description || s.row.publicCode }}</strong
            ><small>{{ s.row.client?.name || '—' }}</small></q-td
          ></template
        >
        <template #body-cell-balance="s"
          ><q-td :props="s"
            ><strong>{{ money(s.row.outstandingAmount, s.row.currencyIsoCode) }}</strong
            ><small>de {{ money(s.row.principalAmount, s.row.currencyIsoCode) }}</small></q-td
          ></template
        >
        <template #body-cell-actions="s"
          ><q-td :props="s"
            ><div class="debt-actions">
              <q-btn flat dense aria-label="Ver detalhes da dívida" @click="openDetail(s.row)"
                ><img src="/icons/contracts/debt-eye.svg" alt="" /></q-btn
              ><q-btn flat dense disable aria-label="Visualizar boleto"
                ><img src="/icons/contracts/debt-file-check.svg" alt="" /></q-btn
              ><q-btn flat dense disable aria-label="Baixar boleto"
                ><img src="/icons/contracts/debt-download.svg" alt="" /></q-btn
              ><q-btn
                v-if="editing"
                flat
                dense
                aria-label="Editar dívida"
                @click="openEditor(s.row)"
                ><img src="/icons/contracts/debt-pen.svg" alt="" /></q-btn
              ><q-btn v-if="editing" flat dense disable aria-label="Remover dívida"
                ><img src="/icons/contracts/debt-trash2.svg" alt=""
              /></q-btn></div></q-td
        ></template> </q-table
    ></resource-state>
    <q-dialog :model-value="Boolean(mode)" @update:model-value="!$event && close()"
      ><q-card
        class="workspace-modal debt-modal"
        :class="{ 'debt-modal--detail': mode === 'detail' }"
      >
        <header class="workspace-record-head">
          <h2>
            {{
              mode === 'detail'
                ? 'Detalhes da Dívida (Somente Leitura)'
                : selected
                  ? 'Editar Dívida'
                  : 'Adicionar Dívida'
            }}
          </h2>
          <q-btn flat round dense icon="close" aria-label="Fechar dívida" @click="close" />
        </header>
        <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
        <template v-if="mode === 'detail'">
          <h3 class="debt-title">{{ selected.description || selected.publicCode }}</h3>
          <div class="debt-balance">
            <small>Saldo Devedor Atual</small
            ><strong>{{ money(selected.outstandingAmount, selected.currencyIsoCode) }}</strong
            ><q-badge outline>{{ financeLabel(selected.status) }}</q-badge>
          </div>
          <section v-for="section in detailSections" :key="section.title" class="debt-section">
            <h3 v-if="section.title">{{ section.title }}</h3>
            <dl class="debt-fields">
              <div v-for="f in section.fields" :key="f.label">
                <dt>{{ f.label }}</dt>
                <dd>{{ f.value }}</dd>
              </div>
            </dl>
          </section>
          <section class="debt-section">
            <h3>Observação Interna</h3>
            <p>{{ selected.notes || 'Não informado' }}</p>
          </section>
          <section class="debt-section">
            <h3>Histórico de Alterações</h3>
            <resource-state :state="history.state" @retry="loadHistory"
              ><q-table
                dark
                dense
                flat
                wrap-cells
                :rows="history.state.data || []"
                :columns="historyColumns"
                row-key="id"
                hide-pagination
                :pagination="{ rowsPerPage: 0 }"
                no-data-label="Nenhuma alteração registrada."
            /></resource-state>
          </section>
        </template>
        <template v-else>
          <section v-for="section in formSections" :key="section.title" class="debt-section">
            <h3>{{ section.title }}</h3>
            <div class="workspace-form-grid">
              <workspace-field
                v-for="f in section.fields"
                :key="f.key"
                v-model="form[f.key]"
                :field="f"
              />
            </div>
          </section>
          <template v-if="selected"
            ><section class="debt-section">
              <h3>Modo de Atualização</h3>
              <q-option-group
                v-model="form.updateMode"
                inline
                type="radio"
                :options="[
                  { label: 'Automático', value: 'automatic' },
                  { label: 'Manual', value: 'manual' },
                ]"
              />
              <p>Automático: status calculado por data de vencimento</p>
            </section>
            <section class="debt-section">
              <h3>Boleto</h3>
              <q-file
                v-model="form.receipt"
                outlined
                dark
                dense
                accept="application/pdf,image/*"
                label="Enviar Boleto"
                aria-label="Enviar Boleto"
                ><template #prepend><img src="/icons/contracts/debt-upload.svg" alt="" /></template
              ></q-file>
              <div class="workspace-form-grid">
                <workspace-field
                  v-for="f in receiptFields"
                  :key="f.key"
                  v-model="form[f.key]"
                  :field="f"
                />
              </div></section
          ></template>
        </template>
        <footer class="workspace-actions">
          <q-btn v-if="mode === 'detail'" outline no-caps label="Fechar" @click="close" /><template
            v-else
            ><q-btn outline no-caps label="Cancelar" @click="close" /><q-btn
              outline
              no-caps
              :label="selected ? 'Salvar Alterações' : 'Salvar Dívida'"
              :disable="Boolean(selected) && !dirty"
              @click="save"
          /></template>
        </footer> </q-card
    ></q-dialog>
  </section>
</template>
<script setup>
import { computed, ref, onScopeDispose } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceField from 'src/components/Workspaces/WorkspaceField.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { columns, dateLabel, financeLabel, financeGet, money } from 'src/services/financeService'
import { validateDebtForm } from 'src/services/contractDebtModel'
import { auditAction, auditDate, auditField } from 'src/services/auditModel'
const props = defineProps({
  state: { type: Object, required: true },
  participants: { type: Array, default: () => [] },
  editing: Boolean,
  currency: { type: String, default: 'BRL' },
})
defineEmits(['retry'])
const mode = ref(null),
  selected = ref(null),
  form = ref({}),
  error = ref(''),
  history = useFinanceResource(),
  baseline = ref('')
const rows = computed(() => props.state.data || [])
const debtColumns = columns([
  ['name', 'Nome / Cliente'],
  ['creditor', 'Credor'],
  ['balance', 'Saldo Devedor'],
  ['installment', 'Parcela', () => 'Indisponível'],
  ['installmentAmount', 'Valor Parcela', () => 'Indisponível'],
  ['dueDate', 'Vencimento', (r) => dateLabel(r.dueDate)],
  ['status', 'Status', (r) => financeLabel(r.status)],
  ['mode', 'Modo', () => 'Indisponível'],
  ['actions', 'Ações'],
])
const optionsFor = (key) =>
  [...new Set(rows.value.map((r) => r[key]).filter(Boolean))].map((value) => ({
    label: financeLabel(value),
    value,
  }))
const field = (key, label, kind = 'text', extra = {}) => ({ key, label, kind, ...extra })
const formSections = computed(() => [
  {
    title: 'Dados Principais',
    fields: [
      field('name', 'Nome da dívida/operação *', 'text', {
        placeholder: 'Ex: Empréstimo com imóvel em garantia',
      }),
      field('kind', 'Tipo da dívida *', 'select', {
        options: optionsFor('kind'),
        disabled: !optionsFor('kind').length,
      }),
      field('clientId', 'Cliente vinculado responsável *', 'select', {
        wide: true,
        options: props.participants.map((p) => ({ label: p.displayName, value: p.clientId })),
        disabled: Boolean(selected.value),
      }),
      field('creditor', 'Credor atual *'),
      field('notes', 'Observação interna (opcional)', 'textarea'),
    ],
  },
  {
    title: 'Datas',
    fields: [
      field('startDate', 'Data de início do empréstimo *', 'date'),
      field('paymentStartDate', 'Data de início de pagamento das parcelas *', 'date'),
    ],
  },
  {
    title: 'Valores',
    fields: [
      field('outstandingAmount', 'Saldo devedor atual *', 'number', { min: 0 }),
      field('principalAmount', 'Total financiado *', 'number', { min: 0 }),
      field('installmentAmount', 'Valor padrão das parcelas *', 'number', { min: 0, wide: true }),
    ],
  },
  {
    title: 'Parcelas',
    fields: [
      field('installment', 'Parcela atual *', 'number', { min: 1 }),
      field('totalInstallments', 'Total de parcelas *', 'number', { min: 1 }),
      field('dueDay', 'Dia fixo de vencimento *', 'number', { min: 1, max: 31 }),
      field('dueDate', 'Data do próximo vencimento *', 'date'),
      field('periodicity', 'Periodicidade', 'select', { wide: true, options: [], disabled: true }),
    ],
  },
  {
    title: 'Condições',
    fields: [
      field('amortization', 'Sistema de amortização *', 'select', { options: [], disabled: true }),
      field('correctionIndex', 'Índice de correção', 'select', { options: [], disabled: true }),
      field('monthlyInterest', 'Taxa de juros ao mês *', 'number', { min: 0 }),
      field('annualInterest', 'Taxa de juros ao ano', 'number', { min: 0 }),
    ],
  },
  {
    title: 'Status',
    fields: [
      field('status', 'Status da dívida *', 'select', {
        wide: true,
        options: optionsFor('status'),
        disabled: !optionsFor('status').length,
      }),
    ],
  },
])
const receiptFields = [
  field('paymentLine', 'Linha Digitável'),
  field('barcode', 'Código de Barras'),
  field('receiptAmount', 'Valor do Boleto', 'number', { min: 0 }),
  field('receiptDueDate', 'Vencimento do Boleto', 'date'),
]
const detailSections = computed(() => [
  {
    title: '',
    fields: [
      { label: 'Cliente Responsável', value: selected.value?.client?.name || '—' },
      { label: 'Tipo da Dívida', value: financeLabel(selected.value?.kind) },
      { label: 'Credor Atual', value: selected.value?.creditor || '—' },
      {
        label: 'Total Financiado',
        value: money(selected.value?.principalAmount, selected.value?.currencyIsoCode),
      },
    ],
  },
  {
    title: 'Datas',
    fields: [
      { label: 'Início do Empréstimo', value: dateLabel(selected.value?.startDate) },
      { label: 'Início Pagamento Parcelas', value: 'Indisponível' },
      { label: 'Próximo Vencimento', value: dateLabel(selected.value?.dueDate) },
      { label: 'Dia Fixo Vencimento', value: 'Indisponível' },
    ],
  },
  {
    title: 'Parcelas',
    fields: ['Parcela Atual', 'Valor Padrão Parcela', 'Periodicidade'].map((label) => ({
      label,
      value: 'Indisponível',
    })),
  },
  {
    title: 'Condições Financeiras',
    fields: [
      { label: 'Sistema de Amortização', value: 'Indisponível' },
      { label: 'Índice de Correção', value: 'Indisponível' },
      {
        label: 'Taxa de Juros ao Mês',
        value: 'Indisponível',
      },
      { label: 'Taxa de Juros ao Ano', value: 'Indisponível' },
    ],
  },
])
const historyColumns = columns([
  ['occurredAtUtc', 'Data/Hora', (r) => auditDate(r.occurredAtUtc)],
  ['actor', 'Autor', (r) => r.performedBy?.displayName || '—'],
  ['action', 'Alteração', (r) => auditAction(r.action).label],
  [
    'changes',
    'Anterior → Novo',
    (r) => (r.changedFields || []).map(auditField).join(', ') || r.reason || '—',
  ],
])
function openEditor(row = null) {
  selected.value = row
  mode.value = 'edit'
  error.value = ''
  form.value = {
    name: row?.description || '',
    kind: row?.kind || null,
    clientId: row?.client?.id || null,
    creditor: row?.creditor || '',
    notes: row?.notes || '',
    startDate: row?.startDate || '',
    dueDate: row?.dueDate || '',
    principalAmount: row?.principalAmount ?? null,
    outstandingAmount: row?.outstandingAmount ?? null,
    monthlyInterest: null,
    status: row?.status || null,
    updateMode: null,
  }
  baseline.value = JSON.stringify(form.value)
}
const dirty = computed(() => JSON.stringify(form.value) !== baseline.value)
function openDetail(row) {
  selected.value = row
  mode.value = 'detail'
  error.value = ''
  loadHistory()
}
function close() {
  mode.value = null
  selected.value = null
  form.value = {}
  error.value = ''
  history.reset()
}
const loadHistory = () =>
  history.load(async () => {
    const r = await financeGet('admin/debts/' + selected.value.id + '/history', {
      page: 1,
      pageSize: 100,
    })
    if (!Array.isArray(r.data)) throw Error('Consulta indisponível.')
    return r.data
  })
function save() {
  error.value = validateDebtForm(form.value)
  if (!error.value)
    error.value =
      'Não foi possível salvar todos os dados desta dívida. Serviço indisponível no momento.'
}

onScopeDispose(() => history.reset())
</script>
<style src="src/css/workspaces.scss" lang="scss"></style>
<style scoped>
.debt-registry__toolbar {
  margin-bottom: 16px;
}
.debt-registry__toolbar p {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
}
.debt-registry__toolbar img {
  vertical-align: middle;
  margin-right: 6px;
}
.debt-registry :deep(.q-table__container) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
.debt-registry :deep(th) {
  text-transform: uppercase;
  font-size: 10px;
}
.debt-registry :deep(td) {
  font-size: 11px;
}
.debt-registry :deep(td small) {
  display: block;
}
.debt-actions {
  display: flex;
  gap: 4px;
}
.debt-modal {
  width: 560px;
}
.debt-modal h2,
.debt-modal h3 {
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.debt-section {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 20px;
  margin-top: 20px;
}
.debt-section h3 {
  margin: 0 0 16px;
}
.debt-modal .workspace-actions {
  justify-content: flex-end;
  margin-top: 24px;
}
.debt-modal :deep(.q-table__container) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
.debt-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 0;
}
.debt-fields dt {
  font-size: 11px;
  text-transform: uppercase;
}
.debt-fields dd {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
}
.debt-title {
  text-align: center;
  font-size: 18px !important;
}
.debt-balance {
  text-align: center;
}
.debt-balance small {
  display: block;
  text-transform: uppercase;
}
.debt-balance strong {
  font-size: 24px;
  color: #ff747c;
  display: block;
}
.debt-modal p {
  font-size: 12px;
}
@media (max-width: 500px) {
  .debt-fields {
    grid-template-columns: 1fr;
  }
}
</style>
