<template>
  <div class="PartnerLeadsTable q-mt-lg">
    <div class="row q-mb-md q-mt-xl">
      <span class="text-bolder text-h7">Participações Societários</span>
    </div>
    <q-table
      :rows="leadEdit.partner"
      :columns="columns"
      dense
      class="my-sticky-header-column-table"
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
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'

const leadStore = useLeadStore()
const { leadEdit } = storeToRefs(leadStore)

defineComponent({
  name: 'PartnerLeadsTable',
})
const columns = [
  {
    name: 'razao_social',
    label: 'Razão Social',
    field: 'razao_social',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cnpj',
    label: 'CNPJ',
    field: 'cnpj',
    align: 'left',
    sortable: true,
  },
  {
    name: 'position',
    label: 'Cargo',
    field: 'position',
    align: 'left',
    sortable: true,
  },
  {
    name: 'member_since',
    label: 'Membro Desde',
    field: 'member_since',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    headerStyle: 'width: 10px; text-align: end',
  },
]
</script>
