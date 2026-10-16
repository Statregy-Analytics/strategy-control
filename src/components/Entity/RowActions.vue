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
.row-actions-menu { min-width: 208px; max-width: calc(100vw - 32px); border-radius: 12px; }
.row-actions-menu .q-list { display: flex; flex-direction: column; gap: 3px; padding: 6px; }
.row-actions-menu.q-menu--dark {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sa-text);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.row-actions-menu .row-action { min-height: 36px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; }
.row-actions-menu.q-menu--dark .row-action { background: rgba(255, 255, 255, 0.02); }
.row-actions-menu.q-menu--dark .row-action:hover,
.row-actions-menu.q-menu--dark .row-action:focus {
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.07));
}
.row-actions-menu .row-action .q-item__section--avatar { min-width: 30px; padding-right: 8px; }
.row-actions-menu.q-menu--dark .row-action.text-grey-7 { color: var(--sa-text) !important; }
.row-actions-menu.q-menu--dark .row-action.text-primary .q-item__section--main { color: var(--sa-text); }
.row-actions-menu.q-menu--dark .row-action.text-negative { color: #ff6b78 !important; }
</style>
