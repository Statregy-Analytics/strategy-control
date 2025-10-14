<template>
  <q-card class="SplentEditFormLayout">
    <title-card
      title="Gasto do Assessor"
      :advisor="advisorEdit.assessor.name"
      :icon-left="true"
    ></title-card>
    <q-separator />

    <div class="row q-gutter-sm justify-around q-pt-md q-px-md">
      <label-form className="col" textLabel="Valor do Gasto (R$)">
        <q-input
          outlined
          v-model="splenEdit.value"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Data">
        <q-input
          outlined
          v-model="splenEdit.date"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around q-pt-md q-px-md">
      <label-form className="col" textLabel="Cliente/Lead Atrelado">
        <q-select
          :options="getClientOptions()"
          outlined
          v-model="splenEdit.cliente"
          dense
          placeholder=""
          class="q-my-sm"
          dropdown-icon="keyboard_arrow_down"
        />
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around q-px-md">
      <label-form className="col" textLabel="Valor do Gasto (R$)">
        <q-select
          :options="optionCategories"
          outlined
          v-model="splenEdit.category"
          dense
          placeholder=""
          class="q-my-sm"
          dropdown-icon="keyboard_arrow_down"
        />
      </label-form>
      <label-form className="col" textLabel="Localização">
        <q-input
          outlined
          v-model="splenEdit.location"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row q-gutter-sm justify-around q-px-md">
      <label-form className="col" textLabel="Motivo">
        <q-input
          type="textarea"
          outlined
          v-model="splenEdit.description"
          dense
          placeholder="Descreva por qual motivo o gasto foi gerado."
          grows="3"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="" style="position: absolute; bottom: 10px; right: 10px; width: 100%">
      <q-separator />
      <div class="row justify-end">
        <q-btn label="Voltar" color="primary" flat class="q-mt-md q-mr-sm" v-close-popup no-caps />
        <q-btn
          label="Remover Gastro"
          color="negative"
          class="q-mt-md q-mr-sm outline"
          no-caps
          outline
          style="border-radius: 8px"
          v-if="splenEdit.id"
        />
        <q-btn
          :label="!splenEdit.id ? 'Inserir Gasto' : 'Salvar Alterações'"
          color="primary"
          class="q-mt-md"
          no-caps
          style="border-radius: 8px"
          :icon="!splenEdit.id ? 'add' : 'check'"
        />
      </div>
    </div>
  </q-card>
</template>
<script setup>
import { defineComponent } from 'vue'
import { useAdvisorStore } from 'src/stores/advisor'
import { storeToRefs } from 'pinia'
import useCliente from 'src/composables/Fakes/useCliente'
import TitleCard from 'src/components/Card/TitleCard.vue'
import labelForm from 'src/components/Form/LabelForm.vue'

const advisorStore = useAdvisorStore()
const { getClientOptions } = useCliente()
const { advisorEdit, splenEdit } = storeToRefs(advisorStore)
const optionCategories = [
  { label: 'Passagem', value: 'passagem' },
  { label: 'Estadia', value: 'estadia' },
  { label: 'Alimentação', value: 'alimentacao' },
  { label: 'Outros', value: 'outros' },
]
defineComponent({
  name: 'SplentEditFormLayout',
})
</script>
<style scoped lang="sass">
.SplenEditFormLayout
  min-width: 820px !important
</style>
