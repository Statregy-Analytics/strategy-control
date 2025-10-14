<template>
  <div class="DocumentsPersonaLeadsForm q-pt-lg">
    <div class="row row q-mb-md q-mt-xl">
      <span class="text-bolder text-h7">Documentos Contábeis de Pessoa Jurídica</span>
    </div>
    <!-- Upload de Declaração IRPJ -->
    <label-form className="q-mt-sm" textLabel="Declaração IRPJ">
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
          class="col upload-declarao-irpj"
        />
      </div>
    </label-form>
    <!-- Upload de Recibo IRPJ -->
    <label-form className="q-mt-sm" textLabel="Declaração IRPJ">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputIrpjRecibo"
        />
        <div class="" v-if="uploadedIrpjRecibo.length > 0">
          <q-btn
            v-for="(item, index) in uploadedIrpjRecibo"
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
          @change="handleFileUploadIrpjRecibo"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-recibo-irpj"
        />
      </div>
    </label-form>

    <!-- Upload de Pro Labore -->
    <label-form className="q-mt-sm" textLabel="Pro Labore">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputLabore"
        />
        <div class="" v-if="uploadLabore.length > 0">
          <q-btn
            v-for="(item, index) in uploadLabore"
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
          @change="handleFileUploadLabore"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-labore"
        />
      </div>
    </label-form>

    <!-- Upload de  Faturamento dos últimos 9 meses-->
    <label-form className="q-mt-sm" textLabel="Faturamento dos últimos 9 meses">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputFaturamento"
        />
        <div class="" v-if="uploadedFaturamento.length > 0">
          <q-btn
            v-for="(item, index) in uploadedFaturamento"
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
          @change="handleFileUploadFaturamento"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-faturamento"
        />
      </div>
    </label-form>
    <!-- Upload de  Extrato bancário dos útimos 9 meses-->
    <label-form className="q-mt-sm" textLabel="Extrato bancário dos útimos 9 meses">
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
          ref="fileInput"
          style="display: none"
          @change="handleFileUploadExtrato"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-extrato"
        />
      </div>
    </label-form>
    <!-- Upload de  Pagamento DAS-->
    <label-form className="q-mt-sm" textLabel="PGDAS">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputDas"
        />
        <div class="" v-if="uploadedDas.length > 0">
          <q-btn
            v-for="(item, index) in uploadedDas"
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
          @change="handleFileUploadDas"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-das"
        />
      </div>
    </label-form>
    <!-- Upload de Comprovante Residencia da Empresa-->
    <label-form className="q-mt-sm" textLabel="Comprovante de Endereço da Empresa">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputCEmpresa"
        />
        <div class="" v-if="uploadedCEmpresa.length > 0">
          <q-btn
            v-for="(item, index) in uploadedCEmpresa"
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
          @change="handleFileUploadCEmpresa"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-compromante-empresa"
        />
      </div>
    </label-form>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref } from 'vue'
defineComponent({
  name: 'DocumentsPersonaLeadsForm',
})

const uploadedFiles = ref([])
// const uploadedIrpj = ref([])
const uploadedIrpjRecibo = ref([])
const uploadLabore = ref([])
const uploadedFaturamento = ref([])
const uploadedExtrato = ref([])
const uploadedDas = ref([])
const uploadedCEmpresa = ref([])
const triggerFileInput = () => {
  const fileInput = document.querySelector('.upload-negative')
  if (fileInput) fileInput.click()
}
const handleFileUpload = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFiles.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFiles.value)
  }
}
const triggerFileInputIrpjRecibo = () => {
  const fileInput = document.querySelector('.upload-recibo-irpj')
  if (fileInput) fileInput.click()
}
const handleFileUploadIrpjRecibo = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedIrpjRecibo.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedIrpjRecibo.value)
  }
}

const triggerFileInputLabore = () => {
  const fileInput = document.querySelector('.upload-labore')
  if (fileInput) fileInput.click()
}
const handleFileUploadLabore = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadLabore.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadLabore.value)
  }
}

const triggerFileInputFaturamento = () => {
  const fileInput = document.querySelector('.upload-faturamento')
  if (fileInput) fileInput.click()
}
const handleFileUploadFaturamento = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFaturamento.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFaturamento.value)
  }
}
const triggerFileInputExtrato = () => {
  const fileInput = document.querySelector('.upload-extrato')
  if (fileInput) fileInput.click()
}
const handleFileUploadExtrato = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedExtrato.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedExtrato.value)
  }
}
const triggerFileInputDas = () => {
  const fileInput = document.querySelector('.upload-das')
  if (fileInput) fileInput.click()
}
const handleFileUploadDas = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedDas.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedDas.value)
  }
}
const triggerFileInputCEmpresa = () => {
  const fileInput = document.querySelector('.upload-compromante-empresa')
  if (fileInput) fileInput.click()
}
const handleFileUploadCEmpresa = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedCEmpresa.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedCEmpresa.value)
  }
}
</script>
