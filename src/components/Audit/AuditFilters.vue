<template>
  <div class="audit-filters" :class="{ stacked }">
    <q-btn
      outline
      no-caps
      class="audit-period"
      :label="periodLabel"
      :title="periodLabel"
      aria-label="Período"
      :aria-expanded="periodOpen"
      ><img src="/icons/audit/chevron.svg" alt="" /><q-menu v-model="periodOpen"
        ><q-card class="audit-calendar"
          ><q-date
            :model-value="period"
            range
            mask="YYYY-MM-DD"
            :default-year-month="
              modelValue.from || modelValue.to
                ? (modelValue.from || modelValue.to).slice(0, 7).replace('-', '/')
                : undefined
            "
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
      :title="auditActors.find((x) => x.value === modelValue.actor)?.label || 'Autor'"
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
      :title="modelValue.module ? auditModule(modelValue.module) : 'Módulo'"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @popup-show="emit('modules')"
      @update:model-value="emit('change', { module: $event || '' })"
      ><template #no-option
        ><q-item
          ><q-item-section>{{
            modulesLoading ? 'Carregando módulos...' : modulesError || 'Nenhum módulo registrado.'
          }}</q-item-section></q-item
        ></template
      ><template #after-options
        ><q-item v-if="modules.length && modulesError" role="alert"
          ><q-item-section>{{ modulesError }}</q-item-section></q-item
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
      :title="auditActions.find((x) => x.value === modelValue.action)?.label || 'Ação'"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @update:model-value="emit('change', { action: $event || '' })"
    />
    <customer-select
      :model-value="modelValue.customer || null"
      :current="customer"
      :selected-label="customer?.displayName || ''"
      :resolving="customerLoading"
      dark
      :placeholder="modelValue.customer ? undefined : 'Cliente'"
      hide-selected
      fill-input
      :title="customer?.displayName"
      dropdown-icon="img:/icons/audit/chevron.svg"
      @update:model-value="emit('change', { customer: $event || '' })"
      @resolved="emit('customer-resolved', $event)"
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
  customerLoading: Boolean,
  stacked: Boolean,
})
const emit = defineEmits(['change', 'modules', 'customer-resolved'])
const periodOpen = ref(false)
function clearPeriod() {
  emit('change', { from: '', to: '' })
  periodOpen.value = false
}
const period = computed(() =>
  props.modelValue.from && props.modelValue.to
    ? { from: props.modelValue.from, to: props.modelValue.to }
    : props.modelValue.from || props.modelValue.to || null,
)
const dateLabel = (value) => value.split('-').reverse().join('/')
const periodLabel = computed(() => {
  const { from, to } = props.modelValue
  if (from && to) return from === to ? dateLabel(from) : `${dateLabel(from)} – ${dateLabel(to)}`
  if (from) return `A partir de ${dateLabel(from)}`
  if (to) return `Até ${dateLabel(to)}`
  return 'Período'
})
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
  flex-wrap: nowrap;
}
.audit-filters :deep(.q-select .q-field__native > span) {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
