<template>
  <q-card class="CompareLayout">
    <q-icon name=""></q-icon>
    <title-card :title="dialogOpengHeader" :advisor="''" @on-close="onClose" />
    <q-separator />
    <!-- DEBUG: mostra conteúdo de compare para ajuste de mapeamento -->
    <div
      v-if="debugCompare"
      class="q-pa-sm"
      style="background: #fff7e6; border: 1px dashed #ffdca8; margin: 8px"
    >
      <strong>DEBUG compare:</strong>
      <pre style="max-height: 200px; overflow: auto; font-size: 12px">{{
        JSON.stringify(compare, null, 2)
      }}</pre>
    </div>
    <div class="compare-wrapper" :class="{ 'compare-debug': debugCompare }">
      <div
        class="compare-inner"
        :style="`--compare-inner-width: ${innerWidth}px`"
        :class="{ 'compare-debug-inner': debugCompare }"
      >
        <q-banner inline-actions rounded class="q-ma-md">
          <div class="row q-gutter-sm">
            <div class="col">
              <label-form textLabel="Dados comparados">
                <q-select
                  outlined
                  dense
                  menu-shrink
                  popup-content-class="q-pa-xs"
                  options-selected-class="bg-grey-2 text-gray-1"
                  :options="optionsCompare"
                  v-model="option"
                  class="q-my-sm"
                  options-dense
                />
              </label-form>
            </div>
            <div class="row self-center" style="background-color: #fafafa; min-width: 0">
              <div class="compare-scroll">
                <div v-for="(item, index) in compare" :key="index" class="compare-card">
                  <div v-if="item.cliente" class="relative">
                    <client-simple
                      class="border-gray"
                      :id="item.id"
                      :avatar="item.cliente.avatar"
                      :name="item.cliente.name"
                      :level="item.level"
                      style="width: 18rem"
                    />
                    <q-btn
                      flat
                      dense
                      size="xs"
                      class="compare-remove-btn absolute-top-right"
                      :icon="$filtersString.resolveUrl('img:icons/trash.svg')"
                      @click.prevent.stop="() => leadStore.removeCompareAt(index)"
                    >
                      <q-tooltip anchor="top middle" self="bottom middle"
                        >Remover da comparação</q-tooltip
                      >
                    </q-btn>
                  </div>
                  <div v-else>
                    <q-banner class="bg-grey-2 border-gray text-grey-8 col" rounded>
                      <div class="text-center row compare-card-actions">
                        <add-lead-compare :slot-index="index" />
                        <q-btn
                          @click.prevent.stop="removeEmpty"
                          flat
                          size="xs"
                          :icon="$filtersString.resolveUrl('img:icons/trash.svg')"
                        />
                      </div>
                    </q-banner>
                  </div>
                </div>
              </div>
            </div>
            <div class="col self-center">
              <q-btn
                outline
                color="primary"
                no-caps
                size="sm"
                padding="xs xs"
                class="outline"
                icon="add"
                @click.prevent="sendEmptyArray"
                :disabled="compare && compare.length >= 5"
              />
            </div>
          </div>
        </q-banner>
        <personal-fields-layout v-if="option.value === 'personal' || option.value === 'all'" />
        <investiment-fields-layout v-if="option.value === 'all' || option.value === 'investment'" />
        <loan-fields-layout v-if="option.value === 'all' || option.value === 'loan'" />
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useLayoutStore } from 'src/stores/layout'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import ClientSimple from 'src/components/Card/ClientSimple.vue'
import AddLeadCompare from 'src/components/Form/AddLeadCompare.vue'
import PersonalFieldsLayout from './Compare/PersonalFieldsLayout.vue'
import InvestimentFieldsLayout from './Compare/InvestimentFieldsLayout.vue'
import LoanFieldsLayout from './Compare/LoanFieldsLayout.vue'
// onBeforeUnmount removed: no manual scroll sync needed; wrapper provides the scrollbar

const layoutStore = useLayoutStore()
const leadStore = useLeadStore()
const { compare } = storeToRefs(leadStore)
const { dialogOpengHeader } = storeToRefs(layoutStore)
const debugCompare =
  import.meta.env.VITE_DEBUG_COMPARE === 'true' || import.meta.env.VITE_DEBUG_COMPARE === true
const $q = useQuasar()
const option = ref({ label: 'Todos os dados', value: 'all' })

// keep compare control functions simple; selector component handles fetching

const sendEmptyArray = () => {
  // allow adding empty slots up to 5
  const current = Array.isArray(compare) ? compare.length : 0
  if (current >= 5) {
    $q.notify({ message: 'Máximo de 5 leads para comparar.', color: 'negative' })
    return
  }
  leadStore.setCompare([{ id: 0, value: 'empty' }])
}

const removeEmpty = () => {
  leadStore.setRemoveEmpty()
}

const onClose = () => {
  layoutStore.setDialogOpengHeader('Lead')
  leadStore.setClearCompare()
}

const optionsCompare = [
  { label: 'Mais relevantes', value: 'hard' },
  { label: 'Todos os dados', value: 'all' },
  { label: 'Dados Pessoais', value: 'personal' },
  { label: 'Dados de investimento', value: 'investment' },
  { label: 'Dados de Empréstimo', value: 'loan' },
]

defineComponent({
  name: 'LeadsCompareLayout',
})

const cardWidth = ref(288) // px fallback (18rem ≈ 288px at 16px root)
const gap = 12
const innerWidth = computed(() => {
  try {
    const n = Array.isArray(compare.value) ? compare.value.length : 0
    if (n <= 1) return cardWidth.value
    return n * cardWidth.value + (n - 1) * gap
  } catch {
    return cardWidth.value
  }
})

onMounted(() => {
  layoutStore.setDialogOpengHeader('Comparação de Leads')
  // attempt to compute accurate pixel size from root font-size
  try {
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize || '16')
    if (fs && !Number.isNaN(fs)) cardWidth.value = Math.round(fs * 18)
  } catch {
    // ignore; keep fallback
  }
})
</script>

<style scoped>
.compare-scroll {
  --compare-card-width: 18rem;
  --compare-gap: 12px;
  --visible-cards: 2; /* number of cards visible without scrolling (kept for reference) */
  display: flex;
  gap: var(--compare-gap);
  padding: 8px;
  align-items: flex-start;
  flex: 0 0 auto;
  min-width: 0;
  /* ensure header uses the same inner width so names align with columns */
  width: var(--compare-inner-width);
}
.compare-card {
  flex: 0 0 var(--compare-card-width);
  max-width: var(--compare-card-width);
  min-width: var(--compare-card-width);
  box-sizing: border-box;
  overflow: hidden;
}
.compare-card .client-simple {
  width: 100% !important;
}
.compare-card-actions {
  overflow: hidden;
  width: 100%;
  justify-content: center;
}

@media (max-width: 800px) {
  .compare-scroll {
    --visible-cards: 1;
  }
}

.compare-wrapper {
  /* This wrapper provides the single horizontal scrollbar that controls
     the entire compare layout (header + all section columns). */
  overflow-x: auto;
  /* ensure the inner content can be wide; allow visual padding for the scrollbar */
  padding-bottom: 8px;
}

.compare-inner {
  /* The inner block will be the wide element that forces the wrapper to scroll */
  display: block;
}

/* debug helpers (enabled when VITE_DEBUG_COMPARE=true) */
.compare-debug {
  outline: 2px dashed rgba(0, 120, 200, 0.08);
}
.compare-debug-inner {
  outline: 1px dashed rgba(200, 80, 80, 0.06);
}
.compare-columns {
  /* ensure columns don't force their content to grow the card */
  white-space: nowrap;
}
.compare-card * {
  box-sizing: border-box;
}
/* clamp textual content inside compare cards to a single line with ellipsis */
.compare-card .q-field__native,
.compare-card .q-field__control {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relative {
  position: relative;
}
.compare-remove-btn.absolute-top-right {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 10;
}

/* subtle animation */
.compare-remove-btn {
  transition:
    transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 140ms;
  border-radius: 6px;
}
.compare-remove-btn:hover,
.compare-remove-btn:focus {
  transform: scale(1.06);
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.08);
}
</style>
