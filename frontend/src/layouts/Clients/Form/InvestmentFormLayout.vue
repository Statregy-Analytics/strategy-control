<template>
  <div class="CarteiraFormLayout">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Classificação">
        <q-select
          outlined
          dense
          emit-value
          :options="optionsClassification"
          v-model="selectedClassification"
          class="q-my-sm"
        ></q-select>
      </label-form>
      <label-form className="col" textLabel="Carteira Total">
        <q-input
          outlined
          v-model="clientEdit.investment.saldo"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <!-- Assessor / Data de dividendo / Valor do dividendo foram extraídos para
         `CarteiraContractsFields.vue` e devem ser renderizados abaixo da seção
         de contratos no formulário pai. -->
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, computed, watch } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const optionsClassification = [
  { label: 'Gold', value: 'Gold' },
  { label: 'Platinum', value: 'Platinum' },
  { label: 'Black', value: 'Black' },
]

// computed classification that prefers manual selection but can auto-derive
// from `clientEdit.investment.saldo` (Carteira Total) when not manually set.
const selectedClassification = computed({
  get() {
    const inv = clientEdit.value && clientEdit.value.investment
    if (!inv) return null
    if (inv.classification && String(inv.classification).trim()) return inv.classification
    const saldo = Number(inv.saldo) || 0
    if (saldo >= 100000) return 'Black'
    if (saldo >= 50000) return 'Platinum'
    if (saldo >= 10000) return 'Gold'
    return null
  },
  set(val) {
    const inv = clientEdit.value && clientEdit.value.investment
    if (!inv) return
    inv.classification = val
  },
})

defineComponent({ name: 'CarteiraFormLayout' })

// propagate selected investment classification to top-level client level
watch(
  () => {
    const inv = clientEdit.value && clientEdit.value.investment
    return inv ? inv.classification : null
  },
  (newVal) => {
    if (newVal !== undefined && newVal !== null) {
      // avoid setting an object to level (which renders as [object Object])
      if (typeof newVal === 'object') {
        clientEdit.value.level = newVal.value || newVal.label || String(newVal)
      } else {
        clientEdit.value.level = newVal
      }
    }
  },
)
</script>
