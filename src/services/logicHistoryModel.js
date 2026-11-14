// Labels and ordering from LG09 (1484:83540). IDs identify design rows, not HTTP fields.
export function temporalCellText(cell) {
  const value = cell && typeof cell === 'object' ? cell.text : cell
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'Indisponível'
  return typeof value === 'string' && value.trim() ? value : 'Indisponível'
}

export function temporalCellClass(cell) {
  if (!cell || typeof cell !== 'object' || temporalCellText(cell) === 'Indisponível') return []
  return [
    ...(['positive', 'negative'].includes(cell.tone) ? ['temporal-cell--' + cell.tone] : []),
    ...(cell.badge === true ? ['temporal-cell--badge'] : []),
  ]
}
export const logicHistoryGroups = [
  {
    id: '1484:83620',
    label: 'Índice do Motor',
    rows: [
      {
        id: '1484:83623',
        label: 'Índice de abertura do dia',
      },
      {
        id: '1484:83650',
        label: 'Índice bruto médio do dia',
      },
      {
        id: '1484:83677',
        emphasis: true,
        label: 'Índice de fechamento após travas',
      },
      {
        id: '1484:83704',
        label: 'Máxima do índice do dia',
      },
      {
        id: '1484:83731',
        label: 'Mínima do índice do dia',
      },
      {
        id: '1484:83758',
        emphasis: true,
        label: 'Variação do dia',
      },
      {
        id: '1484:83785',
        label: 'Variação acumulada no mês',
      },
      {
        id: '1484:83812',
        label: 'Variação acumulada no ciclo trimestral',
      },
    ],
  },
  {
    id: '1484:83839',
    label: 'Sorteio e Probabilidade',
    rows: [
      {
        id: '1484:83842',
        label: 'Chance positiva base média',
      },
      {
        id: '1484:83869',
        label: 'Chance negativa base média',
      },
      {
        id: '1484:83896',
        labelTone: 'accent',
        label: 'Zona de amortecimento ativa no período',
      },
      {
        id: '1484:83935',
        label: 'Faixas de amortecimento usadas',
      },
      {
        id: '1484:83962',
        label: 'Chance positiva média usada',
      },
      {
        id: '1484:83989',
        label: 'Chance negativa média usada',
      },
      {
        id: '1484:84016',
        label: 'Direções positivas',
      },
      {
        id: '1484:84043',
        label: 'Direções negativas',
      },
      {
        id: '1484:84070',
        label: 'Direção predominante',
      },
    ],
  },
  {
    id: '1484:84109',
    label: 'Intensidade por Atualização',
    rows: [
      {
        id: '1484:84112',
        label: 'Modo de intensidade vigente',
      },
      {
        id: '1484:84139',
        label: 'Percentual médio da banda diária',
      },
      {
        id: '1484:84166',
        label: 'Intensidade positiva real média',
      },
      {
        id: '1484:84193',
        label: 'Intensidade negativa real média',
      },
      {
        id: '1484:84220',
        label: 'Intensidade média sorteada',
      },
      {
        id: '1484:84247',
        label: 'Maior intensidade sorteada',
      },
      {
        id: '1484:84274',
        label: 'Menor intensidade sorteada',
      },
      {
        id: '1484:84301',
        label: 'Assimetria diária detectada',
      },
    ],
  },
  {
    id: '1484:84340',
    label: 'Limites Vigentes',
    rows: [
      {
        id: '1484:84343',
        label: 'Índice de abertura do dia',
      },
      {
        id: '1484:84370',
        label: 'Teto diário vigente',
      },
      {
        id: '1484:84397',
        label: 'Piso diário vigente',
      },
      {
        id: '1484:84424',
        label: 'Índice de abertura do mês',
      },
      {
        id: '1484:84451',
        label: 'Teto mensal vigente',
      },
      {
        id: '1484:84478',
        label: 'Piso mensal vigente',
      },
      {
        id: '1484:84505',
        label: 'Teto efetivo médio',
      },
      {
        id: '1484:84532',
        label: 'Piso efetivo médio',
      },
    ],
  },
  {
    id: '1484:84559',
    label: 'Travas e Resultado Aplicado',
    rows: [
      {
        id: '1484:84562',
        emphasis: true,
        label: 'Quantidade de travas aplicadas',
      },
      {
        id: '1484:84589',
        label: 'Tipos de trava no período',
      },
      {
        id: '1484:84616',
        label: 'Maior valor antes da trava',
      },
      {
        id: '1484:84643',
        label: 'Menor valor após trava',
      },
      {
        id: '1484:84670',
        label: 'Principal motivo de trava',
      },
    ],
  },
  {
    id: '1484:84697',
    label: 'Fechamento Soberano',
    rows: [
      {
        id: '1484:84700',
        label: 'Fechamento soberano aplicado',
      },
      {
        id: '1484:84739',
        emphasis: true,
        label: 'Índice final soberano',
      },
      {
        id: '1484:84766',
        label: 'Data/hora de fechamento prevista',
      },
      {
        id: '1484:84793',
        label: 'Status do ciclo trimestral',
      },
    ],
  },
  {
    id: '1484:84832',
    label: 'Papéis Vinculados',
    rows: [
      {
        id: '1484:84835',
        label: 'Papéis vinculados ativos',
      },
      {
        id: '1484:84862',
        label: 'Papéis recalculados no período',
      },
      {
        id: '1484:84889',
        label: 'Valor agregado dos papéis na abertura',
      },
      {
        id: '1484:84916',
        label: 'Valor agregado dos papéis no fechamento',
      },
      {
        id: '1484:84943',
        emphasis: true,
        label: 'Resultado agregado dos papéis no período',
      },
    ],
  },
  {
    id: '1484:84970',
    label: 'Parâmetros Estruturais Vigentes',
    rows: [
      {
        id: '1484:84973',
        label: 'Intervalo operacional',
      },
      {
        id: '1484:85000',
        emphasis: true,
        label: 'Alvo do ciclo trimestral',
      },
      {
        id: '1484:85027',
        label: 'Índice inicial do ciclo',
      },
      {
        id: '1484:85054',
        emphasis: true,
        label: 'Índice final soberano',
      },
      {
        id: '1484:85081',
        label: 'Início do ciclo trimestral',
      },
      {
        id: '1484:85108',
        label: 'Fechamento do ciclo trimestral',
      },
      {
        id: '1484:85135',
        label: 'Teto diário configurado',
      },
      {
        id: '1484:85162',
        label: 'Piso diário configurado',
      },
      {
        id: '1484:85189',
        label: 'Teto mensal configurado',
      },
      {
        id: '1484:85216',
        label: 'Piso mensal configurado',
      },
      {
        id: '1484:85243',
        label: 'Status do motor',
      },
    ],
  },
]
