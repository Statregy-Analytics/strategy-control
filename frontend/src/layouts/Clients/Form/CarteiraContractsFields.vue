<template>
  <div class="CarteiraContractsFields">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Assessor Responsável">
        <q-select
          outlined
          dense
          :options="optionsAssessor"
          v-model="selectedAssessor"
          class="q-my-sm"
        ></q-select>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Data de dividendo">
        <q-input
          outlined
          v-model="clientEdit.investment.data_dividendo"
          dense
          class="q-my-sm"
          bg-color="white"
          navigation-min-year-month="1990/07"
          type="date"
        />
      </label-form>
      <label-form className="col" textLabel="Valor do dividendo (R$)">
        <q-input
          v-currency-mask
          outlined
          v-model="clientEdit.investment.valor_dividendo"
          dense
          placeholder="Ex.: 1000,00"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
  </div>
</template>

<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { ref, computed, onMounted } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import useAdvisors from 'src/composables/Fakes/useAdvisors'



const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

// advisors helper
const { rowsAssessores, getAdvisorsIdNameEmail } = useAdvisors()
const optionsAssessor = ref([])

const selectedAssessor = computed({
  get() {
    const inv = clientEdit.value && clientEdit.value.investment
    if (!inv) return null
    const a = inv.assessor
    if (a && typeof a === 'object' && a.value !== undefined) {
      const v = String(a.value)
      const found = optionsAssessor.value.find((o) => String(o.value) === v)
      if (found) return found
      return { label: String(a.label || a.name || ''), value: v }
    }
    if (typeof a === 'number' || (typeof a === 'string' && String(a).match(/^\d+$/))) {
      const v = String(a)
      const found = optionsAssessor.value.find((o) => String(o.value) === v)
      if (found) return found
      return { label: v, value: v }
    }
    if (typeof a === 'string' && a.trim()) {
      const name = a.trim()
      const found = optionsAssessor.value.find(
        (o) =>
          String(o.label).toLowerCase() === String(name).toLowerCase() ||
          String(o.value) === String(name),
      )
      if (found) return found
      return { label: name, value: name }
    }
    return null
  },
  set(val) {
    const inv = clientEdit.value && clientEdit.value.investment
    if (!inv) return
    if (val && typeof val === 'object') {
      const label = val.label !== undefined ? String(val.label) : ''
      const value = val.value !== undefined ? String(val.value) : String(val)
      inv.assessor = { label, value }
      return
    }
    inv.assessor = String(val)
  },
})

function updateOptionsAssessor() {
  const list =
    Array.isArray(rowsAssessores) && rowsAssessores.length
      ? rowsAssessores
      : typeof getAdvisorsIdNameEmail === 'function'
        ? getAdvisorsIdNameEmail()
        : []
  optionsAssessor.value = (Array.isArray(list) ? list : []).map((a) => ({
    label: String((a.assessor && a.assessor.name) || a.name || '-'),
    value: String(a.id),
  }))
}

function normalizeAssessorOnLoad() {
  const inv = clientEdit.value && clientEdit.value.investment
  if (!inv) return
  const a = inv.assessor
  if (a && typeof a === 'object' && a.value !== undefined) {
    inv.assessor = String(a.value)
    return
  }
  if (typeof a === 'string' && a.trim()) {
    const name = a.trim().toLowerCase()
    const found = (rowsAssessores || []).find((x) => {
      const xName = (x && x.assessor && x.assessor.name) || x.name || ''
      return xName && xName.toLowerCase() === name
    })
    if (found) inv.assessor = String(found.id)
  }
}

onMounted(() => {
  updateOptionsAssessor()
  normalizeAssessorOnLoad()
})
</script>
