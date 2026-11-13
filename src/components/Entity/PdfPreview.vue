<template>
  <div
    ref="container"
    class="pdf-preview"
    role="region"
    tabindex="0"
    aria-label="Prévia do PDF"
    :aria-busy="loading"
  >
    <q-linear-progress v-if="loading" indeterminate aria-label="Carregando PDF" />
    <q-banner v-if="error" class="bg-transparent" role="alert">{{ error }}</q-banner>
    <div
      v-for="(page, index) in pages"
      :key="index"
      :ref="(el) => setPageElement(index, el)"
      class="pdf-preview__page"
      :style="{ aspectRatio: page.ratio }"
      :data-page="index"
    >
      <canvas
        v-if="page.visible"
        :ref="(el) => setCanvas(index, el)"
        role="img"
        :aria-label="'Página ' + (index + 1) + ' de ' + pages.length"
      />
      <span class="pdf-preview__text">{{ page.text }}</span>
    </div>
  </div>
</template>
<script setup>
import { nextTick, onMounted, onScopeDispose, ref, watch } from 'vue'
const props = defineProps({ src: { type: String, required: true } })
const container = ref(null),
  loading = ref(false),
  error = ref(''),
  pages = ref([])
const pageElements = new Map(),
  canvases = new Map(),
  renders = new Map(),
  versions = new Map()
let generation = 0,
  document = null,
  loadingTask = null,
  intersection = null,
  resize = null,
  active = true,
  lastWidth = 0
const setPageElement = (index, el) =>
  el ? pageElements.set(index, el) : pageElements.delete(index)
const setCanvas = (index, el) => (el ? canvases.set(index, el) : canvases.delete(index))
function cleanup() {
  intersection?.disconnect()
  intersection = null
  for (const task of renders.values()) task.cancel()
  renders.clear()
  versions.clear()
  loadingTask?.destroy().catch(() => {})
  loadingTask = null
  document = null
  pages.value = []
  pageElements.clear()
  canvases.clear()
}
async function renderPage(index, owner) {
  if (!active || owner !== generation || !document || !pages.value[index]) return
  const version = (versions.get(index) || 0) + 1
  versions.set(index, version)
  const current = () => active && owner === generation && versions.get(index) === version
  const previous = renders.get(index)
  previous?.cancel()
  let task
  try {
    if (previous) await previous.promise.catch(() => {})
    const page = await document.getPage(index + 1)
    if (!current()) return
    const initial = page.getViewport({ scale: 1 })
    const width = Math.max(1, container.value?.clientWidth || initial.width)
    const viewport = page.getViewport({ scale: width / initial.width })
    pages.value[index].ratio = initial.width / initial.height
    pages.value[index].visible = true
    await nextTick()
    if (!current()) return
    const canvas = canvases.get(index)
    if (!canvas) return
    const outputScale = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale))
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale))
    task = page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
      transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
    })
    renders.set(index, task)
    await task.promise
    if (!current()) return
    const text = await page.getTextContent()
    if (current()) pages.value[index].text = text.items.map((item) => item.str || '').join(' ')
  } catch (e) {
    if (current() && e?.name !== 'RenderingCancelledException')
      error.value = 'Não foi possível visualizar o PDF. Selecione o arquivo novamente.'
  } finally {
    if (task && renders.get(index) === task) renders.delete(index)
  }
}
async function load(src) {
  const owner = ++generation
  cleanup()
  error.value = ''
  loading.value = Boolean(src)
  if (!src) return
  try {
    const pdf = await import('pdfjs-dist')
    if (!active || owner !== generation) return
    const assets = new URL(
      'vendor/pdfjs/' + pdf.version + '/',
      window.location.origin + import.meta.env.BASE_URL,
    ).href
    pdf.GlobalWorkerOptions.workerSrc = assets + 'pdf.worker.min.js'
    loadingTask = pdf.getDocument({
      url: src,
      isEvalSupported: false,
      cMapUrl: assets + 'cmaps/',
      cMapPacked: true,
      standardFontDataUrl: assets + 'standard_fonts/',
      wasmUrl: assets + 'wasm/',
      iccUrl: assets + 'iccs/',
    })
    const loaded = await loadingTask.promise
    if (!active || owner !== generation) return
    document = loaded
    const first = await document.getPage(1)
    if (!active || owner !== generation) return
    const viewport = first.getViewport({ scale: 1 })
    pages.value = Array.from({ length: document.numPages }, () => ({
      visible: false,
      ratio: viewport.width / viewport.height,
      text: '',
    }))
    await nextTick()
    await renderPage(0, owner)
    if (!active || owner !== generation) return
    intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.dataset.page)
          if (entry.isIntersecting && pages.value[index] && !pages.value[index].visible)
            renderPage(index, owner)
        }
      },
      { root: container.value, rootMargin: '400px' },
    )
    for (const el of pageElements.values()) intersection.observe(el)
  } catch {
    if (active && owner === generation)
      error.value = 'Não foi possível visualizar o PDF. Selecione o arquivo novamente.'
  } finally {
    if (active && owner === generation) loading.value = false
  }
}
watch(() => props.src, load, { immediate: true, flush: 'post' })
onMounted(() => {
  resize = new ResizeObserver(() => {
    const width = container.value?.clientWidth || 0
    if (!width || Math.abs(lastWidth - width) < 1) return
    lastWidth = width
    for (const [index, page] of pages.value.entries())
      if (page.visible) renderPage(index, generation)
  })
  resize.observe(container.value)
})
onScopeDispose(() => {
  active = false
  generation++
  resize?.disconnect()
  cleanup()
})
</script>
<style scoped>
.pdf-preview {
  height: 500px;
  overflow: auto;
  min-width: 0;
  background: rgba(0, 0, 0, 0.08);
}
.pdf-preview__page {
  position: relative;
  width: 100%;
  background: #fff;
  margin-bottom: 12px;
}
.pdf-preview__page canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.pdf-preview__text {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (max-width: 600px) {
  .pdf-preview {
    height: 340px;
  }
}
</style>
