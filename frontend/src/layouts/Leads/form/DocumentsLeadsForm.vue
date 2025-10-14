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
        <q-input outlined v-model="leadEdit.cliente.phone" dense placeholder="" class="q-my-sm" />
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
            :label="item.name"
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
            :label="item.name"
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

const { nameRule, emailRule, cpfRule } = useRules()

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
// Função para disparar o clique no input de arquivo
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const triggerFileInputCertidao = () => {
  if (fileCertidaoInput.value) fileCertidaoInput.value.click()
}

// Função para lidar com o upload de arquivos
const handleFileUpload = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFiles.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFiles.value)
  }
}
// Função para lidar com o upload de arquivos
const handleFileCertidao = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedCertidao.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFiles.value)
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
