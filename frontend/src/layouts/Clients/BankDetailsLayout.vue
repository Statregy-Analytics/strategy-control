<template>
  <div class="BankDetails">
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Banco">
        <q-input
          outlined
          v-model="clientEdit.bank.name"
          dense
          placeholder="Ex.: Itaú"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Agencia">
        <q-input
          outlined
          v-model="clientEdit.bank.agency"
          dense
          placeholder="0000-0"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Conta">
        <q-input
          outlined
          v-model="clientEdit.bank.account"
          dense
          placeholder="00.000-0"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col d-block row" textLabel="Tipo de Conta">

          <!-- <q-select
            outlined
            v-model="clientEdit.bank.type"
            :options="tipo_conta"
            dense
          ></q-select> -->
          <q-radio v-model="clientEdit.bank.type" val="pf" label="Pessoa Física" />
          <q-radio v-model="clientEdit.bank.type" val="pj" label="Pessoa Juridica" />

      </label-form>
      <label-form className="col d-block" textLabel="CPF/CNPJ">
        <q-input
          outlined
          v-model="clientEdit.bank.cpf_cnpj"
          dense
          :placeholder="bankPlaceholder"
          :mask="bankMask"
          class="q-my-sm"
          :rules="cpfOrCnpjRule"
          :readonly="!(clientEdit.bank && clientEdit.bank.type === 'pj')"
          ref="cpfInputRef"
        ></q-input>
      </label-form>
      <label-form className="col d-block" textLabel="Chave Pix">
        <q-input
          outlined
          v-model="clientEdit.bank.chave_pix"
          dense
          placeholder="Insira sua chave PIX"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <q-table
      dense
      class="my-sticky-header-column-table"
      :columns="columnsBanks"
      :rows="clientEdit.bankRegister"
      row-key="name"
      hide-pagination
      flat
    >
      <template v-slot:body-cell-created_at="props">
        <q-td :props="props">{{ formatDateISOToBR(props.row.created_at) }}</q-td>
      </template>
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
import labelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, watch, ref, nextTick, computed } from 'vue'
import useRules from 'src/composables/global/useRules'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)
const { cpfOrCnpjRule } = useRules()
const cpfInputRef = ref(null)
const cpfMask = '###.###.###-##'
const cnpjMask = '##.###.###/####-##'
const bankMask = computed(() =>
  clientEdit.value && clientEdit.value.bank && clientEdit.value.bank.type === 'pj'
    ? cnpjMask
    : cpfMask,
)
const bankPlaceholder = computed(() =>
  clientEdit.value && clientEdit.value.bank && clientEdit.value.bank.type === 'pj'
    ? '00.000.000/0000-00'
    : '000.000.000-00',
)

function formatDateISOToBR(iso) {
  try {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}
// guarda do último prefixo que foi automaticamente copiado para account
let lastAutoCopiedAccount = ''

// ensure bank.created_at exists when creating/editing client
if (clientEdit && clientEdit.value) {
  try {
    if (!clientEdit.value.bank) clientEdit.value.bank = {}
    if (!clientEdit.value.bank.created_at)
      clientEdit.value.bank.created_at = new Date().toISOString()
  } catch {
    /* ignore */
  }
}

// Sincroniza CPF do bloco de Informações Pessoais para Dados Bancários (campo travado)
watch(
  () => clientEdit.value && clientEdit.value.cliente && clientEdit.value.cliente.cpf,
  (newCpf) => {
    try {
      if (!clientEdit.value) return
      if (!clientEdit.value.bank) clientEdit.value.bank = {}
      // Do not overwrite bank cpf_cnpj if account type is 'pj' (allow manual editing for CNPJ)
      if (!clientEdit.value.bank.type || clientEdit.value.bank.type === 'pf') {
        clientEdit.value.bank.cpf_cnpj = newCpf || ''
      }
    } catch {
      /* ignore */
    }
  },
  { immediate: true },
)

// When the current bank form is considered 'final' (user finished typing account or server set created_at),
// add or update the entry in clientEdit.bankRegister so it appears in the table immediately.
watch(
  () => clientEdit.value && clientEdit.value.bank,
  (bank) => {
    try {
      if (!bank) return
      if (!clientEdit.value) return
      if (!clientEdit.value.bankRegister) clientEdit.value.bankRegister = []

      const account = bank.account || ''
      const isFinal = account && !String(account).endsWith('-')
      const hasCreatedAt = !!bank.created_at

      if (isFinal || hasCreatedAt) {
        // build entry
        const entry = {
          name: bank.name || '',
          agency: bank.agency || '',
          account: bank.account || '',
          type: bank.type || '',
          cpf_cnpj: bank.cpf_cnpj || '',
          chave_pix: bank.chave_pix || '',
          created_at: bank.created_at || new Date().toISOString(),
        }

        // try to find existing entry by agency+account+type (best-effort)
        const idx = clientEdit.value.bankRegister.findIndex((b) => {
          try {
            return (
              String(b.agency || '') === String(entry.agency || '') &&
              String(b.account || '') === String(entry.account || '') &&
              String(b.type || '') === String(entry.type || '')
            )
          } catch {
            return false
          }
        })

        if (idx === -1) {
          clientEdit.value.bankRegister.push(entry)
        } else {
          // update existing
          clientEdit.value.bankRegister.splice(idx, 1, entry)
        }
      }
    } catch {
      /* ignore */
    }
  },
  { immediate: true, deep: true },
)
// const tipo_conta = [
//   { label: 'Pessoa Física', value: 'pf' },
//   { label: 'Pessoa Juridica', value: 'pj' }
// ]
// when bank.type changes, if switched to 'pf' ensure bank.cpf_cnpj matches cliente.cpf
watch(
  () => clientEdit.value && clientEdit.value.bank && clientEdit.value.bank.type,
  (type) => {
    try {
      if (!clientEdit.value) return
      if (!clientEdit.value.bank) clientEdit.value.bank = {}
      if (type === 'pf') {
        const cpf = clientEdit.value.cliente && clientEdit.value.cliente.cpf
        clientEdit.value.bank.cpf_cnpj = cpf || ''
      }
      if (type === 'pj') {
        // clear current value to allow user to input CNPJ and focus the input
        try {
          clientEdit.value.bank.cpf_cnpj = ''
          nextTick(() => {
            try {
              if (cpfInputRef.value && cpfInputRef.value.focus) cpfInputRef.value.focus()
            } catch {
              /* ignore */
            }
          })
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  },
  { immediate: true },
)

// Copia agência para conta quando preenchida (conforme config)
watch(
  () => clientEdit.value && clientEdit.value.bank && clientEdit.value.bank.agency,
  (agency) => {
    try {
      // debug log to help identify why copy may not be happening (visible in browser console)
      try {
        if (console && console.debug)
          console.debug('BankDetailsLayout watcher agency changed:', agency)
      } catch {
        /* ignore */
      }
      if (!clientEdit.value) return
      if (!clientEdit.value.bank) clientEdit.value.bank = {}
      if (agency) {
        // ensure agency is string and append '-' so user can fill remaining account digits
        const a = String(agency || '').trim()
        const desired = a.endsWith('-') ? a : `${a}-`
        const currentAccount = clientEdit.value.bank.account || ''
        // update account if it's empty or if it was previously auto-filled (equal to lastAutoCopiedAccount)
        if (!currentAccount || currentAccount === lastAutoCopiedAccount) {
          clientEdit.value.bank.account = desired
          lastAutoCopiedAccount = desired
          try {
            if (console && console.debug)
              console.debug('BankDetailsLayout copied account:', clientEdit.value.bank.account)
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      /* ignore */
    }
  },
  { immediate: true },
)
const columnsBanks = [
  { name: 'name', label: 'Banco', field: 'name', align: 'left' },
  { name: 'agency', label: 'Agência', field: 'agency', align: 'left' },
  { name: 'account', label: 'Conta', field: 'account', align: 'left' },
  { name: 'type', label: 'Tipo de conta', field: 'type', align: 'left' },
  { name: 'cpf_cnpj', label: 'CPF/CNPJ', field: 'cpf_cnpj', align: 'left' },
  { name: 'chave_pix', label: 'Chave Pix', field: 'chave_pix', align: 'left' },
  { name: 'created_at', label: 'Data de criação', field: 'created_at', align: 'left' },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    headerStyle: 'width: 10px; text-align: end',
  },
]
defineComponent({
  name: 'BankDetailsLayout',
})
</script>
