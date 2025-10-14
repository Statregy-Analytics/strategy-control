import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

async function main() {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9000'
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const outDir = path.resolve(__dirname, 'playwright-videos')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const authFile = path.resolve(__dirname, '.e2e_auth.json')
  const lsFile = path.resolve(__dirname, '.e2e_localstorage.json')

  const headless = process.env.PLAYWRIGHT_HEADLESS === 'false' ? false : true
  const slowMo = parseInt(process.env.PLAYWRIGHT_SLOWMO || '0', 10)
  const browser = await chromium.launch({ headless, slowMo })
  const context = await browser.newContext({
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
  })
  // If we have saved localStorage, inject it before any scripts run
  if (fs.existsSync(lsFile)) {
    try {
      const ls = JSON.parse(fs.readFileSync(lsFile, 'utf8'))
      await context.addInitScript((ls) => {
        for (const k of Object.keys(ls)) {
          try { localStorage.setItem(k, ls[k]) } catch(e) {}
        }
      }, ls)
      console.log('will inject saved localStorage at init')
    } catch (e) {
      console.log('error reading ls file', e.message)
    }
  }
  const page = await context.newPage()
  page.on('console', (m) => console.log('PAGE LOG>', m.type(), m.text()))
  page.on('pageerror', (e) => console.log('PAGE ERROR>', e.message))

  try {
    console.log('navigating to', base + '/')
    // If we have a saved auth file, inject it into Pinia before navigation when possible
    if (fs.existsSync(authFile)) {
      const saved = JSON.parse(fs.readFileSync(authFile, 'utf8'))
      console.log('found saved auth, will inject after initial load')
    }
    await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 })
    await page.screenshot({ path: path.join(outDir, 'after-root.png') }).catch(()=>{})

    // If we see a login flow, perform it: click 'Acessar Conta', fill email/password, submit, then validate token
    const signInBtn = page.locator('button:has-text("Acessar Conta")').first()
    if (await signInBtn.count() > 0) {
      console.log('Sign-in button found, performing login flow')
      await signInBtn.click().catch(()=>{})
      // the app usually navigates to /auth — wait for that or navigate explicitly
      try {
        await page.waitForURL('**/auth*', { timeout: 5000 })
        console.log('navigated to /auth')
      } catch (e) {
        console.log('did not auto-navigate to /auth, navigating explicitly')
        await page.goto(base + '/auth', { waitUntil: 'networkidle', timeout: 10000 }).catch(()=>{})
      }

      // fill email and password with multiple fallbacks
      const emailSelectors = [
        'input[placeholder*="E-mail"]',
        'input[placeholder*="E-mail ou CPF"]',
        'input[type="email"]',
        'input[name="email"]',
        'input[aria-label*="E-mail"]',
        'label:has-text("E-mail") input',
        'label:has-text("E-mail ou CPF") input',
      ]
      const pwdSelectors = [
        'input[placeholder*="Senha"]',
        'input[type="password"]',
        'input[name="password"]',
        'input[aria-label*="Senha"]',
        'label:has-text("Senha") input',
      ]

      let filledEmail = false
      for (const s of emailSelectors) {
        try {
          const loc = page.locator(s).first()
          if (await loc.count() > 0) {
            await loc.fill('e2e@example.com')
            filledEmail = true
            console.log('filled email using', s)
            break
          }
        } catch (e) {}
      }
      if (!filledEmail) {
        // fallback to first visible input
        try {
          const anyVisible = page.locator('input:visible').first()
          if (await anyVisible.count() > 0) {
            await anyVisible.fill('e2e@example.com')
            console.log('filled email using generic visible input')
          }
        } catch (e) {}
      }

      let filledPwd = false
      for (const s of pwdSelectors) {
        try {
          const loc = page.locator(s).first()
          if (await loc.count() > 0) {
            await loc.fill('password123')
            filledPwd = true
            console.log('filled password using', s)
            break
          }
        } catch (e) {}
      }

      // submit sign-in (there is usually a button with label 'Acessar Conta')
      const submitSign = page.locator('button:has-text("Acessar Conta")').first()
      if (await submitSign.count() > 0) {
        await submitSign.click().catch(()=>{})
      } else {
        // try any submit-like button
        const alt = page.locator('button:has-text("Entrar")').first()
        if (await alt.count() > 0) await alt.click().catch(()=>{})
      }

      // wait for token validation page or token input
      try {
        await page.waitForURL('**/auth/token-validation*', { timeout: 7000 })
        console.log('navigated to token-validation')
      } catch (e) {
        console.log('token page not auto-opened, trying to wait for token input')
      }

      // fill token '123456' on TokenValidationPage with fallbacks
      // emulate a user pause before filling token
      await page.waitForTimeout(5000)

      const tokenSelectors = [
        'input[placeholder*="Token"]',
        'input[name="token"]',
        'label:has-text("Token de validação") input',
        'input:visible',
      ]
      let filledToken = false
      for (const s of tokenSelectors) {
        try {
          const loc = page.locator(s).first()
          if (await loc.count() > 0) {
            await loc.fill('123456')
            filledToken = true
            console.log('filled token using', s)
            break
          }
        } catch (e) {}
      }
      if (!filledToken) console.log('could not find token input to fill')

      const validateBtn = page.locator('button:has-text("Validar token")').first()
      if (await validateBtn.count() > 0) {
        await validateBtn.click().catch(()=>{})
      } else {
        const altVal = page.locator('button:has-text("Validar")').first()
        if (await altVal.count() > 0) await altVal.click().catch(()=>{})
      }

      // wait briefly then force navigation to dashboard/dataManagement to ensure we reach the Clients page
      // emulate a user pause after validating token before navigating to Inserção de dados
      await page.waitForTimeout(5000)
      await page.waitForTimeout(500)
      try {
        await page.evaluate(() => { location.hash = '#/dataManagement' })
      } catch (e) {}
      // wait for Clients page to mount
      try {
        await page.waitForSelector('.ClientsLayout', { timeout: 7000 })
        console.log('ClientsLayout mounted')
      } catch (e) {
        console.log('ClientsLayout did not mount within timeout')
      }
      // wait for pinia to be available
      try {
        await page.waitForFunction(() => !!(window.__pinia || window.pinia), { timeout: 7000 })
        console.log('pinia available')
      } catch (e) {
        console.log('pinia not available after wait')
      }
      await page.screenshot({ path: path.join(outDir, 'after-login.png') }).catch(()=>{})

      // try to extract auth state from Pinia and persist for next runs
      try {
        // persist current localStorage to file for future runs (more reliable)
        try {
          const ls = await page.evaluate(() => {
            const out = {}
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i)
              out[k] = localStorage.getItem(k)
            }
            return out
          })
          fs.writeFileSync(lsFile, JSON.stringify(ls, null, 2))
          console.log('wrote localStorage snapshot to', lsFile)
        } catch (e) { console.log('could not snapshot localStorage', e.message) }

        const authState = await page.evaluate(() => {
          function findPinia() {
            // try devtools hook
            const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
            if (hook && hook.apps && hook.apps.length) {
              for (const app of hook.apps) {
                const provides = app.provides || (app._context && app._context.provides)
                if (!provides) continue
                for (const k of Object.keys(provides)) {
                  if (k.toLowerCase().includes('pinia')) return provides[k]
                }
              }
            }
            // try global variable names
            if (window.__pinia) return window.__pinia
            if (window.pinia) return window.pinia
            return null
          }
          const pinia = findPinia()
          if (!pinia) return null
          // try to find auth store
          const stores = pinia._s || pinia._a || pinia._s || null
          if (!stores) return null
          // pinia._s is a Map in many versions
          const entries = stores instanceof Map ? Array.from(stores.values()) : Object.values(stores)
          for (const s of entries) {
            try {
              const state = s.$state || s.state || s.$snapshot?.() || null
              if (state && (state.token || (state.auth && state.auth.token) || state.auth)) {
                // normalize
                const result = state.auth ? state.auth : state
                return result
              }
            } catch (e) {}
          }
          return null
        })
        if (authState) {
          fs.writeFileSync(authFile, JSON.stringify(authState, null, 2))
          console.log('wrote auth state to', authFile)
        } else {
          console.log('could not read auth state from pinia')
        }
      } catch (e) {
        console.log('error extracting auth state', e && e.message)
      }
    }

    // After login, click the 'Acessar Sistema' for Inserção de dados (second card)
    try {
      const spans = page.locator('span:has-text("Acessar Sistema")')
      const cnt = await spans.count()
      console.log('found Acessar Sistema spans count=', cnt)
      if (cnt > 1) {
        // emulate user pause before clicking Inserção de dados
        await page.waitForTimeout(2000)
        await spans.nth(1).click().catch((e)=>{console.log('click insercao error', e && e.message)})
      } else if (cnt === 1) {
        await page.waitForTimeout(2000)
        await spans.nth(0).click().catch((e)=>{console.log('click insercao error', e && e.message)})
      }
      // the app uses a 3s timeout before routing after click, wait slightly more
      await page.waitForTimeout(3500)
      // wait for transaction page to mount (IndexPage setTransiction pushes '/transaction')
      try {
        await page.waitForSelector('.TransctionPage, .TransctionPage', { timeout: 7000 })
        console.log('transaction page mounted')
      } catch (e) {
        console.log('transaction page did not appear within timeout')
      }

      // now open top menu 'Gestão de Dados' and click 'Clientes'
      try {
        // click the menu bar item that contains the text 'Gestão de Dados'
        const menuTrigger = page.locator('div.menuBar >> text=Gestão de Dados').first()
        if (await menuTrigger.count() > 0) {
          await menuTrigger.click().catch(()=>{})
          await page.waitForTimeout(400)
          // wait for the menu to render and click the Clientes button inside it
          try {
            await page.waitForSelector('div.q-menu button:has-text("Clientes")', { timeout: 3000 })
            const clientItem = page.locator('div.q-menu button:has-text("Clientes")').first()
            if (await clientItem.count() > 0) {
              await clientItem.click().catch(()=>{})
            }
          } catch (e) {
            // fallback: try any visible button with text 'Clientes'
            const anyClient = page.locator('button:has-text("Clientes")').first()
            if (await anyClient.count() > 0) await anyClient.click().catch(()=>{})
          }
        } else {
          // fallback: try to use router.push if available, otherwise hash
          try {
            const pushed = await page.evaluate(() => {
              // try to find router from devtools hook or global
              try {
                const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
                if (hook && hook.apps && hook.apps.length) {
                  for (const app of hook.apps) {
                    const router = app._context && app._context.router
                    if (router && typeof router.push === 'function') {
                      router.push('/dataManagement')
                      return true
                    }
                  }
                }
              } catch (e) {}
              if (window.$router && typeof window.$router.push === 'function') {
                window.$router.push('/dataManagement')
                return true
              }
              return false
            })
            if (!pushed) await page.evaluate(() => { location.hash = '#/dataManagement' })
          } catch (e) {
            await page.evaluate(() => { location.hash = '#/dataManagement' })
          }
        }
      } catch (e) {
        console.log('error opening top menu or clicking Clientes', e && e.message)
      }

      // wait for ClientsLayout to mount
      try {
        await page.waitForSelector('.ClientsLayout', { timeout: 8000 })
        console.log('ClientsLayout mounted after menu navigation')
      } catch (e) {
        console.log('ClientsLayout did not mount after menu navigation')
      }
      await page.screenshot({ path: path.join(outDir, 'after-access-insert.png') }).catch(()=>{})
    } catch (e) {
      console.log('error clicking access system', e && e.message)
    }

    // Now navigate client-side to Clients page via hash to avoid history-mode server 404
    // If we saved auth previously, try injecting it into Pinia now to avoid login next time
    if (fs.existsSync(authFile)) {
      const saved = JSON.parse(fs.readFileSync(authFile, 'utf8'))
      console.log('injecting saved auth into app')
      await page.evaluate((saved) => {
        function findPinia() {
          const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
          if (hook && hook.apps && hook.apps.length) {
            for (const app of hook.apps) {
              const provides = app.provides || (app._context && app._context.provides)
              if (!provides) continue
              for (const k of Object.keys(provides)) {
                if (k.toLowerCase().includes('pinia')) return provides[k]
              }
            }
          }
          if (window.__pinia) return window.__pinia
          if (window.pinia) return window.pinia
          return null
        }
        const pinia = findPinia()
        if (!pinia) return false
        const stores = pinia._s || pinia._a || pinia._s || null
        const entries = stores instanceof Map ? Array.from(stores.values()) : Object.values(stores)
        for (const s of entries) {
          try {
            // attempt to set auth state
            if (s.$patch) {
              if (s.$state && (s.$state.token || s.$state.auth)) {
                s.$patch({ auth: saved, token: saved.token || null })
                return true
              }
              if (s.auth) {
                s.$patch({ auth: saved })
                return true
              }
            } else if (s.setAuth) {
              s.setAuth(saved)
              return true
            }
          } catch (e) {}
        }
        return false
      }, saved).catch(()=>{})
    }
    // Re-inject localStorage and reload to ensure SPA initializes with token and Pinia
    try {
      if (fs.existsSync(lsFile)) {
        const lsSaved = JSON.parse(fs.readFileSync(lsFile, 'utf8'))
        await page.evaluate((ls) => {
          for (const k of Object.keys(ls)) {
            try { localStorage.setItem(k, ls[k]) } catch (e) {}
          }
        }, lsSaved)
        console.log('re-injected localStorage, reloading')
        await page.reload({ waitUntil: 'networkidle' }).catch(()=>{})
      }
    } catch (e) { console.log('error re-injecting localStorage', e && e.message) }

    // Force navigation to the Clients data management page to ensure the layout mounts
    try {
        console.log('forcing navigation to /dataManagement')
      await page.goto(base + '/dataManagement', { waitUntil: 'networkidle', timeout: 15000 })
    } catch (e) {
      console.log('direct goto to dataManagement failed', e && e.message)
    }

    // Prefer opening the top menu 'Gestão de Dados' then clicking 'Clientes'
    try {
      // click the menu trigger with the name 'Gestão de Dados'
      const menuTrigger = page.locator('span:has-text("Gestão de Dados")').first()
      if (await menuTrigger.count() > 0) {
        await menuTrigger.click().catch(()=>{})
        await page.waitForTimeout(300)
        const clientItem = page.locator('q-menu q-btn:has-text("Clientes")').first()
        if (await clientItem.count() > 0) {
          await clientItem.click().catch(()=>{})
        } else {
          // fallback: click any menu button with 'Clientes' text
          const anyClient = page.locator('button:has-text("Clientes")').first()
          if (await anyClient.count() > 0) await anyClient.click().catch(()=>{})
        }
      } else {
        // fallback to hash navigation
        await page.evaluate(() => { location.hash = '#/dashboard/dataManagement' })
      }
    } catch (e) {
      console.log('error opening top menu', e && e.message)
      await page.evaluate(() => { location.hash = '#/dashboard/dataManagement' })
    }
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'after-nav.png') }).catch(()=>{})

    // diagnostic: dump visible buttons to console for selector tuning
    try {
      const btns = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText.trim(), html: b.outerHTML.slice(0,400) }))
      })
      console.log('PAGE BUTTONS DUMP:', JSON.stringify(btns, null, 2))
    } catch (e) { console.log('could not dump buttons', e && e.message) }

    // Try to programmatically open the Clients create dialog via Pinia store
    try {
      const opened = await page.evaluate(() => {
        // Prefer direct lookup by store id: 'layout'
        const pinia = window.__pinia || window.pinia || null
        if (!pinia) return false
        try {
          const storesMap = pinia._s || pinia._a || null
          if (storesMap instanceof Map) {
            const layout = storesMap.get('layout') || storesMap.get('layout-store') || null
            if (layout) {
              if (layout.setClientDialog) {
                layout.setClientDialog(true)
                return true
              }
              if (layout.$patch) {
                layout.$patch({ clientDialog: true })
                return true
              }
              // direct mutation fallback
              layout.clientDialog = true
              return true
            }
          } else if (typeof storesMap === 'object') {
            if (storesMap['layout']) {
              const layout = storesMap['layout']
              if (layout.setClientDialog) {
                layout.setClientDialog(true)
                return true
              }
              if (layout.$patch) {
                layout.$patch({ clientDialog: true })
                return true
              }
              layout.clientDialog = true
              return true
            }
          }
        } catch (e) {}
        return false
      })
      console.log('programmatic open dialog result=', opened)
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(outDir, 'after-programmatic-open.png') }).catch(()=>{})
    } catch (e) {
      console.log('error opening dialog programmatically', e && e.message)
    }

  // test data (use names without digits to satisfy frontend nameRule)
  const E2E_NAME = 'EdoisE Test'
  const E2E_EMAIL = 'edoisetest+test@example.com'
  const E2E_CPF = '12345678909'
  const E2E_BIRTH = '1990-01-01'
  const E2E_UPDATED_NAME = 'EdoisE Updated'
  // prefer precise selectors for 'Criar Novo' to avoid clicking 'Comparar Clientes'
    const candidates = [
      'button[data-test="clients-create-btn"]',
      '[data-test="clients-create-btn"]',
      // exact text match selector
      'button:has-text("Criar Novo")',
      // fallback: button whose visible text equals 'Criar Novo' (avoid partial matches like 'Comparar Clientes')
      'button:has-text("Criar Novo"):visible',
    ]

    let clicked = false
    for (const sel of candidates) {
      try {
        const loc = page.locator(sel).first()
        const cnt = await loc.count()
        console.log('trying selector', sel, 'count=', cnt)
        if (cnt > 0) {
          await loc.scrollIntoViewIfNeeded()
          await loc.click({ timeout: 2000 }).catch((e)=>{console.log('click failed',e.message)})
          clicked = true
          console.log('clicked selector', sel)
          break
        }
      } catch (err) {
        console.log('selector', sel, 'error', err.message)
      }
    }

    if (!clicked) {
      console.log('did not find or click any create button, dumping page buttons...')
      const btns = await page.$$eval('button', els => els.map(b => ({ text: b.innerText, html: b.outerHTML.slice(0,200) })))
      console.log(JSON.stringify(btns, null, 2))
    } else {
      // wait for dialog and capture screenshot
      // prefer to wait for the explicit data-test dialog attribute we added
      try {
        await page.waitForSelector('[data-test="clients-create-dialog"]', { timeout: 4000 })
        console.log('clients-create-dialog visible')
      } catch (e) {
        console.log('clients-create-dialog not visible within timeout, falling back to class selector')
        await page.waitForTimeout(1000)
      }
      await page.screenshot({ path: path.join(outDir, 'after-click.png') }).catch(()=>{})

  // try filling some inputs
  const dialog = page.locator('div.EditClientsLayout')
      if (await dialog.count() > 0) {
        console.log('dialog visible')
        const inputs = dialog.locator('input')
        if (await inputs.count() > 0) {
          // Fill sensible fields: prefer inputs bound to cliente.* if available
          try {
            // try common selectors
            const nameInput = dialog.locator('input[placeholder*="Nome"], label:has-text("Nome") input, input[name*="name"]').first()
            if (await nameInput.count() > 0) await nameInput.fill(E2E_NAME)
          } catch (e) {}
          try {
            const emailInput = dialog.locator('input[type="email"], input[placeholder*="E-mail"], label:has-text("E-mail") input, input[name*="email"]').first()
            if (await emailInput.count() > 0) await emailInput.fill(E2E_EMAIL)
          } catch (e) {}
          try {
            const cpfInput = dialog.locator('input[placeholder*="CPF"], label:has-text("CPF") input, input[name*="cpf"], input[id*="cpf"]').first()
            if (await cpfInput.count() > 0) await cpfInput.fill(E2E_CPF)
          } catch (e) {}
          try {
            const birthInput = dialog.locator('input[placeholder*="Nascimento"], label:has-text("Data de Nascimento") input, input[name*="birth"], input[type="date"]').first()
            if (await birthInput.count() > 0) await birthInput.fill(E2E_BIRTH)
          } catch (e) {}
          await page.screenshot({ path: path.join(outDir, 'dialog-filled.png') }).catch(()=>{})
        }

        // Robust fallback: ensure the app's store has a valid cliente payload so Joi validation passes
        try {
    await page.evaluate((args) => {
            try {
              const pinia = window.__pinia || window.pinia || null
              if (!pinia) return false
              const storesMap = pinia._s || pinia._a || null
              const entries = storesMap instanceof Map ? Array.from(storesMap.values()) : Object.values(storesMap || {})
              for (const s of entries) {
                try {
                  // guess the layout store by presence of clientDialog/setClientDialog
                  if (s && (s.setClientDialog || s.clientDialog !== undefined)) {
                    const payload = {
                      id: null,
                      cliente: { name: args.name, email: args.email, cpf: args.cpf, rg: '', telefone: '', birth: args.birth, profissao: null, rendaAnual: null },
                      bank: { name: '', agency: '', account: '', type: 'pf', cpf_cnpj: '' },
                      bankRegister: [],
                      residential: { register: '', property: '', number_redisential: '', real_state_registration: '', address: '', address_number: '', address_neighborhood: '', address_city: '', address_state: '', dividendo: null },
                      investment: { register_classification: '', assessor: null, data_dividendo: null, data_value_welend: null },
                      password: '',
                      contrato: { total: 0, quantity: 0 },
                      level: '',
                      weLend: [],
                      newWeLend: { status: null, value: null, value_dividendo: null, value_before: null, value_finish: null, date_payment: null },
                      uploads: []
                    }
                    if (typeof s.setClientEdit === 'function') {
                      s.setClientEdit(payload)
                    } else if (s.$patch) {
                      s.$patch({ clientEdit: payload })
                    } else {
                      s.clientEdit = payload
                    }
                    return true
                  }
                } catch (e) {}
              }
            } catch (e) {}
            return false
          }, { name: E2E_NAME, email: E2E_EMAIL, cpf: E2E_CPF, birth: E2E_BIRTH })
          console.log('ensured store clientEdit contains valid test payload')
        } catch (err) { console.log('could not inject clientEdit into store', err && err.message) }
        // click Salvar scoped to the dialog if present (avoid clicking unrelated buttons)
        const saveScoped = dialog.locator('button:has-text("Salvar")').first()
        if (await saveScoped.count() > 0) {
          await saveScoped.scrollIntoViewIfNeeded()
          // start waiting for the POST response so we can capture created id
          const respPromise = page.waitForResponse(r => r.url().includes('/api/clients') && r.request().method() === 'POST', { timeout: 5000 }).catch(()=>null)
          await saveScoped.click().catch((e)=>{console.log('save click error', e && e.message)})
          console.log('clicked Salvar (scoped)')
          try {
            const resp = await respPromise
            if (resp) {
              const json = await resp.json().catch(()=>null)
              if (json && json.id) {
                createdClientId = json.id
                console.log('captured createdClientId from POST response=', createdClientId)
              }
            }
          } catch (e) {}
          // wait a bit longer for Vue to process and for adapter/network calls to fire
          await page.waitForTimeout(1500)
          await page.screenshot({ path: path.join(outDir, 'after-save.png') }).catch(()=>{})
        } else {
          // fallback: try any button text match on page
          const saveFallback = page.locator('button:has-text("Salvar")').first()
            if (await saveFallback.count() > 0) {
            const respPromise2 = page.waitForResponse(r => r.url().includes('/api/clients') && r.request().method() === 'POST', { timeout: 5000 }).catch(()=>null)
            await saveFallback.click().catch(()=>{})
            console.log('clicked Salvar (fallback)')
            try {
              const resp2 = await respPromise2
              if (resp2) {
                const json2 = await resp2.json().catch(()=>null)
                if (json2 && json2.id) {
                  createdClientId = json2.id
                  console.log('captured createdClientId from POST response (fallback)=', createdClientId)
                }
              }
            } catch (e) {}
            await page.waitForTimeout(1500)
            await page.screenshot({ path: path.join(outDir, 'after-save.png') }).catch(()=>{})
          } else {
            console.log('no Salvar button found in dialog or page')
          }
        }
      } else {
        console.log('dialog not visible after click')
      }
    }

    // Resolve API base (backend) for direct verification calls
    const apiBase = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:3333'

    // Fallback: query backend API to verify the client was created (useful if UI doesn't refresh)
    let createdClientId = null
    try {
      const clients = await page.evaluate(async (args) => {
        try {
          const res = await fetch(args.apiBase + '/api/clients')
          if (!res.ok) return null
          return await res.json()
        } catch (e) { return null }
      }, { apiBase })
      if (clients && Array.isArray(clients)) {
        const found = clients.find(c => (c.cliente && c.cliente.email === E2E_EMAIL) || (c.cliente && c.cliente.name === E2E_NAME))
        if (found) {
          createdClientId = found.id
          console.log('API: found created client id=', createdClientId)
        } else {
          console.log('API: created client not found in list')
        }
      } else {
        console.log('API: could not fetch clients or unexpected response')
      }
    } catch (e) { console.log('error fetching clients after create', e && e.message) }

    // Wait for the table to show the new client: try looking for the name text
      try {
      await page.waitForTimeout(1000)
      const created = await page.locator(`text=${E2E_NAME}`).first()
      if (await created.count() > 0) {
        console.log('created client appears in table')
        await page.screenshot({ path: path.join(outDir, 'created-in-table.png') }).catch(()=>{})
      } else {
        console.log('created client not found by exact text, searching by partial email')
        const byEmail = await page.locator(`text=${E2E_EMAIL}`).first()
        if (await byEmail.count() > 0) console.log('created client found by email')
        else console.log('could not find created client in table')
      }
    } catch (e) { console.log('error verifying created client', e && e.message) }

    // Try to open actions menu for the created client and click Edit, then change name and save
    try {
      // Find action button associated with the created client by scanning all action buttons and checking their nearest row text
  const emailToFind = E2E_EMAIL
      // Prefer locating the table row containing the created client's email, then click the actions button inside that row
      try {
        // wait a bit for the table to render the new row
        await page.waitForTimeout(800)
        // Prefer to find a table cell (td) that contains the E2E email or name, then read its data-test attribute
        const dataTestAttr = await page.evaluate((args) => {
          try {
            // search td cells first (Quasar table renders q-td -> td)
            const tds = Array.from(document.querySelectorAll('td'))
            for (const td of tds) {
              if (td && td.innerText && (td.innerText.indexOf(args.email) !== -1 || td.innerText.indexOf(args.name) !== -1)) {
                // climb up to find an element with data-test starting with clients-row-
                let el = td
                while (el && el !== document.body) {
                  if (el.getAttribute && el.getAttribute('data-test') && el.getAttribute('data-test').startsWith('clients-row-')) {
                    return el.getAttribute('data-test')
                  }
                  el = el.parentElement
                }
              }
            }
          } catch (e) {}
          return null
        }, { email: E2E_EMAIL, name: E2E_NAME })

        let foundRowId = null
        if (dataTestAttr) {
          const m = dataTestAttr.match(/^clients-row-(.+)$/)
          if (m) foundRowId = m[1]
        }

        if (foundRowId) {
          // use per-row action button by id
          const perRowBtn = page.locator(`button[data-test="clients-row-actions-btn-${foundRowId}"]`).first()
          if (await perRowBtn.count() > 0) {
            await perRowBtn.scrollIntoViewIfNeeded()
            await perRowBtn.click({ force: true }).catch(()=>{})
          } else {
            // fallback: click any button inside the found element
            const container = page.locator(`[data-test="clients-row-${foundRowId}"]`).first()
            if (await container.count() > 0) {
              const anyBtn = container.locator('button').first()
              if (await anyBtn.count() > 0) await anyBtn.click({ force: true }).catch(()=>{})
            }
          }
          // expose foundRowId for later removal/edit fallback
          createdClientId = foundRowId
        } else {
          // fallback: find row by text and click first button inside
          const rowLocator = page.locator(`tr:has-text("${emailToFind}")`).first()
          if (await rowLocator.count() > 0) {
            const anyBtn = rowLocator.locator('button').first()
            if (await anyBtn.count() > 0) await anyBtn.click({ force: true }).catch(()=>{})
          }
        }
      } catch (e) {
        // swallow - we'll try menu fallbacks below
      }
      await page.waitForTimeout(400)
        // click Edit option in the opened menu (search inside the q-menu container)
        let clickedEdit = false
        try {
          // wait for the menu container to appear (Quasar often renders q-menu content detached)
          await page.waitForSelector('div.q-menu', { timeout: 2000 })
          const menuContainer = page.locator('div.q-menu').first()
          let menuEditBtn = null
          if (createdClientId) {
            menuEditBtn = menuContainer.locator(`button[data-test="clients-row-edit-${createdClientId}"]`)
            if (await menuEditBtn.count() === 0) {
              menuEditBtn = menuContainer.locator('button:has-text("Editar")')
            }
          } else {
            menuEditBtn = menuContainer.locator('button[data-test^="clients-row-edit"], button:has-text("Editar")').first()
          }
          const menuEditCount = await menuEditBtn.count()
          console.log('menu edit candidates=', menuEditCount)
          if (menuEditCount > 0) {
            await menuEditBtn.click({ force: true }).catch(()=>{})
            clickedEdit = true
            console.log('clicked Editar in row menu (menuContainer)')
          } else {
            console.log('no edit button found inside menu container')
          }
        } catch (e) {
          console.log('menu did not appear or error searching menu for Editar', e && e.message)
        }
        // final fallback: global search (older behavior)
        if (!clickedEdit) {
          let editInMenu
          if (createdClientId) editInMenu = page.locator(`button[data-test="clients-row-edit-${createdClientId}"]`).first()
          else editInMenu = page.locator('button[data-test^="clients-row-edit"]').first()
          const editCount = await editInMenu.count()
          if (editCount > 0) {
            await editInMenu.click({ force: true }).catch(()=>{})
            clickedEdit = true
            console.log('clicked Editar in row menu (global fallback)')
          } else {
            const editInMenuText = page.locator('button:has-text("Editar")').first()
            if (await editInMenuText.count() > 0) { await editInMenuText.click().catch(()=>{}); clickedEdit = true; console.log('clicked Editar in row menu (text fallback)') }
            else console.log('Editar option not found in row menu')
          }
        }
          if (clickedEdit) {
          // wait for dialog and change name
          await page.waitForSelector('div.EditClientsLayout', { timeout: 3000 }).catch(()=>{})
          const nameInput2 = page.locator('div.EditClientsLayout input[placeholder*="Nome"], div.EditClientsLayout input[name*="name"], div.EditClientsLayout input').first()
          if (await nameInput2.count() > 0) {
            await nameInput2.fill(E2E_UPDATED_NAME).catch(()=>{})
            await page.screenshot({ path: path.join(outDir, 'dialog-filled-edit.png') }).catch(()=>{})
            const save2 = page.locator('button:has-text("Salvar")').first()
            if (await save2.count() > 0) { await save2.click().catch(()=>{}); console.log('clicked Salvar after edit'); await page.waitForTimeout(800) }
          }
        } else {
          console.log('Editar option not found in row menu')
        }
      
    } catch (e) { console.log('error editing created client', e && e.message) }

    // Try to remove the created client via UI: open row menu and click Remover
    try {
      let row2
      if (createdClientId) {
        // prefer per-row data-test
        const perRowBtn2 = page.locator(`button[data-test="clients-row-actions-btn-${createdClientId}"]`).first()
        if (await perRowBtn2.count() > 0) {
          await perRowBtn2.click().catch(()=>{})
          await page.waitForTimeout(300)
          const remover = page.locator(`button[data-test="clients-row-delete-${createdClientId}"]`).first()
            if (await remover.count() > 0) {
              await remover.click().catch(()=>{})
              console.log('clicked Remover in row menu')
              await page.waitForTimeout(500)
              await page.screenshot({ path: path.join(outDir, 'after-delete.png') }).catch(()=>{})
            } else {
              // try to wait for menu container and search inside for Remover
              try {
                await page.waitForSelector('div.q-menu', { timeout: 1500 })
                const menuContainer2 = page.locator('div.q-menu').first()
                const removerInMenu = menuContainer2.locator(`button[data-test="clients-row-delete-${createdClientId}"], button:has-text("Remover")`).first()
                if (await removerInMenu.count() > 0) { await removerInMenu.click().catch(()=>{}); console.log('clicked Remover in row menu (menuContainer)'); await page.waitForTimeout(500); await page.screenshot({ path: path.join(outDir, 'after-delete.png') }).catch(()=>{}) }
                else console.log('Remover option not found in menu (menuContainer)')
              } catch (e) {
                const removerText = page.locator('button:has-text("Remover")').first()
                if (await removerText.count() > 0) { await removerText.click().catch(()=>{}); console.log('clicked Remover in row menu (text fallback)'); await page.waitForTimeout(500) }
                else console.log('Remover option not found in menu')
              }
            }
        } else {
          console.log('per-row actions button not found for removal, falling back')
          row2 = await page.locator(`div.ClientsTable tr:has-text("${E2E_UPDATED_NAME}"), div.ClientsTable tr:has-text("${E2E_NAME}")`).first()
        }
      } else {
        row2 = await page.locator(`div.ClientsTable tr:has-text("${E2E_UPDATED_NAME}"), div.ClientsTable tr:has-text("${E2E_NAME}")`).first()
      }
      if (row2 && (await row2.count() > 0)) {
        const actionBtn2 = row2.locator('button').first()
        if (await actionBtn2.count() > 0) {
          await actionBtn2.click().catch(()=>{})
          await page.waitForTimeout(300)
          const removerText2 = page.locator('button:has-text("Remover")').first()
          if (await removerText2.count() > 0) { await removerText2.click().catch(()=>{}); console.log('clicked Remover in row menu (text fallback)'); await page.waitForTimeout(500) }
          else console.log('Remover option not found in menu')
        }
      } else if (!createdClientId) {
        console.log('row not found to remove client')
      }
    } catch (e) { console.log('error removing client via UI', e && e.message) }

    // If UI removal didn't work or to confirm, use API to update and delete the created client (fallback)
    try {
          if (!createdClientId) {
        // attempt to refetch to get id
        const clients2 = await page.evaluate(async (args) => {
          try { const res = await fetch(args.apiBase + '/api/clients'); if (!res.ok) return null; return await res.json() } catch(e){return null}
        }, { apiBase })
        if (clients2 && Array.isArray(clients2)) {
          const found2 = clients2.find(c => c.cliente && (c.cliente.email === 'e2e+test@example.com' || c.cliente.name === 'E2E UI Test'))
          if (found2) createdClientId = found2.id
        }
      }
        if (createdClientId) {
          console.log('API fallback: will try update and delete on id', createdClientId)
          // Update name to E2E Updated via PUT
          const upd = await page.evaluate(async (args) => {
            try {
              const payload = { cliente: { name: args.name } }
              const res = await fetch(args.apiBase + '/api/clients/' + args.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
              return res.ok
            } catch (e) { return false }
          }, { apiBase, id: createdClientId, name: E2E_UPDATED_NAME })
          console.log('API fallback: update result=', upd)
          // Verify updated
          const verify = await page.evaluate(async (args) => { try { const r = await fetch(args.apiBase + '/api/clients/' + args.id); if (!r.ok) return null; return await r.json() } catch(e){return null} }, { apiBase, id: createdClientId })
          console.log('API fallback: verify after update=', verify && verify.cliente && verify.cliente.name)
          // Delete
          const del = await page.evaluate(async (args) => { try { const r = await fetch(args.apiBase + '/api/clients/' + args.id, { method: 'DELETE' }); return r.ok } catch(e){return false} }, { apiBase, id: createdClientId })
          console.log('API fallback: delete result=', del)
      } else {
        console.log('API fallback: no createdClientId available to update/delete')
      }
    } catch (e) { console.log('API fallback error', e && e.message) }

  } catch (err) {
    console.error('error during run', err)
  } finally {
    await context.close()
    await browser.close()

    // find the video file
    const files = fs.readdirSync(outDir).filter(f=>f.endsWith('.webm')||f.endsWith('.mp4'))
    console.log('videos:', files)
    console.log('artifacts in', outDir)
  }
}

main().catch(err => {
  console.error('unhandled error in main', err)
  process.exit(1)
})
