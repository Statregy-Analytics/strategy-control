<template>
  <div class="AddLeadCompare">
    <avatar-initials
      size="32px"
      class="q-mr-sm"
      :src="optionsAdd && optionsAdd[0] && optionsAdd[0].avatar"
      :name="optionsAdd && optionsAdd[0] && optionsAdd[0].label"
    />
    <q-btn
      flat
      dense
      color="grey-6"
      icon-right="keyboard_arrow_down"
      label="Selecionar Leads"
      no-caps
      @click.prevent.stop="showOptions = !showOptions"
    />
    <q-menu v-model="showOptions" self="top middle" square>
      <q-list style="min-width: 420px; padding-top: 2px">
        <q-item
          dense
          v-for="userLead in optionsAdd"
          :key="userLead.value"
          clickable
          @click.prevent.stop="selectLeadCompare(userLead.value)"
          style="border-radius: 6px; margin-inline: 2px"
        >
          <q-item-section avatar>
            <avatar-initials size="32px" :src="userLead.avatar" :name="userLead.label" />
          </q-item-section>
          <q-item-section align="left">
            {{ userLead.label }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>
<script>
import { defineComponent, ref, onMounted } from 'vue'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'
import { useLeadStore } from 'src/stores/lead'
import useLeads from 'src/composables/Fakes/useLeads'
import useLeadsApi from 'src/composables/Api/useLeadsApi'

export default defineComponent({
  name: 'AddLeadCompare',
  components: { AvatarInitials },
  props: {
    slotIndex: {
      type: Number,
      default: -1,
    },
  },
  setup(props) {
    const storeLead = useLeadStore()
    const { getClientLead, getLeadOptions } = useLeads()
    const { rows: apiRows, fetchLeads } = useLeadsApi()
    const useFakes =
      import.meta.env.VITE_USE_FAKES === 'true' || import.meta.env.VITE_USE_FAKES === true
    const normalizeApiRow = (r) => {
      const lead = r.lead || r
      return {
        id: r.id || lead.id,
        cliente: {
          avatar: lead.avatar || lead.cliente?.avatar || '',
          name: lead.name || lead.cliente?.name || '',
          email: lead.email || lead.cliente?.email || '',
          birth:
            lead.birth && String(lead.birth).length >= 10
              ? new Date(lead.birth).toISOString().slice(0, 10)
              : lead.cliente?.birth || lead.data_nascimento || '',
        },
        cpf: lead.cpf || lead.nif || lead.cliente?.cpf || '',
        phone: lead.phone || lead.telefone || lead.cliente?.phone || '',
        profission: lead.profission || lead.profission || lead.profissao || lead.profession || '',
        situacao_rf: lead.situacao_rf || lead.situacao || '',
        estagio_lead: lead.estagio_lead || lead.stage || '',
        address: lead.address || lead.endereco || lead.cliente?.address || [],
        partner: lead.partner || lead.socios || [],
        related_person: lead.related_person || lead.relatedPeople || [],
        bankRegister: lead.bankRegister || lead.bank_register || [],
        bank: lead.bank || {},
        residential: lead.residential || {},
        emprestimo: lead.emprestimo || '',
        dividendo: lead.dividendo || { total: 0, data: '' },
        contrato: lead.contrato || { total: 0, quantity: '' },
        saldo: lead.saldo || 0,
        _raw: lead,
      }
    }

    const selectLeadCompare = (id) => {
      console.log('Selected Lead ID:', id)
      let selectLead = null
      if (!useFakes) {
        const normalized = apiRows.value.map((r) => normalizeApiRow(r))
        selectLead = normalized.find((l) => l && l.id === id) || getClientLead(id)
      } else {
        selectLead = getClientLead(id)
      }
      if (!selectLead) {
        console.warn('Lead not found', id)
        showOptions.value = false
        return
      }
      // if a specific slotIndex was provided, replace that index
      if (typeof props.slotIndex === 'number' && props.slotIndex >= 0) {
        if (storeLead.compare && storeLead.compare.length > props.slotIndex) {
          storeLead.compare.splice(props.slotIndex, 1, selectLead)
        } else {
          // fallback: append
          storeLead.setCompare([selectLead])
        }
      } else {
        // replace first empty slot (id === 0) if present, otherwise append
        const idxEmpty = storeLead.compare
          ? storeLead.compare.findIndex((it) => it && it.id === 0)
          : -1
        if (idxEmpty >= 0) {
          // replace in place to preserve ordering
          storeLead.compare.splice(idxEmpty, 1, selectLead)
        } else {
          storeLead.setCompare([selectLead])
        }
      }
      showOptions.value = false
    }
    const showOptions = ref(false)
    const optionsAdd = ref([])

    onMounted(async () => {
      const filterExisting = (list) => {
        try {
          const existingIds = (storeLead.compare || []).map((c) => c && c.id).filter(Boolean)
          return list.filter((it) => !existingIds.includes(it.value))
        } catch {
          return list
        }
      }

      if (!useFakes) {
        try {
          await fetchLeads()
          const normalized = apiRows.value.map((r) => normalizeApiRow(r))
          optionsAdd.value = normalized
            .map((lead) => ({
              label: lead.cliente?.name || (lead._raw && (lead._raw.name || lead._raw.nome)) || '-',
              value: lead.id,
              avatar: lead.cliente?.avatar || (lead._raw && lead._raw.avatar) || '',
            }))
            .filter((o) => !(storeLead.compare || []).some((c) => c && c.id === o.value))
          return
        } catch (e) {
          console.warn('Failed to fetch leads, falling back to fakes', e)
        }
      }
      optionsAdd.value = filterExisting(getLeadOptions())
    })

    return {
      optionsAdd,
      showOptions,
      selectLeadCompare,
      AvatarInitials,
    }
  },
})
</script>
