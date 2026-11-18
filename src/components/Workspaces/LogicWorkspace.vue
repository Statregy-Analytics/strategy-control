<template>
  <div class="workspace" :class="{ 'logic-creation': !recordId }">
    <logic-history v-if="historyOpen" @close="closeHistory" />
    <header v-show="!historyOpen" class="workspace-header">
      <div>
        <q-btn v-if="recordId" flat no-caps label="Voltar para lógicas" @click="$emit('close')" />
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
            @click="saveDraft"
            ><img src="/icons/logics/create/1484-77514-imgSave.svg" alt="" />Salvar Rascunho</q-btn
          ><q-btn
            outline
            no-caps
            :disable="recordId && (!dirty || resource.state.loading || !source)"
            @click="confirm"
            ><img v-if="!recordId" src="/icons/logics/create/1484-77514-imgCheck.svg" alt="" />{{
              recordId ? 'Salvar Alterações' : 'Confirmar e Criar'
            }}</q-btn
          ></template
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
    <main v-show="!historyOpen" class="workspace-main">
      <q-banner v-if="catalogError" class="workspace-error" role="alert"
        >Não foi possível carregar as moedas.
        <q-btn flat no-caps label="Tentar novamente" @click="loadCatalog"
      /></q-banner>
      <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner
      ><resource-state :state="resource.state" @retry="load">
        <div :class="recordId ? 'logic-existing' : 'workspace-editor'">
          <logic-configuration
            v-model="configurationExpanded"
            :enabled="Boolean(recordId)"
            body-id="logic-configuration-fields"
            :intensity-invalid="intensityConstraint === false"
          >
            <logic-identity
              v-if="!recordId"
              v-model="form"
              :currencies="currencyOptions"
              :code="source?.code || ''"
            />
            <template v-for="section in sections" :key="section.title">
              <logic-creation-fields
                v-if="!recordId && ['cycle', 'intensity'].includes(section.key)"
                v-model="form"
                :kind="section.key"
              />
              <logic-frequency
                v-else-if="section.key === 'frequency'"
                v-model="form"
                :disabled="!editing"
              />
              <logic-damping-zone
                v-else-if="section.key === 'buffer'"
                v-model="form.buffer"
                :disabled="!editing"
              />
              <logic-probability
                v-else-if="section.key === 'probability'"
                v-model:positive="form.positive"
                :negative="form.negative"
                :disabled="!editing"
              />
              <logic-limits
                v-else-if="section.key === 'limits'"
                v-model="form"
                :disabled="!editing"
              />
              <logic-sovereign v-else-if="section.key === 'sovereign'" :model-value="form" />
              <profile-section v-else :title="section.title" :caption="section.caption"
                ><div class="workspace-form-grid">
                  <template v-for="field in section.fields" :key="field.key"
                    ><workspace-field
                      v-if="!field.when || field.when(form)"
                      :model-value="field.computed ? field.computed(form) : form[field.key]"
                      :field="{ ...field, disabled: field.disabled || !editing }"
                      @update:model-value="form[field.key] = $event"
                  /></template>
                </div>
              </profile-section>
            </template>
            <logic-creation-links
              v-if="!recordId"
              v-model="form.contracts"
              :state="contracts.state"
              @retry="loadContracts"
            />
          </logic-configuration>
          <logic-creation-preview
            v-if="!recordId"
            :model-value="form"
            :currencies="currencyOptions"
            :configuration-valid="!validationError"
          />
        </div>
        <template v-if="recordId"
          ><section
            ref="linksPanel"
            class="logic-links"
            tabindex="-1"
            aria-label="Papéis Vinculados ao Motor"
          >
            <profile-section
              title="Papéis Vinculados ao Motor"
              caption="Papéis possuem valor real. O motor apenas indexa a performance proporcionalmente ao índice de conexão de cada papel."
              ><q-table
                dark
                flat
                dense
                :rows="[]"
                :columns="linkedColumns"
                hide-pagination
                no-data-label="Vínculos indisponíveis nesta consulta."
            /></profile-section>
          </section>
          <logic-performance ref="performance" :editing="editing" @history="historyOpen = true" />
        </template>
      </resource-state>
    </main>
    <logic-validation
      v-if="validationOpen"
      :error="validationError"
      :rules="validationRules"
      @close="validationOpen = false"
    />
  </div>
</template>
<script setup>
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceField from './WorkspaceField.vue'
import LogicPerformance from './LogicPerformance.vue'
import LogicValidation from './LogicValidation.vue'
import LogicHistory from './LogicHistory.vue'
import LogicConfiguration from './LogicConfiguration.vue'
import LogicDampingZone from './LogicDampingZone.vue'
import LogicProbability from './LogicProbability.vue'
import LogicLimits from './LogicLimits.vue'
import LogicSovereign from './LogicSovereign.vue'
import LogicFrequency from './LogicFrequency.vue'
import LogicCreationPreview from './LogicCreationPreview.vue'
import LogicCreationFields from './LogicCreationFields.vue'
import LogicCreationLinks from './LogicCreationLinks.vue'
import LogicIdentity from './LogicIdentity.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, columns } from 'src/services/financeService'
import { getPreferenceCatalog } from 'src/services/customerService'
import {
  initialLogic,
  projectedFinalIndex,
  validateLogic,
  logicRuleResults,
  logicIntensityConstraint,
} from 'src/services/adminWorkspaceModel'
const props = defineProps({
    recordId: { type: String, default: null },
    startEditing: Boolean,
    focusLinks: Boolean,
  }),
  emit = defineEmits(['close', 'readonly'])
const performance = ref(null)
const linksPanel = ref(null)
const configurationExpanded = ref(true)
const intensityConstraint = computed(() => logicIntensityConstraint(form.value))
async function closeHistory() {
  historyOpen.value = false
  await nextTick()
  performance.value?.focusHistory()
}
const form = ref(initialLogic()),
  source = ref(null),
  editing = ref(!props.recordId || props.startEditing),
  error = ref(''),
  resource = useFinanceResource(),
  contracts = useFinanceResource(),
  currencyOptions = ref([]),
  catalogError = ref(false),
  historyOpen = ref(false),
  validationOpen = ref(false)
let active = true
watch(
  () => props.focusLinks && !resource.state.loading && !!resource.state.data,
  async (ready) => {
    if (!ready) return
    await nextTick()
    if (!active) return
    linksPanel.value?.scrollIntoView({ block: 'start' })
    linksPanel.value?.focus({ preventScroll: true })
  },
)

const baseline = ref('')
const dirty = computed(() => JSON.stringify(form.value) !== baseline.value),
  validationError = computed(() => validateLogic(form.value))
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
    fields: [],
  },
  {
    key: 'probability',
    title: 'Probabilidade Direcional Base',
    fields: [],
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
    fields: [],
  },
  {
    key: 'buffer',
    title: 'Zona de Amortecimento das Bordas',
    fields: [],
  },
  {
    key: 'sovereign',
    title: 'Fechamento Soberano',
    fields: [],
  },
])
const linkedColumns = columns(
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
const validationRules = computed(() => logicRuleResults(form.value))
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
        buffer: null,
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
.logic-links {
  scroll-margin-top: 20px;
}
@media (max-width: 1023px) {
  .logic-links {
    scroll-margin-top: 72px;
  }
}
.logic-links:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 4px;
  border-radius: 14px;
}
.logic-existing {
  max-width: 1552px;
  margin: auto;
}
</style>

<style scoped lang="scss" src="./logicCreation.scss"></style>
