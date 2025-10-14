<template>
  <q-form class="PersonalDataLayout">
    <div class="row q-gutter-sm">
      <label-form className="col" :required="true" textLabel="Nome">
        <q-input
          outlined
          v-model="clientEdit.cliente.name"
          dense
          placeholder="Nome completo"
          :rules="nameRule"
          :error="nameError"
          :error-message="nameErrorMessage"
          @blur="onBlurName"
          @input="onInputName"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="RG">
        <q-input
          outlined
          v-model="clientEdit.cliente.rg"
          dense
          placeholder=""
        ></q-input>
      </label-form>

      <label-form className="col" :required="true" textLabel="CPF">
        <q-input
          outlined
          v-model="clientEdit.cliente.cpf"
          dense
          placeholder="000.000.000-00"
          mask="###.###.###-##"
          :rules="cpfRule"
          :error="cpfError"
          :error-message="cpfErrorMessage"
          @blur="onBlurCpf"
          @input="onInputCpf"
        ></q-input>
      </label-form>
    </div>

    <div class="row q-gutter-sm">
      <label-form className="col" textLabel="CNH">
        <q-input
          outlined
          v-model="clientEdit.cliente.cnh"
          dense
          placeholder=""
        ></q-input>
      </label-form>

      <label-form className="col" :required="true" textLabel="E-mail">
        <q-input
          outlined
          v-model="clientEdit.cliente.email"
          dense
          placeholder="email@exemplo.com"
          :rules="emailRule"
          :error="emailError"
          :error-message="emailErrorMessage"
          @blur="onBlurEmail"
          @input="onInputEmail"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="Telefone/Celular">
        <q-input
          outlined
          v-model="clientEdit.cliente.telefone"
          dense
          placeholder="000 0000-0000"
        ></q-input>
      </label-form>
    </div>

    <div class="row q-gutter-sm">
      <label-form className="col" :required="true" textLabel="Data de Nascimento">
        <q-input
          outlined
          v-model="clientEdit.cliente.birth"
          navigation-min-year-month="1990/07"
          type="date"
          dense
          placeholder="value"
          :rules="[(val) => !!val || 'Campo é obrigatorio.']"
          :error="birthError"
          :error-message="birthErrorMessage"
          @blur="onBlurBirth"
          @input="onInputBirth"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="Profissão">
        <q-select
          outlined
          v-model="clientEdit.cliente.profissao"
          :options="optionsProfission"
          dense
          placeholder="Selecione a profissão"
        ></q-select>
      </label-form>

      <label-form className="col" textLabel="Renda Anual">
        <q-select
          outlined
          v-model="clientEdit.cliente.rendaAnual"
          :options="rendaAnual"
          dense
          placeholder="Selecione a renda anual"
        ></q-select>
      </label-form>
    </div>
    
    <!-- Uploads: stacked vertically for better organization -->
    <div class="row q-gutter-sm">
      <label-form className="col" textLabel="Comprovante de Endereço" helperText=".jpg, .png, .pdf — até 5MB">
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
              :src="$filtersString.resolveUrl('img:icons/trash.svg')"
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
            class="col"
          />
        </div>
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-xs">
      <label-form className="col" textLabel="Comprovante - Certidão" helperText=".jpg, .png, .pdf — até 5MB">
        <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
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
            <q-icon
              :src="$filtersString.resolveUrl('img:icons/trash.svg')"
              size="0.8rem"
              class="text-muted"
              color="grey-4"
            />
          </div>
          <input
            type="file"
            style="display: none"
            @change="handleFileCertidao"
            multiple
            accept=".jpg, .jpeg, .png, .pdf"
            class="col-2"
          />
        </div>
      </label-form>
    </div>
  </q-form>
</template>
<script setup>
import labelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import useRules from 'src/composables/global/useRules'

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)
const { nameRule, emailRule, cpfRule } = useRules()
const uploadedFiles = ref([])
const uploadedCertidao = ref([])
// error states for inline feedback
const nameError = ref(false)
const nameErrorMessage = ref('')
const emailError = ref(false)
const emailErrorMessage = ref('')
const cpfError = ref(false)
const cpfErrorMessage = ref('')
const birthError = ref(false)
const birthErrorMessage = ref('')

// simple validation helpers that run on input change
const evaluateRule = (rules, value) => {
  if (!rules || !Array.isArray(rules)) return { ok: true }
  for (const r of rules) {
    try {
      const res = r(value)
      if (res !== true) return { ok: false, message: res }
    } catch {
      return { ok: false, message: 'Valor inválido' }
    }
  }
  return { ok: true }
}

// validate on blur and clear errors on input
const onInputName = () => {
  nameError.value = false
  nameErrorMessage.value = ''
}
const onBlurName = () => {
  const val = clientEdit.value?.cliente?.name
  const res = evaluateRule(nameRule, val)
  nameError.value = !res.ok
  nameErrorMessage.value = res.ok ? '' : res.message
}
const onInputEmail = () => {
  emailError.value = false
  emailErrorMessage.value = ''
}
const onBlurEmail = () => {
  const val = clientEdit.value?.cliente?.email
  const res = evaluateRule(emailRule, val)
  emailError.value = !res.ok
  emailErrorMessage.value = res.ok ? '' : res.message
}
const onInputCpf = () => {
  cpfError.value = false
  cpfErrorMessage.value = ''
}
const onBlurCpf = () => {
  const val = clientEdit.value?.cliente?.cpf
  const res = evaluateRule(cpfRule, val)
  cpfError.value = !res.ok
  cpfErrorMessage.value = res.ok ? '' : res.message
}
const onInputBirth = () => {
  birthError.value = false
  birthErrorMessage.value = ''
}
const onBlurBirth = () => {
  const val = clientEdit.value?.cliente?.birth
  const res = evaluateRule([(v) => !!v || 'Campo é obrigatorio.'], val)
  birthError.value = !res.ok
  birthErrorMessage.value = res.ok ? '' : res.message
}
const optionsProfission = [
  { label: 'Engenheiro', value: 'engenheiro' },
  { label: 'Médico', value: 'medico' },
  { label: 'Professor', value: 'professor' },
  { label: 'Advogado', value: 'advogado' },
  { label: 'Outro', value: 'outro' },
]
const rendaAnual = [
  { label: 'Até R$ 50.000,00', value: 'ate_50000' },
  { label: 'De R$ 50.000,00 a R$ 100.000,00', value: 'de_50000_a_100000' },
  { label: 'De R$ 100.000,00 a R$ 200.000,00', value: 'de_100000_a_200000' },
  { label: 'De R$ 200.000,00 a R$ 500.000,00', value: 'de_200000_a_500000' },
  { label: 'Acima de R$ 500.000,00', value: 'acima_de_500000' },
  { label: 'Não Informar', value: 'nao_informar' },
]
// Função para disparar o clique no input de arquivo
const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.click()
}

const triggerFileInputCertidao = () => {
  const fileInputs = document.querySelectorAll('input[type="file"]')
  const fileInput = fileInputs[fileInputs.length - 1]
  if (fileInput) fileInput.click()
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
defineComponent({
  name: 'PersonalDataLayout',
})
</script>

<style scoped>
/* Force three columns per row for the personal data form on medium+ screens.
   This ensures columns render as 33.33% even if some global styles interfere. */
@media (min-width: 960px) {
  /* Apply sizing only to the column wrapper so children can fill it */
  .PersonalDataLayout .row > .col-12.col-sm-4 {
    flex: 0 0 33.3333% !important;
    max-width: 33.3333% !important;
  }
}

/* Ensure label wrapper fills the column */
.PersonalDataLayout .row > div[class*="col-"] > .LabelForm {
  width: 100%;
}
</style>
