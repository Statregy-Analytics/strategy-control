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

    <label-form className="q-mt-sm" textLabel="Quitação de débitos UPTU" helperText=".jpg, .png, .pdf — até 5MB">
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

    <label-form className="q-mt-sm" textLabel="Fotos da Residência (Tiradas pela Equipe Strategy)" helperText=".jpg, .png — até 5MB">
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
import { defineComponent, ref } from 'vue'
defineComponent({
  name: 'UploadResidencialLeadsLayout',
})
const uploadedFiles = ref([])
const uploadedDebitos = ref([])
const uploadedFotos = ref([])
const triggerFileInput = () => {
  const fileInput = document.querySelector('.upload-certidao')
  if (fileInput) fileInput.click()
}
const handleFileUpload = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFiles.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFiles.value)
  }
}
const triggerFileInputIptu = () => {
  const fileInput = document.querySelector('.upload-debitos-uptu')
  if (fileInput) fileInput.click()
}
const handleFileUploadIptu = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedDebitos.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedDebitos.value)
  }
}
const triggerFileInputFotos = () => {
  const fileInput = document.querySelector('.upload-fotos')
  if (fileInput) fileInput.click()
}
const handleFileUploadFotos = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFotos.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFotos.value)
  }
}
</script>
