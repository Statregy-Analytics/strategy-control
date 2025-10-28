<template>
  <q-card class="CompareLayout">
    <q-icon name=""></q-icon>
    <title-card :title="dialogOpengHeader" :advisor="advisorEdit.name" @on-close="onClose" />
    <q-separator />
    <q-banner inline-actions rounded class="q-ma-md">
      <div class="row q-gutter-sm">
        <div class="col">
          <label-form textLabel="Dados comparados">
            <q-select
              outlined
              dense
              :options="optionsCompare"
              v-model="option"
              class="q-my-sm"
              options-dense
              menu-shrink
              popup-content-class="q-pa-xs"
              options-selected-class="bg-grey-2 text-gray-1"
            ></q-select>
          </label-form>
        </div>
        <div class="row self-center" style="background-color: #fafafa">
          <div v-for="(item, index) in compare" :key="index" class="col-auto q-mr-sm">
            <div v-if="item.cliente" class="relative">
              <client-simple
                class="border-gray"
                style="max-width: 18rem"
                :id="item.id"
                :avatar="item.cliente.avatar"
                :name="item.cliente.name"
                :show-level="false"
              />
              <q-btn
                flat
                dense
                size="xs"
                class="compare-remove-btn absolute-top-right"
                :icon="$filtersString.resolveUrl('img:icons/trash.svg')"
                @click.prevent.stop="() => clientStore.removeCompareAt(index)"
              >
                <q-tooltip anchor="top middle" self="bottom middle"
                  >Remover da comparação</q-tooltip
                >
              </q-btn>
            </div>
            <div v-else>
              <q-banner class="bg-grey-2 border-gray text-grey-8 col" rounded>
                <div class="text-center row">
                  <add-client-compare :slot-index="index" />
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
    <personal-fields-layout v-if="option.value == 'personal' || option.value == 'all'" />
    <investiment-fields-layout v-if="option.value == 'all' || option.value == 'investment'" />
    <loan-fields-layout v-if="option.value == 'all' || option.value == 'loan'" />
  </q-card>
</template>
<script setup>
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useLayoutStore } from 'src/stores/layout'
import { useClientStore } from 'src/stores/client'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import ClientSimple from 'src/components/Card/ClientSimple.vue'
import AddClientCompare from 'src/components/Form/AddClientCompare.vue'
import PersonalFieldsLayout from './Compare/PersonalFieldsLayout.vue'
import InvestimentFieldsLayout from './Compare/InvestimentFieldsLayout.vue'
import LoanFieldsLayout from './Compare/LoanFieldsLayout.vue'
const layoutStore = useLayoutStore()
const clientStore = useClientStore()
const advisorStore = useAdvisorStore()
const { advisorEdit } = storeToRefs(advisorStore)
const { compare } = storeToRefs(clientStore)
const { dialogOpengHeader, dialogCompare } = storeToRefs(layoutStore)
const option = ref({ label: 'Todos os dados', value: 'all' })
const $q = useQuasar()
const sendEmptyArray = () => {
  const current = Array.isArray(compare.value) ? compare.value.length : 0
  if (current >= 5) {
    $q.notify({ message: 'Máximo de 5 clientes para comparar.', color: 'negative' })
    return
  }
  clientStore.setCompare([{ id: 0, value: 'empty' }])
}
const removeEmpty = () => {
  clientStore.setRemoveEmpty()
}
const onClose = () => {
  console.log('onClose')
  layoutStore.setDialogOpengHeader('Cliente')
  clientStore.setClearCompare()
}
const optionsCompare = [
  { label: 'Mais relevantes', value: 'hard' },
  { label: 'Todos os dados', value: 'all' },
  { label: 'Dados Pessoais', value: 'personal' },
  { label: 'Dados de investimento', value: 'investment' },
  { label: 'Dados de Empréstimo', value: 'loan' },
]
defineComponent({
  name: 'CompareLayout',
})
onMounted(() => {
  layoutStore.setDialogOpengHeader('Compararação de Clientes')
  console.debug(
    'CompareLayout mounted, compare payload=',
    JSON.parse(JSON.stringify(compare.value || [])),
  )
})

// log whenever compare array changes or the compare dialog opens
watch(compare, (val) => {
  try {
    console.debug('CompareLayout watch compare =>', JSON.parse(JSON.stringify(val || [])))
  } catch {
    console.debug('CompareLayout watch compare => (unserializable)')
  }
})
watch(dialogCompare, (val) => {
  if (val) {
    try {
      console.debug(
        'dialogCompare opened, compare=',
        JSON.parse(JSON.stringify(compare.value || [])),
      )
    } catch {
      console.debug('dialogCompare opened, compare (unserializable)')
    }
  }
})
</script>

<style scoped>
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
