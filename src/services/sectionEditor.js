export const copy = (value) => JSON.parse(JSON.stringify(value))
export const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export function createSectionEditor(
  state,
  { read, plan, write, validate, errorMessage, saved, refresh },
) {
  let revision = 0
  const completed = new Set()
  const clear = () => {
    revision++
    Object.assign(state, {
      active: null,
      source: null,
      draft: null,
      original: null,
      editable: [],
      loading: false,
      saving: false,
      error: '',
      errorSection: null,
      fields: {},
      partial: false,
    })
    completed.clear()
  }
  const dirty = () => Boolean(state.draft && !equal(state.draft, state.original))
  const start = async (key) => {
    if (state.active || state.saving) return false
    clear()
    const operation = revision
    Object.assign(state, { active: key, loading: true })
    try {
      const result = await read(key)
      if (operation !== revision) return false
      Object.assign(state, {
        source: result.source,
        draft: copy(result.values),
        original: copy(result.values),
        editable: result.editable || [],
      })
      return true
    } catch (error) {
      if (operation === revision)
        Object.assign(state, { active: null, errorSection: key, error: errorMessage(error) })
      return false
    } finally {
      if (operation === revision) state.loading = false
    }
  }
  const save = async () => {
    if (!state.active || state.loading || state.saving || !dirty()) return false
    const key = state.active,
      operation = revision
    state.fields = validate(key, state.draft, state.source)
    state.error = ''
    state.errorSection = key
    if (Object.keys(state.fields).length) {
      state.error = 'Não foi possível salvar. Revise o campo destacado.'
      return false
    }
    state.saving = true
    try {
      const steps = plan(key, state.source, state.draft, state.original)
      for (const step of steps) {
        if (operation !== revision) return false
        const fingerprint = JSON.stringify(step)
        if (!step.fields && completed.has(fingerprint)) continue
        await write(step)
        if (operation !== revision) return false
        completed.add(fingerprint)
        for (const field of step.fields || []) state.original[field] = copy(state.draft[field])
        state.partial = true
      }
      if (operation !== revision) return false
      clear()
      saved(key)
      await refresh(key)
      return true
    } catch (error) {
      if (operation === revision) {
        state.error =
          (state.partial ? 'Parte das alterações foi salva. ' : '') + errorMessage(error)
        for (const item of error?.response?.data?.errors || []) {
          const field = item.field?.split('.').at(-1)
          const key = Object.keys(state.draft || {}).find(
            (name) => name.toLowerCase() === field?.toLowerCase(),
          )
          if (key) state.fields[key] = item.message
        }
      }
      return false
    } finally {
      if (operation === revision) state.saving = false
    }
  }
  const discard = async () => {
    if (state.saving) return false
    const key = state.active,
      partial = state.partial
    clear()
    if (partial && key) await refresh(key)
    return true
  }
  return { start, save, discard, dirty, dispose: clear }
}
