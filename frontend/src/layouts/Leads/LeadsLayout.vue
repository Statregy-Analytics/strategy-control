<template>
  <div class="LeadsLayout">
    <title-page :breadcrumbs class="col-8 text-start">
      <div class="row justify-between">
        <div class="text-h6">Leads</div>
        <q-btn
          class="q-mr-sm"
          color="primary"
          padding="sm sm"
          label="Criar Novo"
          icon="add"
          no-caps
          dense
          data-test="leads-create-btn"
          @click.prevent="openCreate"
          style="border-radius: 8px"
        />
      </div>
    </title-page>
    <leads-table />
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import TitlePage from 'src/components/TitlePage.vue'
import LeadsTable from 'src/components/Table/Leads/LeadsTable.vue'
import { useLayoutStore } from 'src/stores/layout'
import { useLeadStore } from 'src/stores/lead'
// use the stores to open the lead creation dialog and prepare an empty lead object
const storeLayout = useLayoutStore()
const storeLead = useLeadStore()

const openCreate = () => {
  try {
    const safeDefault = {
      id: null,
      cliente: { avatar: '', name: '', email: '', rg: '', cpf: '', cnh: '', phone: '', birth: '' },
      residential: {},
      bank: {},
      bankRegister: [],
      cpf: '',
      phone: '',
      profission: '',
      situacao_rf: '',
      estagio_lead: '',
      address: [],
      partner: [],
      related_person: [],
      emprestimo: '',
      dividendo: { total: 0, data: '' },
      contrato: { total: 0, quantity: '' },
      saldo: 0,
      _raw: {},
    }
    storeLead.setLeadEdit(safeDefault)
  } catch (err) {
    console.debug('setLeadEdit failed:', err)
    // fallback: set an empty object
    storeLead.setLeadEdit({})
  }
  storeLayout.setDialogOpengHeader('Inclusão de Lead')
  storeLayout.setLeadDialog(true)
}
defineComponent({
  name: 'LeadsLayout',
})
const breadcrumbs = [
  {
    label: 'Clientes',
  },
  {
    label: 'Lead',
  },
]
</script>
