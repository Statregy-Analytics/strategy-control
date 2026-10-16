<template>
  <q-btn size="xs" padding="xs" flat icon="more_vert" :aria-label="ariaLabel">
    <q-menu :dark="dark" anchor="bottom right" self="top right" :offset="[0, 6]"
      class="row-actions-menu" transition-show="fade" transition-hide="fade">
      <q-list dense padding role="menu" :aria-label="ariaLabel">
        <q-item v-for="action in actions" :key="action.name" clickable v-close-popup
          class="row-action" :class="action.color ? `text-${action.color}` : undefined"
          role="menuitem" @click="emit('select', action.name)">
          <q-item-section avatar><q-icon :name="action.icon" size="18px" /></q-item-section>
          <q-item-section>{{ action.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script setup>
defineProps({
  dark: { type: Boolean, default: null },
  actions: { type: Array, required: true },
  ariaLabel: { type: String, default: 'Opções do registro' },
})
const emit = defineEmits(['select'])
</script>
<style>
.row-actions-menu { min-width: 208px; max-width: calc(100vw - 32px); border-radius: 8px; }
.row-actions-menu.q-menu--dark { background: var(--sa-bg); color: var(--sa-text); border: 1px solid var(--sa-border); }
.row-actions-menu .row-action { min-height: 38px; font-size: 14px; }
.row-actions-menu .row-action .q-item__section--avatar { min-width: 30px; padding-right: 8px; }
.row-actions-menu.q-menu--dark .row-action.text-grey-7 { color: var(--sa-text) !important; }
.row-actions-menu.q-menu--dark .row-action.text-negative { color: #ff6b78 !important; }
</style>
