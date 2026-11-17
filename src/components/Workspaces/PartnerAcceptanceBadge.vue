<template>
  <span class="partner-acceptance" :class="tone">{{ label }}</span>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ value: { type: String, default: null } })
const label = computed(() =>
  ['Sim', 'Sob análise', 'Não'].includes(props.value) ? props.value : '—',
)
const tone = computed(
  () => ({ Sim: 'accepted', 'Sob análise': 'review', Não: 'rejected' })[props.value],
)
</script>
<style scoped>
.partner-acceptance {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  padding: 3px 8px;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  font:
    500 10px/16px Inter,
    sans-serif;
  letter-spacing: 0.25px;
  text-transform: uppercase;
  color: #ffffffb8;
}
.accepted {
  color: #74ffa0;
  border-color: #74ffa0;
  background: #007a5533;
}
.review {
  color: #ffd074;
  border-color: #ffd074;
  background: #a3680033;
}
.rejected {
  color: #ff9a9a;
  border-color: #ff9a9a;
  background: #9f1d3533;
}
</style>
