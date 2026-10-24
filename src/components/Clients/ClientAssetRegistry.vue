<template>
  <resource-state :state="resource.state" @retry="load">
    <section v-for="group in groups" :key="group.type" class="asset-group">
      <header>
        <h3><q-icon :name="group.icon" size="16px" />{{ group.title }}</h3>
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          class="asset-add"
          icon="add"
          :label="`Adicionar ${group.singular}`"
          :disable="saving || dialog"
          @click="edit(null, group)"
        />
      </header>
      <section v-if="dialog && selectedGroup?.type === group.type" class="asset-registry-inline">
        <q-card flat class="asset-editor">
          <header class="asset-editor-header">
            <span class="asset-editor-icon"
              ><img :src="`/icons/asset-editor/${editorIcon}.svg`" alt=""
            /></span>
            <div>
              <h3>{{ selected ? 'Editar' : 'Adicionar' }} {{ selectedGroup.singular }}</h3>
              <p>{{ editorCaption }}</p>
            </div>
            <div class="asset-editor-actions">
              <q-btn
                outline
                dense
                no-caps
                label="Descartar"
                :disable="saving"
                @click="dialog = false"
              /><q-btn
                outline
                dense
                no-caps
                :label="`Salvar ${selectedGroup.singular}`"
                :loading="saving"
                type="submit"
                :form="`asset-editor-${customerId}-${group.type}`"
              />
            </div>
          </header>
          <q-card-section>
            <resource-state :state="editor.state" @retry="loadEditor">
              <q-form
                v-if="draft"
                :id="`asset-editor-${customerId}-${group.type}`"
                @submit.prevent="save"
              >
                <q-banner v-if="error" role="alert">{{ error }}</q-banner>
                <div class="asset-editor-grid">
                  <form-section
                    v-for="section in formSections"
                    :key="section.title"
                    :title="section.title"
                    class="asset-editor-section"
                    :class="{ 'asset-editor-section--narrow': section.narrow }"
                  >
                    <template #icon
                      ><img :src="`/icons/asset-editor/${section.icon}.svg`" alt=""
                    /></template>
                    <div
                      class="asset-editor-fields"
                      :class="`asset-editor-fields--${selectedGroup.type}`"
                    >
                      <label-form
                        v-for="field in section.fields"
                        :key="field.key"
                        :text-label="field.label"
                        :class="[`asset-field--${field.key}`, { 'asset-field--wide': field.wide }]"
                      >
                        <q-toggle
                          v-if="field.type === 'toggle'"
                          v-model="draft[field.key]"
                          :aria-label="field.label"
                          :label="
                            field.key === 'paidOff'
                              ? draft.paidOff
                                ? 'Sim'
                                : 'Não'
                              : 'O ativo possui data de vencimento?'
                          "
                          color="positive"
                          :disable="saving"
                        />
                        <component
                          v-else
                          :is="field.select ? GlassSelect : QInput"
                          :model-value="editorValue(field)"
                          @update:model-value="setEditorValue(field, $event)"
                          outlined
                          dense
                          hide-bottom-space
                          :aria-label="field.label"
                          :type="field.type || 'text'"
                          :options="field.select ? fieldOptions(field) : undefined"
                          :use-input="field.select"
                          :fill-input="field.select"
                          :hide-selected="field.select"
                          @new-value="addOption"
                          :readonly="
                            field.readonly ||
                            (field.debt && draft.paidOff) ||
                            (field.term && !draft.hasFixedTerm)
                          "
                          :disable="saving"
                          :rules="
                            field.readonly ||
                            (field.debt && draft.paidOff) ||
                            (field.term && !draft.hasFixedTerm)
                              ? []
                              : fieldRules(field)
                          "
                          :min="field.type === 'number' ? 0 : undefined"
                          :step="
                            field.type === 'number'
                              ? isAssetIntegerField(field.key)
                                ? 1
                                : 'any'
                              : undefined
                          "
                        >
                          <template v-if="field.currency" #append
                            ><glass-select
                              class="asset-currency-select"
                              v-model="draft.currencyId"
                              :display-value="editorCurrencyCode"
                              :options="currencyOptions"
                              :readonly="Boolean(selected)"
                              aria-label="Moeda do patrimônio"
                              @popup-show="loadCurrencies"
                          /></template>
                        </component>
                      </label-form>
                      <div v-if="section.title === 'Parcelamento'" class="asset-installments">
                        <q-linear-progress :value="installmentProgress" color="grey-4" /><small
                          >{{ Math.round(installmentProgress * 100) }}% quitado</small
                        >
                      </div>
                      <q-btn
                        v-if="section.title === 'Características físicas'"
                        flat
                        dense
                        no-caps
                        label="+ Adicionar característica"
                        disable
                        class="asset-extra-feature"
                        ><q-tooltip
                          >A API ainda não oferece características adicionais.</q-tooltip
                        ></q-btn
                      >
                    </div>
                  </form-section>
                </div>
                <asset-document-collection
                  :ref="setAssetDocuments"
                  :key="photoEditorKey"
                  :customer-id="customerId"
                  :asset-id="editorAssetId"
                  :asset-type="selectedGroup.type"
                  editing
                  :disabled="saving"
                />
                <asset-photo-gallery
                  v-if="['RealEstate', 'Vehicle'].includes(selectedGroup.type)"
                  :ref="setPhotos"
                  :key="photoEditorKey"
                  :customer-id="customerId"
                  :asset-id="editorAssetId"
                  :asset-type="selectedGroup.type"
                  :disabled="saving"
                />
              </q-form>
            </resource-state>
          </q-card-section>
        </q-card>
      </section>
      <template v-if="!(dialog && selectedGroup?.type === group.type)">
        <p v-if="!rowsFor(group).length" class="asset-empty">
          Nenhum {{ group.singular }} registrado ainda.
        </p>
        <q-expansion-item
          v-for="asset in rowsFor(group)"
          :key="asset.id"
          class="asset-row"
          switch-toggle-side
          expand-icon="img:/icons/asset-editor/collapse.svg"
          expanded-icon="img:/icons/asset-editor/collapse.svg"
          @show="loadDocuments(asset.id)"
        >
          <template #header>
            <q-item-section avatar class="asset-row-icon"
              ><img :src="`/icons/asset-editor/${assetIcon(group.type)}.svg`" alt=""
            /></q-item-section>
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
              ><q-badge outline :color="statusTone(asset)">{{
                status(asset)
              }}</q-badge></q-item-section
            >
            <q-item-section side
              ><span class="asset-doc-count"
                ><img src="/icons/asset-editor/linked-documents.svg" alt="" />{{
                  documentCount(asset.id)
                }}</span
              ></q-item-section
            >
            <q-item-section side
              ><q-btn
                flat
                round
                dense
                size="sm"
                :aria-label="`Ações de ${asset.nickname}`"
                @click.stop
                ><img src="/icons/asset-editor/more.svg" alt="" /><q-menu class="profile-glass-menu"
                  ><q-list
                    ><q-item clickable v-close-popup :disable="dialog" @click="edit(asset, group)"
                      ><q-item-section>Editar</q-item-section></q-item
                    ></q-list
                  ></q-menu
                ></q-btn
              ></q-item-section
            >
          </template>
          <div class="asset-documents">
            <dl v-if="expandedFacts(asset).length" class="asset-expanded-facts">
              <div v-for="fact in expandedFacts(asset)" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>
                  {{
                    fact.format === 'money'
                      ? fact.value == null
                        ? 'Não informado'
                        : value({ ...asset, declaredValue: fact.value })
                      : fact.value
                  }}
                </dd>
              </div>
            </dl>
            <asset-document-collection
              :customer-id="customerId"
              :asset-id="asset.id"
              :asset-type="group.type"
              @changed="loadDocuments(asset.id)"
            />
          </div>
        </q-expansion-item>
      </template>
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
  </resource-state>
</template>
<script setup>
import { QInput } from 'quasar'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import AssetDocumentCollection from './AssetDocuments.vue'
import { computed, ref, watch, onScopeDispose } from 'vue'
import { getPreferenceCatalog } from 'src/services/customerService'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import AssetPhotoGallery from './AssetPhotoGallery.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, financeWrite, financeLabel, money } from 'src/services/financeService'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import {
  assetCurrencyCode,
  assetEditorSections,
  assetExpandedFacts,
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
const currencyCatalog = ref([])
const assetDocuments = ref(null),
  editorAssetId = ref(null)
const setAssetDocuments = (el) => {
  assetDocuments.value = el
}
const setPhotos = (el) => {
  photos.value = el
}
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
  assetDocuments.value = null
  photos.value = null
  editor.reset()
  draft.value = null
  error.value = ''
  saving.value = false
}
const activeEditor = (revision, customerId) =>
  revision === editorRevision && customerId === props.customerId && dialog.value
const groups = [
  {
    type: 'RealEstate',
    title: 'Imóveis',
    singular: 'imóvel',
    icon: 'img:/icons/client-profile/asset-real-estate.svg',
  },
  {
    type: 'Vehicle',
    title: 'Veículos',
    singular: 'veículo',
    icon: 'img:/icons/client-profile/asset-vehicle.svg',
  },
  {
    type: 'Consortium',
    title: 'Consórcios',
    singular: 'consórcio',
    icon: 'img:/icons/client-profile/asset-consortium.svg',
  },
  {
    type: 'Investment',
    title: 'Investimentos (ativos externos)',
    singular: 'investimento',
    icon: 'img:/icons/client-profile/asset-investment.svg',
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
const formSections = computed(() => assetEditorSections(selectedGroup.value?.type))

const assetIcon = (type) =>
  ({
    RealEstate: 'real-estate',
    Vehicle: 'vehicle',
    Consortium: 'consortium',
    Investment: 'investment',
  })[type]
const editorIcon = computed(() => assetIcon(selectedGroup.value?.type))
const editorCaption = computed(
  () =>
    ({
      RealEstate: 'Preencha os dados completos do patrimônio.',
      Vehicle: 'Preencha os dados completos do veículo.',
      Consortium: 'Gerencie cotas de consórcios imobiliários, veiculares e serviços.',
      Investment: 'Registre ativos financeiros externos para consolidação patrimonial.',
    })[selectedGroup.value?.type],
)
const currencyOptions = computed(() =>
  [
    ...props.currencies.map((c) => ({ label: c.currencyIsoCode, value: c.currencyId })),
    ...currencyCatalog.value
      .filter((c) => c.id)
      .map((c) => ({ label: c.code || c.value, value: c.id })),
  ].filter((o, i, all) => all.findIndex((x) => x.value === o.value) === i),
)
const editorCurrencyCode = computed(
  () =>
    currencyOptions.value.find((c) => c.value === draft.value?.currencyId)?.label ||
    assetCurrencyCode(selected.value, props.currencies) ||
    'BRL',
)
async function loadCurrencies() {
  const version = editorRevision,
    customerId = props.customerId
  try {
    const catalog = await getPreferenceCatalog()
    if (activeEditor(version, customerId)) currencyCatalog.value = catalog?.currencies || []
  } catch (e) {
    if (activeEditor(version, customerId))
      error.value = getApiErrorMessage(e, 'Não foi possível carregar as moedas.')
  }
}
const installmentProgress = computed(() =>
  draft.value?.totalInstallments > 0
    ? Math.min(1, Number(draft.value.paidInstallments || 0) / Number(draft.value.totalInstallments))
    : 0,
)
const expandedFacts = assetExpandedFacts
const statusTone = (asset) =>
  asset.assetType === 'Investment'
    ? 'grey-4'
    : asset.assetType === 'Consortium'
      ? ['Contemplated', 'Contemplado'].includes(asset.consortium?.quotaStatus)
        ? 'positive'
        : 'grey-4'
      : asset.status === 'PaidOff'
        ? 'positive'
        : 'warning'
const documentCount = (id) => {
  const state = documentResources.get(id)?.state
  return state?.data ? `${state.data.length} ${state.data.length === 1 ? 'doc' : 'docs'}` : 'Docs'
}
function editorValue(field) {
  if (field.key === 'internalId') return selected.value?.id?.slice(0, 8) || 'Gerado ao salvar'
  if (field.key === 'remainingInstallments')
    return Math.max(
      0,
      Number(draft.value.totalInstallments || 0) - Number(draft.value.paidInstallments || 0),
    )
  if (field.key === 'cityState')
    return [draft.value.city, draft.value.state].filter(Boolean).join(' / ')
  return draft.value[field.key]
}
function setEditorValue(field, value) {
  if (field.readonly) return
  if (field.key === 'cityState') {
    const i = String(value).lastIndexOf('/')
    draft.value.city = i < 0 ? value : value.slice(0, i).trim()
    if (i >= 0) draft.value.state = value.slice(i + 1).trim()
    return
  }
  draft.value[field.key] = value
}
function fieldOptions(field) {
  const key = {
    RealEstate: 'realEstate',
    Vehicle: 'vehicle',
    Consortium: 'consortium',
    Investment: 'investment',
  }[selectedGroup.value?.type]
  const options = rows.value.map((a) => a[key]?.[field.key]).filter(Boolean)
  if (draft.value?.[field.key]) options.push(draft.value[field.key])
  if (field.key === 'quotaStatus') options.push('Contemplado', 'Não contemplado')
  return [...new Set(options)]
}
const addOption = (value, done) => done(value, 'add-unique')

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
  photos.value = null
  assetDocuments.value = null
  photoEditorKey.value++
  editorAssetId.value = asset?.id || null
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
  if (result && activeEditor(revision, customerId))
    draft.value = {
      ...assetDraft(result, type),
      currencyId:
        result.currencyId ||
        props.currencies.find((c) => c.currencyIsoCode === 'BRL')?.currencyId ||
        null,
    }
}
async function save() {
  if (saving.value || !dialog.value || !draft.value || !selectedGroup.value) return
  const revision = editorRevision,
    customerId = props.customerId
  const asset = selected.value,
    photoEditor = photos.value,
    documentEditor = assetDocuments.value
  const assetBase = `admin/customers/${customerId}/assets`
  const active = () => activeEditor(revision, customerId)
  let currencyId =
    draft.value?.currencyId ||
    selected.value?.currencyId ||
    props.currencies.find((c) => c.currencyIsoCode === 'BRL')?.currencyId
  saving.value = true
  error.value = ''
  try {
    if (!currencyId) {
      const catalog = await getPreferenceCatalog()
      if (!active()) return
      currencyId = catalog?.currencies?.find((item) => (item.code || item.value) === 'BRL')?.id
    }
    if (!currencyId) throw Error('Não foi possível identificar a moeda BRL para este cadastro.')
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
    await documentEditor?.save(savedId)
    if (!active()) return
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
.asset-registry-inline {
  margin-top: 12px;
}
.asset-editor {
  border: 1px solid var(--sa-border);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
}
.asset-editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid var(--sa-border);
}
.asset-editor-header h3 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  text-transform: capitalize;
}
.asset-editor-header p {
  margin: 0;
  font-size: 12px;
  color: var(--sa-muted);
}
.asset-editor-icon,
.asset-row-icon :deep(img) {
  flex: none;
}
.asset-editor-icon {
  padding: 10px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}
.asset-editor-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.asset-editor-actions .q-btn {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
  padding: 6px 12px;
}
.asset-editor > .q-card__section {
  padding: 24px;
}
.asset-editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.asset-editor-section {
  grid-column: span 2;
  min-width: 0;
}
.asset-editor-section--narrow {
  grid-column: span 1;
}
.asset-editor :deep(.form-section) {
  padding: 0;
}
.asset-editor :deep(.form-section__title) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 500;
  color: var(--sa-muted);
}
.asset-editor-section :deep(.q-mt-md) {
  padding: 16px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
}
.asset-editor-fields {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
}
.asset-editor-fields > * {
  grid-column: span 4;
  min-width: 0;
}
.asset-editor-fields > .asset-field--nickname {
  grid-column: span 6;
}
.asset-editor-fields > .asset-field--internalId,
.asset-editor-fields > .asset-field--propertyType,
.asset-editor-fields > .asset-field--licensePlate,
.asset-editor-fields > .asset-field--manufactureYear,
.asset-editor-fields > .asset-field--modelYear {
  grid-column: span 3;
}
.asset-editor-fields--Vehicle > .asset-field--vehicleType {
  grid-column: span 3;
}
.asset-editor-fields > .asset-field--postalCode {
  grid-column: span 3;
}
.asset-editor-fields > .asset-field--addressLine {
  grid-column: span 9;
}
.asset-editor-fields > .asset-field--number {
  grid-column: span 2;
}
.asset-editor-fields > .asset-field--neighborhood {
  grid-column: span 6;
}
.asset-editor-fields > .asset-field--cityState,
.asset-editor-fields > .asset-field--productName {
  grid-column: span 12;
}
.asset-editor-fields > .asset-field--administrator,
.asset-editor-fields > .asset-field--institution {
  grid-column: span 8;
}
.asset-editor-fields > .asset-field--broker {
  grid-column: span 6;
}
.asset-editor-fields > .asset-field--groupNumber,
.asset-editor-fields > .asset-field--quotaNumber {
  grid-column: span 3;
}
.asset-editor-section--narrow .asset-editor-fields > * {
  grid-column: span 12;
}
.asset-editor-fields :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
}
.asset-editor-fields :deep(.LabelForm > .row > span) {
  color: var(--sa-muted);
  font-size: 11px !important;
  font-weight: 400 !important;
}
.asset-editor-fields :deep(.q-field__native) {
  font-size: 12px;
}
.asset-currency-select {
  width: 75px;
  font-size: 10px;
}
.asset-currency-select :deep(.q-field__control) {
  min-height: 24px !important;
  height: 24px !important;
  padding: 0 4px;
}
.asset-currency-select :deep(.q-field__marginal) {
  height: 24px;
  font-size: 12px;
}
.asset-currency-select :deep(.q-field__native) {
  min-height: 24px;
  font-size: 10px;
  padding: 0;
}
.asset-currency {
  padding: 2px 6px;
  font-size: 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 5px;
}
.asset-editor .asset-document-collection,
.asset-editor .asset-photos {
  margin-top: 28px;
}
.asset-installments {
  padding-top: 8px;
  color: var(--sa-muted);
  font-size: 10px;
}
.asset-installments small {
  display: block;
  text-align: right;
  margin-top: 6px;
}
.asset-extra-feature {
  justify-self: start;
  font-size: 11px;
}
.asset-row :deep(.q-expansion-item__toggle-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.asset-row.q-expansion-item--collapsed :deep(.q-expansion-item__toggle-icon) {
  transform: rotate(180deg);
}
.asset-doc-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  border: 1px solid var(--sa-border);
  border-radius: 6px;
  font-size: 10px;
  padding: 4px 6px;
}
.asset-expanded-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sa-border);
}
.asset-expanded-facts dt {
  color: var(--sa-muted);
  font-size: 11px;
}
.asset-expanded-facts dd {
  margin: 4px 0 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 900px) {
  .asset-editor-header {
    flex-wrap: wrap;
    padding: 16px;
  }
  .asset-editor-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .asset-editor > .q-card__section {
    padding: 16px;
  }
  .asset-editor-section--narrow {
    grid-column: span 2;
  }
  .asset-editor-fields > * {
    grid-column: span 6 !important;
  }
  .asset-editor-fields > .asset-field--cityState,
  .asset-editor-fields > .asset-field--productName {
    grid-column: span 12 !important;
  }
}
@media (max-width: 600px) {
  .asset-editor-fields > * {
    grid-column: span 12 !important;
  }
  .asset-expanded-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .asset-documents {
    padding: 12px;
  }
}
</style>
