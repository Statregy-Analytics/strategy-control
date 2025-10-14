<template>
  <div class="MainTitle">
    <div
      v-if="props.data.text"
      class="row bg-white q-pt-sm q-px-sm align-center justify-between"
      style="border-bottom: 1px solid #ccc"
    >
      <p class="text-h7 text-muted">Parâmetros da Seção</p>
    </div>
    <label-form textLabel="Texto">
      <q-input
        v-model="dataTitle.text"
        type="textarea"
        outlined
        bg-color="white"
        rows="3"
        placeholder="Queda na taxa de juros e a ascensão das empreasas de inteligência artificial."
      />
    </label-form>
    <q-separator class="q-my-lg" />
    <p class="text-title">Tipografia</p>
    <div class="" style="display: grid; gap: 24px">
      <label-form textLabel="Familia Tipográfica">
        <q-select
          v-model="dataTitle.tipografia"
          :options="tipografiaOptions"
          outlined
          dense
          dropdown-icon="keyboard_arrow_down"
          bg-color="white"
          placeholder="Roboto"
        />
      </label-form>
      <div class="row q-gutter-lg">
        <label-form textLabel="Peso do Texto" class="col">
          <q-select
            v-model="dataTitle.pesoText"
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
            v-model="dataTitle.tamanhoText"
            :options="tamanhoTextOptions"
            outlined
            dense
            bg-color="white"
            dropdown-icon="keyboard_arrow_down"
            placeholder="Selecione o tamanho do texto"
          />
        </label-form>
      </div>

      <label-form textLabel="Alinhamento do Texto" class="q-mt-xs">
        <div class="row">
          <q-btn-group outline class="border-radius-pattern">
            <q-btn
              outline
              v-for="(item, index) in textAlignOptions"
              :key="index"
              :color="dataTitle.textAlign === item.value ? 'primary' : 'grey-7'"
              :icon="item.icon"
              :label="item.label"
              no-caps
              style="border: 1px solid currentColor"
              @click="dataTitle.textAlign = item.value"
            />
          </q-btn-group>
        </div>
      </label-form>

      <label-form textLabel="Cor do Texto" class="q-mt-xs">
        <q-input
          outlined
          v-model="dataTitle.corTexto"
          class="my-input"
          dense
          style="width: 20%"
          bg-color="white"
        >
          <template v-slot:prepend>
            <div
              class="color-preview cursor-pointer"
              :style="{
                backgroundColor: dataTitle.corTexto,
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                display: 'inline-block',
              }"
            >
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="dataTitle.corTexto" />
              </q-popup-proxy>
            </div>
          </template>
        </q-input>
      </label-form>
    </div>
  </div>
</template>

<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, onMounted, ref, defineProps } from 'vue'

defineComponent({
  name: 'MainTitle',
})

const props = defineProps({
  // Defina as propriedades se necessário
  data: {
    type: Object,
    default: () => ({}),
  },
})
// Seu código aqui
const dataTitle = ref({
  text: '',
  tipografia: '',
  pesoText: '',
  tamanhoText: '',
  corTexto: '#ffffff',
  textAlign: 'left',
})

const tipografiaOptions = [
  { label: 'Poppins', value: 'poppins' },
  { label: 'Roboto', value: 'roboto' },
  { label: 'Arial', value: 'arial' },
]
const pesoTextOptions = [
  { label: 'Regular', value: 'regular' },
  { label: 'Bold', value: 'bold' },
  { label: 'Light', value: 'light' },
]
const textAlignOptions = [
  { label: 'Á Esquerda', value: 'left', icon: 'format_align_left' },
  { label: 'Centro', value: 'center', icon: 'format_align_center' },
  { label: 'Á Direita', value: 'right', icon: 'format_align_right' },
]

const tamanhoTextOptions = ['12', '14', '16', '18', '20', '22', '24', '28', '32', '36']

onMounted(() => {
  if (props.data.value && props.data.value.text) {
    dataTitle.value = { ...props.data.value }
  }
})
</script>

<style scoped>
/* Seus estilos aqui */
</style>
