<template>
  <div class="ResidencialLeadsLayout q-pt-md">
    <div class="row q-my-md">
      <span class="text-bolder text-h7">Documentos Residenciais</span>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Nome do imóvel">
        <q-input
          outlined
          v-model="leadEdit.residential.register"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Matricula do imóvel">
        <q-input
          outlined
          v-model="leadEdit.residential.property"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Número da Escritura da Residência">
        <q-input
          outlined
          v-model="leadEdit.residential.number_redisential"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Inscrição Imobiliária">
        <q-input
          outlined
          v-model="leadEdit.residential.real_state_registration"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Rua">
        <q-input
          outlined
          v-model="leadEdit.residential.address"
          dense
          placeholder="av. das Startups"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col-2" textLabel="Número">
        <q-input
          outlined
          v-model="leadEdit.residential.address_number"
          dense
          placeholder="000"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Bairro">
        <q-input
          outlined
          v-model="leadEdit.residential.address_neighborhood"
          dense
          placeholder="000"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Municipio">
        <q-input
          outlined
          v-model="leadEdit.residential.address_city"
          dense
          placeholder="av. das Startups"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Provincia/UF">
        <q-input
          outlined
          v-model="leadEdit.residential.address_state"
          dense
          placeholder="000"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
  </div>
</template>
<script setup>
import { defineComponent } from 'vue'
import { useLeadStore } from 'src/stores/lead'
import { storeToRefs } from 'pinia'
import LabelForm from 'src/components/Form/LabelForm.vue'

defineComponent({
  name: 'ResidencialLeadsLayout',
})
const leadStore = useLeadStore()
const { leadEdit } = storeToRefs(leadStore)
</script>
