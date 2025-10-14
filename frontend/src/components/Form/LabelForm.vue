<template>
  <div class="LabelForm" :class="className">
    <span class="label-text">
      {{ textLabel }}<span v-if="required" class="label-required">*</span>
    </span>
    <div v-if="helperText" class="helper-text">{{ helperText }}</div>
    <slot></slot>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LabelForm',
  props: {
    className: {
      type: String,
      default: '',
    },
    textLabel: {
      type: String,
      default: 'Nome Label',
    },
    required: {
      type: Boolean,
      default: false,
    },
    helperText: {
      type: String,
      default: '',
    },
  },
})
</script>
<style scoped>
/* Layout: force consistent vertical rhythm so all form controls align in the grid */
.LabelForm {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 6px;
  align-items: stretch;
  /* Give each label+control a minimum height so columns align when labels wrap or error messages appear */
  min-height: 84px;
}
.LabelForm > * { width: 100% }
.label-text { font-size: 13px; font-weight: 500; min-height: 20px; line-height: 20px; display: block }
.label-required { color: var(--q-color-negative, #e53935); margin-left: 6px }

.helper-text { font-size: 12px; color: #6b6b6b; margin-bottom: 6px }

/* Reset margins from Quasar field wrappers inside LabelForm */
.LabelForm :deep(.q-field) { margin: 0; box-sizing: border-box }

/* Make Quasar fields occupy the remaining vertical space inside the wrapper so inputs align */
.LabelForm :deep(.q-field) {
  height: 100%;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Ensure the control area is vertically centered and consistent across input types */
.LabelForm :deep(.q-field__control) {
  min-height: 34px;
  display: flex;
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
}

/* Target native inputs, selects and date controls to the same visual height */
.LabelForm :deep(.q-field__native),
.LabelForm :deep(.q-field__control input),
.LabelForm :deep(.q-select .q-field__native),
.LabelForm :deep(input[type="date"]) {
  height: 32px !important;
  line-height: 32px !important;
  padding: 4px 8px !important;
  box-sizing: border-box;
}

/* Small responsive tweak: slightly reduce min-height on small screens to keep compactness */
@media (max-width: 600px) {
  .LabelForm { min-height: 72px }
}
</style>
