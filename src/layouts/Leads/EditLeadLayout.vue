<template>
  <q-card class="EditLeadLayout">
    <title-card :title="dialogOpengHeader" @on-close="onClose"></title-card>
    <q-separator />
    <entity-header :id="leadEdit.id" :name="leadEdit.cliente.name" :avatar="leadEdit.cliente.avatar"
      :options="leadHeaderOptions" switch-label="Trocar lead" @select="setLead">
      <template #status>
          <q-btn
            size="xs"
            outline
            padding="xs"
            no-caps
            class="custom-btn-muted"
            :label="leadEdit.estagio_lead"
          />
      </template>
      <template #actions>
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/edit.svg')" />
        <q-btn flat size="xs" :icon="$filtersString.resolveUrl('img:icons/trash.svg')" />
      </template>
    </entity-header>
    <q-card-section>
      <documents-leads-form />
      <banks-leads-layout />
      <residencial-leads-layout />
      <upload-residencial-leads-layout />
      <documents-p-f-leads-layout />
      <documents-persona-leads-form />
      <address-leads-table />
      <partner-leads-table />
      <related-leads-table />
    </q-card-section>
  </q-card>
</template>
<script setup>
import { defineComponent, computed } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'
import useLeads from 'src/composables/Fakes/useLeads'
import TitleCard from 'src/components/Card/TitleCard.vue'
import DocumentsLeadsForm from './form/DocumentsLeadsForm.vue'
import BanksLeadsLayout from './form/BanksLeadsLayout.vue'
import ResidencialLeadsLayout from './form/ResidencialLeadsLayout.vue'
import UploadResidencialLeadsLayout from './form/UploadResidencialLeadsLayout.vue'
import DocumentsPFLeadsLayout from './form/DocumentsPFLeadsLayout.vue'
import DocumentsPersonaLeadsForm from './form/DocumentsPersonaLeadsForm.vue'
import AddressLeadsTable from 'src/components/Table/Leads/AddressLeadsTable.vue'
import PartnerLeadsTable from 'src/components/Table/Leads/PartnerLeadsTable.vue'
import RelatedLeadsTable from 'src/components/Table/Leads/RelatedLeadsTable.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'

const layoutStore = useLayoutStore()
const leadStore = useLeadStore()
const { leadEdit } = storeToRefs(leadStore)
const { dialogOpengHeader } = storeToRefs(layoutStore)
const { getLeadOptions, getClientLead } = useLeads()

const setLead = (id) => {
  console.log('setLead', id)
  leadStore.setLeadEdit(getClientLead(id))
}

const onClose = () => {
  console.log('onClose')
  leadStore.setLeadEdit({})
}
defineComponent({
  name: 'EditLeadLayout',
})
const leadSelected = computed(() => {
  return getLeadOptions()
})
const leadHeaderOptions = computed(() => leadSelected.value.map((lead) => ({
  id: lead.value, name: lead.label, avatar: lead.avatar,
})))
</script>
