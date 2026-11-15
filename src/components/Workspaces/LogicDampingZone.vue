<template>
  <section
    class="logic-damping"
    :class="{ 'logic-damping--active': modelValue === true }"
    aria-label="Zona de Amortecimento das Bordas"
  >
    <div v-if="modelValue === true" class="logic-damping-title">
      <img src="/icons/logics/damping/sliders.svg" alt="" />
      <h3>Zona de Amortecimento das Bordas Diárias</h3>
    </div>
    <profile-section
      class="logic-damping-panel"
      :class="{ 'logic-damping-panel--active': modelValue === true }"
      :title="modelValue === true ? '' : 'Zona de Amortecimento das Bordas'"
      :icon-src="modelValue === true ? '' : '/icons/logics/damping/settings.svg'"
      :caption="
        modelValue === true ? '' : 'Ajuste dinâmico de probabilidade nas proximidades dos limites.'
      "
    >
      <div class="logic-damping-controls">
        <div class="logic-damping-label">
          <span>{{ modelValue === true ? 'Ativada' : 'Ativar Zona de Amortecimento' }}</span>
          <p v-if="modelValue !== true">{{ explanation }}</p>
        </div>
        <span v-if="modelValue == null" class="logic-damping-unknown" role="status"
          >Indisponível</span
        >
        <button
          v-if="modelValue != null || !disabled"
          type="button"
          class="logic-damping-switch"
          :class="{ 'logic-damping-switch--on': modelValue === true }"
          :role="modelValue == null ? undefined : 'switch'"
          :aria-checked="modelValue == null ? undefined : modelValue"
          :aria-pressed="modelValue == null ? 'mixed' : undefined"
          aria-label="Ativar Zona de Amortecimento"
          :aria-description="
            modelValue == null
              ? 'Configuração indisponível; escolha um estado para o rascunho.'
              : undefined
          "
          :disabled="disabled"
          @click="$emit('update:modelValue', modelValue !== true)"
        >
          <span />
        </button>
        <button
          v-if="modelValue === true"
          type="button"
          class="logic-damping-collapse"
          :aria-expanded="expanded"
          :aria-controls="bodyId"
          @click="expanded = !expanded"
        >
          <img
            src="/icons/logics/damping/chevron-up.svg"
            alt=""
            :class="{ 'logic-damping-chevron--closed': !expanded }"
          />{{ expanded ? 'Recolher' : 'Expandir' }}
        </button>
      </div>
      <div v-if="modelValue === true" v-show="expanded" :id="bodyId">
        <p class="logic-damping-explanation">{{ explanation }}</p>
        <div
          class="logic-damping-table"
          tabindex="0"
          role="region"
          aria-label="Faixas da zona de amortecimento"
        >
          <q-table
            flat
            dark
            dense
            :rows="rows"
            :columns="tableColumns"
            row-key="key"
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body-cell-from="p"
              ><q-td :props="p" :class="toneClass(p.row.from)">{{ p.value }}</q-td></template
            >
            <template #body-cell-to="p"
              ><q-td :props="p" :class="toneClass(p.row.to)">{{ p.value }}</q-td></template
            >
          </q-table>
        </div>
      </div>
    </profile-section>
  </section>
</template>
<script setup>
import { computed, ref, useId, watch } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import { dampingRows, dampingPercent, dampingTone } from 'src/services/logicDampingModel'
const props = defineProps({
  modelValue: { type: Boolean, default: null },
  disabled: Boolean,
  values: { type: Object, default: null },
})
defineEmits(['update:modelValue'])
const expanded = ref(true)
const bodyId = `logic-damping-${useId()}`
watch(
  () => props.modelValue,
  (value) => {
    if (value === true) expanded.value = true
  },
)
const explanation =
  'Quando ativada, ajusta a chance positiva ou negativa conforme o índice se aproxima do teto ou do piso diário.'
const rows = computed(() => dampingRows(props.values))
const tableColumns = [
  { name: 'label', label: 'Faixa', field: 'label', align: 'left' },
  {
    name: 'from',
    label: 'De',
    field: 'from',
    align: 'left',
    format: (value) => dampingPercent(value, true),
  },
  {
    name: 'to',
    label: 'Até',
    field: 'to',
    align: 'left',
    format: (value) => dampingPercent(value, true),
  },
  {
    name: 'positive',
    label: 'Chance positiva',
    field: 'positive',
    align: 'right',
    format: (value) => dampingPercent(value),
  },
  {
    name: 'negative',
    label: 'Chance negativa',
    field: 'negative',
    align: 'right',
    format: (value) => dampingPercent(value),
  },
]
const toneClass = (value) => {
  const tone = dampingTone(value)
  return tone ? `logic-damping-${tone}` : undefined
}
</script>
<style scoped>
.logic-damping {
  min-width: 0;
  color: rgba(255, 255, 255, 0.72);
}
.logic-damping-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-radius: 14px;
  background:
    linear-gradient(186.35deg, rgba(0, 0, 0, 0.118), rgba(0, 0, 0, 0.02)),
    linear-gradient(186.35deg, rgba(0, 0, 0, 0.078), rgba(0, 0, 0, 0.01)),
    linear-gradient(
      -14.59deg,
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
.logic-damping-panel :deep(.profile-section__heading) {
  padding: 24px;
  border: 0;
}
.logic-damping-panel :deep(.profile-section__heading h2) {
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}
.logic-damping-panel :deep(.profile-section__heading p) {
  margin: 6px 0 0;
  font-size: 16px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-damping-panel :deep(.profile-section__body) {
  padding: 24px;
}
.logic-damping-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 34px;
}
.logic-damping-label {
  flex: 1;
  min-width: 0;
}
.logic-damping-label > span {
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
}
.logic-damping-label p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
}
.logic-damping-unknown {
  font-size: 12px;
}
.logic-damping-switch {
  position: relative;
  flex: 0 0 32px;
  width: 32px;
  height: 18.4px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
.logic-damping-switch > span {
  position: absolute;
  top: 50%;
  left: 1px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(9, 19, 34, 0.58);
}
.logic-damping-switch--on {
  background: #008236;
  border-color: #008236;
}
.logic-damping-switch:disabled {
  cursor: default;
  opacity: 0.6;
}
.logic-damping-title {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 12px;
}
.logic-damping-title h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.logic-damping--active {
  background: linear-gradient(
    -14.608deg,
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
.logic-damping-panel--active {
  gap: 0;
  border-radius: 10px;
  background: linear-gradient(185.89deg, rgba(0, 0, 0, 0.196), rgba(0, 0, 0, 0.03));
}
.logic-damping-panel--active .logic-damping-controls {
  min-height: 28px;
}
.logic-damping-panel--active :deep(.profile-section__heading) {
  display: none;
}
.logic-damping-panel--active :deep(.profile-section__body) {
  padding: 20px;
}
.logic-damping-panel--active .logic-damping-label {
  flex: 0 1 auto;
}
.logic-damping-panel--active .logic-damping-label > span {
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
}
.logic-damping-collapse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-left: auto;
  min-height: 28px;
  padding: 1px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.72);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.logic-damping-chevron--closed {
  transform: rotate(180deg);
}
.logic-damping-explanation {
  margin: 16px 0 0;
  padding: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}
.logic-damping-table {
  margin-top: 16px;
  max-width: 100%;
  overflow-x: auto;
  color-scheme: dark;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
.logic-damping-table :deep(.q-table__container) {
  overflow: visible;
  background: transparent;
}
.logic-damping-table :deep(.q-table__middle) {
  overflow: visible;
}
.logic-damping-table :deep(table) {
  min-width: 720px;
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.logic-damping-table :deep(tr) {
  border: 1px solid rgba(255, 255, 255, 0.25);
  height: 37px;
}
.logic-damping-table :deep(tbody tr) {
  height: 36.8px;
}
.logic-damping-table :deep(thead tr) {
  height: 40px;
}
.logic-damping-table :deep(th),
.logic-damping-table :deep(td) {
  padding: 7px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 20px;
  white-space: normal;
  overflow-wrap: anywhere;
  border: 0;
}
.logic-damping-table :deep(th:first-child),
.logic-damping-table :deep(td:first-child) {
  width: 26%;
}
.logic-damping-table :deep(th:nth-child(2)),
.logic-damping-table :deep(th:nth-child(3)) {
  width: 13%;
}
.logic-damping-table :deep(th:nth-child(4)),
.logic-damping-table :deep(th:nth-child(5)) {
  width: 24%;
}
.logic-damping-table :deep(th) {
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
}
.logic-damping-table :deep(td:first-child) {
  font-weight: 700;
}
.logic-damping-table :deep(.logic-damping-positive) {
  color: #66e59e;
}
.logic-damping-table :deep(.logic-damping-negative) {
  color: #ff8a8a;
}
.logic-damping button:focus-visible,
.logic-damping-table:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
@media (max-width: 600px) {
  .logic-damping-controls {
    flex-wrap: wrap;
  }
  .logic-damping-label {
    flex-basis: calc(100% - 48px);
  }
  .logic-damping-unknown {
    flex: 1;
  }
  .logic-damping-panel--active .logic-damping-label {
    flex-basis: auto;
  }
}
</style>
