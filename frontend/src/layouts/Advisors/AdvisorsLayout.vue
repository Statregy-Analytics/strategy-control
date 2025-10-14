<template>
  <div class="AdvisorsLayout">
    <title-page :breadcrumbs class="col-8 text-start">
      <div class="row justify-between">
        <div class="text-h6">Assessores</div>
        <q-btn
          class="q-mr-sm"
          color="primary"
          padding="sm sm"
          label="Criar Novo"
          icon="add"
          no-caps
          dense
          style="border-radius: 8px"
          @click.prevent="onCreate"
        />
      </div>
    </title-page>
    <advisors-table />
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { useAdvisorStore } from 'src/stores/advisor'
import TitlePage from 'src/components/TitlePage.vue'
import AdvisorsTable from 'src/components/Table/Advisors/AdvisorsTable.vue'
// \\wsl.localhost\Ubuntu-22.04\home\jorgenunes\Projetos\strategy-control\src\components\Table\Advisors\advisorsTable.vue
defineComponent({
  name: 'AdvisorsLayout',
})
const layoutStore = useLayoutStore()
const advisorStore = useAdvisorStore()

const onCreate = () => {
  advisorStore.setAdvisorEdit({
    id: null,
    assessor: { name: '', avatar: '', email: '' },
    clients_count: 0,
    gastos: { value: 0, limite: 0, data: [] },
    commission: { received: 0, future: 0, value: 0 },
  })
  layoutStore.setDialogOpengHeader('Novo Assessor')
  layoutStore.seAdvisorsDialog(true)
}
const breadcrumbs = [
  {
    label: 'Clientes',
  },
  {
    label: 'Assessores',
  },
]
</script>
