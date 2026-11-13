<template>
  <resource-state :state="state" @retry="$emit('retry')">
    <section class="contract-engine-card">
      <header>
        <h3><img src="/icons/contracts/ct11-chart-pie.svg" alt="" />Motor Principal</h3>
        <q-badge outline>{{ financeLabel(primary?.connectionStatus) }}</q-badge>
      </header>
      <div class="engine-identity">
        <small>Motor Principal</small
        ><strong>{{ primary?.name || 'Nenhum motor vinculado' }}</strong
        ><small>Função</small>
        <p>{{ primary?.functionDescription || 'Indisponível' }}</p>
      </div>
      <dl class="engine-data">
        <div>
          <dt>Índice na Conexão</dt>
          <dd>{{ index(primary?.indexAtConnection) }}</dd>
        </div>
        <div>
          <dt>Data da Conexão</dt>
          <dd>{{ dateLabel(primary?.connectedAtUtc) }}</dd>
        </div>
        <div>
          <dt>Índice Atual</dt>
          <dd>{{ index(primary?.currentIndex) }}</dd>
        </div>
        <div>
          <dt>Variação desde Conexão</dt>
          <dd>
            {{
              primary?.variationSinceConnectionPercentage == null
                ? 'Indisponível'
                : index(primary.variationSinceConnectionPercentage) + '%'
            }}
          </dd>
        </div>
      </dl>
      <q-btn
        class="engine-footer"
        outline
        no-caps
        label="Ver motor completo"
        :disable="!validEngineId"
        :to="
          validEngineId
            ? { path: '/logics', query: { editor: 'open', id: primary.engineId } }
            : undefined
        "
        ><img src="/icons/contracts/ct11-arrow-up-right.svg" alt=""
      /></q-btn>
    </section>
    <section class="contract-engine-card">
      <header>
        <h3>
          <span class="engine-icon-box"
            ><img
              :src="
                dividendMode === 'fixed'
                  ? '/icons/contracts/ct11-dividend-fixed.svg'
                  : dividendMode === 'random'
                    ? '/icons/contracts/ct11-dividend-random.svg'
                    : '/icons/contracts/ct11-coins.svg'
              "
              alt="" /></span
          >Motor de Dividendos
        </h3>
        <div class="engine-mode" v-if="dividend">
          <span>Valor do dividendo</span
          ><q-btn-toggle
            :model-value="dividendMode"
            disable
            no-caps
            :options="[
              { label: 'Aleatório (0,30% a 1,00%)', value: 'random' },
              { label: 'Fixo', value: 'fixed' },
            ]"
          />
        </div>
        <q-badge outline>{{
          dividend ? financeLabel(dividend.connectionStatus) : 'Não Conectado'
        }}</q-badge>
      </header>
      <p v-if="dividend && dividendMode" class="engine-explanation">{{ dividendExplanation }}</p>
      <template v-if="dividend"
        ><div class="engine-identity">
          <small>Motor de Dividendos</small><strong>{{ dividend.name }}</strong
          ><small>Função</small>
          <p>{{ dividend.functionDescription || 'Indisponível' }}</p>
        </div>
        <dl class="engine-data">
          <div>
            <dt>Valor do Dividendo</dt>
            <dd>
              {{
                dividendMode === 'random'
                  ? 'Aleatório: 0,30% a 1,00% do valor do contrato, sorteado a cada mês, até o lucro do mês'
                  : dividendMode === 'fixed'
                    ? 'Fixo: percentual indisponível'
                    : 'Indisponível'
              }}
            </dd>
          </div>
          <div>
            <dt>Próximo Pagamento</dt>
            <dd>Indisponível</dd>
          </div>
          <div>
            <dt>Destino Padrão</dt>
            <dd>Indisponível</dd>
          </div>
          <div>
            <dt>Total Pago no Contrato</dt>
            <dd>Indisponível</dd>
          </div>
        </dl>
        <q-btn class="engine-footer" outline no-caps label="Ver dividendos pagos" disable
          ><img src="/icons/contracts/ct11-dividend-arrow.svg" alt="" /></q-btn
      ></template>
      <template v-else
        ><div class="engine-empty">
          <p>Nenhum motor de dividendos conectado.</p>
          <small>Este contrato ainda não possui lógica automatizada de distribuição.</small>
        </div>
        <q-btn class="engine-footer" outline no-caps label="Adicionar motor de dividendos" disable
          ><img src="/icons/contracts/ct11-plus.svg" alt="" /></q-btn
      ></template>
    </section>
    <section class="contract-engine-card">
      <header>
        <div>
          <h3><img src="/icons/contracts/ct11-activity.svg" alt="" />Operações Intradiárias</h3>
          <p>Registro manual de operações realizadas e seus impactos no saldo do contrato.</p>
        </div>
        <div class="engine-mode">
          <span>Resultado no fechamento</span
          ><q-btn-toggle
            :model-value="closingMode"
            disable
            no-caps
            :options="[
              { label: 'Só Motor Principal', value: 'primary' },
              { label: 'Motor Principal + Operações', value: 'combined' },
            ]"
          />
        </div>
      </header>
      <p class="engine-explanation">{{ closingExplanation }}</p>
      <dl class="engine-operation-metrics">
        <div
          v-for="label in ['Total de Operações', 'Positivas / Negativas', 'Resultado Acumulado']"
          :key="label"
        >
          <dt>{{ label }}</dt>
          <dd>Indisponível</dd>
        </div>
      </dl>
      <div class="engine-empty" role="status">Consulta de operações intradiárias indisponível.</div>
    </section>
  </resource-state>
</template>
<script setup>
import { computed } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { dateLabel, financeLabel } from 'src/services/financeService'
// Display-state props are separate from the HTTP engine catalog. Keep them null
// until the API supplies the operational configuration; do not derive them from isSelectable.
const props = defineProps({
  state: { type: Object, required: true },
  dividendMode: {
    type: String,
    default: null,
    validator: (value) => value == null || ['random', 'fixed'].includes(value),
  },
  closingMode: {
    type: String,
    default: null,
    validator: (value) => value == null || ['primary', 'combined'].includes(value),
  },
})
const closingExplanation = computed(() =>
  props.closingMode === 'combined'
    ? 'Motor Principal + Operações: no fechamento, o resultado das operações soma ao do Motor Principal. Ex.: o motor deixou o contrato em R$ 100.000,00 e as operações somaram +R$ 10,00 → o contrato fecha com R$ 100.010,00.'
    : props.closingMode === 'primary'
      ? 'Só Motor Principal: no fechamento, vale o resultado definido pelo Motor Principal. As operações mudam o valor do contrato durante o prazo e ficam no histórico, mas não entram no resultado final.'
      : 'Configuração do resultado no fechamento indisponível.',
)
const dividendExplanation = computed(() =>
  props.dividendMode === 'fixed'
    ? 'Fixo: o admin digita o percentual (ex.: 0,50% do valor do contrato) e ele vale todo mês até ser alterado. Aleatório: a cada mês o sistema sorteia um percentual entre 0,30% e 1,00%; se passar do lucro do mês, sorteia de novo. O dividendo nunca passa do lucro do mês: se o lucro for menor que 0,30% (Aleatório) ou que o percentual fixo (Fixo), o dividendo do mês é zero.'
    : 'O dividendo sai do valor do contrato no dia do pagamento, como um resgate: o que fica continua acompanhando o Motor Principal. Não reduz o valor aplicado e não muda o % do contrato. Com "Só Motor Principal", o percentual é calculado sobre o valor do contrato pelo motor, sem as operações. O dividendo nunca passa do lucro do mês. No Aleatório, se o sorteio passar do lucro, o sistema sorteia de novo; se o lucro do mês for menor que 0,30% (ou zero, ou negativo), não há sorteio e o dividendo do mês é zero. No Fixo, se o percentual passar do lucro do mês, o dividendo do mês é zero.',
)

defineEmits(['retry'])
const primary = computed(() => props.state.data?.find((e) => e.role === 'Primary'))
const dividend = computed(() =>
  props.state.data?.find((e) => ['Dividend', 'Dividends'].includes(e.role)),
)
const validEngineId = computed(() =>
  /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(primary.value?.engineId || ''),
)
const index = (value) =>
  typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(
        value,
      )
    : 'Indisponível'
</script>
<style scoped>
.engine-icon-box {
  display: inline-flex;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.contract-engine-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  padding: 16px;
  margin-bottom: 16px;
  color: var(--sa-text, #fff);
}
.contract-engine-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.contract-engine-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 22px;
  margin: 0;
}
.contract-engine-card header p {
  font-size: 11px;
  margin: 6px 0 0;
}
.engine-identity {
  padding: 12px 0;
}
.engine-identity small {
  display: block;
  text-transform: uppercase;
  font-size: 10px;
}
.engine-identity strong {
  display: block;
  margin: 6px 0 16px;
  font-size: 16px;
}
.engine-identity p {
  font-size: 12px;
  margin: 4px 0;
}
.engine-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 0;
  margin: 0;
}
.contract-engine-card dt {
  font-size: 10px;
  text-transform: uppercase;
}
.contract-engine-card dd {
  margin: 6px 0 0;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.engine-footer {
  width: 100%;
  font-size: 12px;
  margin-top: 12px;
}
.engine-footer img {
  margin-right: 6px;
}
.engine-empty {
  min-height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
  font-size: 13px;
  text-align: center;
}
.engine-empty p {
  margin: 0 0 6px;
}
.engine-mode {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
}
.engine-mode :deep(.q-btn) {
  font-size: 10px;
}
.engine-mode :deep(.q-btn-toggle) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  box-shadow: none;
  background: rgba(255, 255, 255, 0.04);
}
.engine-explanation {
  font-size: 11px;
  margin: 16px 0;
}
.engine-operation-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
  padding: 8px 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
@media (max-width: 600px) {
  .engine-data,
  .engine-operation-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
