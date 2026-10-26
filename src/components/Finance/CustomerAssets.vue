<template>
  <div>
    <finance-table
      ref="table"
      :path="`admin/customers/${customerId}/assets`"
      :columns="assetColumns"
      ><template #body-cell-actions="p"
        ><q-td :props="p"
          ><row-actions
            :actions="[{ name: 'open', label: 'Abrir patrimônio', icon: 'edit' }]"
            @select="open(p.row.id)" /></q-td></template
    ></finance-table>
    <p class="text-caption q-mt-md">
      O cadastro de novos bens ficará disponível após a definição dos tipos e situações aceitos.
    </p>
    <q-dialog
      v-model="dialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      :persistent="busy"
      ><q-card
        ><title-card
          title="Patrimônio do cliente"
          :disable-close="busy" /><q-separator /><resource-state
          :state="detail.state"
          @retry="loadDetail"
          ><template v-if="detail.state.data"
            ><entity-header :id="id" short-id :name="detail.state.data.nickname"
              ><template #status
                ><q-badge class="q-ml-md">{{
                  financeLabel(detail.state.data.status)
                }}</q-badge></template
              ></entity-header
            ><q-card-section
              ><q-banner v-if="error" role="alert">{{ error }}</q-banner>
              <q-form @submit="save" :inert="busy || undefined"
                ><form-section title="Valores declarados"
                  ><div class="row q-col-gutter-md">
                    <label-form class="col-12" text-label="Identificação do bem"
                      ><q-input
                        v-model="form.nickname"
                        outlined
                        dense
                        aria-label="Identificação do bem"
                        :rules="[(v) => !!v?.trim() || 'Informe a identificação']" /></label-form
                    ><label-form class="col-12 col-md-4" text-label="Moeda"
                      ><currency-select
                        v-model="form.currencyId"
                        @currency-code="currencyCode = $event"
                        :customer-id="customerId"
                        :current="currencyOption" /></label-form
                    ><label-form class="col-12 col-md-4" text-label="Valor declarado"
                      ><money-input
                        :currency="currencyCode"
                        v-model="form.declaredValue"
                        outlined
                        dense
                        min="0"
                        step="0.01"
                        aria-label="Valor declarado"
                        :rules="[nonNegative]" /></label-form
                    ><label-form class="col-12 col-md-4" text-label="Saldo devedor"
                      ><money-input
                        :currency="currencyCode"
                        v-model="form.remainingBalance"
                        outlined
                        dense
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label="Saldo devedor"
                        :rules="[(v) => v == null || v === '' || nonNegative(v)]"
                    /></label-form>
                  </div>
                  <q-btn
                    class="q-mt-md"
                    flat
                    dense
                    no-caps
                    label="Salvar valores"
                    color="primary"
                    type="submit"
                    :loading="busy"
                    :disable="!!detail.state.data.archivedAtUtc" /></form-section
              ></q-form>
              <form-section title="Documentos do bem"
                ><resource-state :state="documents.state" @retry="loadDocuments"
                  ><q-list separator
                    ><q-item v-for="d in documents.state.data || []" :key="d.documentId"
                      ><q-item-section>{{ d.fileName }}</q-item-section
                      ><q-item-section side
                        ><q-btn
                          flat
                          dense
                          icon="link_off"
                          aria-label="Desvincular documento"
                          :disable="busy"
                          @click="unlink(d.documentId)" /></q-item-section></q-item
                  ></q-list>
                  <p v-if="!documents.state.data?.length" class="text-muted">
                    Nenhum documento vinculado.
                  </p></resource-state
                ><customer-document-select v-model="documentId" :customer-id="customerId" /><q-btn
                  flat
                  dense
                  no-caps
                  label="Vincular documento"
                  :disable="!documentId || busy || !!detail.state.data.archivedAtUtc"
                  @click="link"
              /></form-section>
              <form-section title="Arquivamento"
                ><p class="text-caption">
                  O arquivamento retira o bem da posição ativa do cliente.
                </p>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="negative"
                  label="Arquivar bem"
                  :disable="busy || !!detail.state.data.archivedAtUtc"
                  @click="archive"
              /></form-section> </q-card-section></template></resource-state></q-card
    ></q-dialog>
  </div>
</template>
<script setup>
import MoneyInput from 'src/components/Form/MoneyInput.vue'
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import FinanceTable from './FinanceTable.vue'
import ResourceState from './ResourceState.vue'
import CurrencySelect from './CurrencySelect.vue'
import CustomerDocumentSelect from './CustomerDocumentSelect.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, financeWrite, columns, financeLabel, money } from 'src/services/financeService'
const props = defineProps({
  customerId: { type: String, required: true },
  currencies: { type: Array, default: () => [] },
})
const emit = defineEmits(['changed']),
  $q = useQuasar(),
  detail = useFinanceResource(),
  documents = useFinanceResource()
const currencyCode = ref('BRL')
const id = ref(null),
  dialog = ref(false),
  table = ref(),
  busy = ref(false),
  error = ref(''),
  form = ref({}),
  documentId = ref(null)
const currencyOption = computed(() => {
  const c = props.currencies.find((c) => c.currencyId === detail.state.data?.currencyId)
  return c ? { id: c.currencyId, name: c.currencyIsoCode } : null
})
const formatValue = (r) => {
  const currency = props.currencies.find((c) => c.currencyId === r.currencyId)
  return currency ? money(r.declaredValue, currency.currencyIsoCode) : 'Moeda indisponível'
}
const assetColumns = columns([
  ['nickname', 'Bem'],
  ['assetType', 'Tipo', (r) => financeLabel(r.assetType)],
  ['declaredValue', 'Valor declarado', formatValue],
  ['status', 'Situação', (r) => financeLabel(r.status)],
  ['actions', 'Ações'],
])
const nonNegative = (v) =>
  (v !== null && v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) ||
  'Informe um valor válido, maior ou igual a zero'
const path = (suffix) => `admin/customers/${props.customerId}/assets/${id.value}${suffix || ''}`
async function loadDetail() {
  await detail.load(async () => (await financeGet(path())).data)
  const d = detail.state.data
  if (d)
    form.value = {
      nickname: d.nickname,
      declaredValue: d.declaredValue,
      currencyId: d.currencyId,
      remainingBalance: d.remainingBalance,
    }
}
const loadDocuments = () => documents.load(async () => (await financeGet(path('/documents'))).data)
function open(value) {
  id.value = value
  error.value = ''
  documentId.value = null
  dialog.value = true
  loadDetail()
  loadDocuments()
}
async function mutate(method, suffix, payload, reload) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await financeWrite(method, path(suffix), payload)
    if (reload) await reload()
    table.value.reload()
    emit('changed')
    $q.notify({ type: 'positive', message: 'Patrimônio atualizado.' })
  } catch {
    error.value = 'Não foi possível atualizar o patrimônio. Confira os valores e tente novamente.'
  } finally {
    busy.value = false
  }
}
function save() {
  if (!form.value.currencyId) {
    error.value = 'Selecione a moeda.'
    return
  }
  const d = detail.state.data
  // Preserve the existing classification and type-specific data; do not invent enum values.
  const payload = {
    ...form.value,
    remainingBalance: form.value.remainingBalance === '' ? null : form.value.remainingBalance,
    status: d.status,
    realEstate: d.realEstate,
    vehicle: d.vehicle,
    consortium: d.consortium
      ? Object.fromEntries(
          Object.entries(d.consortium).filter(([key]) => key !== 'remainingInstallments'),
        )
      : null,
    investment: d.investment,
  }
  mutate('patch', '', payload, loadDetail)
}
function archive() {
  $q.dialog({
    title: 'Arquivar patrimônio',
    message: `Arquivar ${detail.state.data.nickname}?`,
    cancel: true,
  }).onOk(() => mutate('post', '/archive', undefined, loadDetail))
}
function unlink(document) {
  $q.dialog({
    title: 'Desvincular documento',
    message: 'Confirma a remoção do vínculo com este bem?',
    cancel: true,
  }).onOk(() => mutate('delete', `/documents/${document}`, undefined, loadDocuments))
}
function link() {
  mutate('post', '/documents', { documentId: documentId.value }, loadDocuments)
}
</script>
