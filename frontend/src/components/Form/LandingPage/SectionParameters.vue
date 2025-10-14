<template>
  <div class="SectionParamenters">
    <p class="text-title">Fundo</p>
    <div class="row">
      <label-form textLabel="Estilo do Fundo" class="q-mt-xs col">
        <div class="row">
          <q-btn-group outline class="border-radius-pattern">
            <q-btn
              outline
              v-for="(item, index) in optionsStyleBack"
              :key="index"
              :color="parametersData.styleBackground === item.value ? 'primary' : 'grey-6'"
              no-caps
              style="border: 1px solid currentColor"
              @click="parametersData.styleBackground = item.value"
            >
              <component :is="item.icon" class="q-mr-sm" />
              {{ item.label }}
            </q-btn>
          </q-btn-group>
        </div>
      </label-form>
      <label-form textLabel="Fundo" class="col" v-if="parametersData.styleBackground === 'color'">
        <q-input
          outlined
          v-model="parametersData.background"
          class="my-input"
          dense
          style="width: 40%"
          bg-color="white"
        >
          <template v-slot:prepend>
            <div
              class="color-preview cursor-pointer"
              :style="{
                backgroundColor: parametersData.background,
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                display: 'inline-block',
              }"
            >
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="parametersData.background" />
              </q-popup-proxy>
            </div>
          </template>
        </q-input>
      </label-form>
      <label-form textLabel="Imagem de Fundo" class="col" v-else>
        <div class="row justify-between q-gutter-sm">
          <q-btn
            label="Upload"
            color="primary"
            icon="upload"
            outline
            no-caps
            style="border: 1px solid currentColor"
            @click="triggerFileInputBack"
            class="col-5 border-radius-pattern"
            v-if="uploadedFileBack.length <= 0"
          />
          <!-- size="sm" -->
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="handleFileUploadBack"
            accept=".jpg, .jpeg, .png, .pdf"
            class="upload-back"
          />
          <div v-if="uploadedFileBack.length > 0" class="q-mt-sm col">
            <q-btn
              v-for="(item, index) in uploadedFileBack"
              :key="index"
              size="sm"
              flat
              padding="xs"
              color="secondary"
              no-caps
              class="q-ma-sm text-muted"
              @click="uploadedFileBack = []"
            >
              <IconPhoto class="q-mr-xs" />
              {{ item.name }}
              <IconTrash class="q-ml-lg" />
            </q-btn>
          </div>
        </div>
      </label-form>
    </div>
    <p class="text-title q-mt-lg">Layout</p>
    <div class="d-grid-g14">
      <div class="row">
        <label-form textLabel="Layout da Seção" class="q-mt-xs col">
          <div class="row">
            <q-btn-group outline class="border-radius-pattern">
              <q-btn
                outline
                v-for="(item, index) in optionsLayout"
                :key="index"
                :color="parametersData.layout === item.value ? 'primary' : 'grey-6'"
                no-caps
                style="border: 1px solid currentColor"
                @click="parametersData.layout = item.value"
              >
                <component :is="item.icon" class="q-mr-sm" />
                {{ item.label }}
              </q-btn>
            </q-btn-group>
          </div>
        </label-form>
      </div>

      <div class="row justify-between q-gutter-sm" v-if="parametersData.layout === 'text-imagem'">
        <label-form textLabel="Posição da Imagem" class="col">
          <q-btn-group outline class="border-radius-pattern">
            <q-btn
              outline
              v-for="(item, index) in optionsAlignImage"
              :key="index"
              :color="parametersData.alignImage === item.value ? 'primary' : 'grey-6'"
              no-caps
              style="border: 1px solid currentColor"
              @click="parametersData.alignImage = item.value"
            >
              <component :is="item.icon" class="q-mr-sm" />
              {{ item.label }}
            </q-btn>
          </q-btn-group>
        </label-form>
        <label-form textLabel="Imagem de Fundo" class="col">
          <div class="row justify-between q-gutter-sm">
            <q-btn
              label="Upload"
              color="primary"
              icon="upload"
              outline
              no-caps
              style="border: 1px solid currentColor"
              @click="triggerFileInput"
              class="col-5 border-radius-pattern"
              v-if="uploadedFiles.length <= 0"
            />
            <!-- size="sm" -->
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              @change="handleFileUpload"
              accept=".jpg, .jpeg, .png, .pdf"
              class="upload-negative"
            />
            <div v-if="uploadedFiles.length > 0" class="q-mt-sm col">
              <q-btn
                v-for="(item, index) in uploadedFiles"
                :key="index"
                size="sm"
                flat
                padding="xs"
                color="secondary"
                no-caps
                class="q-ma-sm text-muted"
                @click="uploadedFiles = []"
              >
                <IconPhoto class="q-mr-xs" />
                {{ item.name }}
                <IconTrash class="q-ml-lg" />
              </q-btn>
            </div>
          </div>
        </label-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'

defineComponent({
  name: 'SectionParamenters',
})
// Seu código aqui
const parametersData = ref({
  styleBackground: 'color',
  background: '#ffffff',
  layout: 'text-imagem',
  alignImage: 'left',
})

const optionsStyleBack = [
  { label: 'Cor de Fundo', value: 'color', icon: 'IconPalette' },
  { label: 'Imagem', value: 'image', icon: 'IconPhoto' },
]

const optionsLayout = [
  { label: 'Texto e Imagem', value: 'text-imagem', icon: 'IconTextCaption' },
  { label: 'Somente Texto', value: 'text', icon: 'IconTypography' },
]
const optionsAlignImage = [
  { label: 'Á Esquerda', value: 'left', icon: 'IconAlignLeft' },
  { label: 'Á Direita', value: 'right', icon: 'IconAlignRight' },
]

const uploadedFiles = ref([])
const uploadedFileBack = ref([])
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

const triggerFileInputBack = () => {
  const fileInput = document.querySelector('.upload-back')
  if (fileInput) fileInput.click()
}
const handleFileUploadBack = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFileBack.value = Array.from(files)
  }
}
</script>

<style scoped>
/* Seus estilos aqui */
</style>
