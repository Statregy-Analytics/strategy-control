import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import * as vue from 'vue'
export const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
export const tick = () => new Promise((resolve) => setImmediate(resolve))
export async function componentModel(
  path,
  {
    props = {},
    modules = {},
    exports: names = '',
    transform = (source) => source,
    globals = {},
  } = {},
) {
  const mounted = [],
    disposed = [],
    stops = [],
    events = [],
    notices = []
  const owner = vue.reactive(props)
  let exposed = {}
  const bindings = {
    quasar: { QInput: {} },
    vue: {
      ...vue,
      onMounted: (fn) => mounted.push(fn),
      onScopeDispose: (fn) => disposed.push(fn),
      watch: (...args) => {
        const stop = vue.watch(...args)
        stops.push(stop)
        return stop
      },
    },
    'src/services/apiError': { getApiErrorMessage: (e, f) => e?.message || f },
    'src/composables/global/useNotification': {
      default: () => ({
        successNotify: (message) => notices.push(message),
        errorNotify: (message) => notices.push(message),
      }),
    },
    ...modules,
  }
  const source = transform(
    readFileSync(new URL('../../' + path, import.meta.url), 'utf8').match(
      /<script setup>([\s\S]*?)<\/script>/,
    )[1],
  )
  const context = vm.createContext({
    defineProps: () => owner,
    defineEmits:
      () =>
      (...args) =>
        events.push(args),
    defineExpose: (value) => {
      exposed = value
    },
    ...globals,
  })
  const mod = new vm.SourceTextModule(source + '\nexport {' + names + '};', { context })
  await mod.link((name) => {
    const values = name.endsWith('.vue') ? { default: {} } : bindings[name]
    if (!values) throw Error('Missing test binding ' + name)
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [k, v] of Object.entries(values)) this.setExport(k, v)
      },
      { context },
    )
  })
  await mod.evaluate()
  const ready = Promise.all(mounted.map((fn) => fn()))
  return {
    m: mod.namespace,
    props: owner,
    events,
    notices,
    exposed,
    ready,
    dispose() {
      disposed.forEach((fn) => fn())
      stops.forEach((stop) => stop())
    },
  }
}
