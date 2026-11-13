<template>
  <div class="workspace">
    <header class="workspace-header">
      <div>
        <q-btn flat no-caps label="Voltar para lógicas" @click="$emit('close')" />
        <h1>
          {{
            recordId
              ? (editing ? 'Motor de Variação — ' : '') + (source?.name || 'Motor')
              : 'Criar Novo Motor de Variação Indexada'
          }}
        </h1>
        <p v-if="!recordId">
          Configure identidade, ciclo, limites, intensidade, fechamento soberano e vínculos
          contratuais.
        </p>
      </div>
      <div class="workspace-actions">
        <template v-if="editing"
          ><q-btn outline no-caps label="Cancelar" @click="cancel" /><q-btn
            v-if="!recordId"
            outline
            no-caps
            label="Salvar Rascunho"
            @click="saveDraft" /><q-btn
            outline
            no-caps
            :label="recordId ? 'Salvar Alterações' : 'Confirmar e Criar'"
            :disable="recordId && (!dirty || resource.state.loading || !source)"
            @click="confirm" /></template
        ><q-btn
          v-else
          outline
          no-caps
          label="Editar Lógica"
          :disable="resource.state.loading || (recordId && !source)"
          @click="editing = true"
        />
      </div>
    </header>
    <main class="workspace-main">
      <q-banner v-if="catalogError" class="workspace-error" role="alert"
        >Não foi possível carregar as moedas.
        <q-btn flat no-caps label="Tentar novamente" @click="loadCatalog"
      /></q-banner>
      <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner
      ><resource-state :state="resource.state" @retry="load">
        <div :class="recordId ? 'logic-existing' : 'workspace-editor'">
          <div>
            <profile-section
              v-if="!recordId"
              title="Identidade do Motor"
              icon-src="/icons/workspaces/box.svg"
              caption="Defina como esse motor será identificado no sistema."
              ><div class="workspace-form-grid">
                <workspace-field
                  v-model="form.name"
                  :field="{ label: 'Nome do Motor *', placeholder: 'Ex: Alpha-2 Institutional' }"
                /><workspace-field
                  :model-value="source?.code || ''"
                  :field="{ label: 'ID (Automático)', disabled: true, placeholder: '—' }"
                /><workspace-field
                  v-model="form.description"
                  :field="{
                    label: 'Descrição Interna',
                    wide: true,
                    placeholder: 'Descrição técnica ou administrativa do motor',
                  }"
                /><workspace-field
                  v-model="form.status"
                  :field="{ label: 'Status Inicial', kind: 'select', options: logicStatuses }"
                /><workspace-field
                  v-model="form.currency"
                  :field="{ label: 'Moeda Firmada *', kind: 'select', options: currencyOptions }"
                /><workspace-field
                  v-model="form.engineType"
                  :field="{ label: 'Tipo de Motor', kind: 'select', options: [], disabled: true }"
                />
              </div>
              <p>Ícone Representativo</p>
              <div class="logic-icons">
                <q-btn
                  v-for="icon in icons"
                  :key="icon.value"
                  outline
                  no-caps
                  :aria-pressed="form.icon === icon.value"
                  @click="form.icon = icon.value"
                  ><workspace-icon :name="icon.value" />{{ icon.label }}</q-btn
                >
              </div>
              <p>Cor Institucional</p>
              <div class="logic-colors">
                <button
                  v-for="color in colors"
                  :key="color"
                  :style="{ background: color }"
                  :aria-label="'Cor ' + color"
                  :aria-pressed="form.color === color"
                  @click="form.color = color"
                >
                  <workspace-icon v-if="form.color === color" name="check" />
                </button></div
            ></profile-section>
            <profile-section
              v-for="section in sections"
              :key="section.title"
              :title="section.title"
              :caption="section.caption"
              ><div class="workspace-form-grid">
                <template v-for="field in section.fields" :key="field.key"
                  ><workspace-field
                    v-if="!field.when || field.when(form)"
                    :model-value="field.computed ? field.computed(form) : form[field.key]"
                    :field="{ ...field, disabled: field.disabled || !editing }"
                    @update:model-value="form[field.key] = $event"
                /></template>
              </div>
              <template v-if="section.key === 'probability'"
                ><div
                  v-if="form.positive != null && form.negative != null"
                  class="logic-probability"
                  :aria-label="
                    'Chance positiva ' + form.positive + '%; chance negativa ' + form.negative + '%'
                  "
                >
                  <span
                    :style="{ width: Math.max(0, Math.min(100, Number(form.positive) || 0)) + '%' }"
                  />
                </div>
                <p
                  :class="{
                    'text-negative': Number(form.positive) + Number(form.negative) !== 100,
                  }"
                >
                  Soma atual:
                  {{
                    form.positive == null || form.negative == null
                      ? 'Indisponível'
                      : Number(form.positive) + Number(form.negative) + '%'
                  }}
                </p></template
              >
              <p v-if="section.key === 'sovereign'" class="workspace-muted">
                As bandas e probabilidades controlam o percurso. O fechamento soberano controla o
                índice final do ciclo trimestral.
              </p>
              <div v-if="section.key === 'buffer' && form.buffer">
                <q-table
                  dark
                  flat
                  dense
                  :rows="[]"
                  :columns="bufferColumns"
                  hide-pagination
                  no-data-label="Configuração indisponível."
                /></div
            ></profile-section>
            <profile-section
              v-if="!recordId"
              title="Vincular Papéis/Contratos (Opcional)"
              caption="Associe contratos ou papéis existentes agora ou faça depois."
              ><q-input
                v-model="contractSearch"
                outlined
                dense
                dark
                placeholder="Buscar contrato ou papel por nome ou ID..."
                aria-label="Buscar contrato ou papel por nome ou ID"
              /><resource-state :state="contracts.state" @retry="loadContracts"
                ><q-list
                  ><q-item v-for="row in matchedContracts" :key="row.id"
                    ><q-item-section avatar
                      ><q-checkbox
                        v-model="form.contracts"
                        :val="row.id"
                        :aria-label="'Vincular ' + row.name" /></q-item-section
                    ><q-item-section
                      >{{ row.name }}<small>{{ row.publicCode }}</small></q-item-section
                    ></q-item
                  ></q-list
                ></resource-state
              >
              <p>Importante sobre Vínculos</p>
              <small
                >Papéis vinculados após o início do ciclo não herdam performance anterior. A
                valorização passa a ser calculada a partir do índice na conexão.</small
              ></profile-section
            >
          </div>
          <aside
            v-if="!recordId"
            class="workspace-record logic-preview"
            :style="{ borderColor: form.color }"
          >
            <workspace-icon :name="form.icon" />
            <h2>{{ form.name || 'Prévia do motor' }}</h2>
            <q-badge outline>{{ form.status }}</q-badge>
            <dl>
              <div>
                <dt>Índice Atual</dt>
                <dd>{{ form.initialIndex ?? '—' }}</dd>
              </div>
              <div>
                <dt>Alvo do Ciclo</dt>
                <dd>{{ form.target == null ? '—' : form.target + '%' }}</dd>
              </div>
              <div>
                <dt>Final Obrigatório</dt>
                <dd>{{ finalIndex ?? '—' }}</dd>
              </div>
              <div>
                <dt>Papéis/Contratos</dt>
                <dd>{{ form.contracts.length }}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <template v-if="recordId"
          ><profile-section
            title="Papéis Vinculados ao Motor"
            caption="Papéis possuem valor real. O motor apenas indexa a performance proporcionalmente ao índice de conexão de cada papel."
            ><q-table
              dark
              flat
              dense
              :rows="[]"
              :columns="linkedColumns"
              hide-pagination
              no-data-label="Vínculos indisponíveis nesta consulta." /></profile-section
          ><logic-performance :editing="editing" @history="historyOpen = !historyOpen" />
          <profile-section v-if="historyOpen" title="Histórico Completo do Motor">
            <template #actions
              ><q-btn outline no-caps label="Voltar para lógica" @click="historyOpen = false"
            /></template>
            <div class="workspace-empty">Histórico operacional indisponível.</div>
          </profile-section>
        </template>
      </resource-state>
    </main>
    <q-dialog v-model="validationOpen"
      ><q-card class="workspace-modal"
        ><h2>Validação da Configuração</h2>
        <p>{{ validationError || 'Configuração Válida' }}</p>
        <q-list
          ><q-item v-for="rule in validationRules" :key="rule"
            ><q-item-section>{{ rule }}</q-item-section></q-item
          ></q-list
        >
        <div class="workspace-actions">
          <q-btn flat no-caps label="Fechar" v-close-popup /></div></q-card
    ></q-dialog>
  </div>
</template>
<script setup>
import { computed, onScopeDispose, ref } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceIcon from './WorkspaceIcon.vue'
import WorkspaceField from './WorkspaceField.vue'
import LogicPerformance from './LogicPerformance.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, columns } from 'src/services/financeService'
import { getPreferenceCatalog } from 'src/services/customerService'
import {
  initialLogic,
  logicStatuses,
  projectedFinalIndex,
  validateLogic,
  foldSearch,
} from 'src/services/adminWorkspaceModel'
const props = defineProps({ recordId: { type: String, default: null }, startEditing: Boolean }),
  emit = defineEmits(['close', 'readonly'])
const form = ref(initialLogic()),
  source = ref(null),
  editing = ref(!props.recordId || props.startEditing),
  error = ref(''),
  resource = useFinanceResource(),
  contracts = useFinanceResource(),
  contractSearch = ref(''),
  currencyOptions = ref([]),
  catalogError = ref(false),
  historyOpen = ref(false),
  validationOpen = ref(false)
let active = true
const baseline = ref('')
const dirty = computed(() => JSON.stringify(form.value) !== baseline.value),
  finalIndex = computed(() => projectedFinalIndex(form.value)),
  validationError = computed(() => validateLogic(form.value))
const colors = ['#153d49', '#1043e9', '#00b6cf', '#008641', '#35291c', '#f00000', '#be0000']
const icons = [
  { label: 'Distribuição', value: 'chart-pie' },
  { label: 'Oscilação', value: 'activity1' },
  { label: 'Performance', value: 'trending-up' },
  { label: 'Rápida', value: 'zap' },
  { label: 'Segurança', value: 'shield' },
  { label: 'Estrutural', value: 'box' },
  { label: 'Composta', value: 'layers' },
  { label: 'Algorítmica', value: 'cpu' },
]
const fields = (items) =>
  items.map(([key, label, kind = 'number', extra = {}]) => ({ key, label, kind, ...extra }))
const sections = computed(() => [
  {
    key: 'cycle',
    title: props.recordId ? 'Parâmetros do Ciclo Trimestral' : 'Ciclo Trimestral',
    caption: 'Defina o período, índices e alvo do ciclo operacional.',
    fields: fields([
      ['initialIndex', 'Índice Inicial do Motor'],
      ['target', 'Alvo do Ciclo Trimestral (%) *'],
      [
        'finalIndex',
        'Índice Final Obrigatório — calculado',
        'number',
        { computed: projectedFinalIndex, disabled: true },
      ],
      ['startDate', 'Data de Início do Ciclo', 'date'],
      ['endDate', 'Data de Fechamento do Ciclo', 'date'],
    ]),
  },
  {
    key: 'frequency',
    title: 'Frequência de Atualização',
    caption: 'Configure o intervalo e ritmo de execução do motor.',
    fields: fields([
      ['interval', 'Intervalo Operacional *', 'select', { options: [], disabled: true }],
      ['updatesPerDay', 'Atualizações por Dia', 'number', { disabled: true }],
      ['firstRun', 'Primeira Execução', 'datetime'],
      ['lastRun', 'Última Atualização', 'text', { disabled: true }],
      ['nextRun', 'Próxima Atualização', 'text', { disabled: true }],
      ['estimatedUpdates', 'Atualizações Estimadas no Ciclo', 'number', { disabled: true }],
    ]),
  },
  {
    key: 'probability',
    title: 'Probabilidade Direcional Base',
    caption: 'Configure a probabilidade de variação positiva ou negativa.',
    fields: fields([
      ['positive', 'Chance Positiva (%)', 'number', { min: 0, max: 100 }],
      ['negative', 'Chance Negativa (%)', 'number', { min: 0, max: 100 }],
    ]),
  },
  {
    key: 'intensity',
    title: 'Intensidade por Atualização',
    caption: 'Configure a magnitude de cada variação dentro dos limites.',
    fields: fields([
      [
        'intensityMode',
        'Modo de Intensidade',
        'select',
        { options: ['Percentual da Banda Diária'] },
      ],
      ['intensity', 'Intensidade Configurada (%)', 'number', { min: 0, max: 100 }],
    ]),
  },
  {
    key: 'limits',
    title: 'Limites Operacionais',
    caption: 'Defina as bandas de variação diária e mensal.',
    fields: fields([
      ['dailyCeiling', 'Teto Diário (%)'],
      ['dailyFloor', 'Piso Diário (%)'],
      ['monthlyCeiling', 'Teto Mensal (%)'],
      ['monthlyFloor', 'Piso Mensal (%)'],
    ]),
  },
  {
    key: 'buffer',
    title: 'Zona de Amortecimento das Bordas',
    caption: 'Ajuste dinâmico de probabilidade nas proximidades dos limites.',
    fields: fields([
      [
        'buffer',
        'Ativar Zona de Amortecimento',
        'check',
        {
          wide: true,
          caption:
            'Quando ativada, ajusta a chance positiva ou negativa conforme o índice se aproxima do teto ou do piso diário.',
        },
      ],
    ]),
  },
  {
    key: 'sovereign',
    title: 'Fechamento Soberano',
    caption: 'Garantia do índice final ao término do ciclo trimestral.',
    fields: fields([
      ['initialIndex', 'Índice Inicial do Ciclo', 'number', { disabled: true }],
      ['target', 'Alvo do Ciclo', 'number', { disabled: true }],
      [
        'finalIndex',
        'Índice Final Obrigatório',
        'number',
        { computed: projectedFinalIndex, disabled: true },
      ],
    ]),
  },
])
const bufferColumns = columns([
    ['range', 'Faixa'],
    ['positive', 'Chance Positiva'],
    ['negative', 'Chance Negativa'],
  ]),
  linkedColumns = columns(
    [
      'Papel',
      'Valor de entrada',
      'Índice na conexão',
      'Índice atual do motor',
      'Valor atual',
      'Variação desde conexão',
      'Status do vínculo',
    ].map((x) => [x, x]),
  )
const validationRules = [
  'Intensidade positiva menor que teto diário',
  'Intensidade negativa menor que piso diário em módulo',
  'Teto diário menor que teto mensal',
  'Piso diário em módulo menor que piso mensal em módulo',
  'Chance positiva + chance negativa = 100%',
]
const matchedContracts = computed(() =>
  (contracts.state.data || []).filter((c) =>
    foldSearch(c.name + ' ' + c.publicCode).includes(foldSearch(contractSearch.value)),
  ),
)
async function loadContracts() {
  await contracts.load(async () => {
    let all = [],
      page = 1,
      pages = 1
    do {
      const r = await financeGet('admin/contracts', { page, pageSize: 100 })
      all.push(...(r.data || []))
      pages = Math.max(1, Number(r.pagination?.totalPages || 1))
      if (pages > 10000) throw Error('Refine a consulta.')
      page++
    } while (active && page <= pages)
    return all
  })
}
async function load() {
  if (!props.recordId) {
    baseline.value = JSON.stringify(form.value)
    return
  }
  await resource.load(async () => {
    const result = await financeGet('admin/contracts/catalog/engines', {
      includeNonSelectable: true,
    })
    const row = result.data?.find((r) => r.id === props.recordId)
    if (!row) throw Error('Registro indisponível.')
    if (active) {
      source.value = row
      form.value = {
        ...initialLogic(),
        name: row.name,
        description: row.description || '',
        initialIndex: null,
        positive: null,
        negative: null,
        status: null,
      }
      baseline.value = JSON.stringify(form.value)
    }
    return row
  })
}
function unavailable() {
  error.value = 'Não foi possível salvar esta configuração. Serviço indisponível no momento.'
}
function saveDraft() {
  error.value = form.value.name.trim() ? '' : 'Informe o nome do motor.'
  if (!error.value) unavailable()
}
function confirm() {
  error.value = validateLogic(form.value)
  validationOpen.value = true
  if (!error.value) unavailable()
}
function cancel() {
  if (props.recordId && editing.value) {
    form.value = JSON.parse(baseline.value)
    editing.value = false
    error.value = ''
    emit('readonly')
  } else emit('close')
}
load()
if (!props.recordId) loadContracts()
async function loadCatalog() {
  catalogError.value = false
  try {
    const c = await getPreferenceCatalog()
    if (!Array.isArray(c.currencies)) throw Error('Catálogo indisponível.')
    if (active)
      currencyOptions.value = c.currencies.map((c) => ({
        label: c.label,
        value: c.value || c.code,
      }))
  } catch {
    if (active) catalogError.value = true
  }
}
loadCatalog()
onScopeDispose(() => {
  active = false
  resource.reset()
  contracts.reset()
})
</script>
<style scoped>
.logic-icons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.logic-icons .q-btn :deep(.q-btn__content) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.logic-icons [aria-pressed='true'] {
  color: #00a3ff;
  border-color: #00a3ff;
}
.logic-colors {
  display: flex;
  gap: 12px;
}
.logic-colors button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}
.logic-colors button[aria-pressed='true'] {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
.logic-preview {
  position: sticky;
  top: 24px;
}
.logic-preview dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.logic-preview dt {
  font-size: 11px;
}
.logic-preview dd {
  margin: 8px 0;
}
.logic-existing {
  max-width: 1552px;
  margin: auto;
}
.logic-probability {
  height: 10px;
  border-radius: 6px;
  background: rgba(241, 55, 70, 0.65);
  overflow: hidden;
  margin-top: 24px;
}
.logic-probability span {
  display: block;
  height: 100%;
  background: #4dd495;
}
</style>
