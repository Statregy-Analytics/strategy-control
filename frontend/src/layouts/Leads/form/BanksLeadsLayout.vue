<template>
  <div class="BanksLeadsLayout q-pt-md">
    <div class="row q-my-md">
      <span class="text-bolder text-h7">Dados Bancários</span>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Banco">
        <q-input
          outlined
          v-model="leadEdit.bank.name"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Agencia">
        <q-input
          outlined
          v-model="leadEdit.bank.agency"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Conta">
        <q-input
          outlined
          v-model="leadEdit.bank.agency"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col d-block" textLabel="Tipo de Conta">
        <div class="row">
          <q-radio v-model="leadEdit.bank.type" val="pf" label="Pessoa Física" />
          <q-radio v-model="leadEdit.bank.type" val="pj" label="Pessoa Juridica" />
        </div>
      </label-form>
      <label-form className="col d-block" textLabel="CPF/CNPJ">
        <q-input
          outlined
          v-model="leadEdit.bank.cpf_cnpj"
          dense
          placeholder="0000000000000"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col d-block" textLabel="Chave Pix">
        <q-input
          outlined
          v-model="leadEdit.bank.chave_pix"
          dense
          placeholder="(000)0000000000"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <q-table
      :columns="columnsBanks"
      :rows="leadEdit.bankRegister"
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
import LabelForm from 'src/components/Form/LabelForm.vue'

const leadStore = useLeadStore()
const { leadEdit } = storeToRefs(leadStore)

const columnsBanks = [
  { name: 'name', label: 'Banco', field: 'name', align: 'left' },
  { name: 'agency', label: 'Agência', field: 'agency', align: 'left' },
  { name: 'account', label: 'Conta', field: 'account', align: 'left' },
  { name: 'type', label: 'Tipo de conta', field: 'type', align: 'left' },
  { name: 'cpf_cnpj', label: 'CPF/CNPJ', field: 'cpf_cnpj', align: 'left' },
  { name: 'chave_pix', label: 'Chave Pix', field: 'chave_pix', align: 'left' },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    headerStyle: 'width: 10px; text-align: end',
  },
]
defineComponent({
  name: 'BanksLeadsLayout',
})
</script>
