<template>
  <span class="logic-status" :class="'logic-status--' + tone"
    ><img v-if="icon" :src="logicImage(icon)" alt="" />{{ logicStateLabel(value) }}</span
  >
</template>
<script setup>
import { computed } from 'vue'
import { logicState, logicStateLabel, logicImage } from 'src/services/logicDirectoryModel'
const props = defineProps({ value: { type: String, default: null } })
const tone = computed(() => logicState(props.value))
const icon = computed(
  () =>
    ({
      active: 'cards-imgCircleCheck2',
      closed: 'cards-imgCircleCheck1',
      paused: 'cards-imgCirclePause',
      analysis: 'cards-imgCircleAlert1',
    })[tone.value],
)
</script>
<style scoped>
.logic-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  border: 0.5px solid white;
  border-radius: 8px;
  background: #00000033;
  padding: 3px 10px;
  color: white;
  font:
    400 10px/16px Inter,
    sans-serif;
}
.logic-status--active {
  background: #007a5533;
  border-color: #74ffa0;
  color: #74ffa0;
  text-transform: uppercase;
}
.logic-status--analysis {
  background: #7a5d0033;
  border-color: #ffe49d;
  color: #ffe49d;
  text-transform: uppercase;
}
</style>
