<template>
  <q-banner inline-actions rounded class="entity-header q-ma-md border-pattern">
    <div class="row items-center no-wrap">
      <q-avatar size="38px" :color="avatar ? undefined : 'blue-grey-1'" text-color="blue-grey-7" :icon="avatar ? undefined : 'person'">
        <q-img v-if="avatar" :src="avatar" :alt="name" />
      </q-avatar>
      <div class="q-ml-md entity-header__identity">
        <span class="text-muted entity-header__id">ID #{{ displayId }}</span>
        <div class="text-subtitle1 text-weight-medium ellipsis">{{ name }}</div>
      </div>
      <slot name="status" />
      <q-btn v-if="options.length" flat round dense color="grey-6" icon="keyboard_arrow_down" :aria-label="switchLabel">
        <q-menu self="top middle" square>
          <q-list class="entity-header__switcher">
            <q-item v-for="option in options" :key="option.id" clickable v-close-popup
              :active="option.id === id" active-class="bg-blue-1 text-primary" @click="emit('select', option.id)">
              <q-item-section avatar>
                <q-avatar size="32px" :color="option.avatar ? undefined : 'blue-grey-1'" text-color="blue-grey-7" :icon="option.avatar ? undefined : 'person'">
                  <q-img v-if="option.avatar" :src="option.avatar" :alt="option.name" />
                </q-avatar>
              </q-item-section>
              <q-item-section><q-item-label>{{ option.name }}</q-item-label><q-item-label v-if="option.caption" caption>{{ option.caption }}</q-item-label></q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <template #action><slot name="actions" /></template>
  </q-banner>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  id: { type: [String, Number], required: true }, name: { type: String, required: true },
  avatar: { type: String, default: '' }, options: { type: Array, default: () => [] },
  shortId: { type: Boolean, default: false }, switchLabel: { type: String, default: 'Trocar registro' },
})
const emit = defineEmits(['select'])
const displayId = computed(() => props.shortId ? String(props.id).slice(0, 8) : props.id)
</script>

<style scoped>
.entity-header { min-height: 74px; }
.entity-header__identity { min-width: 170px; max-width: 280px; }
.entity-header__id { font-size: 12px; }
.entity-header__switcher { min-width: 360px; max-height: 480px; overflow-y: auto; padding: 4px; }
</style>
