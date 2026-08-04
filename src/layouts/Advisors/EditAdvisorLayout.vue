<template>
  <q-card class="EditAdvisorLayout">
    <title-card :title="dialogOpengHeader" @on-close="onClose"></title-card>
    <q-separator />
    <entity-header :id="advisorEdit.id" :name="advisorEdit.assessor.name" :avatar="advisorEdit.assessor.avatar"
      :options="advisorHeaderOptions" switch-label="Trocar assessor" @select="setAdvisor">
      <template #actions>
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/edit.svg')" />
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/trash.svg')" />
      </template>
    </entity-header>

    <q-card-section>
      <splent-form-layout />

      <commission-form-layout />
      <div class="text-h7 text-bold q-mt-xl q-mb-md">Clientes</div>
      <customers-form-layout />
    </q-card-section>
  </q-card>
</template>
<script setup>
import { defineComponent, computed } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import TitleCard from 'src/components/Card/TitleCard.vue'
import useAdvisors from 'src/composables/Fakes/useAdvisors'
import SplentFormLayout from './Form/SplentFormLayout.vue'
import CommissionFormLayout from './Form/CommissionFormLayout.vue'
import CustomersFormLayout from './Form/CustomersFormLayout.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'

const layoutStore = useLayoutStore()
const advisorStore = useAdvisorStore()
const { advisorEdit } = storeToRefs(advisorStore)
const { dialogOpengHeader } = storeToRefs(layoutStore)
const { getAdvisorsIdNameEmail, getAdvisor } = useAdvisors()
const onClose = () => {
  console.log('onClose')
  advisorStore.setAdvisorEdit({})
}
defineComponent({
  name: 'EditAdvisorLayout',
})

const setAdvisor = (advisorId) => {
  advisorStore.setAdvisorEdit(getAdvisor(advisorId))
}

const advisorsSelected = computed(() => {
  return getAdvisorsIdNameEmail()
})
const advisorHeaderOptions = computed(() => advisorsSelected.value.map((advisor) => ({
  id: advisor.id, name: advisor.name, avatar: advisor.avatar,
})))
</script>
