<template>
  <div class="contract-flow__box">
    <p>
      {{ money(record.conversion.sourceAmount, record.conversion.sourceCurrencyIsoCode) }} ×
      {{ rate(record.conversion.exchangeRate) }} =
      {{ money(record.amount, record.currency?.isoCode) }}
    </p>
    <p>
      {{
        record.conversion.rateSource === 'BcbPtax'
          ? 'PTAX de venda do Banco Central'
          : record.conversion.rateSource || 'Fonte indisponível'
      }}, fechamento de {{ date }}: a última publicada na hora da entrada, a mesma nos dois
      sentidos.
    </p>
    <p class="contract-flow__muted">
      Saldos da moeda de origem antes e depois: indisponíveis nesta consulta.
    </p>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { money } from 'src/services/financeService'
const props = defineProps({ record: { type: Object, required: true } })
const rate = (value) =>
  Number.isFinite(Number(value))
    ? new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
        useGrouping: false,
      }).format(Number(value))
    : 'Indisponível'
const date = computed(() => {
  const dates = [
    ...new Set(
      (props.record.conversion?.quotes || []).map((row) => row.referenceDate).filter(Boolean),
    ),
  ]
  return dates.length
    ? dates.map((value) => value.split('-').reverse().join('/')).join(' / ')
    : 'data indisponível'
})
</script>
