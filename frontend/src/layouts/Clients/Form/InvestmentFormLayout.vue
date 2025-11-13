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
          @keydown="onKeydownNumeric"
          @paste="onPasteNumeric"
          @update:model-value="(val) => onInputNumeric(val)"
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

// enforce numeric-only input for carteira total (clientEdit.investment.saldo)
const onInputNumeric = (val) => {
  try {
    if (!clientEdit || !clientEdit.value) return
    if (!clientEdit.value.investment) clientEdit.value.investment = {}
    // value may be passed as event payload; fallback to current model value
    let v = val == null ? clientEdit.value.investment.saldo : val
    if (v == null) v = ''
    // keep only digits
    const digits = String(v).replace(/\D+/g, '')
    clientEdit.value.investment.saldo = digits
  } catch (e) {
    void e
  }
}

// prevent typing non-digit characters
const onKeydownNumeric = (event) => {
  try {
    // allow control/meta shortcuts (copy/paste/select all)
    if (event.ctrlKey || event.metaKey) return
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
      'Enter',
      'Home',
      'End',
    ]
    if (allowedKeys.includes(event.key)) return
    // allow digits
    if (/^[0-9]$/.test(event.key)) return
    // otherwise prevent
    event.preventDefault()
  } catch (e) {
    void e
  }
}

// sanitize pasted content: only allow digits, insert filtered text at cursor
const onPasteNumeric = (event) => {
  try {
    const clipboardData = event.clipboardData || window.clipboardData
    const paste = clipboardData.getData('text') || ''
    const digits = String(paste).replace(/\D+/g, '')
    if (!digits) {
      // nothing to paste
      event.preventDefault()
      return
    }
    // insert filtered digits into the input at cursor position
    const target = event.target
    if (target && typeof target.selectionStart === 'number') {
      event.preventDefault()
      const start = target.selectionStart
      const end = target.selectionEnd
      const cur = String(target.value || '')
      const next = cur.slice(0, start) + digits + cur.slice(end)
      // set value and move cursor
      target.value = next
      // update model value stored in clientEdit
      if (!clientEdit.value) clientEdit.value = {}
      if (!clientEdit.value.investment) clientEdit.value.investment = {}
      clientEdit.value.investment.saldo = next.replace(/\D+/g, '')
      const pos = start + digits.length
      // set selection/cursor after paste
      setTimeout(() => {
        try {
          target.setSelectionRange(pos, pos)
        } catch (e) {
          void e
        }
      }, 0)
    }
  } catch (e) {
    void e
  }
}

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
