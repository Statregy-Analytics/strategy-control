<template>
  <profile-section
    class="contract-panel"
    :title="title"
    :icon-src="icon ? `/icons/contracts/${icon}.svg` : ''"
    :caption="caption"
  >
    <template #actions><slot name="actions" /></template><slot />
  </profile-section>
</template>
<script setup>
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  caption: { type: String, default: '' },
})
</script>
<style scoped>
.contract-panel :deep(.profile-section__heading) {
  padding: 24px;
  min-height: 82px;
  background: linear-gradient(182deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.02));
  border-color: rgba(255, 255, 255, 0.05);
}
.contract-panel :deep(h2) {
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  gap: 12px;
}
.contract-panel :deep(.profile-section__body) {
  padding: 24px;
  padding-top: 48px;
}
@media (max-width: 700px) {
  .contract-panel :deep(.profile-section__heading),
  .contract-panel :deep(.profile-section__body) {
    padding: 16px;
  }
}
</style>
