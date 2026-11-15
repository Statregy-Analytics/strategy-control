<template>
  <article class="logic-card" :aria-label="`Motor ${record.name || record.code}`">
    <div class="logic-card-body">
      <header class="logic-card-heading">
        <logic-executive-summary
          :name="record.name || record.code"
          :description="record.description"
        >
          <div class="logic-card-identity">
            <span class="logic-card-symbol"
              ><img src="/icons/logics/lg01/chart-pie.svg" alt=""
            /></span>
            <div class="logic-card-title">
              <h2>{{ record.name || record.code }}</h2>
              <div class="logic-card-tags">
                <span class="logic-card-code">{{ record.code || '—' }}</span>
                <span class="logic-card-status"
                  ><img v-if="closed" src="/icons/logics/lg01/circle-check.svg" alt="" />{{
                    workspaceStatus(record.status)
                  }}</span
                >
              </div>
            </div>
          </div>
        </logic-executive-summary>
        <row-actions
          class="logic-card-options"
          dark
          icon-src="/icons/logics/lg01/ellipsis.svg"
          :aria-label="`Opções do motor ${record.name || record.code}`"
          :actions="actions"
          @select="emit('select', $event)"
        />
      </header>
      <dl class="logic-card-metrics">
        <div v-for="label in metrics" :key="label">
          <dt>{{ label }}</dt>
          <dd>
            <img
              v-if="label === 'Papéis/Contratos'"
              src="/icons/logics/lg01/link.svg"
              alt=""
            />Indisponível
          </dd>
        </div>
      </dl>
      <div class="logic-card-cycle">
        <p><span>Ciclo Atual:</span><span>Indisponível</span></p>
        <p><span>Performance do Ciclo Atual:</span><span>Indisponível</span></p>
        <p>
          <span
            ><img v-if="closed" src="/icons/logics/lg01/clock.svg" alt="" />{{
              closed ? 'Encerrado em:' : 'Próxima Atualização:'
            }}</span
          ><span>Indisponível</span>
        </p>
      </div>
      <div class="logic-card-closure"><span>Fechamento indisponível</span></div>
    </div>
    <nav class="logic-card-actions" :aria-label="`Ações do motor ${record.name || record.code}`">
      <button
        v-for="action in actions"
        :key="action.name"
        type="button"
        @click="emit('select', action.name)"
      >
        {{ action.label }}
      </button>
    </nav>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import LogicExecutiveSummary from './LogicExecutiveSummary.vue'
import { workspaceStatus } from 'src/services/adminWorkspaceModel'
const props = defineProps({ record: { type: Object, required: true } })
const emit = defineEmits(['select'])
const closed = computed(() => ['Closed', 'Encerrado'].includes(props.record.status))
const metrics = ['Índice Atual', 'Alvo do Ciclo', 'Final Obrigatório', 'Papéis/Contratos']
const actions = [
  { name: 'open', label: 'Abrir', icon: 'visibility' },
  { name: 'edit', label: 'Editar', icon: 'edit' },
  { name: 'links', label: 'Vínculos', icon: 'link' },
]
</script>
<style scoped>
.logic-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.04));
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
  color: rgba(255, 255, 255, 0.72);
}
.logic-card-body {
  padding: 20px;
  min-height: 390px;
}
.logic-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.logic-card-identity {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}
.logic-card-symbol {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 10px;
}
.logic-card-title {
  min-width: 0;
}
.logic-card h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  overflow-wrap: anywhere;
}
.logic-card-tags {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 4px;
}
.logic-card-code {
  padding: 4px 7px;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
  font:
    10px/15px Consolas,
    monospace;
  overflow-wrap: anywhere;
  min-width: 0;
}
.logic-card-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 0.5px solid #fff;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 12px;
  line-height: 16px;
}
.logic-card-options {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.logic-card-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 40px 0 0;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.logic-card dt {
  font-size: 10px;
  font-weight: 700;
  line-height: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.logic-card dd {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: #fff;
  overflow-wrap: anywhere;
}
.logic-card-cycle {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.logic-card-cycle p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  font-size: 12px;
  line-height: 16px;
}
.logic-card-cycle p + p {
  padding-top: 8px;
}
.logic-card-cycle span {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow-wrap: anywhere;
}
.logic-card-cycle span:last-child {
  text-align: right;
}
.logic-card-closure {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.logic-card-closure > span {
  display: inline-block;
  padding: 3px 10px;
  border: 0.5px solid #fff;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 12px;
  line-height: 15px;
}
.logic-card-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(20, 27, 38, 0.92);
  backdrop-filter: blur(20px);
  opacity: 0;
  pointer-events: none;
}
.logic-card-actions button {
  border: 0;
  padding: 0 10px;
  background: transparent;
  color: #e5e7eb;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
}
.logic-card-actions button + button {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}
.logic-card:hover .logic-card-actions,
.logic-card:focus-within .logic-card-actions {
  opacity: 1;
  pointer-events: auto;
}
.logic-card-actions button:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 4px;
  border-radius: 4px;
}
.logic-card:hover .logic-card-closure,
.logic-card:focus-within .logic-card-closure {
  visibility: hidden;
}
@media (hover: none) {
  .logic-card-closure {
    visibility: hidden;
  }
  .logic-card-actions {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
