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
                icon="img:/icons/section-edit/save-check.svg"
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
                greedy
                :id="`asset-editor-${customerId}-${group.type}`"
                @submit.prevent="save"
                @validation-error="validationAttempted = true"
              >
                <div
                  class="asset-validation-notice"
                  :class="{ 'asset-validation-notice--visible': error || hasInvalidFields }"
                  role="alert"
                >
                  {{
                    error ||
                    (hasInvalidFields
                      ? 'Não foi possível salvar. Revise os campos destacados.'
                      : '')
                  }}
                </div>
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
                        v-for="field in section.fields.filter(
                          (item) => !item.debt || !draft.paidOff,
                        )"
                        :key="field.key"
                        :text-label="field.label"
                        :class="[
                          `asset-field--${field.key}`,
                          {
                            'asset-field--wide': field.wide,
                            'asset-field--settled': field.key === 'paidOff' && draft.paidOff,
                          },
                        ]"
                      >
                        <div v-if="field.type === 'toggle'" class="asset-toggle-card">
                          <q-toggle
                            v-if="field.type === 'toggle'"
                            v-model="draft[field.key]"
                            :aria-label="field.label"
                            :label="draft[field.key] ? 'Sim' : 'Não'"
                            color="positive"
                            :disable="saving"
                          />
                          <small class="asset-settlement-help">{{
                            field.key === 'paidOff'
                              ? draft.paidOff
                                ? 'Quitado: sem saldo devedor. Se desativado, aparece o campo Restante para Quitação.'
                                : 'Informe o saldo devedor ao lado.'
                              : 'O ativo possui data de vencimento?'
                          }}</small>
                        </div>
                        <div
                          v-else-if="['bedrooms', 'bathrooms'].includes(field.key)"
                          class="asset-counter"
                        >
                          <q-btn
                            flat
                            dense
                            icon="remove"
                            :aria-label="`Diminuir ${field.label}`"
                            :disable="saving || !(Number(draft[field.key]) > 0)"
                            @click="
                              draft[field.key] = Math.max(0, Number(draft[field.key] || 0) - 1)
                            "
                          />
                          <q-input
                            :model-value="editorValue(field) ?? 0"
                            @update:model-value="setEditorValue(field, $event)"
                            :aria-label="field.label"
                            type="number"
                            min="0"
                            step="1"
                            dense
                            borderless
                            :disable="saving"
                            :rules="fieldRules(field)"
                          />
                          <q-btn
                            flat
                            dense
                            icon="add"
                            :aria-label="`Aumentar ${field.label}`"
                            :disable="saving"
                            @click="draft[field.key] = Number(draft[field.key] || 0) + 1"
                          />
                        </div>
                        <component
                          v-else
                          :is="
                            field.select
                              ? GlassSelect
                              : moneyFields.includes(field.key)
                                ? MoneyInput
                                : QInput
                          "
                          :currency="editorCurrencyCode || 'BRL'"
                          :model-value="editorValue(field)"
                          @update:model-value="setEditorValue(field, $event)"
                          outlined
                          dense
                          :hide-bottom-space="false"
                          bottom-slots
                          reactive-rules
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
                        <small v-if="field.key === 'contemplationMethod'" class="asset-field-help"
                          >Informe como ocorreu a contemplação para histórico.</small
                        >
                      </label-form>
                      <span
                        v-if="section.title === 'Prazo e vencimento' && !draft.hasFixedTerm"
                        class="asset-free-term"
                        >Ativo com liquidez / Prazo livre</span
                      >
                      <div v-if="section.title === 'Parcelamento'" class="asset-installments">
                        <q-linear-progress
                          :value="installmentProgress"
                          color="grey-4"
                          size="10px"
                          rounded
                        /><small>{{ Math.round(installmentProgress * 100) }}% quitado</small>
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
              ><q-badge
                outline
                class="asset-status"
                :class="`asset-status--${statusTone(asset)}`"
                :color="statusTone(asset)"
                >{{ status(asset) }}</q-badge
              ></q-item-section
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
import MoneyInput from 'src/components/Form/MoneyInput.vue'
const moneyFields = [
  'declaredValue',
  'remainingBalance',
  'initialAmount',
  'amountPaid',
  'releasedCredit',
]
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
const validationAttempted = ref(false)
const requiredMessage = (field) =>
  field.key === 'propertyType'
    ? 'Escolha um tipo na lista (ex.: Apartamento)'
    : field.label === 'Valor estimado'
      ? 'Informe o valor estimado, ex.: R$ 1.800.000,00'
      : `Informe ${field.label.toLocaleLowerCase('pt-BR')}.`
const required = (field) => (v) =>
  (v !== null && v !== undefined && String(v).trim() !== '') || requiredMessage(field)
const fieldRules = (field) => [
  ...(field.required || field.debt ? [required(field)] : []),
  ...(field.debt
    ? [(value) => Number(value) > 0 || 'Informe o saldo devedor maior que zero.']
    : []),
  ...(isAssetIntegerField(field.key) ? [assetIntegerRule] : []),
]
const hasInvalidFields = computed(
  () =>
    validationAttempted.value &&
    draft.value &&
    formSections.value.some((section) =>
      section.fields.some(
        (field) =>
          !field.readonly &&
          !(field.debt && draft.value.paidOff) &&
          !(field.term && !draft.value.hasFixedTerm) &&
          fieldRules(field).some((rule) => rule(editorValue(field)) !== true),
      ),
    ),
)
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
  validationAttempted.value = false
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
  width: 120px;
  min-height: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
  padding: 0 8px;
  color: rgba(255, 255, 255, 0.72);
}
.asset-editor-actions .q-btn:before {
  border-color: rgba(255, 255, 255, 0.12);
}
.asset-editor-actions .q-btn:last-child {
  color: #fff;
  width: auto;
  min-width: 120px;
}
.asset-editor-actions :deep(.q-btn__content) {
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
}
.asset-editor-actions :deep(.q-icon.on-left) {
  margin-right: 0;
}
.asset-editor-actions .q-btn:last-child:before {
  border-color: rgba(255, 255, 255, 0.28);
}
.asset-editor-actions .q-btn.disabled {
  opacity: 0.4 !important;
}
.asset-editor-actions :deep(.q-icon) {
  font-size: 16px;
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
.asset-editor-section :deep(> .q-mt-md) {
  padding: 20px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
}
.asset-editor-fields {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px 12px;
  align-items: start;
}
.asset-editor-fields > * {
  grid-column: span 4;
  min-width: 0;
}
.asset-editor-fields > .asset-field--nickname {
  grid-column: span 6;
}
.asset-editor-fields > .asset-field--settled {
  grid-column: span 8;
}
.asset-settlement-help {
  display: block;
  color: var(--sa-muted);
  font-size: 11px;
  line-height: 1.5;
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
.asset-editor-fields :deep(.LabelForm > span) {
  color: var(--sa-muted);
  font-size: 10px !important;
  font-weight: 500 !important;
  color: #ffffffb8;
}
.asset-editor-fields :deep(.q-field__native) {
  font-size: 12px;
}
.asset-currency-select {
  width: 53px;
  flex: none;
  font-size: 12px;
}
.asset-currency-select :deep(.q-field__control) {
  min-height: 25px !important;
  height: 25px !important;
  padding: 0 4px;
}
.asset-currency-select :deep(.q-field__marginal) {
  height: 25px;
  font-size: 10px;
}
.asset-currency-select :deep(.q-field__native) {
  min-height: 25px;
  font-size: 12px;
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

.asset-validation-notice {
  min-height: 40px;
  padding: 8px 12px;
  margin-bottom: 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
}
.asset-validation-notice--visible {
  color: #ff9e9e;
  border-color: #e7000b55;
  background: #e7000b14;
}
.asset-editor-fields :deep(.LabelForm) {
  align-content: start;
}
.asset-editor-fields :deep(.q-field--with-bottom) {
  padding-bottom: 0;
}
.asset-editor-fields :deep(.q-field__bottom) {
  height: 24px;
  min-height: 24px;
  padding: 4px 0 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
}
.asset-editor-fields :deep(.q-field--error .q-field__bottom) {
  color: #ff9e9e;
}
.asset-editor-fields :deep(.q-field--error .q-field__control:before),
.asset-editor-fields :deep(.q-field--error .q-field__control:after) {
  border: 1px solid #e7000b;
}
.asset-editor-fields :deep(.q-field__control),
.asset-editor-fields :deep(.q-field__marginal) {
  min-height: 40px;
  height: 40px;
}
.asset-toggle-card {
  border: 1px solid #ffffff1f;
  border-radius: 8px;
  background: #ffffff0d;
  padding: 12px;
}
.asset-toggle-card :deep(.q-toggle__inner) {
  width: 40px;
  height: 22px;
  min-width: 40px;
  padding: 0;
  margin-right: 8px;
}
.asset-toggle-card :deep(.q-toggle__track) {
  width: 40px;
  height: 22px;
  border: 1px solid #ffffff66;
  border-radius: 11px;
  opacity: 1;
  background: #ffffff1a;
}
.asset-toggle-card :deep(.q-toggle__inner--truthy .q-toggle__track) {
  background: #26cc7d;
}
.asset-toggle-card :deep(.q-toggle__thumb) {
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  color: white;
}
.asset-toggle-card :deep(.q-toggle__inner--truthy .q-toggle__thumb) {
  left: 21px;
}
.asset-toggle-card :deep(.q-toggle__label) {
  font-size: 12px;
}
.asset-toggle-card .asset-settlement-help {
  margin-top: 8px;
}
.asset-editor-section--narrow .asset-editor-fields > .asset-field--landAreaSquareMeters,
.asset-editor-section--narrow .asset-editor-fields > .asset-field--builtAreaSquareMeters,
.asset-editor-section--narrow .asset-editor-fields > .asset-field--bedrooms,
.asset-editor-section--narrow .asset-editor-fields > .asset-field--bathrooms,
.asset-editor-section--narrow .asset-editor-fields > .asset-field--paidInstallments,
.asset-editor-section--narrow .asset-editor-fields > .asset-field--remainingInstallments,
.asset-editor-fields > .asset-field--quotaStatus,
.asset-editor-fields > .asset-field--contemplationMethod {
  grid-column: span 6;
}
.asset-editor-fields > .asset-field--hasFixedTerm,
.asset-editor-fields > .asset-free-term,
.asset-editor-fields > .asset-installments {
  grid-column: span 12;
}
.asset-field-help {
  font-size: 11px;
  color: #ffffff99;
}
.asset-counter {
  display: flex;
  align-items: flex-start;
  height: 64px;
  position: relative;
}
.asset-counter:before {
  content: '';
  position: absolute;
  inset: 0 0 24px;
  border: 1px solid #ffffff47;
  border-radius: 8px;
}
.asset-counter .q-btn {
  width: 36px;
  height: 40px;
  flex: none;
}
.asset-counter :deep(input) {
  text-align: center;
  appearance: textfield;
}
.asset-counter :deep(input::-webkit-inner-spin-button) {
  appearance: none;
}
.asset-counter :deep(.q-field__control) {
  background: transparent;
}
.asset-currency-select :deep(.q-field__control) {
  background: #ffffff14;
  border: 1px solid #ffffff29;
  border-radius: 6px;
}
.asset-currency-select :deep(.q-field__native) {
  color: #ffffffd9;
  justify-content: center;
  font-weight: 500;
}
.asset-currency-select :deep(.q-select__dropdown-icon) {
  width: 10px;
  height: 10px;
  font-size: 10px;
}
.asset-currency-select :deep(.q-field__marginal) {
  min-height: 25px;
  height: 25px;
  padding-left: 2px;
}
.asset-installments :deep(.q-linear-progress) {
  color: #ffffffb8 !important;
  background: #ffffff1a;
}
.asset-installments :deep(.q-linear-progress__track) {
  opacity: 0;
}
.asset-free-term {
  justify-self: start;
  padding: 6px 10px;
  border: 1px solid #ffffff33;
  border-radius: 6px;
  font-size: 11px;
  color: #ffffffb8;
}
.asset-row :deep(> .q-expansion-item__container > .q-item) {
  min-height: 92px;
  padding: 16px;
}
.asset-row-icon {
  min-width: 52px;
  padding-right: 12px;
}
.asset-row-icon img {
  width: 40px;
  height: 40px;
  padding: 10px;
  border: 1px solid #ffffff29;
  border-radius: 8px;
  background: linear-gradient(120deg, #ffffff14, #ffffff08);
}
.asset-identity .asset-name {
  font-size: 14px;
  line-height: 20px;
}
.asset-identity :deep(.q-item__label--caption) {
  margin-top: 6px;
  font-size: 11px;
}
.asset-status--positive {
  color: #74ffa0 !important;
  border-color: #74ffa0;
  background: #007a5533;
}
.asset-doc-count {
  color: white;
  border-color: #ffffff66;
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
  .asset-validation-notice {
    min-height: 64px;
  }
  .asset-editor-actions {
    flex-wrap: wrap;
  }
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
