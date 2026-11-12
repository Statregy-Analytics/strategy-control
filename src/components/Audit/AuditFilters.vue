<template>
  <div class="audit-filters" :class="{ stacked }">
    <q-btn
      outline
      no-caps
      class="audit-period"
      :label="periodLabel"
      aria-label="Período"
      :aria-expanded="periodOpen"
      ><img src="/icons/audit/chevron.svg" alt="" /><q-menu v-model="periodOpen"
        ><q-card class="audit-calendar"
          ><q-date
            :model-value="period"
            range
            mask="YYYY-MM-DD"
            dark
            @update:model-value="changePeriod" /><q-btn
            flat
            dense
            no-caps
            label="Limpar período"
            @click="clearPeriod" /></q-card></q-menu
    ></q-btn>
    <q-select
      :model-value="modelValue.actor || null"
      :options="auditActors"
      emit-value
      map-options
      clearable
      outlined
      dense
      dark
      placeholder="Autor"
      :display-value="auditActors.find((x) => x.value === modelValue.actor)?.label || 'Autor'"
      aria-label="Autor"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @update:model-value="emit('change', { actor: $event || '' })"
    />
    <q-select
      :model-value="modelValue.module || null"
      :options="modules"
      emit-value
      map-options
      clearable
      outlined
      dense
      dark
      :loading="modulesLoading"
      :display-value="modelValue.module ? auditModule(modelValue.module) : 'Módulo'"
      aria-label="Módulo"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @popup-show="emit('modules')"
      @update:model-value="emit('change', { module: $event || '' })"
      ><template #no-option
        ><q-item
          ><q-item-section>{{
            modulesError || 'Nenhum módulo registrado.'
          }}</q-item-section></q-item
        ></template
      ></q-select
    >
    <q-select
      :model-value="modelValue.action || null"
      :options="auditActions"
      emit-value
      map-options
      clearable
      outlined
      dense
      dark
      :display-value="auditActions.find((x) => x.value === modelValue.action)?.label || 'Ação'"
      aria-label="Ação"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @update:model-value="emit('change', { action: $event || '' })"
    />
    <customer-select
      :model-value="modelValue.customer || null"
      :current="customer"
      dark
      :placeholder="modelValue.customer ? undefined : 'Cliente'"
      hide-selected
      fill-input
      :title="customer?.displayName"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @update:model-value="emit('change', { customer: $event || '' })"
    />
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import CustomerSelect from 'src/components/Finance/CustomerSelect.vue'
import { auditActors, auditActions, auditModule } from 'src/services/auditModel'
const props = defineProps({
  modelValue: { type: Object, required: true },
  modules: { type: Array, default: () => [] },
  modulesLoading: Boolean,
  modulesError: String,
  customer: { type: Object, default: null },
  stacked: Boolean,
})
const emit = defineEmits(['change', 'modules'])
const periodOpen = ref(false)
function clearPeriod() {
  emit('change', { from: '', to: '' })
  periodOpen.value = false
}
const period = computed(() =>
  props.modelValue.from
    ? { from: props.modelValue.from, to: props.modelValue.to || props.modelValue.from }
    : null,
)
const periodLabel = computed(() =>
  props.modelValue.from
    ? [props.modelValue.from, props.modelValue.to]
        .filter(Boolean)
        .map((v) => v.split('-').reverse().join('/'))
        .join(' – ')
    : 'Período',
)
function changePeriod(value) {
  if (!value) return
  emit(
    'change',
    typeof value === 'string' ? { from: value, to: value } : { from: value.from, to: value.to },
  )
  periodOpen.value = false
}
</script>
<style scoped>
.audit-filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}
.audit-filters.stacked {
  grid-template-columns: 1fr;
  gap: 16px;
}
.audit-filters :deep(.q-field) {
  min-width: 0;
}
.audit-filters :deep(.q-field__control),
.audit-period {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
  background: linear-gradient(89deg, #ffffff1f, #ffffff0d, #ffffff1a);
}
.audit-filters :deep(.q-field__native),
.audit-filters :deep(.q-field__input),
.audit-period {
  color: rgba(255, 255, 255, 0.72);
  font:
    400 14px/20px Inter,
    sans-serif;
}
.audit-filters :deep(.q-field__native) {
  min-height: 36px;
}
.audit-filters :deep(.q-field__marginal) {
  height: 36px;
}
.audit-filters :deep(.q-select__dropdown-icon),
.audit-period img {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.audit-period :deep(.q-btn__content) {
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}
.audit-period :deep(.block) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.audit-period:before {
  border-color: rgba(255, 255, 255, 0.12);
}
.audit-calendar {
  background: #242a3b;
  color: #fff;
  padding: 8px;
}
@media (max-width: 1150px) {
  .audit-filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 599px) {
  .audit-filters {
    grid-template-columns: 1fr;
  }
}
</style>
