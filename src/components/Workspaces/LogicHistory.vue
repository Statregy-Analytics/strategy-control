<template>
  <section class="logic-history" aria-labelledby="logic-history-title">
    <header class="logic-history__header">
      <div class="logic-history__heading">
        <q-btn outline no-caps class="logic-history__back" @click="$emit('close')">
          <img src="/icons/logics/lg09/arrow-left.svg" alt="" />Voltar para lógica
        </q-btn>
        <div class="logic-history__title">
          <h1 id="logic-history-title" ref="heading" tabindex="-1">HISTÓRICO COMPLETO DO MOTOR</h1>
          <p>
            Auditoria detalhada das atualizações do índice, parâmetros vigentes, travas aplicadas e
            impacto nos papéis vinculados.
          </p>
        </div>
        <div class="logic-history__exports" aria-label="Exportação do histórico">
          <q-btn outline no-caps disable
            ><img src="/icons/logics/lg09/download.svg" alt="" />Exportar CSV</q-btn
          >
          <q-btn outline no-caps disable
            ><img src="/icons/logics/lg09/file-text.svg" alt="" />Exportar PDF</q-btn
          >
        </div>
      </div>
      <div class="logic-history__controls">
        <div class="logic-history__group" role="group" aria-label="Período">
          <span>Período:</span>
          <div class="logic-history__options">
            <q-btn v-for="label in periods" :key="label" outline no-caps disable :label="label" />
          </div>
        </div>
        <div class="logic-history__group" role="group" aria-label="Granularidade">
          <span>Granularidade:</span>
          <div class="logic-history__options">
            <q-btn
              v-for="label in granularities"
              :key="label"
              outline
              no-caps
              disable
              :label="label"
            />
          </div>
        </div>
        <div class="logic-history__group" role="group" aria-label="Tipo de visualização">
          <span>Tipo de visualização:</span>
          <div class="logic-history__options">
            <q-btn outline no-caps :aria-pressed="view === 'table'" @click="view = 'table'">
              <img src="/icons/logics/lg09/table.svg" alt="" />Tabela
            </q-btn>
            <q-btn
              outline
              no-caps
              label="Gráfico"
              :aria-pressed="view === 'chart'"
              @click="view = 'chart'"
            />
          </div>
        </div>
      </div>
    </header>
    <main class="logic-history__body">
      <template v-if="view === 'table'">
        <p class="logic-history__availability" role="status">Histórico operacional indisponível.</p>
        <grouped-temporal-table :groups="logicHistoryGroups" />
      </template>
      <temporal-chart
        v-else
        :points="[]"
        label="Histórico completo do motor"
        empty-text="Histórico operacional indisponível."
      />
    </main>
  </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import TemporalChart from 'src/components/Entity/TemporalChart.vue'
import GroupedTemporalTable from 'src/components/Entity/GroupedTemporalTable.vue'
import { logicHistoryGroups } from 'src/services/logicHistoryModel'
defineEmits(['close'])
const heading = ref(null)
const view = ref('table')
const periods = ['Hoje', '7D', '30D', 'Mês', 'Ciclo trimestral', 'Tudo']
const granularities = ['Atualização', 'Hora', 'Dia', 'Semana', 'Mês']
// The published API exposes the engine catalog, not operational history.
// Keep data-dependent controls unavailable until their HTTP contract exists.
onMounted(() => heading.value?.focus())
</script>
<style scoped>
.logic-history {
  color: var(--sa-text, #fff);
  min-width: 0;
}
.logic-history__header {
  padding: 16px 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(181deg, rgba(0, 0, 0, 0.19), rgba(0, 0, 0, 0.03));
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.logic-history__heading,
.logic-history__exports,
.logic-history__controls,
.logic-history__group,
.logic-history__options {
  display: flex;
  align-items: center;
}
.logic-history__heading {
  gap: 16px;
  flex-wrap: wrap;
}
.logic-history__back {
  flex-shrink: 0;
}
.logic-history__title {
  flex: 1 1 480px;
  min-width: 0;
}
#logic-history-title {
  margin: 0;
  font-size: 18px;
  line-height: 28px;
  font-weight: 700;
}
#logic-history-title:focus {
  outline: none;
}
p {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
}
.logic-history__exports {
  gap: 8px;
  margin-left: auto;
}
.logic-history__controls {
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.logic-history__group {
  gap: 8px;
  flex-wrap: wrap;
}
.logic-history__group > span {
  font-size: 12px;
  font-weight: 600;
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
}
.logic-history__options {
  gap: 4px;
  flex-wrap: wrap;
}
.logic-history :deep(.q-btn) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  min-height: 28px;
  padding: 0 11px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.logic-history :deep(.q-btn::before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.logic-history :deep(.logic-history__back) {
  min-height: 36px;
  font-size: 14px;
  padding: 0 13px;
}
.logic-history__exports :deep(.q-btn) {
  min-height: 32px;
}
.logic-history :deep(.q-btn img) {
  margin-right: 8px;
  flex-shrink: 0;
}
.logic-history :deep(.q-btn[aria-pressed='true']) {
  background: rgba(255, 255, 255, 0.12);
}
.logic-history :deep(.q-btn:focus-visible) {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
.logic-history__body {
  padding: 24px;
}
.logic-history__availability {
  margin-bottom: 12px;
}
@media (max-width: 600px) {
  .logic-history__header,
  .logic-history__body {
    padding: 16px;
  }
  .logic-history__exports {
    margin-left: 0;
    flex-wrap: wrap;
  }
  .logic-history__title {
    flex-basis: 100%;
  }
}
</style>
