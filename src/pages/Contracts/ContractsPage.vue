<template>
  <q-page class="q-pa-md">
    <title-page title="Contratos" />
    <div class="row q-col-gutter-md q-my-md items-center">
      <div class="col-12 col-sm">
        <q-input
          v-model="search"
          outlined
          dense
          debounce="350"
          placeholder="Buscar contratos"
          aria-label="Buscar contratos"
          ><template #prepend><q-icon name="search" /></template
        ></q-input>
      </div>
      <div class="col-12 col-sm-auto">
        <q-select
          v-model="registrationStatus"
          :options="registrationOptions"
          emit-value
          map-options
          outlined
          dense
          aria-label="Situação do cadastro"
        />
      </div>
      <div class="col-auto">
        <q-btn color="primary" no-caps icon="add" label="Novo contrato" @click="open()" />
      </div>
    </div>
    <finance-table
      ref="table"
      path="admin/contracts"
      :params="{ search: search || undefined, registrationStatus }"
      :columns="contractColumns"
    >
      <template #body-cell-actions="p"
        ><q-td :props="p"
          ><row-actions
            :actions="[{ name: 'open', label: 'Abrir contrato', icon: 'edit' }]"
            @select="open(p.row.id)" /></q-td
      ></template>
    </finance-table>
    <q-dialog
      v-model="dialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      :persistent="saving"
    >
      <q-card
        ><title-card title="Contrato" :disable-close="saving" /><q-separator />
        <resource-state :state="detail.state" @retry="loadDetail">
          <entity-header
            v-if="id && detail.state.data"
            :id="detail.state.data.publicCode || id"
            :name="detail.state.data.name || 'Rascunho'"
          >
            <template #status
              ><q-badge class="q-ml-md">{{
                financeLabel(detail.state.data.registrationStatus)
              }}</q-badge></template
            >
          </entity-header>
          <q-card-section>
            <q-banner v-if="error" role="alert" class="q-mb-md">{{ error }}</q-banner>
            <q-form @submit="save" :inert="saving || undefined">
              <form-section title="Dados do contrato">
                <div class="row q-col-gutter-md">
                  <label-form class="col-12" text-label="Nome"
                    ><q-input v-model="form.name" outlined dense aria-label="Nome do contrato"
                  /></label-form>
                  <label-form class="col-12 col-md-4" text-label="Data de início"
                    ><q-input
                      v-model="form.startDate"
                      type="date"
                      outlined
                      dense
                      :disable="!draft"
                      aria-label="Data de início"
                  /></label-form>
                  <label-form class="col-12 col-md-4" text-label="Prazo"
                    ><q-input
                      v-model.number="termValue"
                      type="number"
                      min="1"
                      :max="termOptions.find((option) => option.value === termUnit)?.max"
                      step="1"
                      outlined
                      dense
                      :disable="!termUnit"
                      aria-label="Prazo"
                  /></label-form>
                  <label-form class="col-12 col-md-4" text-label="Unidade do prazo"
                    ><q-select
                      v-model="termUnit"
                      :options="termOptions"
                      emit-value
                      map-options
                      outlined
                      dense
                      :disable="!termOptions.length"
                      aria-label="Unidade do prazo"
                  /></label-form>
                  <label-form v-if="!draft" class="col-12" text-label="Data final"
                    ><q-input v-model="endDate" type="date" outlined dense aria-label="Data final"
                  /></label-form>
                </div>
              </form-section>
              <form-section title="Capital e estratégia">
                <resource-state :state="catalog.state" @retry="loadCatalog">
                  <div class="row q-col-gutter-md">
                    <label-form class="col-12 col-md-4" text-label="Moeda"
                      ><currency-select
                        v-model="form.currencyId"
                        :customer-id="form.clientAllocations[0]?.clientId"
                        :current="detail.state.data?.currency"
                        :disable="!draft"
                    /></label-form>
                    <label-form class="col-12 col-md-4" text-label="Capital inicial"
                      ><q-input
                        v-model.number="form.initialContractualCapital"
                        outlined
                        dense
                        type="number"
                        min="0"
                        step="0.01"
                        :disable="!draft"
                        aria-label="Capital inicial"
                    /></label-form>
                    <label-form class="col-12 col-md-4" text-label="Origem do capital"
                      ><q-select
                        v-model="form.initialCapitalOriginId"
                        :options="catalog.state.data?.origins || []"
                        option-value="id"
                        option-label="name"
                        emit-value
                        map-options
                        outlined
                        dense
                        :disable="!draft"
                        aria-label="Origem do capital"
                    /></label-form>
                    <label-form class="col-12 col-md-6" text-label="Motor"
                      ><q-select
                        v-model="form.primaryEngineId"
                        :options="catalog.state.data?.engines || []"
                        option-value="id"
                        option-label="name"
                        emit-value
                        map-options
                        outlined
                        dense
                        :disable="!draft"
                        aria-label="Motor"
                    /></label-form>
                    <label-form class="col-12 col-md-6" text-label="Status"
                      ><q-select
                        v-model="form.initialContractStatusId"
                        :options="catalog.state.data?.statuses || []"
                        option-value="id"
                        option-label="name"
                        emit-value
                        map-options
                        outlined
                        dense
                        :disable="!draft"
                        aria-label="Status inicial"
                    /></label-form>
                  </div>
                </resource-state>
                <label-form class="q-mt-md" text-label="Observações financeiras"
                  ><q-input
                    v-model="form.financialNotes"
                    outlined
                    dense
                    type="textarea"
                    aria-label="Observações financeiras"
                /></label-form>
              </form-section>
              <form-section v-if="draft" title="Participantes">
                <div
                  v-for="(allocation, index) in form.clientAllocations"
                  :key="index"
                  class="row q-col-gutter-sm q-mb-md items-start"
                >
                  <label-form class="col-12 col-md-7" text-label="Cliente"
                    ><customer-select
                      v-model="allocation.clientId"
                      :current="participantOption(allocation.clientId)"
                  /></label-form>
                  <label-form class="col" text-label="Valor alocado"
                    ><q-input
                      v-model.number="allocation.allocatedAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      outlined
                      dense
                      aria-label="Valor alocado"
                  /></label-form>
                  <q-btn
                    flat
                    round
                    icon="close"
                    aria-label="Remover participante"
                    @click="form.clientAllocations.splice(index, 1)"
                  />
                </div>
                <q-btn
                  flat
                  dense
                  no-caps
                  icon="add"
                  label="Adicionar participante"
                  @click="form.clientAllocations.push({ clientId: null, allocatedAmount: null })"
                />
              </form-section>
              <q-btn
                type="submit"
                flat
                dense
                color="primary"
                no-caps
                :loading="saving"
                :label="draft ? 'Salvar rascunho' : 'Salvar alterações'"
              />
              <q-btn
                v-if="id && draft"
                flat
                dense
                color="primary"
                no-caps
                :disable="saving"
                label="Finalizar contrato"
                @click="confirmFinalize"
              />
            </q-form>
            <contract-sections
              v-if="id"
              :key="id"
              :contract-id="id"
              :detail="detail.state.data"
              :statuses="catalog.state.data?.statuses || []"
              @changed="onSectionChanged"
            />
          </q-card-section>
        </resource-state>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import TitlePage from 'src/components/TitlePage.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import FinanceTable from 'src/components/Finance/FinanceTable.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import CurrencySelect from 'src/components/Finance/CurrencySelect.vue'
import CustomerSelect from 'src/components/Finance/CustomerSelect.vue'
import ContractSections from 'src/components/Finance/ContractSections.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { buildDraftPayload, buildContractTerm, contractTermOptions } from 'src/services/financeModels'
import { financeGet, financeWrite, money, financeLabel, columns } from 'src/services/financeService'
const $q = useQuasar(),
  table = ref(),
  search = ref(''),
  dialog = ref(false),
  id = ref(null),
  saving = ref(false),
  error = ref('')
const registrationStatus = ref(null)
const registrationOptions = [
  { label: 'Contratos cadastrados', value: null },
  { label: 'Rascunhos', value: 'Draft' },
]
const detail = useFinanceResource(),
  catalog = useFinanceResource(),
  form = ref({}),
  termValue = ref(null),
  termUnit = ref(null),
  endDate = ref(null)
const draft = computed(() => !id.value || detail.state.data?.registrationStatus === 'Draft')
const termOptions = contractTermOptions
const contractColumns = columns([
  ['publicCode', 'Contrato'],
  ['name', 'Nome'],
  ['status', 'Status', (r) => r.businessStatus?.name || financeLabel(r.registrationStatus)],
  ['clients', 'Participantes', (r) => r.clientCount],
  ['capital', 'Capital inicial', (r) => money(r.initialContractualCapital, r.currencyCode)],
  ['actions', 'Ações'],
])
const participantOption = (clientId) => {
  const p = detail.state.data?.participants?.find((p) => p.clientId === clientId)
  return p ? { customerId: p.clientId, displayName: p.displayName } : null
}
function onSectionChanged() {
  loadDetail(false)
  table.value?.reload()
}
function empty() {
  return {
    name: null,
    startDate: null,
    currencyId: null,
    initialContractualCapital: null,
    initialCapitalOriginId: null,
    financialNotes: null,
    primaryEngineId: null,
    initialContractStatusId: null,
    clientAllocations: [],
  }
}
async function loadCatalog() {
  await catalog.load(async () => {
    const results = await Promise.all([
      ...['capital-origins', 'engines', 'statuses'].map((p) =>
        financeGet(`admin/contracts/catalog/${p}`),
      ),
    ])
    return { origins: results[0].data, engines: results[1].data, statuses: results[2].data }
  })
}
async function loadDetail(syncForm = true) {
  if (!id.value) return
  const d = await detail.load(async () => (await financeGet(`admin/contracts/${id.value}`)).data)
  if (d && syncForm) {
    form.value = {
      name: d.name,
      startDate: d.startDate,
      currencyId: d.currency?.id ?? null,
      initialContractualCapital: d.initialContractualCapital,
      initialCapitalOriginId: d.initialCapitalOrigin?.id ?? null,
      financialNotes: d.financialNotes,
      primaryEngineId: d.primaryEngine?.id ?? null,
      initialContractStatusId: d.businessStatus?.id ?? null,
      clientAllocations: d.participants.map((p) => ({
        clientId: p.clientId,
        allocatedAmount: p.allocatedAmount,
      })),
    }
    termValue.value = d.term?.value
    termUnit.value = d.term?.unit || null
    endDate.value = d.expectedEndDate
  }
}
function open(value = null) {
  id.value = value
  error.value = ''
  form.value = empty()
  termValue.value = null
  termUnit.value = null
  endDate.value = null
  detail.reset()
  dialog.value = true
  loadCatalog()
  if (value) loadDetail()
}
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    const term = buildContractTerm(
      termUnit.value || (termValue.value != null && termValue.value !== '')
        ? { value: termValue.value, unit: termUnit.value }
        : null,
    )
    const payload = draft.value
      ? buildDraftPayload(form.value, term)
      : {
          name: form.value.name,
          financialNotes: form.value.financialNotes,
          term,
          endDate: endDate.value || null,
        }
    const result = await financeWrite(
      id.value ? (draft.value ? 'put' : 'patch') : 'post',
      id.value
        ? `admin/contracts/${id.value}${draft.value ? '/draft' : ''}`
        : 'admin/contracts/drafts',
      payload,
    )
    id.value = result.id
    await loadDetail()
    registrationStatus.value = detail.state.data?.registrationStatus === 'Draft' ? 'Draft' : null
    table.value.reload()
    $q.notify({ type: 'positive', message: 'Contrato salvo.' })
  } catch (e) {
    error.value = e.response
      ? 'Não foi possível salvar. Confira os dados, os participantes e as alocações.'
      : e.message
  } finally {
    saving.value = false
  }
}
function confirmFinalize() {
  if (!termUnit.value || !termValue.value) {
    error.value =
      'Defina o prazo e sua unidade antes de finalizar.'
    return
  }
  $q.dialog({
    title: 'Finalizar contrato',
    message: 'As alterações serão salvas e o cadastro será finalizado. Confirma?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await save()
    if (error.value) return
    saving.value = true
    try {
      await financeWrite('post', `admin/contracts/${id.value}/finalize`)
      registrationStatus.value = null
      await loadDetail()
      table.value.reload()
    } catch {
      error.value =
        'Não foi possível finalizar. Confira os campos obrigatórios e a soma das alocações.'
    } finally {
      saving.value = false
    }
  })
}
const route = useRoute()
watch(() => route.query.contractId, value => {
  if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) open(value)
}, { immediate: true })
</script>
