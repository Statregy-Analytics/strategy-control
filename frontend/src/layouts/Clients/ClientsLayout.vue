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
          data-test="clients-create-btn"
          @click.prevent="openCreate"
        />
      </div>
    </title-page>
    <clients-table />
  </div>
</template>
<script setup>
import TitlePage from 'src/components/TitlePage.vue'
import ClientsTable from 'src/components/Table/Clients/ClientsTable.vue'
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
defineComponent({
  name: 'ClientsLayout',
})
const storeLayout = useLayoutStore()
const openCreate = () => {
  // ensure there's a clientEdit object to prevent render errors in EditClientsLayout
  try {
    storeLayout.setClientEdit({
      id: null,
      cliente: {
        name: '',
        email: '',
        avatar: '',
        cpf: '',
        rg: '',
        telefone: '',
        cnh: '',
        birth: '',
        profissao: null,
        rendaAnual: null,
      },
      bank: {
        name: '',
        agency: '',
        account: '',
        type: 'pf',
        cpf_cnpj: '',
        chave_pix: '',
      },
      bankRegister: [],
      residential: {
        register: '',
        property: '',
        number_redisential: '',
        real_state_registration: '',
        address: '',
        address_number: '',
        address_neighborhood: '',
        address_city: '',
        address_state: '',
        dividendo: null,
      },
      investment: {
        classification: '',
        assessor: null,
        data_dividendo: null,
        data_value_welend: null,
      },
      password: '',
      contrato: { total: 0, quantity: 0 },
      level: '',
      weLend: [],
      newWeLend: {
        status: null,
        value: null,
        value_dividendo: null,
        value_before: null,
        value_finish: null,
        date_payment: null,
      },
      // any additional arrays/objects used by children
      uploads: [],
    })
  } catch (err) {
    // log the error to aid debugging but don't block flow
    console.debug('setClientEdit failed:', err)
  }
  storeLayout.setDialogOpengHeader('Inclusão de Cliente')
  storeLayout.setClientDialog(true)
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
