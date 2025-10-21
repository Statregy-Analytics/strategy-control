<template>
  <q-avatar :size="size" :rounded="rounded" :color="bgColor" class="avatar-initials">
    <template v-if="srcToUse && srcToUse !== ''">
      <q-img :src="srcToUse" />
    </template>
    <template v-else>
      <div class="initials">{{ initials }}</div>
    </template>
  </q-avatar>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: '32px' },
  rounded: { type: Boolean, default: false },
})

const initials = computed(() => {
  try {
    if (!props.name) return ''
    const parts = String(props.name).trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    const first = parts[0].slice(0, 1).toUpperCase()
    const last = parts[parts.length - 1].slice(0, 1).toUpperCase()
    return `${first}${last}`
  } catch {
    return ''
  }
})

// simple deterministic background color based on name
// resolve /storage paths to the API host so dev server origin doesn't break images
const srcToUse = computed(() => {
  try {
    const s = props.src || ''
    if (!s) return ''
    if (s.startsWith('/storage')) {
      const apiBase =
        (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
        'http://localhost:3333'
      return `${String(apiBase).replace(/\/$/, '')}${s}`
    }
    return s
  } catch {
    return props.src || ''
  }
})

const bgColor = computed(() => {
  if (props.src) return ''
  const name = props.name || ''
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 60%, 85%)`
})
</script>

<style scoped>
.avatar-initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.initials {
  font-weight: 700;
  color: #2c3e50;
}
</style>
