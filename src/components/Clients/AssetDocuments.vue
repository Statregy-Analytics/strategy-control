<template>
  <section
    class="asset-document-collection"
    :class="{ 'asset-document-collection--expanded': !editing }"
    :aria-busy="loading || disabled || writing"
  >
    <header>
      <h4><img src="/icons/asset-editor/documents.svg" alt="" />{{ title }}</h4>
      <q-btn
        v-if="!editing"
        flat
        dense
        no-caps
        class="asset-document-extra"
        label="+ Documento Extra"
        :disable="disabled || writing || !extraType"
        @click="choose(extraType)"
        ><q-tooltip v-if="!extraType">Tipo documental indisponível no catálogo.</q-tooltip></q-btn
      >
    </header>
    <q-linear-progress
      v-if="loading"
      indeterminate
      aria-label="Carregando documentação do patrimônio"
    />
    <p v-if="error" role="alert" class="text-negative">
      {{ error }}
      <q-btn v-if="loadFailed" flat dense no-caps label="Tentar novamente" @click="load" />
    </p>
    <div v-if="!loading && !loadFailed" class="asset-document-grid">
      <article
        v-for="slot in displaySlots"
        :key="slot.key"
        class="asset-document-card"
        :class="{ 'asset-document-card--empty': !slot.item }"
      >
        <template v-if="slot.item">
          <profile-document-item
            v-if="slot.item.documentId && !slot.item.file"
            :customer-id="customerId"
            :variant="editing ? 'asset-editor' : 'asset-expanded'"
            :caption="editing ? slot.item.fileName : ''"
            :item="{
              ...slot.item,
              documentTypeName: slot.label,
              status: slot.item.documentStatus,
              allowedActions: [],
            }"
          />
          <div v-else class="asset-document-queued">
            <span class="asset-document-pending"
              ><img src="/icons/asset-editor/pending-status.svg" alt="" />PENDENTE</span
            >
            <span class="asset-document-file"
              ><img src="/icons/asset-editor/file.svg" alt="" /></span
            ><strong>{{ slot.label }}</strong
            ><small>{{ slot.item.fileName }}</small
            ><span>Aguardando salvar</span>
          </div>
          <q-btn
            v-if="!editing && slot.item.documentStatus === 'Rejected'"
            flat
            dense
            no-caps
            class="asset-document-replace"
            label="Substituir"
            :disable="disabled || writing || !slot.type"
            @click="choose(slot.type, slot.item)"
          />
          <q-btn
            v-if="editing"
            flat
            dense
            class="asset-document-remove"
            :aria-label="`Remover ${slot.label}`"
            :disable="disabled"
            @click="remove(slot.item)"
            ><img src="/icons/asset-editor/remove.svg" alt=""
          /></q-btn>
        </template>
        <template v-else>
          <span class="asset-document-file"
            ><img
              :src="
                editing ? '/icons/asset-editor/file.svg' : '/icons/asset-editor/asset-missing.svg'
              "
              alt="" /></span
          ><span v-if="editing" class="asset-document-missing"
            ><img src="/icons/asset-editor/upload-missing.svg" alt="" width="12" height="12" />Não
            enviado</span
          ><span class="asset-missing-identity"
            ><strong>{{ slot.label }}</strong
            ><small>Nenhum arquivo</small></span
          >
          <q-btn
            flat
            dense
            no-caps
            :label="editing ? 'Enviar' : 'Upload'"
            :disable="disabled || writing || !slot.type"
            @click="choose(slot.type)"
            ><img src="/icons/asset-editor/upload.svg" alt="" /><q-tooltip v-if="!slot.type"
              >Tipo documental indisponível no catálogo.</q-tooltip
            ></q-btn
          >
        </template>
      </article>
    </div>
    <input
      ref="picker"
      class="asset-document-input"
      type="file"
      accept="application/pdf,image/jpeg,image/png"
      @change="selectFile"
    />
  </section>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import ProfileDocumentItem from './ProfileDocumentItem.vue'
import { financeGet, financeWrite } from 'src/services/financeService'
import { listDocumentTypes, uploadCustomerDocument } from 'src/services/documentAdminService'
import {
  assetDocumentSlots,
  validateAssetFile,
  persistAssetDocuments,
} from 'src/services/assetDocuments'
import { getApiErrorMessage } from 'src/services/apiError'
const props = defineProps({
  customerId: { type: String, required: true },
  assetId: { type: String, default: null },
  assetType: { type: String, required: true },
  editing: Boolean,
  disabled: Boolean,
})
const emit = defineEmits(['changed'])
const writing = ref(false)
const items = ref([]),
  types = ref([]),
  loading = ref(false),
  error = ref(''),
  loadFailed = ref(false),
  picker = ref(null)
let revision = 0,
  selectedType = null,
  selectedReplacement = null
const removed = new Set()
const title = computed(() =>
  props.editing
    ? {
        RealEstate: 'Documentação do imóvel',
        Vehicle: 'Documentação do veículo',
        Consortium: 'Documentação do consórcio',
        Investment: 'Documentação do investimento',
      }[props.assetType]
    : 'Documentação vinculada',
)
const extraType = computed(() => types.value.find((t) => t.code === 'COMPROVANTE_PATRIMONIAL'))
const displaySlots = computed(() => {
  const visible = items.value.filter(
    (i) =>
      !props.editing || !['FOTOS_IMOVEL', 'FOTOS_VISTORIA_VEICULO'].includes(i.documentTypeCode),
  )
  const slots = assetDocumentSlots(props.assetType),
    used = new Set()
  const rows = slots.flatMap((s) => {
    const matches = visible.filter((i) => i.documentTypeCode === s.code)
    matches.forEach((i) => used.add(i))
    const type = types.value.find((t) => t.code === s.code)
    return matches.length
      ? matches.map((item, n) => ({
          key: item.documentId || s.code + n,
          item,
          label: s.label,
          type,
        }))
      : [{ key: s.code, label: s.label, type }]
  })
  return [
    ...rows,
    ...visible
      .filter((i) => !used.has(i))
      .map((item, n) => ({
        key: item.documentId || 'extra' + n,
        item,
        label: item.documentTypeName || item.fileName,
      })),
  ]
})
async function load() {
  const version = ++revision,
    customerId = props.customerId,
    assetId = props.assetId
  writing.value = false
  loading.value = true
  loadFailed.value = false
  error.value = ''
  removed.clear()
  try {
    const [catalog, docs] = await Promise.all([
      listDocumentTypes({ pageSize: 100 }),
      assetId
        ? financeGet(`admin/customers/${customerId}/assets/${assetId}/documents`)
        : Promise.resolve({ data: [] }),
    ])
    if (version !== revision) return
    types.value = (Array.isArray(catalog) ? catalog : catalog.data || []).filter(
      (t) => t.isActive !== false,
    )
    items.value = docs.data || []
  } catch (e) {
    if (version === revision) {
      loadFailed.value = true
      error.value = getApiErrorMessage(e, 'Não foi possível carregar a documentação.')
    }
  } finally {
    if (version === revision) loading.value = false
  }
}
function choose(type, replacement = null) {
  if (!type || props.disabled || writing.value || loading.value) return
  selectedType = type
  selectedReplacement = replacement
  picker.value?.click()
}
async function selectFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || !selectedType || props.disabled || writing.value || loading.value) return
  const version = revision,
    owner = props.customerId
  writing.value = true
  try {
    validateAssetFile(file)
    if (selectedReplacement) remove(selectedReplacement)
    items.value.push({
      file,
      fileName: file.name,
      documentTypeId: selectedType.id,
      documentTypeCode: selectedType.code,
      documentTypeName: selectedType.name,
    })
    error.value = ''
    if (!props.editing && props.assetId) {
      await save(props.assetId)
      if (version !== revision) return
      await load()
      if (owner === props.customerId) emit('changed')
    }
  } catch (e) {
    if (owner === props.customerId)
      error.value = getApiErrorMessage(e, 'Não foi possível enviar o documento.')
  } finally {
    if (owner === props.customerId) writing.value = false
  }
}
function remove(item) {
  if (props.disabled) return
  if (item.documentId && !item.file) removed.add(item.documentId)
  items.value = items.value.filter((i) => i !== item)
}
async function save(assetId) {
  const version = revision,
    customerId = props.customerId
  await persistAssetDocuments({
    items: items.value,
    removed,
    customerId,
    assetId,
    upload: uploadCustomerDocument,
    link: (customerId, id, documentId) =>
      financeWrite('post', `admin/customers/${customerId}/assets/${id}/documents`, { documentId }),
    unlink: (customerId, id, documentId) =>
      financeWrite('delete', `admin/customers/${customerId}/assets/${id}/documents/${documentId}`),
    active: () => version === revision && props.customerId === customerId,
  })
}
watch(() => [props.customerId, props.assetId, props.assetType], load, { immediate: true })
onScopeDispose(() => {
  revision++
})
defineExpose({ save, reload: load })
</script>
<style scoped>
.asset-document-collection > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--sa-muted);
}
h4 img {
  flex: none;
}
.asset-document-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.asset-document-card {
  position: relative;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
.asset-document-card--empty {
  background: #ffffff08;
  border-color: #ffffff4d;
  border-style: dashed;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 6px;
}
.asset-document-card strong,
.asset-document-queued strong {
  display: block;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.asset-document-card small {
  font-size: 11px;
  color: var(--sa-muted);
}
.asset-document-file {
  align-self: start;
  justify-self: start;
  display: inline-flex;
  padding: 8px;
  border: 1px solid var(--sa-border);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
}
.asset-document-missing {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 108px;
  height: 21px;
  justify-content: center;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-end;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  border: 0.5px solid #fff;
  border-radius: 7px;
  padding: 1px 8px;
}
.asset-document-card .q-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 7px;
  font-size: 11px;
}
.asset-document-card--empty > .q-btn {
  width: 100%;
  margin-top: auto;
}
.asset-document-card--empty > .q-btn :deep(.q-btn__content) {
  gap: 6px;
}
.asset-document-replace {
  margin: 0 12px 12px auto;
  display: block;
}
.asset-document-remove {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 5px;
}
.asset-document-queued {
  display: grid;
  gap: 6px;
  padding-bottom: 35px;
}
.asset-document-queued span {
  font-size: 10px;
  color: #fee685;
}
.asset-missing-identity {
  min-width: 0;
}
.asset-missing-identity small {
  display: block;
  margin-top: 4px;
}
.asset-document-collection--expanded .asset-document-card--empty {
  flex-direction: row;
  align-items: center;
  min-height: 70px;
  padding: 12px;
  gap: 10px;
}
.asset-document-collection--expanded .asset-document-card--empty > .q-btn {
  width: auto;
  margin: 0 0 0 auto;
  padding: 4px 8px;
}
.asset-document-collection--expanded .asset-document-file {
  flex: none;
  border-radius: 50%;
  align-self: center;
}
.asset-document-input {
  display: none;
}
.asset-document-extra {
  color: #fff;
  border: 1px dashed var(--sa-border);
  font-size: 11px;
  border-radius: 6px;
}
.asset-document-collection--expanded .asset-document-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.asset-document-collection--expanded .asset-document-card {
  padding: 0;
}
@media (max-width: 700px) {
  .asset-document-grid,
  .asset-document-collection--expanded .asset-document-grid {
    grid-template-columns: 1fr;
  }
  .asset-document-collection > header {
    flex-wrap: wrap;
  }
}
.asset-document-pending {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 10px;
  border: 1px solid #fee685;
  border-radius: 6px;
  color: #fee685;
  background: #bb4d0033;
  padding: 1px 6px;
}
.asset-document-pending img {
  width: 12px;
  height: 12px;
}
</style>
