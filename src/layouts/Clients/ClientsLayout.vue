<template>
  <div class="ClientsLayout">
    <title-page :breadcrumbs class="col-8 text-start">
      <div class="row justify-between">
        <div class="text-h6">Clientes</div>
        <q-btn
          class="q-mr-sm"
          color="primary"
          padding="sm sm"
          label="Criar Novo"
          icon="add"
          no-caps
          dense
          style="border-radius: 8px"
          @click.prevent.stop="openCreateClient"
        />
      </div>
    </title-page>
    <clients-table />
    <q-dialog
      v-model="createClientDialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
    >
      <create-client-layout />
    </q-dialog>
  </div>
</template>
<script setup>
import TitlePage from 'src/components/TitlePage.vue'
import ClientsTable from 'src/components/Table/Clients/ClientsTable.vue'
import CreateClientLayout from 'src/layouts/Clients/CreateClientLayout.vue'
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
defineComponent({
  name: 'ClientsLayout',
})
const layoutStore = useLayoutStore()
const { createClientDialog } = storeToRefs(layoutStore)
const openCreateClient = () => {
  layoutStore.setCreateClientDialog(true)
}
const breadcrumbs = [
  {
    label: 'Clientes',
  },
  {
    label: 'Clientes',
  },
]
</script>
