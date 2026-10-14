<template>
  <section class="profile-section">
    <header class="profile-section__heading">
      <div>
        <h2>
          <img v-if="iconSrc" :src="iconSrc" alt="" /><q-icon
            v-else-if="icon"
            :name="icon"
            size="16px"
          />{{ title }}
        </h2>
        <p v-if="caption">{{ caption }}</p>
      </div>
      <slot name="actions" />
    </header>
    <div class="profile-section__body"><slot /></div>
  </section>
</template>
<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  iconSrc: { type: String, default: '' },
  caption: { type: String, default: '' },
})
</script>
<style scoped>
.profile-section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--sa-radius);
  background: linear-gradient(160deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.04));
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
  backdrop-filter: blur(20px);
}
.profile-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 75px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}
h2 img {
  flex: none;
}
p {
  margin: 6px 0 0;
  color: var(--sa-muted);
  font-size: 12px;
  line-height: 18px;
}
.profile-section__body {
  padding: 24px;
}
@media (max-width: 700px) {
  .profile-section__heading {
    padding: 16px;
  }
  .profile-section__body {
    padding: 20px 16px;
  }
}
</style>
