<template>
  <div class="UploadResidencialLeadsLayout">
    <!-- Upload de IPTU CAPA -->

    <label-form className="q-mt-sm" textLabel="UPTU Capa" helperText=".jpg, .png, .pdf — até 5MB">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInput"
        />
        <div class="" v-if="uploadedFiles.length > 0">
          <q-btn
            v-for="(item, index) in uploadedFiles"
            :key="index"
            size="sm"
            outline
            padding="xs"
            icon="description"
            color="secondary"
            :label="item.name"
            no-caps
            class="q-ma-sm text-muted"
          />
          <q-icon
            :name="$filtersString.resolveUrl('img:icons/trash.svg')"
            size="0.8rem"
            class="text-muted"
            color="grey-4"
          />
        </div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-certidao"
        />
      </div>
    </label-form>
    <!-- Upload de Quitação de débitos UPTU -->

    <label-form
      className="q-mt-sm"
      textLabel="Quitação de débitos UPTU"
      helperText=".jpg, .png, .pdf — até 5MB"
    >
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputIptu"
        />
        <div class="" v-if="uploadedDebitos.length > 0">
          <q-btn
            v-for="(item, index) in uploadedDebitos"
            :key="index"
            size="sm"
            outline
            padding="xs"
            icon="description"
            color="secondary"
            :label="item.name"
            no-caps
            class="q-ma-sm text-muted"
          />
          <q-icon
            :name="$filtersString.resolveUrl('img:icons/trash.svg')"
            size="0.8rem"
            class="text-muted"
            color="grey-4"
          />
        </div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUploadIptu"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-debitos-uptu"
        />
      </div>
    </label-form>
    <!-- Upload de FOTOS da Residêcia(Tiradas pela Equipe)-->

    <label-form
      className="q-mt-sm"
      textLabel="Fotos da Residência (Tiradas pela Equipe Strategy)"
      helperText=".jpg, .png — até 5MB"
    >
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputFotos"
        />
        <div class="" v-if="uploadedFotos.length > 0">
          <q-btn
            v-for="(item, index) in uploadedFotos"
            :key="index"
            size="sm"
            outline
            padding="xs"
            icon="description"
            color="secondary"
            :label="item.name"
            no-caps
            class="q-ma-sm text-muted"
          />
          <q-icon
            :name="$filtersString.resolveUrl('img:icons/trash.svg')"
            size="0.8rem"
            class="text-muted"
            color="grey-4"
          />
        </div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUploadFotos"
          multiple
          accept=".jpg, .jpeg, .png"
          class="col upload-fotos"
        />
      </div>
    </label-form>
  </div>
</template>
<script setup>
import labelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref, watch } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'

defineComponent({
  name: 'UploadResidencialLeadsLayout',
})

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const uploadedFiles = ref([])
const uploadedDebitos = ref([])
const uploadedFotos = ref([])
const pendingNames = new Map()

const triggerFileInput = () => {
  const fileInput = document.querySelector('.upload-certidao')
  if (fileInput) fileInput.click()
}
const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedFiles.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.iptu = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.iptu = urls
          else delete clientEdit.value.cliente.iptu
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist iptu failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedFiles.value = items
}
const triggerFileInputIptu = () => {
  const fileInput = document.querySelector('.upload-debitos-uptu')
  if (fileInput) fileInput.click()
}
const handleFileUploadIptu = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedDebitos.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.quitacao_uptu = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.quitacao_uptu = urls
          else delete clientEdit.value.cliente.quitacao_uptu
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist quitacao_uptu failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedDebitos.value = items
}
const triggerFileInputFotos = () => {
  const fileInput = document.querySelector('.upload-fotos')
  if (fileInput) fileInput.click()
}
const handleFileUploadFotos = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedFotos.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.fotos_residencia = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.fotos_residencia = urls
          else delete clientEdit.value.cliente.fotos_residencia
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist fotos_residencia failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedFotos.value = items
}

function resolveStorageUrl(u) {
  try {
    if (!u) return u
    if (typeof u === 'string' && u.startsWith('/storage')) {
      const apiBase =
        (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
        'http://localhost:3333'
      return `${String(apiBase).replace(/\/$/, '')}${u}`
    }
    return u
  } catch {
    return u
  }
}

watch(
  () => clientEdit && clientEdit.value && clientEdit.value.cliente,
  (cliente) => {
    try {
      const iptu = cliente && cliente.iptu
      if (iptu) {
        const arr = Array.isArray(iptu) ? iptu : [iptu]
        uploadedFiles.value = arr.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'iptu',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedFiles.value = []

      const deb = cliente && cliente.quitacao_uptu
      if (deb) {
        const arr2 = Array.isArray(deb) ? deb : [deb]
        uploadedDebitos.value = arr2.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'quitacao_uptu',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedDebitos.value = []

      const fotos = cliente && cliente.fotos_residencia
      if (fotos) {
        const arr3 = Array.isArray(fotos) ? fotos : [fotos]
        uploadedFotos.value = arr3.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'foto',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedFotos.value = []
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('sync leads residential previews failed', err)
    }
  },
  { immediate: true, deep: true },
)
</script>
