import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
const noReference = JSON.parse(readFileSync('docs/FRONTEND-SEM-REFERENCIA-FIGMA.json', 'utf8'))
for (const item of noReference.items) {
  // The portal is a separate repository; verify its paths when the sibling checkout is present.
  if (item.source.startsWith('portal:') && !existsSync('../Strategy-analytics-v2')) continue
  const source = item.source.startsWith('portal:')
    ? '../Strategy-analytics-v2/' + item.source.slice(7)
    : item.source
  if (!existsSync(source)) throw Error('Fonte de tela sem referência não encontrada: ' + source)
}
if (new Set(noReference.items.map((item) => item.id)).size !== noReference.items.length)
  throw Error('Registro sem referência contém IDs duplicados.')
const baselinePath = 'docs/evidence/qa-2026-11-16-inventory/classification.json'
const baselineText = readFileSync(baselinePath, 'utf8'),
  baseline = JSON.parse(baselineText)
const overrides = JSON.parse(readFileSync('docs/FRONTEND-PROGRESS-OVERRIDES.json', 'utf8'))
const items = baseline.items
  .filter((i) => i.counted)
  .map((i) => {
    const update = overrides.items[i.id]
    const front = update?.front || i.front
    const blockers = update?.blockers || i.blockers
    const category =
      front !== 'done'
        ? 'Ajuste de front'
        : blockers.includes('backend')
          ? 'Bloqueio backend'
          : blockers.includes('designer')
            ? 'Bloqueio designer/produto'
            : 'Já correto'
    return {
      ...i,
      ...(update || {}),
      historicalCategory: i.category,
      category,
      evidence: update ? [...new Set([...(i.evidence || []), update.evidence])] : i.evidence,
    }
  })
if (new Set(items.map((i) => i.id)).size !== items.length)
  throw Error('Inventário contém IDs duplicados.')
for (const id of Object.keys(overrides.items))
  if (!items.some((i) => i.id === id)) throw Error('Override sem frame: ' + id)
const counts = { done: 0, validation: 0, adjustment: 0 }
for (const i of items) {
  if (!(i.front in counts)) throw Error('Estado inválido: ' + i.front)
  counts[i.front]++
}
const total = items.length,
  implemented = counts.done + counts.validation
const metrics = {
  total,
  ...counts,
  implemented,
  implementedPercent: Number(((100 * implemented) / total).toFixed(1)),
  readyPercent: Number(((100 * counts.done) / total).toFixed(1)),
}
const report = {
  updatedAt: overrides.updatedAt,
  baseline: baselinePath,
  baselineSha256: createHash('sha256').update(baselineText).digest('hex'),
  unit: 'Frames/estados independentes do Figma, não rotas nem horas',
  dependencyAudit:
    'Flags de dependência herdadas da auditoria base. Para bloqueios retestados, consultar a seção da entrega atual; não interpretar esses flags históricos como uma nova auditoria HTTP.',
  definitions: {
    done: 'Pronto no frontend; pode ainda depender de API, decisão ou massa.',
    validation: 'Implementado, mas falta comparação/revalidação completa.',
    adjustment: 'Ainda precisa implementação/complemento/correção de frontend.',
  },
  metrics,
  withoutLinkedFigmaReference: {
    count: noReference.items.length,
    countedInFigmaProgress: false,
    register: 'docs/FRONTEND-SEM-REFERENCIA-FIGMA.json',
    note: noReference.scope,
  },
  items,
}
writeFileSync('docs/FRONTEND-PROGRESS.json', JSON.stringify(report, null, 2) + '\n')
const text = `<!-- frontend-progress:start -->
## Panorama atual do frontend

Atualizado em ${overrides.updatedAt}. Contagem por **telas e estados independentes do Figma**, com peso igual; não é estimativa de horas. Os 30 agrupamentos/conexões do inventário foram excluídos.

| Situação | Quantidade |
| --- | ---: |
| Total inventariado | **${total}** |
| Prontas no frontend | **${counts.done}** |
| Implementadas, aguardando revalidação/comparação completa | **${counts.validation}** |
| Ainda exigem implementação, complemento ou correção | **${counts.adjustment}** |
| Com implementação existente (prontas + revalidação) | **${implemented} / ${total} (${metrics.implementedPercent.toFixed(1).replace('.', ',')}%)** |

**Para encerrar o front faltam ${counts.adjustment} itens de implementação/ajuste e ${counts.validation} de revalidação.** “Pronto no frontend” não significa fluxo integrado liberado: dependências de backend/designer podem afetar também telas prontas. Os números não classificam toda pendência como tela nova nem como problema de API. A comparação de Crédito, carteira global e editor editorial que não foi concluída integralmente permanece em revalidação.

Fonte por frame: [progresso atual](FRONTEND-PROGRESS.json). A base anterior permanece histórica; [atualizações com evidências](FRONTEND-PROGRESS-OVERRIDES.json) registram cada mudança. Ao finalizar **cada entrega**, atualizar os IDs comprovados, executar \`node scripts/frontend-progress.mjs\` e informar este panorama na resposta final.
<!-- frontend-progress:end -->`
const path = 'docs/CHECKLIST-UNICO-FIGMA-FRONT.md'
let checklist = readFileSync(path, 'utf8')
if (checklist.includes('<!-- frontend-progress:start -->'))
  checklist = checklist.replace(
    /<!-- frontend-progress:start -->[\s\S]*?<!-- frontend-progress:end -->/,
    text,
  )
else {
  const at = checklist.indexOf('\n## ')
  checklist = checklist.slice(0, at) + '\n' + text + '\n' + checklist.slice(at)
}
const states = {
  done: 'Pronto no front',
  validation: 'Implementado · revalidar',
  adjustment: 'Implementação/ajuste pendente',
}
const byId = new Map(items.map((i) => [i.id, i]))
checklist = checklist
  .split('\n')
  .map((line) => {
    const id = line.match(/^\| \[(\d+:\d+)\]\(/)?.[1]
    if (!id || !byId.has(id)) return line
    const item = byId.get(id)
    return line.replace(/\|[^|]*\|$/, '| ' + states[item.front] + ' · ' + item.group + ' |')
  })
  .join('\n')
const noReferenceSection = `<!-- frontend-no-reference:start -->
## Telas e adaptações sem frame vinculado — avaliação de Éric

${noReference.scope} **Não entram nas ${total} telas/estados do percentual.** Nenhuma nova tela sem referência foi criada no lote de 17/11; os novos detalhes e estados de Transações têm IDs específicos abaixo.

| Superfície | Origem | Avaliação pendente |
| --- | --- | --- |
${noReference.items.map((item) => `| ${item.name} · \`${item.path}\` | ${item.origin} | ${item.decision} |`).join('\n')}

Registro verificável por arquivo: [${noReference.items.length} superfícies/adaptações](FRONTEND-SEM-REFERENCIA-FIGMA.json). Algumas são rotas legadas; outras são blocos dentro de telas já contadas. O registro não representa ${noReference.items.length} telas novas nem uma aprovação visual.
<!-- frontend-no-reference:end -->`
if (checklist.includes('<!-- frontend-no-reference:start -->'))
  checklist = checklist.replace(
    /<!-- frontend-no-reference:start -->[\s\S]*?<!-- frontend-no-reference:end -->/,
    noReferenceSection,
  )
else
  checklist = checklist.replace(
    '<!-- frontend-progress:end -->',
    '<!-- frontend-progress:end -->\n\n' + noReferenceSection,
  )
writeFileSync(path, checklist)
console.log(JSON.stringify(metrics))
