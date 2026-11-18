<template>
  <profile-section
    class="logic-identity"
    title="Identidade do Motor"
    aria-label="Identidade do Motor"
    icon-src="/icons/logics/identity/heading-box.svg"
    caption="Defina como esse motor será identificado no sistema."
  >
    <div class="logic-identity-name">
      <label-form text-label="Nome do Motor *">
        <q-input
          :model-value="modelValue.name"
          aria-label="Nome do Motor *"
          placeholder="Ex: Alpha-2 Institutional"
          outlined
          dense
          dark
          hide-bottom-space
          maxlength="2000"
          @update:model-value="setField('name', $event || '')"
        />
      </label-form>
      <label-form text-label="ID (Automático)">
        <q-input
          class="logic-identity-code"
          :model-value="code"
          placeholder="—"
          aria-label="ID (Automático)"
          outlined
          dense
          dark
          disable
          hide-bottom-space
        />
      </label-form>
    </div>
    <label-form text-label="Descrição Interna">
      <q-input
        :model-value="modelValue.description"
        aria-label="Descrição Interna"
        placeholder="Descrição técnica ou administrativa do motor"
        outlined
        dense
        dark
        hide-bottom-space
        maxlength="2000"
        @update:model-value="setField('description', $event || '')"
      />
    </label-form>
    <div class="logic-identity-selects">
      <label-form text-label="Status Inicial">
        <glass-select
          :class="{ 'logic-identity-pending': modelValue.status === 'Em Análise' }"
          :model-value="modelValue.status"
          :options="statuses"
          aria-label="Status Inicial"
          dropdown-icon="img:/icons/logics/identity/chevron.svg"
          @update:model-value="setField('status', $event)"
        />
      </label-form>
      <label-form text-label="Moeda Firmada *">
        <glass-select
          :model-value="modelValue.currency"
          :options="currencies"
          placeholder="Selecione"
          aria-label="Moeda Firmada *"
          dropdown-icon="img:/icons/logics/identity/chevron.svg"
          @update:model-value="setField('currency', $event)"
        />
      </label-form>
      <label-form text-label="Tipo de Motor">
        <glass-select
          :model-value="modelValue.engineType"
          :options="[]"
          disable
          placeholder="Selecione"
          aria-label="Tipo de Motor"
          dropdown-icon="img:/icons/logics/identity/chevron.svg"
        />
      </label-form>
    </div>
    <div role="group" aria-label="Ícone Representativo">
      <p class="logic-identity-label">Ícone Representativo</p>
      <div class="logic-identity-icons">
        <button
          v-for="icon in icons"
          :key="icon.value"
          type="button"
          :aria-pressed="modelValue.icon === icon.value"
          @click="setField('icon', icon.value)"
        >
          <img :src="'/icons/logics/identity/' + icon.asset + '.svg'" alt="" />{{ icon.label }}
        </button>
      </div>
    </div>
    <div role="group" aria-label="Cor Institucional">
      <p class="logic-identity-label">Cor Institucional</p>
      <div class="logic-identity-colors">
        <button
          v-for="color in colors"
          :key="color.value"
          type="button"
          :style="{ background: color.background, borderColor: color.border }"
          :aria-label="'Cor ' + color.value"
          :aria-pressed="modelValue.color === color.value"
          @click="setField('color', color.value)"
        >
          <img
            v-if="modelValue.color === color.value"
            src="/icons/logics/identity/check.svg"
            alt=""
          />
        </button>
      </div>
    </div>
  </profile-section>
</template>
<script setup>
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import { logicStatuses } from 'src/services/adminWorkspaceModel'
const props = defineProps({
  modelValue: { type: Object, required: true },
  currencies: { type: Array, default: () => [] },
  code: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const statuses = logicStatuses
function setField(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
const icons = [
  { label: 'Distribuição', value: 'chart-pie', asset: 'chart-pie' },
  { label: 'Oscilação', value: 'activity1', asset: 'activity' },
  { label: 'Performance', value: 'trending-up', asset: 'trending-up' },
  { label: 'Rápida', value: 'zap', asset: 'zap' },
  { label: 'Segurança', value: 'shield', asset: 'shield' },
  { label: 'Estrutural', value: 'box', asset: 'box' },
  { label: 'Composta', value: 'layers', asset: 'layers' },
  { label: 'Algorítmica', value: 'cpu', asset: 'cpu' },
]
const colors = [
  { value: '#153d49', background: 'rgba(0,0,0,.1)', border: '#2b7fff' },
  { value: '#1447e6', background: '#1447e6', border: '#1447e6' },
  { value: '#00b8db', background: '#00b8db', border: '#00b8db' },
  { value: '#008236', background: '#008236', border: '#008236' },
  { value: '#fee685', background: 'rgba(187,77,0,.2)', border: '#fee685' },
  { value: '#e7000b', background: '#e7000b', border: '#e7000b' },
  { value: '#c10007', background: '#c10007', border: '#c10007' },
]
</script>
<style scoped>
.logic-identity {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(
      197.678deg,
      rgba(0, 0, 0, 0.118),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.02)
    ),
    linear-gradient(
      197.678deg,
      rgba(0, 0, 0, 0.078),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.01)
    ),
    linear-gradient(
      -36.691deg,
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
.logic-identity :deep(.profile-section__heading) {
  padding: 24px;
  border: 0;
}
.logic-identity :deep(.profile-section__heading h2) {
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}
.logic-identity :deep(.profile-section__heading p) {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  line-height: 24px;
}
.logic-identity :deep(.profile-section__body) {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.logic-identity-name,
.logic-identity-selects {
  display: grid;
  gap: 24px;
  min-width: 0;
}
.logic-identity-name {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.logic-identity-selects {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.logic-identity :deep(.LabelForm) {
  min-width: 0;
  gap: 8px !important;
}
.logic-identity :deep(.LabelForm > span),
.logic-identity-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-identity-label {
  margin: 0 0 12px;
}
.logic-identity :deep(.q-field__control),
.logic-identity :deep(.q-field__marginal) {
  height: 36px;
  min-height: 36px;
}
.logic-identity :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.logic-identity :deep(.q-field--outlined .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.logic-identity :deep(.q-field__native) {
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72) !important;
}
.logic-identity :deep(.q-field--disabled .q-field__inner) {
  opacity: 0.5 !important;
}
.logic-identity :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.logic-identity-code :deep(input) {
  font-family: Consolas, monospace;
}
.logic-identity-pending :deep(.q-field__native) {
  color: #fee685 !important;
}
.logic-identity-icons {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 12px;
}
.logic-identity-icons button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 70px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  font:
    500 10px/15px Inter,
    sans-serif;
  cursor: pointer;
}
.logic-identity-icons button[aria-pressed='true'] {
  border: 2px solid #2b7fff;
  padding: 9px;
  color: #2b7fff;
  background:
    linear-gradient(90deg, rgba(43, 127, 255, 0.12), rgba(43, 127, 255, 0.12)),
    linear-gradient(
      89.68deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.07)
    );
}
.logic-identity-icons img {
  flex: none;
}
.logic-identity-colors {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 2px;
}
.logic-identity-colors button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: none;
  padding: 0;
  border: 1px solid;
  border-radius: 50%;
  cursor: pointer;
}
.logic-identity-colors button[aria-pressed='true'] {
  border: 2px solid #2b7fff !important;
  outline: 2px solid white;
  outline-offset: 0;
}
.logic-identity button:focus-visible {
  outline: 2px solid white;
  outline-offset: 4px;
}
.logic-identity button:hover {
  filter: brightness(1.12);
}
@media (max-width: 600px) {
  .logic-identity-name,
  .logic-identity-selects {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
