<template>
  <resource-state :state="resource.state" @retry="load">
    <section v-for="group in groups" :key="group.type" class="asset-group">
      <header>
        <h3><q-icon :name="group.icon" size="18px" />{{ group.title }}</h3>
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          color="white"
          class="asset-add"
          icon="add"
          :label="`Adicionar ${group.singular}`"
          @click="edit(null, group)"
        />
      </header>
      <p v-if="!rowsFor(group).length" class="asset-empty">
        Nenhum {{ group.singular }} registrado ainda.
      </p>
      <q-expansion-item
        v-for="asset in rowsFor(group)"
        :key="asset.id"
        class="asset-row"
        @show="loadDocuments(asset.id)"
      >
        <template #header>
          <q-item-section avatar><q-icon :name="group.icon" /></q-item-section>
          <q-item-section class="asset-identity"
            ><q-item-label class="asset-name">{{ asset.nickname }}</q-item-label
            ><q-item-label caption>{{ description(asset) }}</q-item-label></q-item-section
          >
          <q-item-section side class="asset-value"
            ><strong>{{ value(asset) }}</strong
            ><small v-if="asset.status === 'Financed'"
              >Resta {{ value(asset, 'remainingBalance') }}</small
            ></q-item-section
          >
          <q-item-section side
            ><q-badge outline :color="asset.status === 'PaidOff' ? 'positive' : 'warning'">{{
              status(asset)
            }}</q-badge></q-item-section
          >
          <q-item-section side
            ><q-btn
              flat
              round
              dense
              size="sm"
              icon="edit"
              :aria-label="`Editar ${asset.nickname}`"
              :disable="!!asset.archivedAtUtc"
              @click.stop="edit(asset, group)"
          /></q-item-section>
        </template>
        <div class="asset-documents">
          <header><h4>Documentação vinculada</h4></header>
          <resource-state
            :state="documentResource(asset.id).state"
            @retry="loadDocuments(asset.id)"
          >
            <div class="asset-documents__grid">
              <profile-document-item
                v-for="doc in documentResource(asset.id).state.data || []"
                :key="doc.documentId"
                :customer-id="customerId"
                :item="{ ...doc, status: doc.documentStatus, allowedActions: [] }"
              />
            </div>
            <p v-if="!documentResource(asset.id).state.data?.length" class="text-muted">
              Nenhum documento vinculado.
            </p>
          </resource-state>
        </div>
      </q-expansion-item>
    </section>
    <entity-table-footer
      v-if="total > pageSize"
      :page="page"
      :page-size="pageSize"
      :total-items="total"
      :total-pages="Math.ceil(total / pageSize)"
      :first-item="(page - 1) * pageSize + 1"
      :last-item="Math.min(page * pageSize, total)"
      @page="changePage"
      @page-size="changeSize"
    />
    <q-dialog
      v-model="dialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width asset-registry-dialog"
      :persistent="saving"
    >
      <q-card class="asset-editor">
        <title-card
          :title="`${selected ? 'Editar' : 'Adicionar'} ${selectedGroup?.singular || 'patrimônio'}`"
          :disable-close="saving"
          @on-close="dialog = false"
        />
        <q-card-section>
          <resource-state :state="editor.state" @retry="loadEditor">
            <q-form v-if="draft" @submit.prevent="save">
              <q-banner v-if="error" class="q-mb-md" role="alert">{{ error }}</q-banner>
              <form-section
                v-for="section in formSections"
                :key="section.title"
                :title="section.title"
              >
                <div class="row q-col-gutter-md">
                  <label-form
                    v-for="field in section.fields"
                    :key="field.key"
                    :text-label="field.label"
                    :class="field.wide ? 'col-12' : 'col-12 col-sm-6'"
                  >
                    <q-input
                      v-model="draft[field.key]"
                      :aria-label="field.label"
                      outlined
                      dense
                      :type="field.type || 'text'"
                      :rules="fieldRules(field)"
                      :min="field.type === 'number' ? 0 : undefined"
                      :step="
                        field.type === 'number'
                          ? isAssetIntegerField(field.key)
                            ? 1
                            : 'any'
                          : undefined
                      "
                    />
                  </label-form>
                </div>
              </form-section>
              <form-section
                :title="
                  selectedGroup.type === 'Investment' ? 'Prazo e vencimento' : 'Situação financeira'
                "
              >
                <template v-if="selectedGroup.type === 'Investment'">
                  <q-toggle v-model="draft.hasFixedTerm" label="Prazo determinado" />
                  <div v-if="draft.hasFixedTerm" class="row q-col-gutter-md">
                    <label-form class="col-12 col-sm-6" text-label="Data de vencimento"
                      ><q-input
                        v-model="draft.maturityDate"
                        aria-label="Data de vencimento"
                        type="date"
                        outlined
                        dense
                        :rules="[required]"
                    /></label-form>
                    <label-form class="col-12 col-sm-6" text-label="Prazo em meses (opcional)"
                      ><q-input
                        v-model="draft.termMonths"
                        aria-label="Prazo em meses"
                        :rules="[assetIntegerRule]"
                        type="number"
                        min="1"
                        outlined
                        dense
                    /></label-form>
                  </div>
                </template>
                <label-form
                  v-else-if="selectedGroup.type === 'Consortium'"
                  text-label="Saldo devedor"
                >
                  <q-input
                    v-model.number="draft.remainingBalance"
                    aria-label="Saldo devedor"
                    type="number"
                    min="0"
                    step="0.01"
                    outlined
                    dense
                    :rules="[required]"
                  />
                </label-form>
                <template v-else>
                  <q-toggle v-model="draft.paidOff" label="Está quitado?" />
                  <label-form v-if="!draft.paidOff" text-label="Restante para quitação"
                    ><q-input
                      v-model.number="draft.remainingBalance"
                      aria-label="Restante para quitação"
                      type="number"
                      min="0.01"
                      step="0.01"
                      outlined
                      dense
                      :rules="[(v) => Number(v) > 0 || 'Informe um saldo devedor maior que zero']"
                  /></label-form>
                </template>
              </form-section>
              <asset-photo-gallery
                v-if="['RealEstate', 'Vehicle'].includes(selectedGroup.type)"
                ref="photos"
                :key="photoEditorKey"
                :customer-id="customerId"
                :asset-id="selected?.id || null"
                :asset-type="selectedGroup.type"
                :disabled="saving"
              />
              <div class="row justify-end q-gutter-sm q-mt-lg">
                <q-btn
                  flat
                  no-caps
                  label="Descartar"
                  :disable="saving"
                  @click="dialog = false"
                /><q-btn
                  type="submit"
                  flat
                  no-caps
                  color="primary"
                  :label="`Salvar ${selectedGroup.singular}`"
                  :loading="saving"
                />
              </div>
            </q-form>
          </resource-state>
        </q-card-section>
      </q-card>
    </q-dialog>
  </resource-state>
</template>
<script setup>
import { computed, ref, watch, onScopeDispose } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import ProfileDocumentItem from './ProfileDocumentItem.vue'
import AssetPhotoGallery from './AssetPhotoGallery.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, financeWrite, financeLabel, money } from 'src/services/financeService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import {
  assetCurrencyCode,
  assetFormSections,
  assetPayload,
  assetDraft,
  isAssetIntegerField,
  assetIntegerRule,
} from 'src/services/clientAssetProfile'
const props = defineProps({
  customerId: { type: String, required: true },
  currencies: { type: Array, default: () => [] },
})
const emit = defineEmits(['changed'])
const { successNotify, errorNotify } = useNotification()
const resource = useFinanceResource(),
  editor = useFinanceResource(),
  documentResources = new Map()
const photos = ref(null),
  photoEditorKey = ref(0)
const page = ref(1),
  pageSize = ref(100),
  dialog = ref(false),
  saving = ref(false),
  selected = ref(null),
  selectedGroup = ref(null),
  draft = ref(null),
  error = ref('')
let editorRevision = 0
function invalidateEditor() {
  editorRevision++
  editor.reset()
  draft.value = null
  error.value = ''
  saving.value = false
}
const activeEditor = (revision, customerId) =>
  revision === editorRevision && customerId === props.customerId && dialog.value
const groups = [
  { type: 'RealEstate', title: 'Imóveis', singular: 'imóvel', icon: 'home' },
  { type: 'Vehicle', title: 'Veículos', singular: 'veículo', icon: 'directions_car' },
  { type: 'Consortium', title: 'Consórcios', singular: 'consórcio', icon: 'receipt_long' },
  {
    type: 'Investment',
    title: 'Investimentos (ativos externos)',
    singular: 'investimento',
    icon: 'trending_up',
  },
]
const rows = computed(() => resource.state.data?.data || [])
const total = computed(() =>
  Number(resource.state.data?.pagination?.totalItems ?? rows.value.length),
)
const rowsFor = (group) =>
  rows.value.filter((row) => row.assetType === group.type && !row.archivedAtUtc)
const value = (asset, key = 'declaredValue') => {
  const currency = assetCurrencyCode(asset, props.currencies)
  return currency ? money(asset[key], currency) : 'Moeda não informada'
}
const description = (asset) =>
  asset.realEstate
    ? [asset.realEstate.addressLine, asset.realEstate.city, asset.realEstate.state]
        .filter(Boolean)
        .join(' · ')
    : asset.vehicle
      ? [asset.vehicle.brand, asset.vehicle.model, asset.vehicle.manufactureYear]
          .filter(Boolean)
          .join(' · ')
      : asset.consortium
        ? [
            asset.consortium.administrator,
            asset.consortium.groupNumber && `Grupo ${asset.consortium.groupNumber}`,
            asset.consortium.quotaNumber && `Cota ${asset.consortium.quotaNumber}`,
          ]
            .filter(Boolean)
            .join(' · ')
        : asset.investment
          ? [asset.investment.institution, asset.investment.investmentType]
              .filter(Boolean)
              .join(' · ')
          : ''
const status = (asset) =>
  asset.assetType === 'Investment'
    ? asset.investment?.hasFixedTerm
      ? 'Prazo determinado'
      : 'Sem vencimento'
    : asset.assetType === 'Consortium'
      ? asset.consortium?.quotaStatus || financeLabel(asset.status)
      : financeLabel(asset.status)
const required = (v) =>
  (v !== null && v !== undefined && String(v).trim() !== '') || 'Campo obrigatório'
const fieldRules = (field) => [
  ...(field.required ? [required] : []),
  ...(isAssetIntegerField(field.key) ? [assetIntegerRule] : []),
]
const formSections = computed(() => assetFormSections(selectedGroup.value?.type))
const base = () => `admin/customers/${props.customerId}/assets`
const load = () =>
  resource.load(() => financeGet(base(), { page: page.value, pageSize: pageSize.value }))
const changePage = (value) => {
  page.value = value
  load()
}
const changeSize = (value) => {
  pageSize.value = value
  page.value = 1
  load()
}
function documentResource(id) {
  if (!documentResources.has(id)) documentResources.set(id, useFinanceResource())
  return documentResources.get(id)
}
const loadDocuments = (id, customerId = props.customerId) =>
  documentResource(id).load(
    async () => (await financeGet(`admin/customers/${customerId}/assets/${id}/documents`)).data,
  )
async function edit(asset, group) {
  if (saving.value) return
  photoEditorKey.value++
  selected.value = asset
  selectedGroup.value = group
  draft.value = null
  error.value = ''
  dialog.value = true
  await loadEditor()
}
async function loadEditor() {
  if (!dialog.value || !selectedGroup.value) return
  const revision = ++editorRevision,
    customerId = props.customerId
  const asset = selected.value,
    type = selectedGroup.value.type
  const result = await editor.load(async () =>
    asset ? (await financeGet(`admin/customers/${customerId}/assets/${asset.id}`)).data : {},
  )
  if (result && activeEditor(revision, customerId)) draft.value = assetDraft(result, type)
}
async function save() {
  if (saving.value || !dialog.value || !draft.value || !selectedGroup.value) return
  const revision = editorRevision,
    customerId = props.customerId
  const asset = selected.value,
    photoEditor = photos.value
  const assetBase = `admin/customers/${customerId}/assets`
  const active = () => activeEditor(revision, customerId)
  const currencyId =
    selected.value?.currencyId ||
    props.currencies.find((c) => c.currencyIsoCode === 'BRL')?.currencyId
  if (!currencyId) {
    error.value = 'Não foi possível identificar a moeda BRL para este cadastro.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = assetPayload(
      draft.value,
      selectedGroup.value.type,
      currencyId,
      selected.value ? editor.state.data : null,
    )
    const saved = await financeWrite(
      selected.value ? 'patch' : 'post',
      `${assetBase}${asset ? `/${asset.id}` : ''}`,
      payload,
    )
    if (!active()) return
    // A partial photo failure must retry against the created asset, not create another one.
    const savedId = asset?.id || saved?.id || saved?.assetId
    if (!savedId) throw new Error('O salvamento não retornou o identificador do patrimônio.')
    if (!selected.value) {
      selected.value = { ...saved, id: savedId, currencyId }
      editor.state.data = { ...payload, ...saved }
    }
    await photoEditor?.save(savedId)
    if (!active()) return
    await loadDocuments(savedId, customerId)
    if (!active()) return
    successNotify('Patrimônio salvo.')
    emit('changed')
    dialog.value = false
    if (customerId === props.customerId) await load()
  } catch (e) {
    if (!active()) return
    error.value = getApiErrorMessage(e, 'Não foi possível salvar o patrimônio.')
    errorNotify(error.value)
  } finally {
    if (active()) saving.value = false
  }
}
watch(
  dialog,
  (open) => {
    if (!open) invalidateEditor()
  },
  { flush: 'sync' },
)
watch(
  () => props.customerId,
  () => {
    invalidateEditor()
    resource.reset()
    documentResources.forEach((item) => item.reset())
    documentResources.clear()
    dialog.value = false
    page.value = 1
    load()
  },
  { immediate: true, flush: 'sync' },
)
onScopeDispose(() => {
  invalidateEditor()
  resource.reset()
  documentResources.forEach((item) => item.reset())
})
</script>
<style scoped>
.asset-group + .asset-group {
  margin-top: 24px;
}
.asset-group > header,
.asset-documents > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 12px;
}
h3,
h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}
h3 {
  display: flex;
  align-items: center;
  gap: 8px;
}
h4 {
  color: var(--sa-muted);
  font-size: 11px;
  text-transform: uppercase;
}
.asset-row {
  margin-top: 8px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: var(--sa-surface-soft);
}
.asset-name {
  overflow-wrap: anywhere;
}
.asset-row :deep(.q-item__label--caption) {
  color: var(--sa-muted);
  overflow-wrap: anywhere;
}
.asset-value {
  color: inherit;
  font-size: 12px;
}
.asset-value small {
  margin-top: 4px;
  color: var(--sa-muted);
}
.asset-documents {
  padding: 20px;
  border-top: 1px solid var(--sa-border);
}
.asset-documents__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.asset-editor {
  color: var(--sa-text);
  background: linear-gradient(145deg, #101423, #072539);
}
.asset-editor :deep(.form-section) {
  padding: 18px 0;
}
.asset-editor :deep(.q-field__native),
.asset-editor :deep(.q-field__input),
.asset-editor :deep(.q-field__marginal) {
  color: #fff;
}
.asset-editor :deep(.q-field--outlined .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.28);
}
.asset-editor :deep(.form-section__title) {
  font-size: 12px;
  text-transform: uppercase;
}
@media (max-width: 700px) {
  .asset-row :deep(.q-item) {
    flex-wrap: wrap;
    gap: 8px;
  }
  .asset-identity {
    flex: 1 1 calc(100% - 64px);
    min-width: 0;
  }
  .asset-value {
    margin-left: 0;
  }
  .asset-documents__grid {
    grid-template-columns: 1fr;
  }
}
.asset-add {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.asset-empty {
  margin: 12px 0 0;
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
</style>
<style>
.asset-registry-dialog .q-dialog__inner {
  width: min(900px, 100vw) !important;
  max-width: 100vw !important;
}
.asset-add {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.asset-empty {
  margin: 12px 0 0;
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
</style>
