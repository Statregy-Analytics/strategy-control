<template>
  <dl class="profile-fields" :class="`profile-fields--${columns}`">
    <div v-for="field in fields" :key="field.label" :class="{ 'profile-fields__wide': field.wide }">
      <label-form v-if="editing" :text-label="field.label" class="profile-field-editor">
        <component
          :is="field.options ? GlassSelect : field.inputType === 'money' ? MoneyInput : QInput"
          :options="field.options"
          :multiple="field.multiple"
          :use-input="field.allowNewValue"
          :fill-input="field.allowNewValue"
          :hide-selected="field.allowNewValue"
          @new-value="(value, done) => done(value, 'add-unique')"
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
          :disable="busy || (!editable.includes(field.editKey) && Boolean(field.options))"
          :aria-label="field.label"
          :class="{
            'profile-field-editor--readonly': !editable.includes(field.editKey),
            'profile-field-editor--changed':
              editable.includes(field.editKey) && changed(field.editKey),
          }"
          :error="Boolean(errors?.[field.editKey])"
          :error-message="errors?.[field.editKey]"
          @update:model-value="
            $emit('update:values', {
              ...values,
              [field.editKey]: field.inputType === 'number' && $event === '' ? null : $event,
            })
          "
          ><template v-if="field.action" #append
            ><q-btn
              flat
              dense
              no-caps
              :label="field.action"
              size="sm"
              :disable="field.actionDisabled || busy"
              @click="$emit('field-action', field.editKey)"
              ><q-tooltip>{{ field.actionReason }}</q-tooltip></q-btn
            ></template
          ><q-tooltip v-if="!editable.includes(field.editKey)"
            >Edição indisponível na API atual.</q-tooltip
          ></component
        >
      </label-form>
      <template v-else>
        <dt>
          <img v-if="field.iconSrc" :src="field.iconSrc" alt="" width="14" height="14" />{{
            field.label
          }}
        </dt>
        <dd>
          <span
            :class="[
              {
                'profile-field-badge': field.badge,
                'profile-field--password': field.label === 'Status da senha',
                'profile-field--two-factor': field.label === '2FA',
              },
              field.tone ? `profile-field--${field.tone}` : '',
            ]"
          >
            <img
              v-if="field.valueIconSrc"
              :src="field.valueIconSrc"
              alt=""
              width="12"
              height="12"
            />
            {{ field.value ?? 'Não informado' }}
          </span>
        </dd>
      </template>
    </div>
  </dl>
</template>
<script setup>
import { QInput } from 'quasar'
import MoneyInput from 'src/components/Form/MoneyInput.vue'
import GlassSelect from './GlassSelect.vue'
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
defineEmits(['update:values', 'field-action'])
const changed = (key) => sectionChanged(props.values, props.original, key)
</script>
<style scoped>
.profile-field-editor {
  gap: 8px !important;
}
.profile-field-editor > :deep(span:first-child) {
  font-size: 12px !important;
  font-weight: 500 !important;
  color: var(--sa-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.profile-field-editor :deep(.q-field__control),
.profile-field-editor :deep(.q-field__marginal) {
  height: 36px;
  min-height: 36px;
}

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
.profile-field-editor :deep(.q-field__control) {
  min-height: 36px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
}
.profile-field-editor :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.profile-field-editor :deep(.q-field__control-container) {
  padding-top: 0;
}
.profile-field-editor--readonly :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.02);
}
.profile-field-editor--readonly :deep(.q-field__native) {
  color: rgba(255, 255, 255, 0.4);
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
  display: flex;
  align-items: center;
  gap: 6px;
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
dd > span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
}
dt img,
dd img {
  flex: none;
}
.profile-field-badge {
  padding: 1px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 11px;
}
.profile-field--ok {
  color: #74ffa0;
}
.profile-field-badge.profile-field--ok {
  border-color: rgba(116, 255, 160, 0.4);
  background: rgba(0, 200, 80, 0.12);
}
.profile-field--pending {
  color: #fee685;
}
.profile-field--inactive {
  color: rgba(255, 255, 255, 0.65);
}
.profile-field--password {
  font-size: 14px;
}
.profile-field--password.profile-field--ok {
  color: #00a63e;
}
.profile-field--two-factor {
  min-width: 46px;
  height: 22px;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
}
.profile-field--two-factor.profile-field--ok {
  color: #73ffa1;
  border-color: #73ffa1;
  background: rgba(0, 122, 84, 0.2);
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
