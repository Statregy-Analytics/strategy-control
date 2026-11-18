<template>
  <span class="credit-stage" :class="{ current }">{{ label || '—' }}</span>
</template>
<script setup>
defineProps({ label: { type: String, default: null }, current: Boolean })
</script>
<style scoped>
.credit-stage {
  display: inline-flex;
  padding: 7px 13px;
  border: 1px solid #ffffff33;
  border-radius: 999px;
  background: #ffffff0d;
  color: #ffffffb8;
  font:
    500 12px/16px Inter,
    sans-serif;
  max-width: 100%;
  overflow-wrap: anywhere;
}
.credit-stage.current {
  color: white;
  padding: 6.8px 12.8px;
  border: 0.8px solid #ffffff42;
  background: linear-gradient(89deg, #ffffff1f, #ffffff0d 50%, #ffffff1a);
}
</style>
