<template>
  <div class="credit-view-toggle" role="group" aria-label="Visualização das operações">
    <button
      v-for="item in views"
      :key="item.value"
      :aria-label="item.label"
      :aria-pressed="modelValue === item.value"
      @click="$emit('update:modelValue', item.value)"
    >
      <img
        :src="
          '/icons/credit-directory/view-' +
          item.asset +
          '-' +
          (modelValue === item.value ? 'on' : 'off') +
          '.svg'
        "
        alt=""
      />
    </button>
  </div>
</template>
<script setup>
defineProps({ modelValue: { type: String, default: 'list' } })
defineEmits(['update:modelValue'])
const views = [
  { value: 'list', label: 'Lista', asset: 'list' },
  { value: 'cards', label: 'Cards', asset: 'cards' },
  { value: 'kanban', label: 'Kanban', asset: 'kanban' },
]
</script>
<style scoped>
.credit-view-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px;
  border: 1px solid #ffffff1f;
  border-radius: 10px;
  background: #ffffff0d;
  width: max-content;
  flex: none;
}
.credit-view-toggle button {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  padding: 6px;
  cursor: pointer;
}
.credit-view-toggle button[aria-pressed='true'] {
  width: 30px;
  height: 30px;
  border-color: #ffffff33;
  background: linear-gradient(90deg, #ffffff14, #ffffff08 50%, #ffffff12);
  box-shadow: 0 1px 3px #0000001a;
}
.credit-view-toggle button:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 2px;
}
</style>
