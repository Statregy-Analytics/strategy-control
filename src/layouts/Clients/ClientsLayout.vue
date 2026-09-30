<template>
  <div class="ClientsLayout">
    <title-page class="clients-page-header text-start">
      <div class="row justify-between items-start no-wrap">
        <div>
          <div class="text-h5 text-weight-bold">Selecionar Cliente</div>
          <div class="clients-page-header__caption">Escolha um cliente para acessar suas informações cadastrais e operacionais</div>
        </div>
        <q-btn
          class="q-mr-sm clients-page-header__action"
          color="primary"
          padding="sm sm"
          label="Cadastrar Novo Cliente"
          icon="add"
          no-caps
          dense
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
</script>

<style scoped>
.ClientsLayout { min-height: 100vh; color: #fff; }
.clients-page-header { padding: 30px 32px 16px; }
.clients-page-header__caption { margin-top: 5px; color: rgba(255,255,255,.54); font-size: 12px; }
.clients-page-header__action { border-radius: 8px; background: rgba(255,255,255,.72) !important; color: #111827 !important; }
@media (max-width: 700px) {
  .clients-page-header { padding: 22px 16px 10px; }
  .clients-page-header__caption { max-width: 230px; }
  .clients-page-header__action :deep(.q-btn__content) { font-size: 0; }
  .clients-page-header__action :deep(.q-icon) { font-size: 20px; }
}
</style>
