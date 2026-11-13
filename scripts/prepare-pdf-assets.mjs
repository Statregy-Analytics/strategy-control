import { cp, mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const root = new URL('../', import.meta.url)
const source = new URL('node_modules/pdfjs-dist/', root)
const { version } = JSON.parse(await readFile(new URL('package.json', source), 'utf8'))
const target = new URL('public/vendor/pdfjs/' + version + '/', root)
await mkdir(target, { recursive: true })
for (const name of ['cmaps', 'standard_fonts', 'wasm', 'iccs', 'LICENSE']) {
  await cp(fileURLToPath(new URL(name, source)), fileURLToPath(new URL(name, target)), {
    recursive: true,
  })
}

// Use .js so servers without an .mjs MIME mapping serve the module correctly.
await cp(new URL('build/pdf.worker.min.mjs', source), new URL('pdf.worker.min.js', target))
