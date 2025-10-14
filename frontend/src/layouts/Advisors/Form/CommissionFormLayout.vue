<template>
  <div class="CommissionFormLayout">
    <div class="row q-mt-xl q-mb-md justify-between">
      <div class="text-h7 text-bold">Comissão</div>
      <q-btn
        label="Inserir Comissão"
        color="primary"
        no-caps
        size="sm"
        padding="xs xs"
        icon="add"
        flat
        @click.prevent="layoutStore.setCommissionDialog(true)"
      />
    </div>
    <div class="row q-gutter-sm justify-around">
      <label-form className="col" textLabel="Comissão já paga (R$)">
        <q-input
          outlined
          v-model="advisorEdit.commission.received"
          dense
          placeholder=""
          class="q-my-sm"
          readonly
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Comissão futura (R$)">
        <q-input
          outlined
          v-model="advisorEdit.commission.future"
          dense
          placeholder=""
          class="q-my-sm"
          readonly
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Valor da Comissão (R$)">
        <q-input
          outlined
          v-model="advisorEdit.commission.value"
          dense
          placeholder=""
          class="q-my-sm"
          readonly
        ></q-input>
      </label-form>
    </div>
  </div>
</template>
<script setup>
import { defineComponent } from 'vue'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import labelForm from 'src/components/Form/LabelForm.vue'
import { useLayoutStore } from 'src/stores/layout'
const layoutStore = useLayoutStore()
const advisorStore = useAdvisorStore()
const { advisorEdit } = storeToRefs(advisorStore)
defineComponent({
  name: 'CommissionFormLayout',
})
</script>
