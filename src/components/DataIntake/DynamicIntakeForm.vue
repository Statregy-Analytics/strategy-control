<template>
  <div>
    <q-banner v-if="unsupported.length" class="bg-red-1 text-negative q-mb-md" role="alert">
      Este formulário contém campos ainda não suportados: {{ unsupported.join(', ') }}. A edição está bloqueada até a compatibilidade ser ajustada.
    </q-banner>
    <form-section v-for="section in sections" :key="section.id" :title="section.title">
      <div class="row q-col-gutter-md">
        <template v-for="key in section.fields" :key="key">
          <div v-if="fields[key].component === 'attachment'" class="col-12">
            <slot name="attachment" :field="fields[key]" />
          </div>
          <label-form v-else-if="visible(key)" class-name="col-12 col-md-4" :text-label="label(key)" :data-intake-field="key">
            <q-select dark options-dense hide-bottom-space v-if="fields[key].component === 'select'" :model-value="modelValue[key]" :options="options(key)" emit-value map-options outlined dense clearable :disable="disabled" :aria-label="label(key)" :error="!!errors[key]" :error-message="errors[key]" @update:model-value="setValue(key, $event)" />
            <q-field dark hide-bottom-space v-else-if="fields[key].component === 'toggle'" borderless dense :error="!!errors[key]" :error-message="errors[key]">
              <template #control><q-toggle :model-value="modelValue[key] ?? false" :disable="disabled" :aria-label="label(key)" :label="modelValue[key] ? 'Sim' : 'Não'" @update:model-value="setValue(key, $event)" /></template>
            </q-field>
            <q-input dark hide-bottom-space v-else-if="fields[key].component === 'currency'" :model-value="currencyText(modelValue[key])" outlined dense inputmode="decimal" prefix="R$" :disable="disabled" :aria-label="label(key)" :placeholder="fields[key].placeholder" :error="!!errors[key]" :error-message="errors[key]" @change="setCurrency(key, $event)" />
            <q-input dark hide-bottom-space v-else-if="supported(fields[key])" :model-value="modelValue[key]" outlined dense :type="numeric(key) ? 'number' : 'text'" :step="fields[key].component === 'stepper' ? 1 : 'any'" :min="fields[key].schema.minimum" :max="fields[key].schema.maximum" :disable="disabled" :aria-label="label(key)" :placeholder="fields[key].placeholder" :error="!!errors[key]" :error-message="errors[key]" @update:model-value="setValue(key, numeric(key) && $event !== '' && $event !== null ? Number($event) : $event)">
              <template v-if="fields[key].component === 'stepper' && !disabled" #prepend><q-btn flat round dense icon="remove" :aria-label="`Diminuir ${fields[key].label}`" :disable="(modelValue[key] ?? 0) <= (fields[key].schema.minimum ?? -Infinity)" @click="increment(key, -1)" /></template>
              <template v-if="fields[key].component === 'stepper' && !disabled" #append><q-btn flat round dense icon="add" :aria-label="`Aumentar ${fields[key].label}`" :disable="(modelValue[key] ?? 0) >= (fields[key].schema.maximum ?? Infinity)" @click="increment(key, 1)" /></template>
            </q-input>
            <div v-if="fields[key].helpText" class="text-caption text-muted">{{ fields[key].helpText }}</div>
          </label-form>
        </template>
      </div>
    </form-section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import { components, formFields, formSections, fieldVisible, isDebtField } from './formModel'

const props = defineProps({ form: { type: Object, required: true }, modelValue: { type: Object, required: true }, errors: { type: Object, default: () => ({}) }, disabled: Boolean })
const emit = defineEmits(['update:modelValue'])
const fields = computed(() => formFields(props.form))
const sections = computed(() => formSections(props.form))
const supported = (field) => components.includes(field.component) && !['object', 'array'].includes(field.schema.type)
const unsupported = computed(() => Object.values(fields.value).filter((field) => !supported(field)).map((field) => field.label))
const visible = (key) => fieldVisible(props.form, key, props.modelValue)
const label = (key) => `${fields.value[key].label}${props.form.schema.required?.includes(key) || (isDebtField(props.form, key) && props.modelValue.estaQuitado === false) ? ' *' : ''}`
const options = (key) => fields.value[key].options || (fields.value[key].schema.enum || []).map((value) => ({ label: String(value), value }))
const numeric = (key) => ['number', 'stepper'].includes(fields.value[key].component)
const currencyText = (value) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : value ?? ''
function setValue(key, value) { emit('update:modelValue', { ...props.modelValue, [key]: value }) }
function setCurrency(key, text) {
  const cleaned = String(text).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  setValue(key, cleaned === '' ? undefined : /^-?\d+(\.\d{1,2})?$/.test(cleaned) ? Number(cleaned) : text)
}
function increment(key, amount) {
  const schema = fields.value[key].schema
  setValue(key, Math.min(schema.maximum ?? Infinity, Math.max(schema.minimum ?? -Infinity, (Number(props.modelValue[key]) || 0) + amount)))
}
</script>

<style scoped>
:deep(.q-field__prefix) { color: inherit; }
</style>
