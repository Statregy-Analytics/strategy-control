<template>
  <header class="logic-detail-header">
    <div v-if="editing" class="logic-detail-edit-strip">
      MODO DE EDIÇÃO DE PARÂMETROS <img :src="asset('1484:80088', 'imgPonto')" alt="" />
      {{ simulationAvailable ? 'SIMULAÇÃO EM TEMPO REAL ATIVA' : 'SIMULAÇÃO INDISPONÍVEL' }}
    </div>
    <div class="logic-detail-header-inner">
      <div class="logic-detail-heading-line">
        <button type="button" @click="$emit('close')">
          <img src="/icons/logics/lg09/arrow-left.svg" alt="" />Voltar para lógicas
        </button>
        <h1>
          <span class="logic-detail-motor-icon"><img :src="img('imgActivity')" alt="" /></span>Motor
          de Variação <span>— {{ record?.name || 'Motor' }}</span>
        </h1>
        <nav aria-label="Ações do motor">
          <button type="button" disabled title="Edição de tooltips indisponível">
            <img :src="img('imgInfo')" alt="" />Editar Tooltips</button
          ><button type="button" disabled title="Pausa operacional indisponível">
            <img :src="img('imgCirclePause')" alt="" />Pausar Lógica</button
          ><template v-if="editing"
            ><button type="button" @click="$emit('cancel')">
              <img :src="asset('1484:80088', 'imgIcon')" alt="" />Cancelar</button
            ><button type="button" :disabled="!dirty || loading" @click="$emit('save')">
              <img :src="asset('1484:80088', 'imgSave')" alt="" />Salvar Alterações
            </button></template
          ><button v-else type="button" :disabled="loading || !record" @click="$emit('edit')">
            <img :src="asset('1484:78333', 'imgPen')" alt="" />Editar Lógica
          </button>
        </nav>
      </div>
      <div class="logic-detail-header-metrics">
        <div>
          <small>Índice Operacional Atual</small><strong>{{ num(metrics.currentIndex, 4) }}</strong>
        </div>
        <div>
          <small>Papéis Vinculados</small><strong>{{ count(metrics.linkCount) }}</strong>
        </div>
        <div>
          <small>Status</small
          ><strong :class="{ positive: state(record?.status) === 'active' }">{{
            record?.status ? stateLabel(record.status) : unavailable
          }}</strong>
        </div>
        <div>
          <small>Configuração</small
          ><strong
            ><img
              v-if="metrics.configurationValid === true"
              :src="img('imgCircleCheck')"
              alt=""
            />{{
              metrics.configurationValid === true
                ? 'Válida'
                : metrics.configurationValid === false
                  ? 'Inválida'
                  : unavailable
            }}</strong
          >
        </div>
        <div>
          <small>Última Atualização</small
          ><strong><img :src="img('imgClock')" alt="" />{{ time(metrics.lastRun, true) }}</strong>
        </div>
        <div>
          <small>Ciclo Trimestral</small
          ><strong class="logic-detail-cycle"
            ><img :src="img('imgCalendar')" alt="" />{{
              cycle(metrics.startDate, metrics.endDate)
            }}</strong
          >
        </div>
      </div>
    </div>
  </header>
</template>
<script setup>
import { structuralAsset as asset } from 'src/services/logicStructuralAssets'
import {
  structuralNumber as num,
  structuralTime as time,
  structuralCycle as cycle,
  unavailable,
} from 'src/services/logicStructuralModel'
import {
  logicCount as count,
  logicState as state,
  logicStateLabel as stateLabel,
} from 'src/services/logicDirectoryModel'
const props = defineProps({
  record: { type: Object, default: null },
  editing: Boolean,
  dirty: Boolean,
  loading: Boolean,
  metrics: { type: Object, default: () => ({}) },
  simulationAvailable: Boolean,
})
defineEmits(['close', 'cancel', 'save', 'edit'])
const img = (name) => asset(props.editing ? '1484:80088' : '1484:78333', name)
</script>
<style scoped>
.logic-detail-header {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(183deg, rgba(0, 0, 0, 0.118), rgba(0, 0, 0, 0.02));
  backdrop-filter: blur(20px);
}
.logic-detail-header-inner {
  max-width: 1600px;
  margin: auto;
  padding: 16px 24px;
}
.logic-detail-heading-line {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 36px;
}
.logic-detail-heading-line h1 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin: 0;
  min-width: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.logic-detail-heading-line h1 > span:last-child {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
}
.logic-detail-motor-icon {
  width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.logic-detail-header button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.72);
  font:
    500 12px/16px Inter,
    sans-serif;
  cursor: pointer;
  white-space: nowrap;
}
.logic-detail-header img {
  flex: none;
}
.logic-detail-header button:disabled {
  opacity: 0.5;
  cursor: default;
}
.logic-detail-header button:focus-visible {
  outline: 2px solid #4bc7ff;
  outline-offset: 3px;
}
.logic-detail-header button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.12);
}
.logic-detail-header nav {
  display: flex;
  gap: 12px;
  align-items: center;
}
.logic-detail-header-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.logic-detail-header-metrics > div {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px;
  min-height: 74px;
  background: rgba(0, 0, 0, 0.04);
}
.logic-detail-header-metrics small {
  display: block;
  font:
    600 9px/13.5px Inter,
    sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.225px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}
.logic-detail-header-metrics strong {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  line-height: 20px;
  overflow-wrap: anywhere;
}
.logic-detail-header-metrics .logic-detail-cycle {
  font-size: 12px;
  font-weight: 500;
}
.positive {
  color: #66e59e;
}
.logic-detail-edit-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 25px;
  padding: 4px 16px;
  background: rgba(187, 77, 0, 0.2);
  border-bottom: 1px solid #fee685;
  color: #fee685;
  font-size: 10px;
  line-height: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
}
@media (max-width: 1400px) {
  .logic-detail-heading-line {
    flex-wrap: wrap;
  }
  .logic-detail-heading-line nav {
    margin-left: auto;
    flex-wrap: wrap;
  }
  .logic-detail-header-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .logic-detail-header-inner {
    padding: 16px;
  }
  .logic-detail-heading-line h1 {
    flex-basis: 100%;
    flex-wrap: wrap;
  }
  .logic-detail-heading-line nav {
    margin: 0;
    gap: 8px;
  }
  .logic-detail-header-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .logic-detail-header button {
    white-space: normal;
  }
  .logic-detail-edit-strip {
    flex-wrap: wrap;
  }
}
</style>
