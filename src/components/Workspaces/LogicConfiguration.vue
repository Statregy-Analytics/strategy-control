<template>
  <div v-if="!enabled"><slot /></div>
  <profile-section
    v-else
    class="logic-configuration"
    title="Configuração do Motor"
    icon-src="/icons/logics/lg11/settings.svg"
  >
    <template #actions>
      <q-btn
        outline
        no-caps
        class="logic-configuration__toggle"
        :aria-label="
          modelValue ? 'Recolher configuração do motor' : 'Expandir configuração do motor'
        "
        :aria-expanded="modelValue"
        :aria-controls="bodyId"
        @click="$emit('update:modelValue', !modelValue)"
      >
        <img
          src="/icons/logics/lg11/chevron-down.svg"
          alt=""
          :class="{ 'logic-configuration__chevron--expanded': modelValue }"
        />
      </q-btn>
    </template>
    <div :id="bodyId" v-show="modelValue" class="logic-configuration__fields"><slot /></div>
    <div class="logic-configuration__notices">
      <div v-if="intensityInvalid" class="logic-configuration__notice" role="alert">
        <img src="/icons/logics/lg11/circle-alert.svg" alt="" />
        <span>Intensidade por atualização deve ser menor que limite diário</span>
      </div>
      <div class="logic-configuration__notice" role="note">
        <img src="/icons/logics/lg11/info.svg" alt="" />
        <span>Intensidade alta pode causar muitas travas</span>
      </div>
    </div>
  </profile-section>
</template>
<script setup>
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
defineProps({
  enabled: Boolean,
  modelValue: { type: Boolean, default: true },
  bodyId: { type: String, required: true },
  intensityInvalid: Boolean,
})
defineEmits(['update:modelValue'])
</script>
<style scoped>
.logic-configuration {
  padding: 24px;
  border-radius: 0;
  background:
    linear-gradient(
      182.637556deg,
      rgba(0, 0, 0, 0.24) 0.52072%,
      rgba(0, 0, 0, 0.08) 51.124%,
      rgba(0, 0, 0, 0.04) 99.479%
    ),
    linear-gradient(
      182.637556deg,
      rgba(0, 0, 0, 0.16) 0.52072%,
      rgba(0, 0, 0, 0.08) 51.124%,
      rgba(0, 0, 0, 0.02) 99.479%
    ),
    linear-gradient(
      -6.147105deg,
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
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.24);
}
.logic-configuration > :deep(.profile-section__heading) {
  padding: 0;
  min-height: 32px;
  border: 0;
}
.logic-configuration > :deep(.profile-section__heading h2) {
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  gap: 8px;
}
.logic-configuration > :deep(.profile-section__body) {
  padding: 0;
}
.logic-configuration__toggle {
  min-width: 40px;
  height: 32px;
  padding: 0 11px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.logic-configuration__toggle:before {
  border-color: rgba(255, 255, 255, 0.2);
}
.logic-configuration__chevron--expanded {
  transform: rotate(180deg);
}
.logic-configuration__fields {
  margin-top: 16px;
}
.logic-configuration__notices {
  margin-top: 16px;
  display: grid;
  gap: 8px;
}
.logic-configuration__notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.25),
    rgba(0, 0, 0, 0.16) 52%,
    rgba(0, 0, 0, 0.08)
  );
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
  font-size: 12px;
  line-height: 16px;
}
.logic-configuration__notice img {
  flex-shrink: 0;
}
.logic-configuration__toggle:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
@media (max-width: 600px) {
  .logic-configuration {
    padding: 16px;
  }
}
</style>
