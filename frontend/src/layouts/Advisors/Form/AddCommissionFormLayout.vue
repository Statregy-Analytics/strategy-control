<template>
  <q-card class="AddCommissionFormLayout">
    <title-card
      title="Comissão do Assessor"
      :advisor="advisorEdit.assessor.name"
      :icon-left="true"
    />
    <q-separator />
    <div class="row q-ma-md">
      <div class="col-12 text-bold">Variação da Comissão</div>
      <div class="col-12">
        <q-btn-group outline size="sm">
          <q-btn
            outline
            class="outline"
            :color="btnActivo == 'one' ? 'primary' : 'secondary'"
            label="Absoluto"
            icon="123"
            size="sm"
            no-caps
          />
          <q-btn
            outline
            class="outline"
            :color="btnActivo == 'two' ? 'primary' : 'muted'"
            label="Percentual"
            size="sm"
            no-caps
            icon="percent"
          />
        </q-btn-group>
      </div>
    </div>
    <div class="row q-gutter-sm justify-around q-ma-md">
      <label-form className="col" textLabel="Novo Valor de Comissão (R$)">
        <q-input
          outlined
          v-model="commission.value"
          dense
          placeholder=""
          class="q-my-sm"
          readonly
          :hint="`Atual: R$ ${$filtersString.formatPartternCurrency(advisorEdit.commission.value)}`"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Agendamento">
        <q-input
          outlined
          v-model="commission.future"
          dense
          placeholder=""
          class="q-my-sm"
          type="date"
        ></q-input>
      </label-form>
    </div>
    <div class="" style="position: absolute; bottom: 10px; right: 10px; width: 100%">
      <q-separator />
      <div class="row justify-end">
        <q-btn label="Voltar" color="primary" flat class="q-mt-md q-mr-sm" v-close-popup no-caps />

        <q-btn
          label="Salvar Comissão"
          color="primary"
          class="q-mt-md"
          no-caps
          style="border-radius: 8px"
          icon="add"
        />
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
const btnActivo = ref('one')
const advisorStore = useAdvisorStore()
const { advisorEdit, commission } = storeToRefs(advisorStore)

defineComponent({
  name: 'AddCommissionFormLayout',
})
</script>
<style lang="sass" scoped>
.AddCommissionFormLayout
  min-width: 900px
  // max-width: 00px
</style>
