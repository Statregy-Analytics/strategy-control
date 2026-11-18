<template>
  <article class="logic-active-row" :aria-label="`Motor ativo ${record.name || record.code}`">
    <span class="logic-active-row__icon" aria-hidden="true">◔</span>
    <div class="logic-active-row__identity">
      <h2>{{ record.name || record.code }}</h2>
      <small>{{ record.code || '—' }}</small>
    </div>
    <span class="logic-active-row__status">Ativo</span>
    <dl>
      <div>
        <dt>Índice Atual</dt>
        <dd>{{ indexLabel }}</dd>
      </div>
      <div
        :class="[
          'logic-active-row__performance',
          {
            'is-unknown': metrics.performancePercent == null,
            'is-negative': Number(metrics.performancePercent) < 0,
          },
        ]"
      >
        <dt>Perf. Ciclo</dt>
        <dd>{{ performanceLabel }}</dd>
      </div>
      <div>
        <dt>Vínculos</dt>
        <dd>{{ metrics.links ?? 'Indisponível' }}</dd>
      </div>
    </dl>
    <nav :aria-label="`Ações do motor ${record.name || record.code}`">
      <button type="button" disabled title="Pausa indisponível">
        <span aria-hidden="true">Ⅱ</span>Pausar</button
      ><button type="button" @click="$emit('select', 'edit')">
        <span aria-hidden="true">✎</span>Editar</button
      ><button type="button" @click="$emit('select', 'open')">
        <span aria-hidden="true">❯</span>Entrar
      </button>
    </nav>
  </article>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  record: { type: Object, required: true },
  metrics: { type: Object, default: () => ({}) },
})
defineEmits(['select'])
const indexLabel = computed(() =>
  props.metrics.index != null && Number.isFinite(Number(props.metrics.index))
    ? new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
        useGrouping: false,
      }).format(Number(props.metrics.index))
    : 'Indisponível',
)
const performanceLabel = computed(() =>
  props.metrics.performancePercent != null &&
  Number.isFinite(Number(props.metrics.performancePercent))
    ? new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always',
      }).format(Number(props.metrics.performancePercent)) + '%'
    : 'Indisponível',
)
</script>
<style scoped>
.logic-active-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 112px;
  padding: 16px;
  border: 1px solid #00a3ff66;
  border-radius: 12px;
  background: #ffffff0f;
  box-shadow: 0 6px 14px #00000038;
  color: #fff;
  white-space: normal;
}
.logic-active-row__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  font-size: 25px;
  color: #1fdb8c;
  border: 1px solid #1fdb8c75;
  border-radius: 10px;
  background: #1fdb8c1a;
}
.logic-active-row__identity {
  min-width: 100px;
  flex: 1;
}
h2 {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  overflow-wrap: anywhere;
}
small {
  font-size: 10px;
  line-height: 18px;
  color: #abb8ccb8;
}
.logic-active-row__status {
  padding: 3px 8px;
  border: 0.8px solid #74ffa0;
  border-radius: 8px;
  background: #007a5533;
  color: #74ffa0;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.25px;
}
dl {
  display: flex;
  gap: 24px;
  margin: 0;
}
dt,
dd {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}
dt {
  text-transform: uppercase;
}
.logic-active-row__performance {
  color: #1fdb8c;
}
nav {
  display: flex;
  gap: 12px;
  margin-left: auto;
}
button {
  width: 56px;
  min-height: 64px;
  padding: 8px 4px;
  border: 1px solid #00a3ff99;
  border-radius: 8px;
  background: #00a3ff14;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
}
button span {
  display: block;
  font-size: 18px;
  line-height: 24px;
  margin-bottom: 4px;
  color: #abb8cc;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
button:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
@media (max-width: 900px) {
  .logic-active-row {
    flex-wrap: wrap;
  }
  dl {
    flex: 1;
    flex-wrap: wrap;
    gap: 12px 24px;
  }
  nav {
    margin-left: auto;
  }
}
@media (max-width: 480px) {
  dl {
    flex-basis: 100%;
    justify-content: space-between;
  }
  nav {
    width: 100%;
    justify-content: flex-end;
  }
  .logic-active-row__identity {
    min-width: 80px;
  }
}
.logic-active-row__performance.is-unknown {
  color: #ffffffb8;
}
.logic-active-row__performance.is-negative {
  color: #ffc9c9;
}
.logic-active-row nav {
  opacity: 0;
  pointer-events: none;
}
.logic-active-row:hover nav,
.logic-active-row:focus-within nav {
  opacity: 1;
  pointer-events: auto;
}
@media (hover: none) {
  .logic-active-row nav {
    opacity: 1;
    pointer-events: auto;
  }
}

.logic-active-row__identity {
  flex: 0 1 144px;
}
.logic-active-row dl {
  display: grid;
  grid-template-columns: 100px 96px 70px;
  gap: 24px;
  margin-left: 44px;
}
.logic-active-row nav {
  margin-right: 12px;
}
@media (max-width: 900px) {
  .logic-active-row__identity {
    flex: 1;
  }
  .logic-active-row dl {
    margin-left: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    flex-basis: 100%;
  }
  .logic-active-row nav {
    margin-right: 0;
  }
}
</style>
