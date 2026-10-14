<template>
  <dl class="profile-fields" :class="`profile-fields--${columns}`">
    <div v-for="field in fields" :key="field.label" :class="{ 'profile-fields__wide': field.wide }">
      <dt>{{ field.label }}</dt>
      <dd>{{ field.value ?? 'Não informado' }}</dd>
    </div>
  </dl>
</template>
<script setup>
defineProps({ fields: { type: Array, required: true }, columns: { type: Number, default: 4 } })
</script>
<style scoped>
.profile-fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin: 0;
}
.profile-fields--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.profile-fields--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.profile-fields > div {
  min-width: 0;
}
.profile-fields__wide {
  grid-column: span 2;
}
dt {
  margin-bottom: 7px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}
@media (max-width: 1200px) {
  .profile-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .profile-fields {
    grid-template-columns: 1fr;
  }
  .profile-fields__wide {
    grid-column: auto;
  }
}
</style>
