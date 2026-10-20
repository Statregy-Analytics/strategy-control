<template>
  <dl class="profile-fields" :class="`profile-fields--${columns}`">
    <div v-for="field in fields" :key="field.label" :class="{ 'profile-fields__wide': field.wide }">
      <label-form v-if="editing" :text-label="field.label" class="profile-field-editor">
        <q-input
          outlined
          dense
          hide-bottom-space
          :model-value="
            editable.includes(field.editKey)
              ? values?.[field.editKey]
              : (field.value ?? 'Não informado')
          "
          :type="editable.includes(field.editKey) ? field.inputType || 'text' : 'text'"
          :readonly="!editable.includes(field.editKey)"
          :disable="busy"
          :aria-label="field.label"
          :class="{
            'profile-field-editor--changed':
              editable.includes(field.editKey) && changed(field.editKey),
          }"
          :error="Boolean(errors?.[field.editKey])"
          :error-message="errors?.[field.editKey]"
          @update:model-value="
            $emit('update:values', {
              ...values,
              [field.editKey]:
                field.inputType === 'number' && $event === '' ? null : $event,
            })
          "
          ><q-tooltip v-if="!editable.includes(field.editKey)"
            >Edição indisponível na API atual.</q-tooltip
          ></q-input
        >
      </label-form>
      <template v-else>
        <dt>{{ field.label }}</dt>
        <dd>{{ field.value ?? 'Não informado' }}</dd>
      </template>
    </div>
  </dl>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { sectionChanged } from 'src/services/clientSectionModel'
const props = defineProps({
  fields: { type: Array, required: true },
  columns: { type: Number, default: 4 },
  editing: Boolean,
  busy: Boolean,
  values: Object,
  original: Object,
  errors: Object,
  editable: { type: Array, default: () => [] },
})
defineEmits(['update:values'])
const changed = (key) => sectionChanged(props.values, props.original, key)
</script>
<style scoped>
.profile-field-editor :deep(.LabelForm > span),
.profile-field-editor :deep(span) {
  font-size: 12px;
}
.profile-field-editor--changed :deep(.q-field__control) {
  background: rgba(190, 219, 255, 0.08);
}
.profile-field-editor--changed :deep(.q-field__control:before) {
  border-color: rgba(190, 219, 255, 0.5);
}
.profile-field-editor :deep(.q-field__native) {
  font-size: 13px;
}
.profile-fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.profile-fields--5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
.profile-fields--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.profile-fields--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.profile-fields > div {
  min-width: 0;
}
.profile-fields__wide {
  grid-column: span 2;
}
dt {
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
@media (max-width: 1200px) {
  .profile-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .profile-fields {
    grid-template-columns: 1fr;
  }
  .profile-fields__wide {
    grid-column: auto;
  }
}
</style>
