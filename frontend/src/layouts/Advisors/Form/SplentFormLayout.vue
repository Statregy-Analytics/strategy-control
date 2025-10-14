<template>
  <div class="SplentFormLayout">
    <div class="row q-mb-md justify-between">
      <div class="text-h7 text-bold">Gastos</div>
      <div class="">
        <q-btn
          label="Ver Histórico"
          no-caps
          size="sm"
          padding="xs xs"
          flat
          color="muted"
          @click.prevent="setHistoric"
        />
        <q-btn
          label="Inserir Gasto"
          color="primary"
          no-caps
          size="sm"
          padding="xs xs"
          icon="add"
          flat
          @click.prevent="layoutStore.setSplenDialog(true)"
        />
      </div>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Gasto do Assessor(R$)">
        <q-input
          outlined
          v-model="advisorEdit.gastos.value"
          dense
          placeholder=""
          class="q-my-sm"
          readonly
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Limite de Gasto(R$)">
        <q-input
          outlined
          v-model="advisorEdit.gastos.limite"
          dense
          placeholder=""
          class="q-my-sm"
          readonly
        ></q-input>
      </label-form>
    </div>

    <q-table
      dense
      class="my-sticky-header-column-table"
      :columns="columnsGastos"
      :rows="advisorEdit.gastos.data"
      row-key="name"
      hide-pagination
      flat
    >
      <!-- Coluna de target -->
      <template v-slot:body-cell-target="props">
        <q-td :props="props">
          <q-item>
            <q-item-section avatar>
              <q-avatar size="32px" class="q-mr-sm">
                <q-img
                  :src="props.row.target.avatar"
                  :alt="props.row.target.name"
                  :title="props.row.target.name"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section align="left">
              <q-item-label>
                {{ props.row.target.name }}
              </q-item-label>
              <q-item-label caption>
                {{ props.row.target.level }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>

      <!-- actions -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            size="xs"
            padding="xs"
            no-caps
            flat
            :icon="$filtersString.resolveUrl('img:icons/dots-vertical.svg')"
            @click.prevent="setSplen(props.row)"
          />
          <!-- @click.prevent="advisorStore.setSplenEdit(props.row)" -->
        </q-td>
      </template>
      <template v-slot:bottom-row>
        <q-tr class="bg-grey-3">
          <q-td colspan="100%">
            <div class="row items-center justify-between q-pa-sm">
              <span class="text-weight-bold">SubTotal:</span>
              <span class="text-weight-bold">
                {{
                  advisorEdit.gastos.value != null
                    ? advisorEdit.gastos.value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : 'R$ 0,00'
                }}
              </span>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog
      v-model="splenDialog"
      position="right"
      full-height
      full-width
      persistent
      maximized
      class="control-width"
    >
      <splen-edit-form-layout />
    </q-dialog>
  </div>
</template>
<script setup>
import { defineComponent } from 'vue'
import { useAdvisorStore } from 'src/stores/advisor'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import labelForm from 'src/components/Form/LabelForm.vue'
import SplenEditFormLayout from './SplentEditFormLayout.vue'
const advisorStore = useAdvisorStore()
const layoutStore = useLayoutStore()
const { splenDialog } = storeToRefs(layoutStore)
const { advisorEdit } = storeToRefs(advisorStore)
const columnsGastos = [
  {
    name: 'date',
    label: 'Data',
    align: 'left',
    field: (row) => row.date,
    format: (val) => {
      if (!val) return ''
      const date = new Date(val)
      return date.toLocaleDateString('pt-BR')
    },
    sortable: true,
  },
  {
    name: 'target',
    label: 'Cliente/Leads Atrelado',
    align: 'left',
    field: 'target',
  },
  {
    name: 'category',
    label: 'Categoria',
    align: 'left',
    field: (row) => row.category,
    sortable: true,
  },
  {
    name: 'location',
    label: 'Localização',
    align: 'left',
    field: (row) => row.location,
    sortable: true,
  },
  {
    name: 'description',
    label: 'Motivo',
    align: 'left',
    field: (row) => row.description,
    sortable: true,
  },

  {
    name: 'amount',
    label: 'Valor (R$)',
    align: 'right',
    field: (row) => row.amount,
    sortable: true,
    format: (val) =>
      val != null ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    headerStyle: 'width: 10px; text-align: end',
  },
]

const setSplen = (item) => {
  console.log(item)
  const newObjct = {
    id: 1,
    value: item.amount,
    date: item.date,
    category: item.category,
    cliente: item.target.id,
    location: item.location,
    description: item.description,
  }
  advisorStore.setSplenEdit(newObjct)
  layoutStore.setSplenDialog(true)
}

const setHistoric = () => {
  layoutStore.setSplentHistoricDialog(true)
}

defineComponent({
  name: 'SplentFormLayout',
})
</script>
