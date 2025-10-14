<template>
  <div class="InvestmentFormLayout">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Classificação">
        <q-select
          outlined
          dense
          :options="optionsClassification"
          v-model="clientEdit.investment.classification"
          class="q-my-sm"
        ></q-select>
      </label-form>
      <label-form className="col" textLabel="Saldo disponível">
        <q-input
          outlined
          v-model="clientEdit.investment.saldo"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
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
          outlined
          v-model="clientEdit.investment.valor_dividendo"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form textLabel="Senha" className="col">
        <q-input
          outlined
          ref="passwordRef"
          v-model="clientEdit.password"
          dense
          aria-placeholder="Digiter a senha"
          unmasked-value
          class="q-my-sm"
          bg-color="white"
          :type="isPwd ? 'password' : 'text'"
        >
          <template v-slot:append>
            <q-icon
              color="grey-5"
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </label-form>
    </div>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { ref, onMounted, watch, defineComponent, computed } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import useAdvisors from 'src/composables/Fakes/useAdvisors'

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)
const isPwd = ref(false)

const optionsClassification = [
  { label: 'Ações', value: 'Ações' },
  { label: 'Renda Fixa', value: 'Renda Fixa' },
  { label: 'Fundos Imobiliários', value: 'Fundos Imobiliários' },
  { label: 'Criptomoedas', value: 'Criptomoedas' },
]

// advisors data (composable exposes rowsAssessores and a helper)
const { rowsAssessores, getAdvisorsIdNameEmail } = useAdvisors()
const optionsAssessor = ref([])

// computed proxy so q-select shows label correctly even when options are loaded async
const selectedAssessor = computed({
  get() {
    const inv = clientEdit.value && clientEdit.value.investment
    if (!inv) return null
    const a = inv.assessor
    // if object { label, value } -> try to return matching option
    if (a && typeof a === 'object' && a.value !== undefined) {
      const v = String(a.value)
      const found = optionsAssessor.value.find((o) => String(o.value) === v)
      if (found) return found
      return { label: String(a.label || a.name || ''), value: v }
    }
    // numeric id or numeric string -> find option
    if (typeof a === 'number' || (typeof a === 'string' && String(a).match(/^\d+$/))) {
      const v = String(a)
      const found = optionsAssessor.value.find((o) => String(o.value) === v)
      if (found) return found
      return { label: v, value: v }
    }
    // string name -> try find by label or value
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
    // if q-select emits object (option), store object {label,value}
    if (val && typeof val === 'object') {
      const label = val.label !== undefined ? String(val.label) : ''
      const value = val.value !== undefined ? String(val.value) : String(val)
      inv.assessor = { label, value }
      return
    }
    // primitives -> store as string
    inv.assessor = String(val)
  },
})

// watch selectedAssessor internal value and add a temporary option if it's a string label
watch(
  () => selectedAssessor.value,
  (val) => {
    if (!val) return
    // if selected is a non-numeric string and not present in options, insert as temp option
    if (typeof val === 'string' && !String(val).match(/^\d+$/)) {
      if (!optionsAssessor.value.find((o) => String(o.value) === String(val))) {
        optionsAssessor.value.unshift({ label: val, value: val })
      }
    }
  },
)

function updateOptionsAssessor() {
  const list =
    Array.isArray(rowsAssessores) && rowsAssessores.length
      ? rowsAssessores
      : typeof getAdvisorsIdNameEmail === 'function'
        ? getAdvisorsIdNameEmail()
        : []
  optionsAssessor.value = (Array.isArray(list) ? list : []).map((a) => ({
    label: String((a.assessor && a.assessor.name) || a.name || '-'),
    // coerce id to string to keep types consistent with selectedAssessor
    value: String(a.id),
  }))
}

function normalizeAssessorOnLoad() {
  const inv = clientEdit.value && clientEdit.value.investment
  if (!inv) return
  const a = inv.assessor
  // if it's an object like { label, value }, prefer value (id)
  if (a && typeof a === 'object' && a.value !== undefined) {
    inv.assessor = String(a.value)
    return
  }
  // if it's a string name, try to resolve to id so select will pick correct option
  if (typeof a === 'string' && a.trim()) {
    const name = a.trim().toLowerCase()
    const found = (rowsAssessores || []).find((x) => {
      const xName = (x && x.assessor && x.assessor.name) || x.name || ''
      return xName && xName.toLowerCase() === name
    })
    if (found) inv.assessor = String(found.id)
    // else leave string; backend will create/resolve on save
  }
}

onMounted(() => {
  updateOptionsAssessor()
  normalizeAssessorOnLoad()
})

watch(
  () => rowsAssessores,
  () => updateOptionsAssessor(),
  { deep: true },
)
watch(
  () => clientEdit.value && clientEdit.value.investment && clientEdit.value.investment.assessor,
  (val) => {
    if (typeof val === 'string') normalizeAssessorOnLoad()
  },
)

defineComponent({ name: 'InvestmentFormLayout' })
</script>
