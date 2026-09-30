<template>
  <section class="form-section">
    <div v-if="title" class="form-section__title">{{ title }}</div>
    <div v-if="caption" class="form-section__caption">{{ caption }}</div>
    <div :class="title || caption ? 'q-mt-md' : ''"><slot /></div>
  </section>
</template>
<script setup>
defineProps({ title: { type: String, default: '' }, caption: { type: String, default: '' } })
</script>
<style scoped>
.form-section { padding: 28px 0; }
.form-section__title { color: inherit; font-size: 15px; font-weight: 700; letter-spacing: .02em; }
.form-section__caption { color: rgba(255,255,255,.52); font-size: 12px; margin-top: 3px; }
</style>
