<template>
  <q-card class="OpenDepositLayout">
    <q-card-section class="row justify-between">
      <div class="text-h6">{{ dialogOpengHeader }}</div>
      <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" />
    </q-card-section>
    <q-separator />
    <q-card-section class="row justify-between">
      <!-- Tipo de Movimentação -->
      <label-form className="q-mt-md q-px-sm col-md-6 col-12" textLabel="Tipo de Movimentação">
        <q-select
          outlined
          v-if="dialogOpengHeader === 'Solicitação de Depósito'"
          v-model="dataSolicitacao.type"
          :options="tiposOptionsDeposito"
          emit-value
          map-options
          dense
          disable
          bg-color="grey-2"
          dropdown-icon="keyboard_arrow_down"
        />
        <q-input
          v-else
          outlined
          v-model="dataSolicitacao.tipo"
          type="text"
          dense
          bg-color="grey-2"
          disable
          readonly
        />
      </label-form>
      <!-- Valor de Movimentação -->
      <label-form
        className="q-mt-md q-px-sm col-md-6 col-12"
        textLabel="Valor de Movimentação (R$)"
      >
        <q-input
          outlined
          v-if="dialogOpengHeader === 'Solicitação de Depósito'"
          v-model="dataSolicitacao.transactionValue"
          type="text"
          dense
          mask="###.###.###.###,##"
          reverse-fill-mask
          unmasked-value
          @update:model-value="onInput"
          :value="formatCurrency(dataSolicitacao.transactionValue)"
        />
        <q-input
          v-else
          outlined
          v-model="dataSolicitacao.transactionValue"
          type="text"
          dense
          disable
          readonly
          :value="formatCurrency(dataSolicitacao.transactionValue)"
        />
      </label-form>

      <!-- Cliente -->
      <label-form className="q-mt-md q-px-sm col-12" textLabel="Cliente">
        <q-select
          v-if="dialogOpengHeader === 'Solicitação de Depósito'"
          outlined
          v-model="dataSolicitacao.client"
          :options="clients"
          options-cover
          emit-value
          map-options
          dense
          dropdown-icon="keyboard_arrow_down"
        />
        <q-input
          v-else
          outlined
          v-model="dataSolicitacao.cliente.name"
          type="text"
          dense
          disable
          readonly
        />
      </label-form>

      <!-- Origem -->
      <label-form className="q-mt-md q-px-sm col-6" textLabel="Origem">
        <q-select
          v-if="dialogOpengHeader === 'Solicitação de Depósito'"
          outlined
          v-model="dataSolicitacao.bank"
          :options="banks"
          emit-value
          map-options
          dense
          dropdown-icon="keyboard_arrow_down"
        />
        <q-select
          v-else
          outlined
          v-model="dataSolicitacao.origem"
          :options="getOrigemDeposit"
          emit-value
          map-options
          dense
          disable
          dropdown-icon="keyboard_arrow_down"
        />
      </label-form>

      <!-- Destino -->
      <label-form className="q-mt-md col-6" textLabel="Destino">
        <q-select
          outlined
          v-model="dataSolicitacao.destination"
          :options="[{ label: 'Carteira Disponível para Movimentar', value: 'movimentar' }]"
          emit-value
          map-options
          dense
          readonly
          disable
          bg-color="grey-2"
          dropdown-icon="keyboard_arrow_down"
        />
      </label-form>

      <!-- Upload de Comprovante -->
      <label-form
        className="q-mt-md col-12"
        textLabel="Documentos anexos - comprovante, recibo, etc.(opcional)"
      >
      </label-form>
      <q-btn
        color="primary"
        outline
        no-caps
        style="border-radius: 6px; border: 2px solid #00a3ff"
        class="q-mt-sm q-px-md q-py-sm"
        @click="triggerFileInput"
      >
        <IconUpload size="16" class="q-mr-sm" />
        Upload
      </q-btn>
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileUpload"
        multiple
        accept=".jpg, .jpeg, .png, .pdf"
      />

      <div class="col" v-if="uploadedFiles.length > 0" style="text-align-last: end">
        <q-btn
          v-for="(item, index) in uploadedFiles"
          :key="index"
          size="sm"
          flat
          padding="xs"
          color="secondary"
          no-caps
          class="q-ma-sm text-muted"
        >
          <IconPhoto class="q-mr-xs" />
          {{ item.name }}
          <IconTrash class="q-ml-lg" @click="uploadedFiles = []" />
        </q-btn>
      </div>
    </q-card-section>

    <!-- Botão de Enviar -->
    <div class="" style="position: absolute; bottom: 10px; right: 10px; width: 100%">
      <q-separator />
      <div class="row justify-end">
        <q-btn label="Voltar" color="primary" flat class="q-mt-md q-mr-sm" v-close-popup no-caps />
        <q-btn
          v-if="dialogOpengHeader === 'Solicitação de Depósito'"
          label="Enviar Solicitação de Depósito"
          color="primary"
          class="q-mt-md"
          no-caps
          style="border-radius: 8px"
          icon="add"
          @click="sendPasswordAction = true"
        />
        <q-btn
          v-else
          label="Aprovar Solicitação de Depósito"
          color="primary"
          class="q-mt-md"
          no-caps
          style="border-radius: 8px"
          icon="check"
          @click="sendPasswordAction = true"
        />
      </div>
    </div>
    <q-dialog v-model="sendPasswordAction" persistent>
      <password-confirm
        title="Confirmação de Senha"
        description="Por favor, insira sua senha para confirmar a solicitação de depósito."
        @passwordSubmitted="submitForm"
        @cancel="sendPasswordAction = false"
      />
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, defineComponent, computed, onMounted } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import PasswordConfirm from 'components/Auth/PasswordConfirm.vue'
import LabelForm from 'components/Form/LabelForm.vue'
import useMovement from 'src/composables/Fakes/useMovement'
defineComponent({
  name: 'OpenDepositLayout',
})
const layoutStore = useLayoutStore()
const { dataSolicitacao, dialogOpengHeader, getOrigemDeposit } = storeToRefs(layoutStore)
const transactionType = ref('deposit')
const selectedDestination = ref('movimentar')
const transactionValue = ref(null)
const selectedClient = ref(null)
const selectedBank = ref(null)
const uploadedFiles = ref([])
const sendPasswordAction = ref(false)
const { tiposOptionsDeposito, getNameClients, banks } = useMovement()

onMounted(() => {
  console.debug('[DEBUG] OpenDepositLayout mounted')
})

// clientes
const clients = computed(() => {
  console.log('dataSolicitacao.value.id', dataSolicitacao.value.id)
  return getNameClients(dataSolicitacao.value.id)
})

// Destinos (preenchidos pelo usuário)
// const destinations = ref([])
// Função para aplicar a máscara de moeda
const onInput = (event) => {
  let value = event.replace(/\D/g, '') // Remove caracteres não numéricos
  if (!value) {
    transactionValue.value = ''
    return
  }
  value = (parseInt(value) / 100).toFixed(2) // Divide por 100 para obter os centavos
  transactionValue.value = value
    .toString()
    .replace('.', ',') // Substitui ponto por vírgula
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.') // Adiciona pontos como separadores de milhar
}

// Função para formatar o valor como moeda
const formatCurrency = (value) => {
  if (!value) return ''

  // Converte para número e garante que temos 2 casas decimais
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value)

  // Verifica se é um número válido
  if (isNaN(num)) return ''

  // Formata o número
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
// Função para disparar o clique no input de arquivo
const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) {
    fileInput.click()
  }
}
// Função para lidar com o upload de arquivos
const handleFileUpload = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    uploadedFiles.value = Array.from(files)
    console.log('Arquivos selecionados:', uploadedFiles.value)
  }
}
// Função para enviar o formulário
const submitForm = () => {
  console.log({
    transactionType: transactionType.value,
    transactionValue: transactionValue.value,
    selectedClient: selectedClient.value,
    selectedBank: selectedBank.value,
    selectedDestination: selectedDestination.value,
    uploadedFiles: uploadedFiles.value,
  })
  sendPasswordAction.value = false
  layoutStore.setDialogTransactionDeposit(false)
  layoutStore.setDialogConfirmAction(true)
  if (dialogOpengHeader.value === 'Solicitação de Depósito') {
    layoutStore.setDialogactionHeaderBody(
      true,
      'Solicitação de Depósito registrada!',
      'A solicitação de depósito foi registrada com sucesso no sistema.',
    )
  } else {
    layoutStore.setDialogactionHeaderBody(
      true,
      'Depósito concluído!',
      'A conclusão do depósito foi registrada com sucesso no sistema.',
    )
  }
}
</script>
