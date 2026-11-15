<template>
  <profile-section
    class="logic-probability-section"
    aria-label="Probabilidade Direcional Base"
    title="Probabilidade Direcional Base"
    caption="Configure a probabilidade de variação positiva ou negativa."
    :icon-src="
      state.valid === false
        ? '/icons/logics/probability/gauge-invalid.svg'
        : '/icons/logics/probability/gauge-valid.svg'
    "
  >
    <div class="logic-probability-fields">
      <percent-input
        :model-value="positive"
        label="Chance Positiva (%)"
        :min="0"
        :max="100"
        :disabled="disabled"
        @update:model-value="$emit('update:positive', $event)"
      />
      <percent-input :model-value="negative" label="Chance Negativa (%)" disabled />
    </div>
    <div class="logic-probability-visual">
      <p>Barra Visual 100%</p>
      <div
        v-if="state.drawable"
        class="logic-probability-bar"
        role="img"
        :aria-label="`Alta ${probabilityLabel(state.positive)}; Baixa ${probabilityLabel(state.negative)}`"
      >
        <span
          class="logic-probability-high"
          :style="{ width: state.positiveWidth + '%' }"
          aria-hidden="true"
          >Alta {{ probabilityLabel(state.positive) }}</span
        >
        <span
          class="logic-probability-low"
          :style="{ width: state.negativeWidth + '%' }"
          aria-hidden="true"
          >Baixa {{ probabilityLabel(state.negative) }}</span
        >
      </div>
      <div v-else class="logic-probability-unavailable" role="status">Indisponível</div>
      <p class="logic-probability-total" aria-live="polite">
        <span>Soma atual:</span
        ><strong
          :class="{
            'logic-probability-total--valid': state.valid === true,
            'logic-probability-total--invalid': state.valid === false,
          }"
          >{{ probabilityLabel(state.total) }}</strong
        >
      </p>
    </div>
    <div
      class="logic-probability-rule"
      :class="{ 'logic-probability-rule--invalid': state.valid === false }"
      :role="state.valid === false ? 'alert' : undefined"
    >
      <strong v-if="state.rangeInvalid"
        >Regra violada: as chances devem estar entre 0 e 100%.</strong
      >
      <strong v-else-if="state.valid === false"
        >Regra violada: a soma atual deve totalizar 100%.</strong
      >
      <span v-else><strong>Regra:</strong> A soma das chances deve ser sempre 100%.</span>
    </div>
  </profile-section>
</template>
<script setup>
import { computed } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import PercentInput from 'src/components/Form/PercentInput.vue'
import { probabilityState, probabilityLabel } from 'src/services/logicProbabilityModel'
const props = defineProps({
  positive: { type: [Number, String], default: null },
  negative: { type: [Number, String], default: null },
  disabled: Boolean,
})
defineEmits(['update:positive'])
const state = computed(() => probabilityState(props.positive, props.negative))
</script>
<style scoped>
.logic-probability-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(192.21deg, rgba(0, 0, 0, 0.118), rgba(0, 0, 0, 0.02)),
    linear-gradient(192.21deg, rgba(0, 0, 0, 0.078), rgba(0, 0, 0, 0.01)),
    linear-gradient(
      -26.83deg,
      #1a1e2d 0%,
      #1a1e2d 7%,
      #13476d 23%,
      #10517e 28%,
      #10517e 30%,
      #124e78 33%,
      #1a1e2d 53%,
      #1a1e2d 84%,
      #4e1723 100%
    );
}
.logic-probability-section :deep(.profile-section__heading) {
  padding: 24px;
  border: 0;
}
.logic-probability-section :deep(.profile-section__heading h2) {
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}
.logic-probability-section :deep(.profile-section__heading p) {
  margin: 6px 0 0;
  font-size: 16px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-probability-section :deep(.profile-section__body) {
  padding: 24px;
}
.logic-probability-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.logic-probability-visual {
  padding-top: 24px;
}
.logic-probability-visual > p {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
}
.logic-probability-bar,
.logic-probability-unavailable {
  display: flex;
  height: 32px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 8px;
}
.logic-probability-bar > span {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
}
.logic-probability-high {
  background: #008236;
  color: #66e59e;
}
.logic-probability-low {
  background: #e7000b;
  color: #ff8a8a;
}
.logic-probability-unavailable {
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
}
.logic-probability-visual .logic-probability-total {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 8px;
  min-height: 28px;
}
.logic-probability-total strong {
  font-size: 14px;
  line-height: 20px;
}
.logic-probability-total--valid {
  color: #66e59e;
}
.logic-probability-total--invalid {
  color: #ff8a8a;
}
.logic-probability-rule {
  margin-top: 24px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: linear-gradient(181.36deg, rgba(0, 0, 0, 0.196), rgba(0, 0, 0, 0.03));
  font-size: 12px;
  line-height: 16px;
}
.logic-probability-rule--invalid {
  background: #e7000b;
  border-color: #e7000b;
  color: #fff;
}
@media (max-width: 600px) {
  .logic-probability-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
