<template>
  <section class="asset-photos" :aria-label="title" :aria-busy="loading || disabled">
    <header>
      <h4>
        <img
          :src="`/icons/asset-photos/${vehicle ? 'vehicle' : 'real-estate'}-section.svg`"
          alt=""
        />{{ title }}
      </h4>
      <span v-if="!vehicle"
        >{{ items.length }}
        {{ items.length === 1 ? 'foto selecionada' : 'fotos selecionadas' }}</span
      >
    </header>
    <p v-if="vehicle" class="asset-photos__hint">
      Adicione as fotos conforme solicitado para validação
    </p>
    <q-linear-progress v-if="loading" indeterminate aria-label="Carregando fotos" />
    <q-banner v-if="error" class="bg-transparent" role="alert"
      >{{ error }}
      <template v-if="loadFailed" #action
        ><q-btn flat no-caps label="Tentar novamente" @click="load"
      /></template>
    </q-banner>
    <div v-if="!loading && !loadFailed" class="asset-photos__grid">
      <template v-if="vehicle">
        <button
          v-for="[slot, label] in vehiclePhotoSlots"
          :key="slot"
          type="button"
          class="asset-photo"
          :class="{ 'asset-photo--empty': !inSlot(slot) }"
          :disabled="disabled"
          :aria-label="`${inSlot(slot) ? 'Visualizar' : 'Adicionar'} ${label}`"
          @click="inSlot(slot) ? preview(inSlot(slot)) : choose(slot)"
        >
          <img
            v-if="inSlot(slot)?.url"
            class="asset-photo__image"
            :src="inSlot(slot).url"
            :alt="label"
            @error="inSlot(slot).url = ''"
          />
          <span v-else-if="!inSlot(slot)" class="asset-photo__plus"
            ><img src="/icons/asset-photos/plus.svg" alt=""
          /></span>
          <img v-else class="asset-photo__placeholder" src="/icons/asset-photos/image.svg" alt="" />
          <span class="asset-photo__label">{{ label }}</span>
        </button>
      </template>
      <button
        v-for="item in looseItems"
        :key="item.key"
        type="button"
        class="asset-photo"
        :disabled="disabled"
        :aria-label="`Visualizar ${item.name}`"
        @click="preview(item)"
      >
        <img
          v-if="item.url"
          class="asset-photo__image"
          :src="item.url"
          :alt="item.name"
          @error="item.url = ''"
        />
        <img v-else class="asset-photo__placeholder" src="/icons/asset-photos/image.svg" alt="" />
        <span class="asset-photo__label">{{ item.name }}</span>
      </button>
      <button
        v-if="!vehicle"
        type="button"
        class="asset-photo asset-photo--empty"
        :disabled="disabled"
        @click="choose()"
      >
        <span class="asset-photo__plus"><img src="/icons/asset-photos/plus.svg" alt="" /></span
        ><span class="asset-photo__label">Adicionar foto</span>
      </button>
    </div>
    <input
      ref="picker"
      class="asset-photos__input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      :multiple="!vehicle"
      @change="selectFiles"
    />
    <q-dialog v-model="showPreview"
      ><q-card class="asset-photo-preview">
        <title-card :title="previewName" @on-close="showPreview = false" />
        <q-img
          v-if="previewUrl"
          :src="previewUrl"
          :alt="previewName"
          fit="contain"
          @error="
            previewError =
              'Não foi possível carregar a imagem. Feche e abra a foto para tentar novamente.'
          "
        />
        <q-banner v-if="previewError" role="alert">{{ previewError }}</q-banner>
      </q-card></q-dialog
    >
  </section>
</template>
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import { financeGet, financeWrite } from 'src/services/financeService'
import {
  getAdminDocument,
  getDocumentTemporaryUrl,
  listDocumentTypes,
  uploadCustomerDocument,
} from 'src/services/documentAdminService'
import {
  vehiclePhotoSlots,
  photoTypeCode,
  photoSlot,
  validatePhoto,
  photoUrl,
  persistPhotos,
} from 'src/services/assetPhotos'
import { getApiErrorMessage } from 'src/services/apiError'
const props = defineProps({
  customerId: { type: String, required: true },
  assetId: { type: String, default: null },
  assetType: { type: String, required: true },
  disabled: Boolean,
})
const items = ref([]),
  loading = ref(false),
  loadFailed = ref(false),
  error = ref(''),
  picker = ref(null)
const showPreview = ref(false),
  previewUrl = ref(''),
  previewName = ref(''),
  previewError = ref('')
let revision = 0,
  selectedSlot = null,
  typeId = null
const localUrls = new Set()
const vehicle = computed(() => props.assetType === 'Vehicle')
const title = computed(() => (vehicle.value ? 'Fotos do Veículo (Vistoria)' : 'Fotos do Imóvel'))
const looseItems = computed(() => items.value.filter((item) => !vehicle.value || !item.slot))
const inSlot = (slot) => items.value.find((item) => item.slot === slot)
function dispose() {
  revision++
  localUrls.forEach((url) => URL.revokeObjectURL(url))
  localUrls.clear()
  showPreview.value = false
}
async function load() {
  dispose()
  const current = revision
  items.value = []
  error.value = ''
  loading.value = true
  loadFailed.value = false
  typeId = null
  const customerId = props.customerId,
    assetId = props.assetId
  try {
    const types = await listDocumentTypes({ pageSize: 100 })
    if (current !== revision) return
    const type = (Array.isArray(types) ? types : types?.data || []).find(
      (row) => row.code === photoTypeCode(props.assetType),
    )
    if (!type?.id || !type.allowsFileUpload)
      throw new Error('O tipo documental de fotos não está disponível para upload.')
    typeId = type.id
    const docs = assetId
      ? (await financeGet(`admin/customers/${customerId}/assets/${assetId}/documents`)).data || []
      : []
    const photos = await Promise.all(
      docs
        .filter(
          (doc) => doc.documentTypeCode === type.code && /^image\//i.test(doc.contentType || ''),
        )
        .map(async (doc) => {
          const detail = vehicle.value ? await getAdminDocument(doc.documentId) : null
          let url = ''
          try {
            url = photoUrl(await getDocumentTemporaryUrl(doc.documentId))
          } catch {
            /* A thumbnail can be retried by opening it. */
          }
          return {
            key: doc.documentId,
            documentId: doc.documentId,
            name: doc.fileName || 'Foto',
            slot: photoSlot(detail?.metadata),
            linked: true,
            url,
          }
        }),
    )
    if (current !== revision) return
    // Never silently hide a second legacy image assigned to the same position.
    const used = new Set()
    items.value = photos.map((item) => {
      if (item.slot && used.has(item.slot)) item.slot = null
      if (item.slot) used.add(item.slot)
      return item
    })
  } catch (e) {
    if (current === revision) {
      error.value = getApiErrorMessage(e, 'Não foi possível carregar as fotos.')
      loadFailed.value = true
    }
  } finally {
    if (current === revision) loading.value = false
  }
}
function choose(slot = null) {
  selectedSlot = slot
  picker.value?.click()
}
function selectFiles(event) {
  const files = [...(event.target.files || [])]
  event.target.value = ''
  if (props.disabled || loading.value || loadFailed.value) return
  try {
    files.forEach(validatePhoto)
    if (vehicle.value && (files.length !== 1 || inSlot(selectedSlot))) return
    for (const file of files) {
      const url = URL.createObjectURL(file)
      localUrls.add(url)
      items.value.push({ key: url, file, name: file.name, url, slot: selectedSlot, linked: false })
    }
    error.value = ''
  } catch (e) {
    error.value = e.message
  }
}
async function preview(item) {
  const current = revision
  error.value = ''
  try {
    const url = item.file ? item.url : photoUrl(await getDocumentTemporaryUrl(item.documentId))
    if (current !== revision) return
    item.url = url
    previewUrl.value = url
    previewName.value = item.name
    previewError.value = ''
    showPreview.value = true
  } catch (e) {
    if (current === revision)
      error.value = getApiErrorMessage(e, 'Não foi possível abrir a foto. Tente novamente.')
  }
}
async function save(assetId) {
  if (!items.value.some((item) => item.file && !item.linked)) return
  if (loading.value || loadFailed.value || !typeId)
    throw new Error('Aguarde o carregamento das fotos ou tente novamente.')
  const current = revision
  await persistPhotos({
    items: items.value,
    customerId: props.customerId,
    assetId,
    typeId,
    upload: uploadCustomerDocument,
    link: (customerId, id, documentId) =>
      financeWrite('post', `admin/customers/${customerId}/assets/${id}/documents`, { documentId }),
    active: () => current === revision,
  })
}
watch(() => [props.customerId, props.assetType], load, { immediate: true })
onBeforeUnmount(dispose)
defineExpose({ save })
</script>
<style scoped>
.asset-photos {
  padding: 18px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}
.asset-photos header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.asset-photos h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  line-height: 14px;
  text-transform: uppercase;
  font-weight: 600;
}
.asset-photos h4 img {
  width: 14px;
  height: 14px;
}
.asset-photos header > span {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}
.asset-photos__hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: -8px 0 20px;
}
.asset-photos__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.asset-photo {
  position: relative;
  width: 160px;
  max-width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
  color: white;
  cursor: pointer;
  font: inherit;
}
.asset-photo--empty {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.3);
}
.asset-photo:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 3px;
}
.asset-photo:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.7);
}
.asset-photo:disabled {
  opacity: 0.6;
  cursor: wait;
}
.asset-photo__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.asset-photo__placeholder {
  width: 24px;
  height: 24px;
}
.asset-photo__label {
  font-size: 10px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 100%;
  overflow-wrap: anywhere;
}
.asset-photo__image ~ .asset-photo__label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
}
.asset-photo__plus {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}
.asset-photo__plus img {
  width: 20px;
  height: 20px;
}
.asset-photos__input {
  display: none;
}
.asset-photo-preview {
  width: min(900px, 90vw);
  max-width: 90vw;
  color: white;
  background: #101423;
}
.asset-photo-preview :deep(.q-img) {
  max-height: 75vh;
}
</style>
