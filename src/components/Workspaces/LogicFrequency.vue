<template>
  <profile-section
    class="logic-frequency"
    title="Frequência de Atualização"
    aria-label="Frequência de Atualização"
    caption="Configure o intervalo e ritmo de execução do motor."
    icon-src="/icons/logics/frequency/clock.svg"
  >
    <div class="logic-frequency-top">
      <label-form text-label="Intervalo Operacional *">
        <glass-select
          :model-value="modelValue.interval"
          :options="[]"
          disable
          placeholder="Selecione"
          aria-label="Intervalo Operacional *"
          dropdown-icon="img:/icons/logics/frequency/chevron.svg"
        />
      </label-form>
      <label-form text-label="Atualizações por Dia">
        <q-input
          :model-value="modelValue.updatesPerDay"
          aria-label="Atualizações por Dia"
          outlined
          dense
          dark
          disable
          hide-bottom-space
        />
      </label-form>
    </div>
    <div class="logic-frequency-times">
      <label-form text-label="Primeira Execução">
        <q-input
          class="logic-frequency-first"
          :model-value="modelValue.firstRun"
          aria-label="Primeira Execução"
          type="datetime-local"
          :disable="disabled"
          outlined
          dense
          dark
          hide-bottom-space
          @update:model-value="
            $emit('update:modelValue', { ...modelValue, firstRun: $event || null })
          "
        >
          <template #prepend><img src="/icons/logics/frequency/calendar.svg" alt="" /></template>
        </q-input>
      </label-form>
      <label-form v-for="field in timestamps" :key="field.key" :text-label="field.label">
        <q-input
          :model-value="modelValue[field.key] || '—'"
          :aria-label="field.label"
          outlined
          dense
          dark
          disable
          hide-bottom-space
        />
      </label-form>
    </div>
    <label-form text-label="Atualizações Estimadas no Ciclo">
      <q-input
        :model-value="modelValue.estimatedUpdates"
        aria-label="Atualizações Estimadas no Ciclo"
        outlined
        dense
        dark
        disable
        hide-bottom-space
      />
    </label-form>
  </profile-section>
</template>
<script setup>
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
defineProps({ modelValue: { type: Object, required: true }, disabled: Boolean })
defineEmits(['update:modelValue'])
const timestamps = [
  { key: 'lastRun', label: 'Última Atualização' },
  { key: 'nextRun', label: 'Próxima Atualização' },
]
</script>
<style scoped>
.logic-frequency {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(
      191.918deg,
      rgba(0, 0, 0, 0.118),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.02)
    ),
    linear-gradient(
      191.918deg,
      rgba(0, 0, 0, 0.078),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.01)
    ),
    linear-gradient(
      -26.264deg,
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
.logic-frequency :deep(.profile-section__heading) {
  padding: 24px;
  border: 0;
}
.logic-frequency :deep(.profile-section__heading h2) {
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}
.logic-frequency :deep(.profile-section__heading p) {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  line-height: 24px;
}
.logic-frequency :deep(.profile-section__body) {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}
.logic-frequency-top,
.logic-frequency-times {
  display: grid;
  gap: 24px;
  min-width: 0;
}
.logic-frequency-top {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.logic-frequency-times {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.logic-frequency :deep(.LabelForm) {
  gap: 8px !important;
  min-width: 0;
}
.logic-frequency :deep(.LabelForm > span) {
  color: rgba(255, 255, 255, 0.72);
  line-height: 14px;
}
.logic-frequency :deep(.q-field__control),
.logic-frequency :deep(.q-field__marginal) {
  min-height: 36px;
  height: 36px;
}
.logic-frequency :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.logic-frequency :deep(.q-field--outlined .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.logic-frequency :deep(.q-field__native) {
  color: rgba(255, 255, 255, 0.72) !important;
  font-size: 14px;
  line-height: 20px;
  min-width: 0;
}
.logic-frequency :deep(.q-field--disabled .q-field__inner) {
  opacity: 0.5 !important;
}
.logic-frequency :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.logic-frequency-first :deep(.q-field__prepend) {
  padding-right: 8px;
}
.logic-frequency-first :deep(.q-field__native) {
  font-size: 12px;
}
.logic-frequency-first :deep(input::-webkit-calendar-picker-indicator) {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  opacity: 0;
  cursor: pointer;
}
@media (max-width: 600px) {
  .logic-frequency-top,
  .logic-frequency-times {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
