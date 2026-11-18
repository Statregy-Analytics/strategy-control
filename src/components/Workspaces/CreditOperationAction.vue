<template>
  <button
    class="credit-operation-action"
    type="button"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <img
      :src="icon === 'pen' ? '/icons/partners/pen.svg' : '/icons/credit/' + icon + '.svg'"
      alt=""
    />
    <span>{{ label }}</span>
  </button>
</template>
<script setup>
defineProps({
  label: { type: String, required: true },
  icon: { type: String, required: true },
  disabled: Boolean,
})
defineEmits(['click'])
</script>
<style scoped>
.credit-operation-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 32px;
  padding: 0.8px 14.8px;
  border: 0.8px solid #ffffff33;
  border-radius: 8px;
  background: #ffffff0f;
  color: #ffffffb8;
  font:
    500 14px/20px Inter,
    sans-serif;
  cursor: pointer;
}
.credit-operation-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.credit-operation-action:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
</style>
