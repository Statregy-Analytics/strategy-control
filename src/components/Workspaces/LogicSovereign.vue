<template>
  <profile-section
    class="logic-sovereign"
    title="Fechamento Soberano"
    aria-label="Fechamento Soberano"
    caption="Garantia do índice final ao término do ciclo trimestral."
    icon-src="/icons/logics/sovereign/target-heading.svg"
  >
    <div class="logic-sovereign-fields">
      <label-form
        v-for="field in fields"
        :key="field.key"
        :text-label="field.label"
        :label-size="12"
        :class="{ 'logic-sovereign-target': field.key === 'target' }"
      >
        <q-input
          :model-value="display(field.value, field.key === 'target' ? 2 : 4)"
          :aria-label="field.label"
          outlined
          dense
          dark
          disable
          hide-bottom-space
        />
      </label-form>
    </div>
    <div class="logic-sovereign-principle">
      <h3>
        <img src="/icons/logics/sovereign/target-principle.svg" alt="" />
        Princípio do Fechamento Soberano
      </h3>
      <p>
        As bandas e probabilidades controlam o percurso. O fechamento soberano controla o índice
        final do ciclo trimestral.
      </p>
    </div>
  </profile-section>
</template>
<script setup>
import { computed } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { projectedFinalIndex } from 'src/services/adminWorkspaceModel'
import { numberInputValue } from 'src/services/numberInputValue'

const props = defineProps({ modelValue: { type: Object, required: true } })
const fields = computed(() => [
  { key: 'initialIndex', label: 'Índice Inicial do Ciclo', value: props.modelValue.initialIndex },
  { key: 'target', label: 'Alvo do Ciclo', value: props.modelValue.target },
  {
    key: 'finalIndex',
    label: 'Índice Final Obrigatório',
    value: projectedFinalIndex(props.modelValue),
  },
])
function display(value, fractionDigits) {
  const number = numberInputValue(value)
  return number === null
    ? ''
    : new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
        useGrouping: false,
      }).format(number)
}
</script>
<style scoped>
.logic-sovereign {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(
      191.888deg,
      rgba(0, 0, 0, 0.118),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.02)
    ),
    linear-gradient(
      191.888deg,
      rgba(0, 0, 0, 0.078),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.01)
    ),
    linear-gradient(
      -26.206deg,
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
.logic-sovereign :deep(.profile-section__heading) {
  position: relative;
  padding: 24px 24px 31px;
  border: 0;
}
.logic-sovereign :deep(.profile-section__heading::after) {
  content: '';
  position: absolute;
  top: 92px;
  right: 24px;
  left: 24px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}
.logic-sovereign :deep(.profile-section__heading h2) {
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}
.logic-sovereign :deep(.profile-section__heading p) {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  line-height: 24px;
}
.logic-sovereign :deep(.profile-section__body) {
  padding: 24px;
}
.logic-sovereign-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.logic-sovereign-fields :deep(.LabelForm) {
  gap: 8px !important;
  min-width: 0;
}
.logic-sovereign-fields :deep(.LabelForm > span) {
  color: rgba(255, 255, 255, 0.6);
  line-height: 16px;
}
.logic-sovereign-target :deep(span) {
  color: #bedbff !important;
}
.logic-sovereign-fields :deep(.q-field__control),
.logic-sovereign-fields :deep(.q-field__marginal) {
  height: 36px;
  min-height: 36px;
}
.logic-sovereign-fields :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.logic-sovereign-fields :deep(.q-field--outlined .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.logic-sovereign-fields :deep(.q-field--disabled) {
  opacity: 0.5;
}
.logic-sovereign-fields :deep(.q-field--disabled .q-field__inner) {
  opacity: 1 !important;
}
.logic-sovereign-fields :deep(.q-field__native) {
  color: rgba(255, 255, 255, 0.72) !important;
  font-size: 14px;
  line-height: 20px;
}
.logic-sovereign-principle {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.logic-sovereign-principle h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: 0.35px;
  text-align: center;
  text-transform: uppercase;
}
.logic-sovereign-principle img {
  flex: none;
}
.logic-sovereign-principle p {
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 26px;
  text-align: center;
  overflow-wrap: anywhere;
}
@media (max-width: 600px) {
  .logic-sovereign-fields {
    grid-template-columns: minmax(0, 1fr);
  }
  .logic-sovereign :deep(.profile-section__heading) {
    padding-bottom: 24px;
  }
  .logic-sovereign :deep(.profile-section__heading::after) {
    top: auto;
    bottom: 5px;
  }
}
</style>
