<template>
  <span class="contract-status-badge" :class="'contract-status-badge--' + status.tone">{{
    status.label
  }}</span>
</template>
<script setup>
defineProps({ status: { type: Object, required: true } })
</script>
<style scoped>
.contract-status-badge {
  display: inline-block;
  border: 1px solid #ffffff4d;
  border-radius: 8px;
  background: #0000001a;
  color: #ffffff99;
  padding: 3px 8px;
  font:
    500 10px/15px Inter,
    sans-serif;
  letter-spacing: 0.25px;
  text-transform: uppercase;
  white-space: nowrap;
}
.contract-status-badge--active {
  border-color: #74ffa0;
  color: #74ffa0;
  background: #007a5533;
}
.contract-status-badge--blocked {
  border-color: #ffa6a6;
  color: #ffa6a6;
  background: #7a001d33;
}
.contract-status-badge--analysis {
  border-color: #ffe49d;
  color: #ffe49d;
  background: #7a5d0033;
}
</style>
