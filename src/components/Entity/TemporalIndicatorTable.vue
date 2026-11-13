<template>
  <div class="indicator-scroll" role="region" :aria-label="label" tabindex="0">
    <table>
      <thead>
        <tr>
          <th scope="col">Indicador</th>
          <th scope="col">—</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="indicator in indicators" :key="indicator">
          <th scope="row">{{ indicator }}</th>
          <td>Indisponível</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
defineProps({
  indicators: { type: Array, required: true },
  label: { type: String, default: 'Indicadores temporais' },
})
</script>
<style scoped>
.indicator-scroll {
  overflow: auto;
  min-width: 0;
  color: var(--sa-text, #fff);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
th,
td {
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 8px;
  font-weight: 500;
  text-align: center;
}
th:first-child {
  text-align: left;
  width: 230px;
  background: rgba(255, 255, 255, 0.05);
  text-transform: uppercase;
  font-weight: 600;
}
thead th {
  height: 40px;
}
td {
  color: var(--sa-muted, rgba(255, 255, 255, 0.6));
}
</style>
