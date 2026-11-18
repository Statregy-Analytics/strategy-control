<template>
  <section
    class="logic-structural"
    :class="{ 'logic-structural--editing': editing }"
    aria-label="Definições estruturais"
  >
    <h2 class="logic-detail-section-title" aria-label="Definições Estruturais">
      <button
        type="button"
        class="logic-structural-collapse"
        aria-label="Recolher configuração do motor"
        aria-expanded="true"
        @click="$emit('collapse')"
      >
        Definições Estruturais
      </button>
    </h2>
    <div class="logic-structural-panel">
      <section class="logic-structural-group">
        <h3><img :src="img('imgTarget')" alt="" />Parâmetros do Ciclo Trimestral</h3>
        <div class="logic-structural-box">
          <p>
            Define o alvo soberano do ciclo trimestral.<br />As atualizações, limites diários e
            limites mensais controlam o percurso, mas o índice final soberano é aplicado no
            fechamento do ciclo.
          </p>
          <div class="logic-structural-grid five">
            <parameter
              v-bind="field('initialIndex', 'Índice inicial do motor')"
              :info="img('imgInfo')"
            /><parameter
              v-bind="field('target', 'Alvo do Ciclo Trimestral', true)"
              :info="img('imgInfo')"
              tall
              :previous="editing ? percent(baseline.target, 2, true) : undefined"
              previous-tone="positive"
            /><parameter
              label="Índice Final Soberano"
              :model-value="projection.finalIndex"
              :digits="4"
              :info="img('imgInfo')"
              tall
              tone="strong"
              :hint="
                'Calculado: ' +
                num(modelValue.initialIndex) +
                ' × (1 + ' +
                percent(modelValue.target) +
                ')'
              "
            /><parameter
              v-bind="field('startDate', 'Início do ciclo', false, 'date')"
              :info="img('imgInfo')"
            /><parameter
              v-bind="field('endDate', 'Fechamento do ciclo', false, 'date')"
              :info="img('imgInfo')"
            />
          </div>
        </div>
      </section>
      <section class="logic-structural-group">
        <h3><img :src="img('imgClock')" alt="" />Frequência de Atualização</h3>
        <div class="logic-structural-box">
          <div class="logic-structural-grid three">
            <label-form
              text-label="Intervalo Operacional"
              :label-size="10"
              class="logic-structural-select"
              ><template #label
                >Intervalo Operacional<img
                  class="logic-structural-info"
                  :src="img('imgInfo')"
                  alt="" /></template
              ><glass-select
                :model-value="modelValue.interval"
                :options="intervalOptions"
                :disable="!editing || !intervalOptions.length"
                placeholder="Indisponível"
                aria-label="Intervalo Operacional"
                dropdown-icon="img:/icons/logics/frequency/chevron.svg"
                @update:model-value="set('interval', $event)" /></label-form
            ><parameter
              label="Última Atualização"
              :model-value="time(modelValue.lastRun)"
              kind="text"
              tall
            /><parameter
              v-bind="field('updatesPerDay', 'Atualizações por dia')"
              :digits="0"
              grouped
              tall
            /><parameter
              v-bind="field('startDate', 'Início do Ciclo Trimestral', false, 'date')"
              tall
            /><parameter
              v-bind="field('endDate', 'Fechamento do Ciclo Trimestral', false, 'date')"
              tall
            /><parameter
              v-bind="field('estimatedUpdates', 'Atualizações estimadas no ciclo trimestral')"
              :digits="0"
              grouped
              tall
            />
          </div>
        </div>
      </section>
      <section class="logic-structural-group">
        <h3><img :src="img('imgSlidersVertical')" alt="" />Probabilidade Direcional Base</h3>
        <div class="logic-structural-box">
          <p>
            Define a chance padrão de alta ou queda em cada atualização.<br />Pode ser substituída
            temporariamente pela zona de amortecimento quando ativada.
          </p>
          <div class="logic-structural-grid two">
            <parameter
              v-bind="field('positive', 'Chance Positiva Base', true)"
              :info="img('imgInfo')"
              :digits="0"
              tall
            /><parameter
              v-bind="field('negative', 'Chance Negativa Base')"
              :info="img('imgInfo')"
              :digits="0"
              tall
              tone="strong"
            />
          </div>
          <div class="logic-structural-chances">
            <span>Alta {{ percent(modelValue.positive, 0) }}</span
            ><span>Baixa {{ percent(modelValue.negative, 0) }}</span>
          </div>
        </div>
      </section>
      <section class="logic-structural-group">
        <h3><img :src="img('imgActivity')" alt="" />Intensidade por Atualização</h3>
        <div class="logic-structural-box">
          <p>Define o tamanho máximo de cada movimento gerado pelo motor em uma atualização.</p>
          <p :class="{ 'logic-structural-warning': editing }">
            Aviso: este parâmetro é obrigatório para limitar a magnitude de cada atualização.
          </p>
          <div class="logic-structural-grid four">
            <parameter
              label="Modo da Intensidade"
              :model-value="
                modelValue.intensityMode === 'Percentual da Banda Diária'
                  ? '% da banda diária'
                  : modelValue.intensityMode
              "
              kind="text"
              :info="img('imgInfo')"
              tall
            /><parameter
              v-bind="field('intensity', 'Intensidade Configurada', true)"
              :digits="0"
              :info="img('imgInfo')"
              tall
            /><parameter
              label="Intensidade Positiva Real"
              :model-value="percent(projection.positive, 3, true)"
              kind="text"
              :info="img('imgInfo')"
              tall
              :tone="projection.positive === null ? '' : 'positive'"
            /><parameter
              label="Intensidade Negativa Real"
              :model-value="percent(projection.negative, 3, true)"
              kind="text"
              :info="img('imgInfo')"
              tall
              :tone="projection.negative === null ? '' : 'negative'"
            />
          </div>
          <div class="logic-structural-calculation">
            <small>Cálculo</small>
            <p>
              Intensidade positiva = percentual aplicado × teto diário<br />{{
                percent(modelValue.intensity, 0)
              }}
              × {{ percent(modelValue.dailyCeiling) }} = {{ percent(projection.positive, 3, true)
              }}<br />Intensidade negativa = percentual aplicado × piso diário em módulo<br />{{
                percent(modelValue.intensity, 0)
              }}
              × {{ percent(abs(modelValue.dailyFloor)) }} =
              {{ percent(abs(projection.negative), 3) }}
            </p>
          </div>
        </div>
      </section>
      <section class="logic-structural-group">
        <h3><img :src="img('imgTarget')" alt="" />Limites Operacionais do Índice</h3>
        <div class="logic-structural-box">
          <p>
            Os limites operacionais controlam a trajetória do índice.<br />A cada atualização, o
            motor respeita simultaneamente os limites diário e mensal.
          </p>
          <div class="logic-structural-grid two bands">
            <div v-for="band in bands" :key="band.key" class="logic-structural-band">
              <h4>Limite {{ band.label }} do Índice</h4>
              <parameter
                v-bind="field(band.top, 'Teto ' + band.lower, true)"
                :previous="editing ? num(baseline[band.top]) : undefined"
              /><parameter
                v-bind="field(band.bottom, 'Piso ' + band.lower, true)"
                tone="negative"
                :previous="editing ? num(baseline[band.bottom]) : undefined"
                previous-tone="negative"
              /><parameter v-bind="field(band.open, 'Índice de abertura ' + band.period)" />
              <div class="logic-structural-calculation">
                <small>Calculado</small>
                <dl>
                  <div>
                    <dt>Teto {{ band.lower }}:</dt>
                    <dd>{{ num(projection[band.key + 'Top']) }}</dd>
                  </div>
                  <div>
                    <dt>Piso {{ band.lower }}:</dt>
                    <dd>{{ num(projection[band.key + 'Bottom']) }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <div class="logic-structural-effective">
            <h4>Limite Efetivo por Atualização</h4>
            <p>
              Teto efetivo = menor entre teto diário e teto mensal<br />Piso efetivo = maior entre
              piso diário e piso mensal
            </p>
            <div class="logic-structural-grid two">
              <div>
                <small>Teto efetivo</small><strong>{{ num(projection.effectiveTop) }}</strong>
              </div>
              <div>
                <small>Piso efetivo</small><strong>{{ num(projection.effectiveBottom) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="logic-structural-group">
        <h3>
          <img :src="img('imgSlidersVertical')" alt="" />Zona de Amortecimento das Bordas Diárias
        </h3>
        <div class="logic-structural-box">
          <div class="logic-structural-damping-head">
            <div>
              <span>Ativada</span
              ><button
                type="button"
                role="switch"
                :aria-checked="modelValue.buffer === null ? 'mixed' : modelValue.buffer"
                aria-label="Ativar Zona de Amortecimento"
                :disabled="!editing"
                :class="{ 'is-on': modelValue.buffer === true }"
                @click="set('buffer', modelValue.buffer !== true)"
              >
                <span /></button
              ><small v-if="modelValue.buffer === null">Indisponível</small>
            </div>
            <button
              type="button"
              :aria-expanded="expanded"
              :aria-controls="dampingId"
              @click="expanded = !expanded"
            >
              <img
                src="/icons/logics/damping/chevron-up.svg"
                alt=""
                :class="{ 'is-collapsed': !expanded }"
              />{{ expanded ? 'Recolher' : 'Expandir' }}
            </button>
          </div>
          <div :id="dampingId" v-show="expanded">
            <p>
              Quando ativada, ajusta a chance positiva ou negativa conforme o índice se aproxima do
              teto ou do piso diário.
            </p>
            <div
              class="logic-structural-table-scroll"
              role="region"
              aria-label="Faixas da zona de amortecimento"
              tabindex="0"
            >
              <table>
                <thead>
                  <tr>
                    <th>Faixa</th>
                    <th>De</th>
                    <th>Até</th>
                    <th>Chance positiva</th>
                    <th>Chance negativa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in ranges" :key="row.key">
                    <th scope="row">{{ row.label }}</th>
                    <td :class="dampingTone(row.from)">{{ dampingPercent(row.from, true) }}</td>
                    <td :class="dampingTone(row.to)">{{ dampingPercent(row.to, true) }}</td>
                    <td>{{ dampingPercent(row.positive) }}</td>
                    <td>{{ dampingPercent(row.negative) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="editing" class="logic-structural-damping-actions">
              <button type="button" disabled>Adicionar faixa</button
              ><button type="button" disabled>Remover faixa</button>
            </div>
          </div>
        </div>
      </section>
      <section class="logic-structural-group">
        <h3><img :src="img('imgCircleCheck')" alt="" />Fechamento Soberano do Ciclo Trimestral</h3>
        <div class="logic-structural-box">
          <p>
            <strong
              >No último ponto do ciclo trimestral, o índice do motor é forçado para o índice final
              soberano.</strong
            >
          </p>
          <div class="logic-structural-grid five">
            <parameter
              v-bind="field('initialIndex', 'Índice inicial do ciclo')"
              :info="img('imgInfo')"
              tall
            /><parameter
              label="Alvo do ciclo trimestral"
              :model-value="percent(modelValue.target, 2, true)"
              kind="text"
              :info="img('imgInfo')"
              tall
              :tone="
                numberInputValue(modelValue.target) > 0
                  ? 'positive'
                  : numberInputValue(modelValue.target) < 0
                    ? 'negative'
                    : ''
              "
            /><parameter
              label="Índice Final Soberano"
              :model-value="projection.finalIndex"
              :digits="4"
              :info="img('imgInfo')"
              tall
              tone="strong"
            /><parameter
              label="Data/hora de fechamento"
              :model-value="closing"
              kind="text"
              :info="img('imgInfo')"
              tall
            /><parameter
              label="Status"
              model-value="Obrigatório"
              kind="text"
              :info="img('imgInfo')"
              tall
            />
          </div>
          <p class="logic-structural-principle">
            As bandas e probabilidades controlam o percurso. O fechamento soberano controla o índice
            final do ciclo trimestral.
          </p>
        </div>
      </section>
    </div>
  </section>
</template>
<script setup>
import { computed, ref, useId } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import Parameter from './LogicParameterField.vue'
import { structuralAsset as asset } from 'src/services/logicStructuralAssets'
import {
  structuralNumber as num,
  structuralPercent as percent,
  structuralTime as time,
  structuralProjection,
  structuralDateTime,
} from 'src/services/logicStructuralModel'
import { dampingRows, dampingPercent, dampingTone } from 'src/services/logicDampingModel'
import { numberInputValue } from 'src/services/numberInputValue'
const props = defineProps({
  modelValue: { type: Object, required: true },
  baseline: { type: Object, default: () => ({}) },
  editing: Boolean,
  damping: { type: Object, default: null },
  intervalOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['patch', 'collapse'])
const expanded = ref(true),
  dampingId = 'structural-damping-' + useId()
const img = (name) => asset(props.editing ? '1484:80209' : '1484:78436', name)
const projection = computed(() => structuralProjection(props.modelValue)),
  ranges = computed(() => dampingRows(props.damping))
function set(key, value) {
  const patch = { [key]: value }
  if (key === 'positive')
    patch.negative = numberInputValue(value) === null ? null : 100 - Number(value)
  emit('patch', patch)
}

function field(key, label, editable = false, kind = 'number') {
  return {
    modelValue: props.modelValue[key],
    label,
    kind,
    editable: props.editing && editable,
    highlight: key === 'target',
    dimmed:
      !props.editing &&
      [
        'initialIndex',
        'target',
        'positive',
        'dailyCeiling',
        'dailyFloor',
        'monthlyCeiling',
        'monthlyFloor',
      ].includes(key),
    ...(['positive', 'intensity'].includes(key)
      ? { min: 0, max: 100 }
      : ['dailyCeiling', 'monthlyCeiling'].includes(key)
        ? { min: 0 }
        : ['dailyFloor', 'monthlyFloor'].includes(key)
          ? { max: 0 }
          : {}),
    'onUpdate:modelValue': (v) => set(key, v),
  }
}
function abs(v) {
  const n = numberInputValue(v)
  return n === null ? null : Math.abs(n)
}
const closing = computed(() => structuralDateTime(props.modelValue.closingAt))

const bands = [
  {
    key: 'daily',
    label: 'Diário',
    lower: 'diário',
    period: 'do dia',
    top: 'dailyCeiling',
    bottom: 'dailyFloor',
    open: 'dayOpeningIndex',
  },
  {
    key: 'monthly',
    label: 'Mensal',
    lower: 'mensal',
    period: 'do mês',
    top: 'monthlyCeiling',
    bottom: 'monthlyFloor',
    open: 'monthOpeningIndex',
  },
]
</script>
<style scoped lang="scss" src="./logicStructural.scss"></style>
