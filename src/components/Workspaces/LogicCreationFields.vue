<template>
  <profile-section
    v-if="kind === 'cycle'"
    class="logic-create-cycle"
    title="Ciclo Trimestral"
    caption="Defina o período, índices e alvo do ciclo operacional."
    icon-src="/icons/logics/limits/calendar.svg"
  >
    <div class="logic-create-three">
      <label-form text-label="Índice Inicial do Motor"
        ><q-input
          :model-value="indexText"
          aria-label="Índice Inicial do Motor"
          inputmode="decimal"
          outlined
          dense
          dark
          hide-bottom-space
          @focus="indexEditing = true"
          @blur="indexEditing = false"
          @update:model-value="updateIndex"
      /></label-form>
      <percent-input
        :model-value="modelValue.target"
        label="Alvo do Ciclo Trimestral (%) *"
        localized
        @update:model-value="set('target', $event)"
      />
      <label-form text-label="Índice Final Obrigatório — calculado"
        ><q-input
          :model-value="indexDisplay(finalIndex)"
          aria-label="Índice Final Obrigatório — calculado"
          disable
          outlined
          dense
          dark
          hide-bottom-space
      /></label-form>
    </div>
    <div class="logic-create-two">
      <label-form v-for="f in dates" :key="f.key" :text-label="f.label"
        ><q-input
          :model-value="modelValue[f.key]"
          :aria-label="f.label"
          type="date"
          outlined
          dense
          dark
          hide-bottom-space
          @update:model-value="set(f.key, $event || '')"
      /></label-form>
    </div>
    <p class="logic-create-note">
      <img src="/icons/logics/create/1484-77672-imgTarget.svg" alt="" />O índice final obrigatório
      será alcançado no fechamento do ciclo, independentemente das oscilações intermediárias.
    </p>
  </profile-section>
  <profile-section
    v-else
    title="Intensidade por Atualização"
    caption="Configure a magnitude de cada variação dentro dos limites."
    icon-src="/icons/logics/create/1484-77833-imgActivity.svg"
  >
    <div class="logic-create-two">
      <label-form text-label="Modo de Intensidade"
        ><glass-select
          :model-value="modelValue.intensityMode"
          :options="[{ label: 'Percentual da Banda Diária', value: 'Percentual da Banda Diária' }]"
          aria-label="Modo de Intensidade"
          dropdown-icon="img:/icons/logics/frequency/chevron.svg"
          @update:model-value="set('intensityMode', $event)" /></label-form
      ><percent-input
        :model-value="modelValue.intensity"
        label="Intensidade Configurada (%)"
        localized
        :min="0"
        :max="100"
        @update:model-value="set('intensity', $event)"
      />
    </div>
  </profile-section>
</template>
<script setup>
import { computed, ref } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import PercentInput from 'src/components/Form/PercentInput.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import { projectedFinalIndex } from 'src/services/adminWorkspaceModel'
import { decimalInputValue, numberInputValue } from 'src/services/numberInputValue'
const props = defineProps({
  modelValue: { type: Object, required: true },
  kind: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
const indexEditing = ref(false),
  rawIndex = ref('')
const finalIndex = computed(() => projectedFinalIndex(props.modelValue))
function indexDisplay(value) {
  const n = numberInputValue(value)
  return n === null
    ? ''
    : n.toLocaleString('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
        useGrouping: false,
      })
}
const indexText = computed(() =>
  indexEditing.value && rawIndex.value !== ''
    ? rawIndex.value
    : indexDisplay(props.modelValue.initialIndex),
)
function set(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
function updateIndex(value) {
  rawIndex.value = String(value ?? '')
  set('initialIndex', decimalInputValue(value))
}
const dates = [
  { key: 'startDate', label: 'Data de Início do Ciclo' },
  { key: 'endDate', label: 'Data de Fechamento do Ciclo' },
]
</script>
<style scoped>
.logic-create-two,
.logic-create-three {
  display: grid;
  gap: 24px;
  min-width: 0;
}
.logic-create-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.logic-create-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 24px;
}
.logic-create-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 24px 0 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fee685;
  font-size: 12px;
  line-height: 20px;
}
.logic-create-note img {
  flex: none;
}
@media (max-width: 600px) {
  .logic-create-two,
  .logic-create-three {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
