<template>
  <q-btn size="xs" padding="xs" flat icon="more_vert" :aria-label="ariaLabel">
    <q-menu transition-show="flip-right" transition-hide="flip-left">
      <q-btn v-for="action in actions" :key="action.name" flat no-caps v-close-popup class="row-action"
        :color="action.color" @click="emit('select', action.name)">
        <q-icon :name="action.icon" size="0.9rem" /><span class="q-ml-sm">{{ action.label }}</span>
      </q-btn>
    </q-menu>
  </q-btn>
</template>
<script setup>
defineProps({
  actions: { type: Array, required: true },
  ariaLabel: { type: String, default: 'Opções do registro' },
})
const emit = defineEmits(['select'])
</script>
<style scoped>.row-action { min-width: 181px; justify-content: flex-start; font-size: small; }</style>
