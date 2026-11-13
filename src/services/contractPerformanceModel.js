export const contractPerformanceIndicators = [
  ['currentCapital', 'Capital Atual (Evolutivo)'],
  ['consolidatedCapital', 'Capital Consolidado Atual'],
  ['accumulatedReturn', 'Retorno Acumulado do Contrato'],
  ['dailyReturn', 'Retorno Diário do Contrato'],
  ['openingReferencePrice', 'Preço de Referência de Abertura'],
  ['closingReferencePrice', 'Preço de Referência de Fechamento'],
  ['primaryEngine', 'Motor Principal Aplicado'],
  ['dividendEngine', 'Motor de Dividendos Aplicado'],
  ['paidDividends', 'Dividendos Pagos'],
  ['paidDividendPercentage', 'Dividendos Pagos (% do Valor)'],
  ['linkedClients', 'Clientes Vinculados na Atualização'],
]
export const contractPerformancePeriods = [
  { label: '30 Dias', value: '30' },
  { label: '90 Dias', value: '90' },
  { label: '12 Meses', value: '365' },
  { label: 'Período Completo', value: 'all' },
]
// This is a view model. No endpoint currently supplies temporal contract performance.
// Never derive historical snapshots from the current contract or illustrative Figma values.
