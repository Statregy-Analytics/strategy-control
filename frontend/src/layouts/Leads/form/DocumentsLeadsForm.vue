<template>
  <div class="DocumentsLeadsForm" v-if="leadEdit && leadEdit.cliente">
    <div class="row q-mb-md">
      <span class="text-bolder text-h7">Documentos Pessoais</span>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Nome" :required="true">
        <q-input
          outlined
          v-model="leadEdit.cliente.name"
          dense
          placeholder=""
          class="q-my-sm"
          :error="!!nameError"
          :error-message="nameError"
          @blur="onBlur('name')"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="RG">
        <q-input
          outlined
          v-model="leadEdit.cliente.rg"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="CPF" :required="true">
        <q-input
          outlined
          v-model="cpfDisplay"
          dense
          placeholder=""
          class="q-my-sm"
          :error="!!cpfError"
          :error-message="cpfError"
          @blur="onBlur('cpf')"
        />
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="CNH">
        <q-input outlined v-model="leadEdit.cliente.cnh" dense placeholder="" class="q-my-sm" />
      </label-form>
      <label-form className="col" textLabel="Email" :required="true">
        <q-input
          outlined
          v-model="leadEdit.cliente.email"
          dense
          placeholder=""
          class="q-my-sm"
          :error="!!emailError"
          :error-message="emailError"
          @blur="onBlur('email')"
        />
      </label-form>
      <label-form className="col" textLabel="Telfone/Celular">
        <q-input
          outlined
          v-model="leadEdit.cliente.phone"
          dense
          placeholder="+5511912345678"
          inputmode="tel"
          :rules="phoneRole"
          class="q-my-sm"
        />
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Data de Nascimento" :required="true">
        <q-input
          outlined
          v-model="leadEdit.cliente.birth"
          dense
          type="date"
          placeholder=""
          class="q-my-sm"
          :error="!!birthError"
          :error-message="birthError"
          @blur="onBlur('birth')"
        />
      </label-form>
      <label-form className="col" textLabel="Profissão">
        <q-input outlined v-model="leadEdit.profission" dense placeholder="" class="q-my-sm" />
      </label-form>
      <label-form className="col" textLabel="Situação na RF">
        <q-input outlined v-model="leadEdit.situacao_rf" dense placeholder="" class="q-my-sm" />
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Estágio do Lead">
        <q-input outlined v-model="leadEdit.estagio_lead" dense placeholder="" class="q-my-sm" />
      </label-form>
    </div>
    <!-- Upload de Comprovante -->
    <label-form
      className="q-mt-sm col"
      textLabel="Comprovante de Endereço"
      helperText=".jpg, .png, .pdf — até 5MB"
    >
      <div class="row q-gutter-sm justify-between q-mt-xs">
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
          <q-btn flat dense round icon="delete" color="negative" @click="clearUploadedFiles" />
        </div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col"
        />
      </div>
      <div class="row q-gutter-sm justify-between q-mt-xs">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputCertidao"
        />
        <div class="" v-if="uploadedCertidao.length > 0">
          <q-btn
            v-for="(item, index) in uploadedCertidao"
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
          <q-btn flat dense round icon="delete" color="negative" @click="clearCertidao" />
        </div>
        <input
          type="file"
          ref="fileCertidaoInput"
          style="display: none"
          @change="handleFileCertidao"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col-2"
        />
      </div>
    </label-form>
  </div>
</template>
<script setup>
import { defineComponent, ref, computed, defineExpose } from 'vue'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import useRules from 'src/composables/global/useRules'
import filtersString from 'src/boot/filtersString'

defineComponent({
  name: 'DocumentsLeadsForm',
})
const leadStore = useLeadStore()
const { leadEdit } = storeToRefs(leadStore)

const { nameRule, emailRule, cpfRule, phoneRole } = useRules()

const getFirstErrorMessage = (rules, value) => {
  if (!rules || !Array.isArray(rules)) return ''
  for (const r of rules) {
    try {
      const res = r(value)
      if (res !== true) return res
    } catch {
      return 'Valor inválido'
    }
  }
  return ''
}

// touched state for progressive validation
const touched = ref({ name: false, email: false, cpf: false, birth: false })

const onBlur = (field) => {
  if (!field) return
  touched.value[field] = true
}

// expose a method so parent can mark all fields as touched (e.g., on submit)
const markAllTouched = () => {
  Object.keys(touched.value).forEach((k) => (touched.value[k] = true))
}
defineExpose({ markAllTouched })

const nameError = computed(() =>
  touched.value.name ? getFirstErrorMessage(nameRule, leadEdit.value?.cliente?.name) : '',
)
const emailError = computed(() =>
  touched.value.email ? getFirstErrorMessage(emailRule, leadEdit.value?.cliente?.email) : '',
)
const cpfError = computed(() =>
  touched.value.cpf ? getFirstErrorMessage(cpfRule, leadEdit.value?.cliente?.cpf) : '',
)
// computed para exibição formatada do CPF (mantém valor puro no modelo)
const cpfDisplay = computed({
  get() {
    return filtersString.formatCpf(leadEdit.value?.cliente?.cpf)
  },
  set(val) {
    // remove qualquer caractere não numérico ao salvar no modelo
    const digits = String(val || '').replace(/\D/g, '')
    if (!leadEdit.value) return
    if (!leadEdit.value.cliente) leadEdit.value.cliente = {}
    leadEdit.value.cliente.cpf = digits
  },
})
const birthError = computed(() => {
  if (!touched.value.birth) return ''
  const val = leadEdit.value?.cliente?.birth
  if (!val) return 'Campo é obrigatorio.'
  // basic date presence; further checks can be added
  return ''
})

const uploadedFiles = ref([])
const uploadedCertidao = ref([])
const fileInput = ref(null)
const fileCertidaoInput = ref(null)
const pendingNames = new Map()

// helper to upload a single file to backend and return {url, name}
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

// Helper to present a friendly/short filename for uploaded items
const displayName = (item) => {
  try {
    if (!item) return ''
    const n = item.name || ''
    if (typeof n === 'string' && n && !n.startsWith('data:') && n.length < 100) return n
    if (item.file && item.file.name) return item.file.name
    if (item.dataUrl && typeof pendingNames !== 'undefined' && pendingNames.has(item.dataUrl))
      return pendingNames.get(item.dataUrl)
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
// Função para disparar o clique no input de arquivo
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const triggerFileInputCertidao = () => {
  if (fileCertidaoInput.value) fileCertidaoInput.value.click()
}

// Função para lidar com o upload de arquivos (upload imediato com fallback)
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
          uploaded.push({ file: f, name: r.name, preview: r.url, dataUrl: r.url })
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
            uploaded.push({ file: f, name, preview: url, dataUrl: url })
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
    if (leadEdit && leadEdit.value && leadEdit.value.cliente) {
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) leadEdit.value.cliente.comprovante_endereco = urls[0]
      else if (urls.length > 1) leadEdit.value.cliente.comprovante_endereco = urls
      else delete leadEdit.value.cliente.comprovante_endereco
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist comprovante_endereco failed', err)
  }
}
// Função para lidar com o upload de arquivos (certidão)
const handleFileCertidao = async (event) => {
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
          uploaded.push({ file: f, name: r.name, preview: r.url, dataUrl: r.url })
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
            uploaded.push({ file: f, name: name, preview: url, dataUrl: url })
            return
          }
        }
      } catch (err) {
        void err
      }
      uploaded.push({ file: f, name: f.name, preview: dataUrl, dataUrl })
    }),
  )
  uploadedCertidao.value = uploaded
  try {
    if (leadEdit && leadEdit.value && leadEdit.value.cliente) {
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) leadEdit.value.cliente.certidao_casamento = urls[0]
      else if (urls.length > 1) leadEdit.value.cliente.certidao_casamento = urls
      else delete leadEdit.value.cliente.certidao_casamento
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist certidao_casamento failed', err)
  }
}

const clearUploadedFiles = () => {
  uploadedFiles.value = []
  if (fileInput.value) fileInput.value.value = null
}

const clearCertidao = () => {
  uploadedCertidao.value = []
  if (fileCertidaoInput.value) fileCertidaoInput.value.value = null
}
</script>
