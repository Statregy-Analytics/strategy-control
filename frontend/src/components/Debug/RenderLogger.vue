<template>
  <div>
    <component :is="component" />
  </div>
</template>

<script setup>
import { onMounted, onErrorCaptured, nextTick } from 'vue'
const props = defineProps({
  component: {
    type: [Object, Function],
    required: true,
  },
  routePath: {
    type: String,
    default: '',
  },
})

onMounted(async () => {
  // aguardar tick para garantir que async component seja resolvido
  await nextTick()
  try {
    const comp = props.component
    const name = comp && (comp.name || comp.__name || (comp && comp.__file) || 'unknown')
    console.debug('[DEBUG][RenderLogger] mounted route=', props.routePath, 'componentName=', name, 'component=', comp)
  } catch (e) {
    console.error('[DEBUG][RenderLogger] erro ao logar montagem', e)
  }
})

onErrorCaptured((err, instance, info) => {
  console.error('[DEBUG][RenderLogger] errorCaptured during render', { err, info, routePath: props.routePath })
  // Return false to continue propagation
  return false
})
</script>

<style scoped>
/* Intentionally empty: purely diagnostic */
</style>
