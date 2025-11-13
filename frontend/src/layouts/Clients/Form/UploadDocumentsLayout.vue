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
            :label="displayName(item)"
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
            :label="displayName(item)"
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
            :label="displayName(item)"
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
            :label="displayName(item)"
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
        (import.meta && import.meta.env && import.meta.env.DEV ? '' : 'http://localhost:3333')
      return `${String(apiBase).replace(/\/$/, '')}${u}`
    }
    return u
  } catch {
    return u
  }
}
// Helper to present a friendly/short filename for uploaded items
const displayName = (item) => {
  try {
    if (!item) return ''
    const n = item.name || ''
    if (typeof n === 'string' && n && !n.startsWith('data:') && n.length < 100) return n
    if (item.file && item.file.name) return item.file.name
    if (item.dataUrl && pendingNames.has(item.dataUrl)) return pendingNames.get(item.dataUrl)
    const preview = item.preview || item.dataUrl || n
    if (preview && typeof preview === 'string' && preview.startsWith('/storage')) {
      const parts = preview.split('/')
      return parts[parts.length - 1] || 'arquivo'
    }
    if (typeof n === 'string' && n.startsWith('data:')) {
      const m = n.match(/^data:(.+?);base64,/) || []
      const mime = m[1]
      const ext = mime ? mime.split('/')[1] || 'bin' : 'bin'
      return `arquivo.${ext}`
    }
    if (typeof n === 'string' && n.length > 80) return `${n.slice(0, 40)}…${n.slice(-20)}`
    return String(n || 'arquivo')
  } catch (e) {
    void e
    return ''
  }
}

// openFile not needed in this component (handled by other upload components)

const triggerFileInput = () => {
  if (fileInputCertidao.value) fileInputCertidao.value.click()
}
const uploadSingleFile = async (file) => {
  try {
    const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload`, {
      method: 'POST',
      body: fd,
    })
    if (!res.ok) throw new Error('upload failed')
    const body = await res.json()
    return { url: body && body.url ? body.url : null, name: (body && body.name) || file.name }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('uploadSingleFile failed', err)
    return { url: null, name: file.name }
  }
}
const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const uploaded = []
  await Promise.all(
    arr.map(async (f) => {
      try {
        const r = await uploadSingleFile(f)
        if (r.url) {
          try {
            pendingNames.set(r.url, r.name)
          } catch (e) {
            void e
          }
          uploaded.push({
            file: f,
            name: r.name,
            preview: resolveStorageUrl(r.url),
            dataUrl: r.url,
          })
          return
        }
      } catch (e) {
        void e
      }
      // fallback to dataURL preview, but try backend b64 persistence first
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(f)
      })
      try {
        if (f && f.name) pendingNames.set(dataUrl, f.name)
      } catch (e) {
        void e
      }
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, data: dataUrl }),
        })
        if (res && res.ok) {
          const body = await res.json()
          const url = body && body.url ? body.url : null
          const name = (body && body.name) || f.name
          if (url) {
            try {
              pendingNames.set(url, name)
            } catch (e) {
              void e
            }
            uploaded.push({ file: f, name, preview: resolveStorageUrl(url), dataUrl: url })
            return
          }
        }
      } catch (err) {
        void err
      }
      uploaded.push({ file: f, name: f.name, preview: dataUrl, dataUrl })
    }),
  )
  uploadedFiles.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.certidao = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.certidao = urls
      else delete clientEdit.value.cliente.certidao
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist certidao failed', err)
  }
}

const triggerFileInputIrpf = () => {
  if (fileInputIrpf.value) fileInputIrpf.value.click()
}
const handleFileUploadIrpf = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const uploaded = []
  await Promise.all(
    arr.map(async (f) => {
      try {
        const r = await uploadSingleFile(f)
        if (r.url) {
          try {
            pendingNames.set(r.url, r.name)
          } catch (e) {
            void e
          }
          uploaded.push({
            file: f,
            name: r.name,
            preview: resolveStorageUrl(r.url),
            dataUrl: r.url,
          })
          return
        }
      } catch (e) {
        void e
      }
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(f)
      })
      try {
        if (f && f.name) pendingNames.set(dataUrl, f.name)
      } catch (e) {
        void e
      }
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, data: dataUrl }),
        })
        if (res && res.ok) {
          const body = await res.json()
          const url = body && body.url ? body.url : null
          const name = (body && body.name) || f.name
          if (url) {
            try {
              pendingNames.set(url, name)
            } catch (e) {
              void e
            }
            uploaded.push({ file: f, name, preview: resolveStorageUrl(url), dataUrl: url })
            return
          }
        }
      } catch (err) {
        void err
      }
      uploaded.push({ file: f, name: f.name, preview: dataUrl, dataUrl })
    }),
  )
  uploadedIrpf.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.irpf = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.irpf = urls
      else delete clientEdit.value.cliente.irpf
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug) console.debug('persist irpf failed', err)
  }
}

const triggerFileInputIrpfRecibo = () => {
  if (fileInputIrpfRecibo.value) fileInputIrpfRecibo.value.click()
}
const handleFileUploadIrpfRecibo = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const uploaded = []
  await Promise.all(
    arr.map(async (f) => {
      try {
        const r = await uploadSingleFile(f)
        if (r.url) {
          try {
            pendingNames.set(r.url, r.name)
          } catch (e) {
            void e
          }
          uploaded.push({
            file: f,
            name: r.name,
            preview: resolveStorageUrl(r.url),
            dataUrl: r.url,
          })
          return
        }
      } catch (e) {
        void e
      }
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(f)
      })
      try {
        if (f && f.name) pendingNames.set(dataUrl, f.name)
      } catch (e) {
        void e
      }
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, data: dataUrl }),
        })
        if (res && res.ok) {
          const body = await res.json()
          const url = body && body.url ? body.url : null
          const name = (body && body.name) || f.name
          if (url) {
            try {
              pendingNames.set(url, name)
            } catch (e) {
              void e
            }
            uploaded.push({ file: f, name, preview: resolveStorageUrl(url), dataUrl: url })
            return
          }
        }
      } catch (err) {
        void err
      }
      uploaded.push({ file: f, name: f.name, preview: dataUrl, dataUrl })
    }),
  )
  uploadedIrpfRecibo.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.irpf_recibo = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.irpf_recibo = urls
      else delete clientEdit.value.cliente.irpf_recibo
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist irpf_recibo failed', err)
  }
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
