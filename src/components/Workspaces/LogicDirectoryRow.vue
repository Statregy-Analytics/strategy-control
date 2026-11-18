<template>
  <div
    class="logic-directory-row"
    :tabindex="active ? 0 : null"
    @keydown.enter.self.prevent="$emit('select', 'open')"
    :class="{ 'logic-directory-row--active': active }"
  >
    <div class="logic-directory-row__normal">
      <span class="logic-directory-row__icon"><img :src="img('cards-imgChartPie')" alt="" /></span>
      <div class="logic-directory-row__identity">
        <h2>
          <button @click="$emit('select', 'open')">{{ record.name || record.code }}</button>
        </h2>
        <div>
          <small>{{ record.code || '—' }}</small
          ><logic-status :value="record.status" />
        </div>
      </div>
      <dl>
        <div v-for="m in fields" :key="m.label">
          <dt>{{ m.label }}</dt>
          <dd :class="m.tone">{{ m.value }}</dd>
        </div>
      </dl>
      <div class="logic-directory-row__end">
        <small>Vínculos</small><span>{{ logicCount(metrics.links) }}</span>
      </div>
      <div class="logic-directory-row__end">
        <small>{{ closed ? 'Encerrado em' : 'Próxima atualização' }}</small
        ><span>{{ logicDate(closed ? metrics.closedAt : metrics.nextUpdate) }}</span>
      </div>
      <span v-if="closed" class="logic-directory-row__closure"
        ><img :src="img('cards-imgCircleCheck1')" alt="" />{{
          metrics.closureApplied === true ? 'Fechamento aplicado' : 'Fechamento indisponível'
        }}</span
      ><q-btn
        v-if="!active"
        flat
        dense
        :aria-label="'Abrir motor ' + (record.name || record.code)"
        @click="$emit('select', 'open')"
        >›</q-btn
      >
    </div>
    <logic-active-row
      v-if="active"
      :record="record"
      :metrics="metrics"
      @select="$emit('select', $event)"
    />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import LogicActiveRow from './LogicActiveRow.vue'
import LogicStatus from './LogicStatus.vue'
import {
  logicImage as img,
  logicState,
  logicCount,
  logicIndex,
  logicPercent,
  logicDate,
  logicNumber,
} from 'src/services/logicDirectoryModel'
const props = defineProps({
  record: { type: Object, required: true },
  metrics: { type: Object, default: () => ({}) },
})
defineEmits(['select'])
const active = computed(() => logicState(props.record.status) === 'active'),
  closed = computed(() => logicState(props.record.status) === 'closed')
const fields = computed(() => [
  { label: 'Índice Atual', value: logicIndex(props.metrics.index) },
  {
    label: 'Alvo Ciclo',
    value:
      logicNumber(props.metrics.target) === null
        ? 'Indisponível'
        : Number(props.metrics.target).toLocaleString('pt-BR') + '%',
  },
  { label: 'Final Obrig.', value: logicIndex(props.metrics.finalIndex) },
  {
    label: 'Perf. Ciclo',
    value: logicPercent(props.metrics.performancePercent),
    tone:
      logicNumber(props.metrics.performancePercent) > 0
        ? 'positive'
        : logicNumber(props.metrics.performancePercent) < 0
          ? 'negative'
          : '',
  },
])
</script>
<style scoped>
.logic-directory-row {
  position: relative;
  min-width: 0;
}
.logic-directory-row__normal {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  min-height: 80px;
  background: linear-gradient(181deg, #00000030, #00000008);
  color: #ffffffb8;
}
.logic-directory-row__icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: none;
}
.logic-directory-row__identity {
  min-width: 200px;
  max-width: 250px;
  flex: 1;
}
.logic-directory-row__identity > div {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
h2 {
  font:
    700 14px/20px Inter,
    sans-serif;
  margin: 0 0 2px;
  overflow-wrap: anywhere;
}
h2 button {
  font: inherit;
  color: inherit;
  border: 0;
  background: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
}
small {
  font:
    400 10px/15px Inter,
    sans-serif;
  color: #ffffff99;
}
.logic-directory-row__identity small {
  font-family: Consolas, monospace;
}
dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(90px, 1fr));
  flex: 3;
  gap: 16px;
  margin: 0;
}
dt {
  font:
    600 10px/15px Inter,
    sans-serif;
  text-transform: uppercase;
}
dd {
  font:
    700 14px/20px Inter,
    sans-serif;
  color: white;
  margin: 4px 0 0;
}
.positive {
  color: #74ffa0;
}
.negative {
  color: #ffb3b3;
}
.logic-directory-row__end {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font:
    400 12px/16px Inter,
    sans-serif;
}
.logic-directory-row__end small {
  text-transform: uppercase;
}
.logic-directory-row__closure {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border: 0.5px solid white;
  border-radius: 8px;
  font:
    400 10px/15px Inter,
    sans-serif;
  white-space: nowrap;
}
.logic-directory-row :deep(.logic-active-row) {
  display: none;
}
.logic-directory-row--active:hover > .logic-directory-row__normal,
.logic-directory-row--active:focus-within > .logic-directory-row__normal {
  display: none;
}
.logic-directory-row--active:hover :deep(.logic-active-row),
.logic-directory-row--active:focus-within :deep(.logic-active-row) {
  display: flex;
}
@media (hover: none) {
  .logic-directory-row--active > .logic-directory-row__normal {
    display: none;
  }
  .logic-directory-row--active :deep(.logic-active-row) {
    display: flex;
  }
}
@media (max-width: 1300px) {
  .logic-directory-row__normal {
    flex-wrap: wrap;
  }
  dl {
    flex-basis: 100%;
  }
  .logic-directory-row__identity {
    max-width: none;
  }
  .logic-directory-row__end {
    flex: 1;
  }
}
@media (max-width: 600px) {
  dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .logic-directory-row__identity {
    min-width: 0;
  }
  .logic-directory-row__normal {
    gap: 12px;
  }
}

.logic-directory-row--active:focus-within :deep(.logic-active-row nav) {
  opacity: 1;
  pointer-events: auto;
}
.logic-directory-row--active:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 2px;
  border-radius: 12px;
}
</style>
