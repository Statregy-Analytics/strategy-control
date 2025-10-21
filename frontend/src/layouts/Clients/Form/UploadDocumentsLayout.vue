<template>
  <div class="UplaodDocumentsLayout">
    <!-- Upload de Certidão negativa de debitos -->

    <label-form
      className="q-mt-sm"
      textLabel="Certidão negativa de débitos relativos aos tributos federais e à dívida da ativa da união"
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
          ref="fileInputCertidao"
          style="display: none"
          @change="handleFileUpload"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-negative"
        />
      </div>
    </label-form>
    <!-- Upload de Declaracao IRPF -->

    <label-form
      className="q-mt-sm"
      textLabel="Declaração IRPF"
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
          @click="triggerFileInputIrpf"
        />
        <div class="" v-if="uploadedIrpf.length > 0">
          <q-btn
            v-for="(item, index) in uploadedIrpf"
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
          ref="fileInputIrpf"
          style="display: none"
          @change="handleFileUploadIrpf"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-irpf"
        />
      </div>
    </label-form>

    <!-- Upload de Recibo IRPF -->

    <label-form className="q-mt-sm" textLabel="Recibo IRPF" helperText=".jpg, .png, .pdf — até 5MB">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputIrpfRecibo"
        />
        <div class="" v-if="uploadedIrpfRecibo.length > 0">
          <q-btn
            v-for="(item, index) in uploadedIrpfRecibo"
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
          ref="fileInputIrpfRecibo"
          style="display: none"
          @change="handleFileUploadIrpfRecibo"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-irpf-recibo"
        />
      </div>
    </label-form>

    <!-- Upload de Extrato Bancario-->

    <label-form
      className="q-mt-sm"
      textLabel="Extrato bancário dos últimos 6 meses"
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
          @click="triggerFileInputExtrato"
        />
        <div class="" v-if="uploadedExtrato.length > 0">
          <q-btn
            v-for="(item, index) in uploadedExtrato"
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
          ref="fileInputExtrato"
          style="display: none"
          @change="handleFileUploadExtrato"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-extrato"
        />
      </div>
    </label-form>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref, watch } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'

defineComponent({
  name: 'UploadDocumentsLayout',
})

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const fileInputCertidao = ref(null)
const fileInputIrpf = ref(null)
const fileInputIrpfRecibo = ref(null)
const fileInputExtrato = ref(null)

const uploadedFiles = ref([])
const uploadedIrpf = ref([])
const uploadedIrpfRecibo = ref([])
const uploadedExtrato = ref([])
const pendingNames = new Map()

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

// openFile not needed in this component (handled by other upload components)

const triggerFileInput = () => {
  if (fileInputCertidao.value) fileInputCertidao.value.click()
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
          if (urls.length === 1) clientEdit.value.cliente.certidao = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.certidao = urls
          else delete clientEdit.value.cliente.certidao
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist certidao failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedFiles.value = items
}

const triggerFileInputIrpf = () => {
  if (fileInputIrpf.value) fileInputIrpf.value.click()
}
const handleFileUploadIrpf = (event) => {
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
      uploadedIrpf.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.irpf = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.irpf = urls
          else delete clientEdit.value.cliente.irpf
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist irpf failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedIrpf.value = items
}

const triggerFileInputIrpfRecibo = () => {
  if (fileInputIrpfRecibo.value) fileInputIrpfRecibo.value.click()
}
const handleFileUploadIrpfRecibo = (event) => {
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
      uploadedIrpfRecibo.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.irpf_recibo = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.irpf_recibo = urls
          else delete clientEdit.value.cliente.irpf_recibo
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist irpf_recibo failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedIrpfRecibo.value = items
}

const triggerFileInputExtrato = () => {
  if (fileInputExtrato.value) fileInputExtrato.value.click()
}
const handleFileUploadExtrato = (event) => {
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
      uploadedExtrato.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.extrato = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.extrato = urls
          else delete clientEdit.value.cliente.extrato
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist extrato failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedExtrato.value = items
}

// Watch clientEdit.cliente to repopulate previews
watch(
  () => clientEdit && clientEdit.value && clientEdit.value.cliente,
  (cliente) => {
    try {
      const cert = cliente && cliente.certidao
      if (cert) {
        const arr = Array.isArray(cert) ? cert : [cert]
        uploadedFiles.value = arr.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'certidao',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedFiles.value = []

      const irpf = cliente && cliente.irpf
      if (irpf) {
        const arr2 = Array.isArray(irpf) ? irpf : [irpf]
        uploadedIrpf.value = arr2.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'irpf',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedIrpf.value = []

      const recibo = cliente && cliente.irpf_recibo
      if (recibo) {
        const arr3 = Array.isArray(recibo) ? recibo : [recibo]
        uploadedIrpfRecibo.value = arr3.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'irpf_recibo',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedIrpfRecibo.value = []

      const extr = cliente && cliente.extrato
      if (extr) {
        const arr4 = Array.isArray(extr) ? extr : [extr]
        uploadedExtrato.value = arr4.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'extrato',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedExtrato.value = []
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('sync documents previews failed', err)
    }
  },
  { immediate: true, deep: true },
)
</script>
