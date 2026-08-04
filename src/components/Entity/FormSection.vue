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
.form-section__title { font-size: 18px; font-weight: 700; }
.form-section__caption { color: #757575; font-size: 13px; margin-top: 2px; }
</style>
