<template>
  <div class="section_button">
    <div class="row q-gutter-md">
      <label-form textLabel="Texto do Botão" class="col">
        <q-input
          outlined
          v-model="dataButton.text"
          dense
          bg-color="white"
          placeholder="Veja os ETFs disponíveis"
        />
      </label-form>
      <label-form textLabel="Link de direcionamento do Botão" class="col">
        <q-select
          v-model="dataButton.link"
          :options="optionLinks"
          outlined
          dense
          bg-color="white"
          placeholder="Selecione o link"
          dropdown-icon="keyboard_arrow_down"
        />
      </label-form>
    </div>
    <q-separator class="q-my-lg" />
    <p class="text-title">Tipográfia</p>
    <div class="d-grid-g14">
      <label-form textLabel="Familia Tipográfica" class="col">
        <q-select
          v-model="dataButton.tipografia"
          :options="tipografiaOptions"
          outlined
          dense
          bg-color="white"
          placeholder="Roboto"
          dropdown-icon="keyboard_arrow_down"
        />
      </label-form>
      <div class="row q-gutter-lg">
        <label-form textLabel="Peso do Texto" class="col">
          <q-select
            v-model="dataButton.pesoText"
            :options="pesoTextOptions"
            outlined
            dense
            dropdown-icon="keyboard_arrow_down"
            bg-color="white"
            placeholder="Selecione o peso do texto"
          />
        </label-form>
        <label-form textLabel="Tamanho do Texto" class="col">
          <q-select
            v-model="dataButton.tamanhoText"
            :options="tamanhoTextOptions"
            outlined
            dense
            bg-color="white"
            dropdown-icon="keyboard_arrow_down"
            placeholder="Selecione o tamanho do texto"
          />
        </label-form>
      </div>
      <div class="row">
        <label-form textLabel="Alinhamento do Texto" class="q-mt-xs">
          <div class="row">
            <q-btn-group outline class="border-radius-pattern">
              <q-btn
                outline
                v-for="(item, index) in textAlignOptions"
                :key="index"
                :color="dataButton.textAlign === item.value ? 'primary' : 'grey-7'"
                :icon="item.icon"
                :label="item.label"
                no-caps
                style="border: 1px solid currentColor"
                @click="dataButton.textAlign = item.value"
              />
            </q-btn-group>
          </div>
        </label-form>
      </div>
    </div>
    <p class="text-title q-mt-lg">Cores</p>
    <div class="row q-gutter-md">
      <label-form textLabel="Cor do Texto" class="col">
        <q-input
          outlined
          v-model="dataButton.corTexto"
          class="my-input"
          dense
          style="width: 40%"
          bg-color="white"
        >
          <template v-slot:prepend>
            <div
              class="color-preview cursor-pointer"
              :style="{
                backgroundColor: dataButton.corTexto,
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                display: 'inline-block',
              }"
            >
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="dataButton.corTexto" />
              </q-popup-proxy>
            </div>
          </template>
        </q-input>
      </label-form>
      <label-form textLabel="Cor de Fundo do Botão" class="col">
        <q-input
          outlined
          v-model="dataButton.background"
          class="my-input"
          dense
          style="width: 40%"
          bg-color="white"
        >
          <template v-slot:prepend>
            <div
              class="color-preview cursor-pointer"
              :style="{
                backgroundColor: dataButton.background,
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                display: 'inline-block',
              }"
            >
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="dataButton.background" />
              </q-popup-proxy>
            </div>
          </template>
        </q-input>
      </label-form>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'

defineComponent({
  name: 'SectionButton',
})

const dataButton = ref({
  text: '',
  link: '',
  corTexto: '#FFFFFF',
  background: '#00A3FF',
})
const pesoTextOptions = [
  { label: 'Regular', value: 'regular' },
  { label: 'Bold', value: 'bold' },
  { label: 'Light', value: 'light' },
]
const optionLinks = [
  { label: 'Selecione Opção', value: '' },
  { label: 'https://strategyanalytics.com.br/quemsomos', value: 'external' },
  { label: 'https://strategyanalytics.com.br/nossaequipe', value: 'internal' },
]

const tipografiaOptions = [
  { label: 'Poppins', value: 'poppins' },
  { label: 'Roboto', value: 'roboto' },
  { label: 'Arial', value: 'arial' },
]
const textAlignOptions = [
  { label: 'Á Esquerda', value: 'left', icon: 'format_align_left' },
  { label: 'Centro', value: 'center', icon: 'format_align_center' },
  { label: 'Á Direita', value: 'right', icon: 'format_align_right' },
]
const tamanhoTextOptions = ['12', '14', '16', '18', '20', '22', '24', '28', '32', '36']
</script>

<style scoped>
/* Seus estilos aqui */
</style>
