import { test, expect } from '@playwright/test'

test.describe('Clients UI', () => {
  test('create -> edit -> delete client', async ({ page }) => {
  // goto app root (use explicit URL to avoid baseURL resolution issues)
  // navigate directly to the Clients page route
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9000'
  await page.goto(`${base}/dashboard/dataManagement`)

    // Click the 'Criar Novo' button in the Clients page header
  await page.waitForSelector('button:has-text("Criar Novo")', { timeout: 20000 })
  await page.click('button:has-text("Criar Novo")')

    // The create/edit form is rendered inside a dialog (EditClientsLayout)
    // Wait for a visible input from PersonalDataLayout (CPF label exists)
    // Use placeholders / label text via role queries is not straightforward for Quasar,
    // so pick inputs by placeholder or aria-label if present. We'll search for inputs in dialog.
    const dialog = page.locator('div.EditClientsLayout')
    await expect(dialog).toBeVisible()

    // Fill some obvious fields that exist in PersonalDataLayout
    // CPF input has placeholder 'value' and is the second input; to be robust we'll locate by label text 'CPF' then find the following input
    const cpfLabel = page.locator('label-form:has-text("CPF")')
    if (await cpfLabel.count() > 0) {
      const cpfInput = cpfLabel.locator('input[type="text"]')
      if (await cpfInput.count() > 0) {
        await cpfInput.fill('12345678909')
      }
    }

    // Fill email using the label 'Emal' (typo in code)
    const emailLabel = page.locator('label-form:has-text("Emal")')
    if (await emailLabel.count() > 0) {
      const emailInput = emailLabel.locator('input[type="text"]')
      if (await emailInput.count() > 0) await emailInput.fill('e2e-ui@example.com')
    }

    // Fill name: the header shows client name in banner. There may not be a dedicated input with name 'cliente.name'.
    // Try to fill by locating an input bound to cliente.name: search for first input in dialog and fill if empty.
    const firstInput = dialog.locator('input').first()
    if (await firstInput.count() > 0) {
      await firstInput.fill('E2E UI Test')
    }

    // Click Salvar button
    await page.click('button:has-text("Salvar")')

    // wait for dialog to close and table update
    await page.waitForTimeout(1000)

  // verify that created item appears in the table by matching name text
  await expect(page.locator('text=E2E UI Test')).toBeVisible({ timeout: 20000 })

    // Edit: open actions menu on the created row and click Editar
    // Find the row that contains the name and open its menu button (dots-vertical)
    const row = page.locator(`text=E2E UI Test`).first()
    await row.scrollIntoViewIfNeeded()
    // the actions button is an ancestor q-td with a button that has the dots icon; click adjacent menu button
    const actionsButton = row.locator('xpath=ancestor::tr').locator('button').filter({ hasText: '' }).first()
    // Fallback: just click the name to open edit (ClientsTable editClient sets store on click)
    try {
      await row.click()
    } catch (e) {
      // ignore
    }

    // Wait for dialog and change name
    await page.waitForSelector('div.EditClientsLayout', { timeout: 5000 })
    const dialogAfter = page.locator('div.EditClientsLayout')
    const anyInput = dialogAfter.locator('input').first()
    if (await anyInput.count() > 0) await anyInput.fill('E2E UI Test Updated')

    await page.click('button:has-text("Salvar")')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=E2E UI Test Updated')).toBeVisible({ timeout: 5000 })

    // Delete: open the edit dialog for the updated row and click Remover
    await page.click('text=E2E UI Test Updated')
    await page.waitForSelector('div.EditClientsLayout', { timeout: 5000 })
    await page.click('button:has-text("Remover")')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=E2E UI Test Updated')).not.toBeVisible()
  })
})
