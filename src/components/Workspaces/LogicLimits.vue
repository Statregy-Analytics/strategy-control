<template>
  <profile-section
    class="logic-limits"
    title="Limites Operacionais"
    aria-label="Limites Operacionais"
    caption="Defina as bandas de variação diária e mensal."
    icon-src="/icons/logics/limits/shield.svg"
  >
    <div class="logic-limits-groups">
      <div v-for="group in groups" :key="group.title" class="logic-limits-group">
        <h3><img :src="group.icon" alt="" />{{ group.title }}</h3>
        <div class="logic-limits-fields">
          <percent-input
            v-for="field in group.fields"
            :key="field.key"
            :model-value="modelValue[field.key]"
            :label="field.label"
            :label-size="12"
            :label-line-height="16"
            localized
            :input-mode="field.floor ? 'text' : 'decimal'"
            :disabled="disabled"
            :min="field.floor ? undefined : 0"
            :max="field.floor ? 0 : undefined"
            :negative-tone="field.floor"
            @update:model-value="$emit('update:modelValue', { ...modelValue, [field.key]: $event })"
          />
        </div>
      </div>
    </div>
    <p class="logic-limits-note">
      O limite efetivo considera simultaneamente a banda diária e a banda mensal.
    </p>
  </profile-section>
</template>
<script setup>
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import PercentInput from 'src/components/Form/PercentInput.vue'
defineProps({ modelValue: { type: Object, required: true }, disabled: Boolean })
defineEmits(['update:modelValue'])
const groups = [
  {
    title: 'Limite Diário',
    icon: '/icons/logics/limits/timer.svg',
    fields: [
      { key: 'dailyCeiling', label: 'Teto Diário (%)' },
      { key: 'dailyFloor', label: 'Piso Diário (%)', floor: true },
    ],
  },
  {
    title: 'Limite Mensal',
    icon: '/icons/logics/limits/calendar.svg',
    fields: [
      { key: 'monthlyCeiling', label: 'Teto Mensal (%)' },
      { key: 'monthlyFloor', label: 'Piso Mensal (%)', floor: true },
    ],
  },
]
</script>
<style scoped>
.logic-limits {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(193.35deg, rgba(0, 0, 0, 0.118), rgba(0, 0, 0, 0.02)),
    linear-gradient(193.35deg, rgba(0, 0, 0, 0.078), rgba(0, 0, 0, 0.01)),
    linear-gradient(
      -29.026deg,
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
.logic-limits :deep(.profile-section__heading) {
  padding: 24px;
  border: 0;
}
.logic-limits :deep(.profile-section__heading h2) {
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}
.logic-limits :deep(.profile-section__heading p) {
  margin: 6px 0 0;
  font-size: 16px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-limits :deep(.profile-section__body) {
  padding: 24px;
}
.logic-limits-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.logic-limits-group {
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.logic-limits-group h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}
.logic-limits-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.logic-limits-note {
  margin: 24px 0 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: linear-gradient(181.36deg, rgba(0, 0, 0, 0.196), rgba(0, 0, 0, 0.03));
  font-size: 12px;
  line-height: 16px;
}
@media (max-width: 600px) {
  .logic-limits-groups {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
