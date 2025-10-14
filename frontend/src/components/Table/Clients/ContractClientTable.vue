<template>
  <q-table
    class="ContractClientTable my-sticky-header-column-table"
    dense
    :columns="columnsContract"
    :rows="clientEdit.weLend"
    row-key="name"
    hide-pagination
    flat
  >
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          size="xs"
          padding="xs"
          no-caps
          flat
          :icon="$filtersString.resolveUrl('img:icons/dots-vertical.svg')"
        >
          <q-menu transition-show="flip-right" transition-hide="flip-left">
            <div
              class=""
              style="
                min-width: 181px;
                border-radius: 12px;
                gap: 4px;
                display: flex;
                flex-direction: column;
                justify-content: start;
              "
            >
              <q-btn class="q-mb-xs" no-caps flat style="min-width: 181px; align-items: start">
                <q-icon
                  :name="$filtersString.resolveUrl('img:icons/edit.svg')"
                  size="0.8rem"
                  class="text-muted"
                />
                <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                  Editar
                </span>
                <!-- <q-tooltip anchor="top middle" self="bottom middle" transition-show="scale">
                    </q-tooltip> -->
              </q-btn>
              <q-btn class="q-mb-xs" no-caps flat style="min-width: 181px; align-items: start">
                <q-icon
                  :name="$filtersString.resolveUrl('img:icons/trash.svg')"
                  size="0.8rem"
                  class="text-red"
                  color="red"
                />
                <span class="q-ml-sm text-muted" style="font-size: small; color: #656565">
                  Remover
                </span>
              </q-btn>
            </div>
            <!-- <q-list style="min-width: 100px; border-radius: 12px"> </q-list> -->
          </q-menu>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>
<script setup>
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)
const columnsContract = [
  { name: 'contrato', label: 'Banco', field: 'contrato', align: 'left' },
  { name: 'saldo', label: 'Agência', field: 'saldo', align: 'left' },
  { name: 'valor', label: 'Valor (R$)', field: 'valor', align: 'left' },
  { name: 'vigencia', label: 'Vigência', field: 'vigencia', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    headerStyle: 'width: 10px; text-align: end',
  },
]
defineComponent({
  name: 'ContractClientTable',
})
</script>
