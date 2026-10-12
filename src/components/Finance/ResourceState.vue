<template>
  <div :aria-busy="state.loading">
    <q-linear-progress v-if="state.loading" indeterminate aria-label="Carregando" />
    <q-banner v-else-if="state.error" class="bg-transparent" role="alert"
      >{{ state.error
      }}<template #action
        ><q-btn flat no-caps label="Tentar novamente" @click="$emit('retry')" /></template
    ></q-banner>
    <slot v-else :data="state.data" />
  </div>
</template>
<script setup>
defineProps({ state: { type: Object, required: true } })
defineEmits(['retry'])
</script>
