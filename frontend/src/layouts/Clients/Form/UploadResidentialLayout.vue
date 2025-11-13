<template>
  <div class="UploadResidential">
    <!-- Upload de IPTU CAPA -->

    <label-form className="q-mt-sm" textLabel="IPTU Capa" helperText=".jpg, .png, .pdf — até 5MB">
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
          <div
            v-for="(item, index) in uploadedFiles"
            :key="index"
            class="row items-center q-gutter-sm"
          >
            <div
              v-if="
                item.preview &&
                (String(item.preview).startsWith('data:image') ||
                  String(item.preview).match(/\.(jpe?g|png|gif)$/i))
              "
            >
              <img
                :src="item.preview"
                alt="preview"
                style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
              />
            </div>
            <div v-else-if="item.preview">
              <q-btn
                flat
                dense
                round
                icon="picture_as_pdf"
                color="primary"
                @click.prevent.stop="openFile(item.preview)"
              />
            </div>
            <q-btn
              size="sm"
              outline
              padding="xs"
              icon="description"
              color="secondary"
              :label="displayName(item)"
              no-caps
              class="q-ma-sm text-muted"
              @click.prevent.stop="item.preview && openFile(item.preview)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              class="q-ml-sm"
              @click.prevent.stop="removeUploadedFile(index)"
            />
          </div>
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
    <!-- Upload de Quitação de débitos IPTU -->

    <label-form
      className="q-mt-sm"
      textLabel="Quitação de débitos IPTU"
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
          <div
            v-for="(item, index) in uploadedDebitos"
            :key="index"
            class="row items-center q-gutter-sm"
          >
            <div
              v-if="
                item.preview &&
                (String(item.preview).startsWith('data:image') ||
                  String(item.preview).match(/\.(jpe?g|png|gif)$/i))
              "
            >
              <img
                :src="item.preview"
                alt="preview"
                style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
              />
            </div>
            <div v-else-if="item.preview">
              <q-btn
                flat
                dense
                round
                icon="picture_as_pdf"
                color="primary"
                @click.prevent.stop="openFile(item.preview)"
              />
            </div>
            <q-btn
              size="sm"
              outline
              padding="xs"
              icon="description"
              color="secondary"
              :label="displayName(item)"
              no-caps
              class="q-ma-sm text-muted"
              @click.prevent.stop="item.preview && openFile(item.preview)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              class="q-ml-sm"
              @click.prevent.stop="removeUploadedDebitos(index)"
            />
          </div>
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

    <label-form className="q-mt-sm" textLabel="Fotos do imóvel" helperText=".jpg, .png — até 5MB">
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
          <div
            v-for="(item, index) in uploadedFotos"
            :key="index"
            class="row items-center q-gutter-sm"
          >
            <div
              v-if="
                item.preview &&
                (String(item.preview).startsWith('data:image') ||
                  String(item.preview).match(/\.(jpe?g|png|gif)$/i))
              "
            >
              <img
                :src="item.preview"
                alt="preview"
                style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
              />
            </div>
            <div v-else-if="item.preview">
              <q-btn
                flat
                dense
                round
                icon="picture_as_pdf"
                color="primary"
                @click.prevent.stop="openFile(item.preview)"
              />
            </div>
            <q-btn
              size="sm"
              outline
              padding="xs"
              icon="description"
              color="secondary"
              :label="displayName(item)"
              no-caps
              class="q-ma-sm text-muted"
              @click.prevent.stop="item.preview && openFile(item.preview)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              class="q-ml-sm"
              @click.prevent.stop="removeUploadedFotos(index)"
            />
          </div>
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
  name: 'UploadResidentialLayout',
})

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const uploadedFiles = ref([])
const uploadedDebitos = ref([])
const uploadedFotos = ref([])
const pendingNames = new Map()

// helper to upload a single file and return {url, name}
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

// ensure residential object exists to bind complemento/cep safely
try {
  if (clientEdit && clientEdit.value && !clientEdit.value.residential)
    clientEdit.value.residential = {}
} catch {
  /* ignore */
}

const openFile = (url) => {
  try {
    if (!url) return
    if (String(url).startsWith('data:')) {
      const m = url.match(/^data:(.+?);base64,(.*)$/)
      if (m) {
        const base64 = m[2]
        const binary = atob(base64)
        const len = binary.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: m[1] })
        const objUrl = URL.createObjectURL(blob)
        window.open(objUrl, '_blank')
        setTimeout(() => URL.revokeObjectURL(objUrl), 30000)
        return
      }
    }
    window.open(url, '_blank')
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug) console.debug('openFile failed', err)
  }
}
const triggerFileInput = () => {
  const fileInput = document.querySelector('.upload-certidao')
  if (fileInput) fileInput.click()
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
      // try backend b64 fallback to persist file and get /storage url
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
      if (!clientEdit.value.residential) clientEdit.value.residential = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.residential.iptu_capa = urls[0]
      else if (urls.length > 1) clientEdit.value.residential.iptu_capa = urls
      else delete clientEdit.value.residential.iptu_capa
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist iptu_capa failed', err)
  }
}
const triggerFileInputIptu = () => {
  const fileInput = document.querySelector('.upload-debitos-uptu')
  if (fileInput) fileInput.click()
}
const handleFileUploadIptu = async (event) => {
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
  uploadedDebitos.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.residential) clientEdit.value.residential = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.residential.quitacao_debitos_uptu = urls[0]
      else if (urls.length > 1) clientEdit.value.residential.quitacao_debitos_uptu = urls
      else delete clientEdit.value.residential.quitacao_debitos_uptu
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist quitacao_debitos_uptu failed', err)
  }
}
const triggerFileInputFotos = () => {
  const fileInput = document.querySelector('.upload-fotos')
  if (fileInput) fileInput.click()
}
const handleFileUploadFotos = async (event) => {
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
  uploadedFotos.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.residential) clientEdit.value.residential = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.residential.fotos_residencia = urls[0]
      else if (urls.length > 1) clientEdit.value.residential.fotos_residencia = urls
      else delete clientEdit.value.residential.fotos_residencia
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist fotos_residencia failed', err)
  }
}

// helper to resolve /storage urls to API base (same logic as PersonalDataLayout)
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

// Watch clientEdit.residential to populate previews when editing existing client
watch(
  () => clientEdit && clientEdit.value && clientEdit.value.residential,
  (residential) => {
    try {
      // Support short names under cliente first (preferred) and fall back to residential
      const iptu =
        (clientEdit &&
          clientEdit.value &&
          clientEdit.value.cliente &&
          clientEdit.value.cliente.iptu) ||
        (residential && residential.iptu_capa)
      if (iptu) {
        const arr = Array.isArray(iptu) ? iptu : [iptu]
        const items = arr.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'iptu',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
        uploadedFiles.value = items
      } else {
        uploadedFiles.value = []
      }

      const deb =
        (clientEdit &&
          clientEdit.value &&
          clientEdit.value.cliente &&
          clientEdit.value.cliente.quitacao_uptu) ||
        (residential && residential.quitacao_debitos_uptu)
      if (deb) {
        const arr2 = Array.isArray(deb) ? deb : [deb]
        const items2 = arr2.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'quitacao_uptu',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
        uploadedDebitos.value = items2
      } else {
        uploadedDebitos.value = []
      }

      const fotos =
        (clientEdit &&
          clientEdit.value &&
          clientEdit.value.cliente &&
          clientEdit.value.cliente.fotos_residencia) ||
        (residential && residential.fotos_residencia)
      if (fotos) {
        const arr3 = Array.isArray(fotos) ? fotos : [fotos]
        const items3 = arr3.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'foto',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
        uploadedFotos.value = items3
      } else {
        uploadedFotos.value = []
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('sync residential previews failed', err)
    }
  },
  { immediate: true, deep: true },
)
const removeUploadedFile = (index) => {
  const arr = Array.isArray(uploadedFiles.value) ? [...uploadedFiles.value] : []
  arr.splice(index, 1)
  uploadedFiles.value = arr
}
const removeUploadedDebitos = (index) => {
  const arr = Array.isArray(uploadedDebitos.value) ? [...uploadedDebitos.value] : []
  arr.splice(index, 1)
  uploadedDebitos.value = arr
}
const removeUploadedFotos = (index) => {
  const arr = Array.isArray(uploadedFotos.value) ? [...uploadedFotos.value] : []
  arr.splice(index, 1)
  uploadedFotos.value = arr
}
</script>
