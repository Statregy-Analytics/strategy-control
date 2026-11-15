<template>
  <div class="LabelForm" :class="className" style="display: grid; gap: 4px">
    <span
      :style="{
        fontSize: typeof labelSize === 'number' ? labelSize + 'px' : labelSize,
        fontWeight: 500,
      }"
      >{{ textLabel }}</span
    >
    <slot></slot>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LabelForm',
  props: {
    labelSize: { type: [Number, String], default: 14 },
    className: {
      type: String,
      default: '',
    },
    textLabel: {
      type: String,
      default: 'Nome Label',
    },
  },
})
</script>
