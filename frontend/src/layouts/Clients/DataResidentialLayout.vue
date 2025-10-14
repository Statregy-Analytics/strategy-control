<template>
  <div class="DataResidentialLayout">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Cadastramento do imóvel">
        <q-input
          outlined
          v-model="clientEdit.residential.register"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Registro do imóvel">
        <q-input
          outlined
          v-model="clientEdit.residential.property"
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
          v-model="clientEdit.residential.number_redisential"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Inscrição Imobiliária">
        <q-input
          outlined
          v-model="clientEdit.residential.real_state_registration"
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
          v-model="clientEdit.residential.address"
          dense
          placeholder="av. das Startups"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col-2" textLabel="Número">
        <q-input
          outlined
          v-model="clientEdit.residential.address_number"
          dense
          placeholder="000"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Bairro">
        <q-input
          outlined
          v-model="clientEdit.residential.address_neighborhood"
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
          v-model="clientEdit.residential.address_city"
          dense
          placeholder="av. das Startups"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Provincia/UF">
        <q-input
          outlined
          v-model="clientEdit.residential.address_state"
          dense
          placeholder="000"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
  </div>
</template>
<script setup>
import labelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)
defineComponent({
  name: 'DataResidentialLayout',
})
</script>
