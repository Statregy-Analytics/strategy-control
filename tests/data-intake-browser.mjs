// Run against the local dev server; all API requests are intercepted with test fixtures.
// PLAYWRIGHT_MODULE may point to a locally installed Playwright ESM entry point.
import { readFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fixture = JSON.parse(await readFile(new URL('./fixtures/data-intake-real-estate.json', import.meta.url), 'utf8'))
const output = new URL('../.impeccable/review/data-intake/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
await context.addInitScript(() => localStorage.setItem('sa_access_token', '__q_strn|test-only'))
let records = [], uploadCount = 0, linkCount = 0, failLink = true
const linkKeys = [], errors = []
let published = structuredClone(fixture)
const data = { apelidoImovel: 'Casa de teste', tipo: 'Casa', valorEstimado: 250000, estaQuitado: true, cep: '01001-000', logradouro: 'Rua de teste', numero: '10', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }
await context.route('**/api/v1/**', async (route) => {
  const request = route.request(), path = new URL(request.url()).pathname, method = request.method()
  const json = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) })
  const ok = (value) => json({ success: true, data: value })
  if (path.endsWith('/auth/me')) return ok({ id: 'test-admin', name: 'Administrador de teste', roles: ['Admin'] })
  if (path.endsWith('/me/systems')) return ok([])
  if (path.endsWith('/customers/lookup')) return ok([{ id: 'test-customer', displayName: 'Cliente de teste' }])
  if (path.endsWith('/admin/document-types')) return ok([{ id: 'test-doc-type', name: 'Documento de teste' }])
  if (path.endsWith('/data-intake/forms')) return ok([{ code: published.code, name: published.name, formDefinitionId: published.formDefinitionId, formVersionId: published.formVersionId, versionNumber: published.versionNumber }])
  if (path.endsWith('/active')) return ok(published)
  if (path.endsWith('/data-intake/submissions') && method === 'GET') return json({ success: true, data: records, pagination: { totalItems: records.length } })
  if (path.endsWith('/drafts')) {
    const body = request.postDataJSON()
    assert.equal(body.customerId, 'test-customer')
    assert.equal(body.formVersionId, 'test-version')
    assert.equal(body.data.valorEstimado, 123456.78)
    assert.ok(!('matriculaImovelAnexo' in body.data))
    assert.ok(request.headers()['idempotency-key'])
    const record = { ...body, id: 'test-submission', version: 1, status: 'Draft', attachments: [], createdAtUtc: '2026-09-29T12:00:00Z' }
    records = [record]; return ok(record)
  }
  if (path.endsWith('/customers/test-customer/documents')) { uploadCount++; assert.match(request.headers()['content-type'], /multipart\/form-data; boundary=/); return ok({ id: 'test-document' }) }
  if (path.endsWith('/attachments')) {
    linkCount++; linkKeys.push(request.headers()['idempotency-key'])
    assert.deepEqual(request.postDataJSON(), { customerUploadedDocumentId: 'test-document' })
    if (failLink) { failLink = false; return json({}, 503) }
    const attachment = { id: 'test-attachment', customerUploadedDocumentId: 'test-document', fileName: 'test.pdf', status: 'Active' }
    records[0].attachments.push(attachment); return ok(attachment)
  }
  if (path.endsWith('/history')) return ok([])
  if (path.endsWith('/submit')) { records[0].status = 'Submitted'; return ok(records[0]) }
  if (path.endsWith('/approve')) { records[0].status = 'NeedsCorrection'; return ok(records[0]) }
  if (path.endsWith('/test-submission') && method === 'PATCH') {
    const body = request.postDataJSON()
    assert.equal(body.expectedVersion, records[0].version)
    records[0] = { ...records[0], ...body, version: records[0].version + 1 }
    return ok(records[0])
  }
  if (path.endsWith('/test-submission')) return ok(records[0])
  return json({}, 404)
})
const page = await context.newPage()
page.on('pageerror', (error) => errors.push(error.message))
try {
  await page.goto(process.env.TEST_URL || 'http://localhost:8080/dataManagement/forms')
  await page.getByRole('button', { name: 'Novo formulário', exact: true }).click()
  await page.getByRole('combobox', { name: 'Formulário', exact: true }).click()
  await page.getByRole('option', { name: 'Declaração de Imóvel' }).click()
  await page.getByLabel('Cliente', { exact: true }).fill('Cliente')
  await page.getByRole('option', { name: 'Cliente de teste' }).click()
  await page.getByLabel('Apelido do Imóvel *', { exact: true }).fill('Casa de teste')
  await page.getByLabel('Valor Estimado (R$) *', { exact: true }).fill('123.456,78')
  await page.getByLabel('CEP *', { exact: true }).fill('01001-000')
  assert.equal(await page.getByRole('button', { name: 'Enviar para análise', exact: true }).count(), 0)
  assert.equal(await page.getByLabel('Restante para Quitação (R$) *', { exact: true }).count(), 1)
  await page.getByLabel('Está quitado? *', { exact: true }).click()
  assert.equal(await page.getByLabel('Restante para Quitação (R$) *', { exact: true }).count(), 0)
  await page.getByLabel('Adicionar Matrícula do Imóvel', { exact: true }).setInputFiles({ name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-test') })
  await page.screenshot({ path: fileURLToPath(new URL('desktop.png', output)), fullPage: true, animations: 'disabled' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: fileURLToPath(new URL('mobile.png', output)), fullPage: true, animations: 'disabled' })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Salvar rascunho e anexos' }).click()
  await page.getByRole('button', { name: 'Retomar envio de anexos' }).waitFor()
  await page.getByText('Não foi possível concluir a operação.', { exact: false }).waitFor()
  await page.getByRole('button', { name: 'Retomar envio de anexos' }).click()
  await page.getByText('Anexos vinculados.', { exact: true }).waitFor()
  assert.equal(uploadCount, 1)
  assert.equal(linkCount, 2)
  assert.equal(linkKeys[0], linkKeys[1])
  await page.getByRole('button', { name: 'Fechar painel' }).click()
  records[0] = { ...records[0], status: 'Submitted', data }
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click()
  await page.getByRole('button', { name: 'Declaração de Imóvel', exact: true }).click()
  await page.getByRole('button', { name: 'Aprovar', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await page.getByText('A submissão requer correção.', { exact: false }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Aprovar', exact: true }).count(), 0)
  await page.getByRole('button', { name: 'Fechar painel' }).click()
  published.metadata.permissions.updateOwnDraft = ['Admin']
  published.metadata.permissions.submit = ['Admin']
  records[0].status = 'Draft'
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click()
  await page.getByRole('button', { name: 'Declaração de Imóvel', exact: true }).click()
  await page.getByLabel('Apelido do Imóvel *', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Enviar para análise', exact: true }).click()
  await page.getByText('Não foi possível salvar. Revise os campos destacados antes de continuar.').waitFor()
  assert.equal(await page.getByLabel('Apelido do Imóvel *', { exact: true }).evaluate((el) => el === document.activeElement), true)
  await page.screenshot({ path: fileURLToPath(new URL('validation-desktop.png', output)), fullPage: true, animations: 'disabled' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Enviar para análise', exact: true }).click()
  assert.equal(await page.getByLabel('Apelido do Imóvel *', { exact: true }).evaluate((el) => el === document.activeElement), true)
  await page.screenshot({ path: fileURLToPath(new URL('validation-mobile.png', output)), fullPage: true, animations: 'disabled' })
  await page.getByLabel('Apelido do Imóvel *', { exact: true }).fill('Casa de teste')
  await page.getByRole('button', { name: 'Enviar para análise', exact: true }).click()
  await page.getByText('Formulário enviado para análise.', { exact: false }).waitFor()
  assert.equal(records[0].status, 'Submitted')
  assert.deepEqual(errors, [])
  console.log('PASS: real form rendering, permissions, currency, conditional debt, multipart, partial retry without duplicate upload, idempotency, approval NeedsCorrection, desktop/mobile overflow.')
} finally { await browser.close() }
