<template>
  <div class="DocumentsPFLeadsLayout q-pt-lg">
    <div class="row row q-mb-md q-mt-xl">
      <span class="text-bolder text-h7">Documentos Contábeis de Pessoa Física</span>
    </div>
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
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-negative"
        />
      </div>
    </label-form>
    <!-- Upload de Declaracao IRPF -->

    <label-form className="q-mt-sm" textLabel="Declaração IRPF" helperText=".jpg, .png, .pdf — até 5MB">
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
          ref="fileInput"
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
          ref="fileInput"
          style="display: none"
          @change="handleFileUploadIrpfRecibo"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-irpf"
        />
      </div>
    </label-form>

    <!-- Upload de Extrato Bancario-->

    <label-form className="q-mt-sm" textLabel="Extrato bancário dos últimos 6 meses" helperText=".jpg, .png, .pdf — até 5MB">
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
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref } from 'vue'
defineComponent({
  name: 'DocumentsPFLeadsLayout',
})

const uploadedFiles = ref([])
const uploadedIrpf = ref([])
const uploadedIrpfRecibo = ref([])
const uploadedExtrato = ref([])
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
const triggerFileInputIrpf = () => {
  const fileInput = document.querySelector('.upload-irpf')
  if (fileInput) fileInput.click()
}
const handleFileUploadIrpf = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedIrpf.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedIrpf.value)
  }
}
const triggerFileInputIrpfRecibo = () => {
  const fileInput = document.querySelector('.upload-irpf')
  if (fileInput) fileInput.click()
}
const handleFileUploadIrpfRecibo = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedIrpfRecibo.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedIrpfRecibo.value)
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
</script>
