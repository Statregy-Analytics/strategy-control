<template>
  <aside class="logic-draft-preview" aria-label="Pré-visualização do motor">
    <div class="logic-draft-preview-band" :style="{ backgroundColor: modelValue.color }" />
    <div class="logic-draft-preview-body">
      <header>
        <span class="logic-draft-preview-icon">
          <img
            v-if="modelValue.icon === 'chart-pie'"
            src="/icons/logics/preview/chart-pie.svg"
            alt=""
          />
          <workspace-icon v-else :name="modelValue.icon || 'box'" />
        </span>
        <div class="logic-draft-preview-identity">
          <h2>{{ modelValue.name || 'Prévia do motor' }}</h2>
          <div class="logic-draft-preview-tags">
            <span class="logic-draft-preview-code">{{ code || '—' }}</span>
            <span class="logic-draft-preview-badge" :class="{ positive: configurationValid }">{{
              configurationValid ? 'Válida' : '—'
            }}</span>
          </div>
        </div>
      </header>
      <div class="logic-draft-preview-states">
        <div>
          <span>Status</span
          ><span
            class="logic-draft-preview-badge"
            :class="{ pending: modelValue.status === 'Em Análise' }"
            >{{ modelValue.status || '—' }}</span
          >
        </div>
        <div>
          <span>Configuração</span
          ><span class="logic-draft-preview-badge" :class="{ positive: configurationValid }">{{
            configurationValid ? 'Válida' : '—'
          }}</span>
        </div>
      </div>
      <div class="logic-draft-preview-currency">
        <span>Moeda Firmada</span><strong>{{ currencyLabel }}</strong>
      </div>
      <dl>
        <div>
          <dt>Moeda Firmada</dt>
          <dd>{{ modelValue.currency || 'Indisponível' }}</dd>
        </div>
        <div>
          <dt>Ciclo Trimestral</dt>
          <dd>{{ cycle }}</dd>
        </div>
        <div class="logic-draft-preview-divider">
          <dt>Índice Inicial</dt>
          <dd class="emphasis">{{ number(modelValue.initialIndex, 4) }}</dd>
        </div>
        <div>
          <dt class="info">Índice Atual</dt>
          <dd class="emphasis">Indisponível</dd>
        </div>
        <div>
          <dt class="info">Alvo do Ciclo</dt>
          <dd class="emphasis">{{ number(modelValue.target, 2, '%') }}</dd>
        </div>
        <div>
          <dt>Índice Final Obrigatório</dt>
          <dd class="emphasis">{{ number(finalIndex, 4) }}</dd>
        </div>
        <div class="logic-draft-preview-divider">
          <dt>Intervalo Operacional</dt>
          <dd>{{ modelValue.interval || 'Indisponível' }}</dd>
        </div>
        <div>
          <dt>Próxima Atualização</dt>
          <dd>Indisponível</dd>
        </div>
        <div>
          <dt>Papéis/Contratos Vinculados</dt>
          <dd class="emphasis">
            {{ Array.isArray(modelValue.contracts) ? modelValue.contracts.length : 'Indisponível' }}
          </dd>
        </div>
      </dl>
      <footer><img src="/icons/logics/preview/clock.svg" alt="" />Pré-visualização do motor</footer>
    </div>
  </aside>
</template>
<script setup>
import { computed } from 'vue'
import WorkspaceIcon from './WorkspaceIcon.vue'
import { projectedFinalIndex } from 'src/services/adminWorkspaceModel'
import { numberInputValue } from 'src/services/numberInputValue'
const props = defineProps({
  modelValue: { type: Object, required: true },
  currencies: { type: Array, default: () => [] },
  code: { type: String, default: '' },
  configurationValid: Boolean,
})
const finalIndex = computed(() => projectedFinalIndex(props.modelValue))
const currencyLabel = computed(
  () =>
    props.currencies.find((c) => c.value === props.modelValue.currency)?.label ||
    props.modelValue.currency ||
    'Indisponível',
)
function number(value, digits, suffix = '') {
  const parsed = numberInputValue(value)
  return parsed === null
    ? 'Indisponível'
    : new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
        useGrouping: false,
      }).format(parsed) + suffix
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = new Date(value + 'T00:00:00Z')
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null
  return { year: value.slice(0, 4), short: value.slice(8, 10) + '/' + value.slice(5, 7) }
}
const cycle = computed(() => {
  const start = date(props.modelValue.startDate),
    end = date(props.modelValue.endDate)
  if (!start || !end) return 'Indisponível'
  return `${start.short}${start.year === end.year ? '' : '/' + start.year}–${end.short}/${end.year}`
})
</script>
<style scoped>
.logic-draft-preview {
  position: sticky;
  top: 24px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.6);
  background:
    linear-gradient(
      215.389deg,
      rgba(0, 0, 0, 0.118),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.02)
    ),
    linear-gradient(
      215.389deg,
      rgba(0, 0, 0, 0.078),
      rgba(0, 0, 0, 0.039) 51.124%,
      rgba(0, 0, 0, 0.01)
    );
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
  backdrop-filter: blur(20px);
  opacity: 0.7;
}
.logic-draft-preview-band {
  height: 8px;
}
.logic-draft-preview-body {
  padding: 48px 24px 24px;
}
.logic-draft-preview header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.logic-draft-preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 10px;
}
.logic-draft-preview-identity {
  min-width: 0;
}
.logic-draft-preview h2 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 700;
  line-height: 22.5px;
  overflow-wrap: anywhere;
}
.logic-draft-preview-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.logic-draft-preview-code {
  padding: 4px 8px;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(
    88.907deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03) 50.059%,
    rgba(255, 255, 255, 0.07)
  );
  font:
    10px/15px Consolas,
    monospace;
  overflow-wrap: anywhere;
}
.logic-draft-preview-badge {
  padding: 3px 8px;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  letter-spacing: 0.25px;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}
.logic-draft-preview-badge.positive {
  color: #74ffa0;
  border-color: #74ffa0;
  background: rgba(0, 122, 85, 0.2);
}
.logic-draft-preview-badge.pending {
  color: #fee685;
  border-color: #fee685;
  background: rgba(187, 77, 0, 0.2);
}
.logic-draft-preview-states {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}
.logic-draft-preview-states > div {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}
.logic-draft-preview-states > div > span:first-child,
.logic-draft-preview-currency > span {
  font-size: 10px;
  font-weight: 700;
  line-height: 15px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.logic-draft-preview-currency {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}
.logic-draft-preview-currency strong {
  color: rgba(255, 255, 255, 0.72);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  overflow-wrap: anywhere;
}
.logic-draft-preview dl {
  margin: 24px 0 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.logic-draft-preview dl > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
.logic-draft-preview dl > div:first-child {
  margin-top: 0;
}
.logic-draft-preview dt,
.logic-draft-preview dd {
  margin: 0;
  min-width: 0;
  font-size: 12px;
  line-height: 16px;
  overflow-wrap: anywhere;
}
.logic-draft-preview dd {
  text-align: right;
}
.logic-draft-preview dt {
  font-weight: 500;
}
.logic-draft-preview .emphasis {
  color: white;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}
.logic-draft-preview .info {
  color: #bedbff;
}
.logic-draft-preview-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
}
.logic-draft-preview footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  line-height: 16px;
}
.logic-draft-preview footer img {
  flex: none;
}
@media (max-width: 1100px) {
  .logic-draft-preview {
    position: static;
  }
}
</style>
