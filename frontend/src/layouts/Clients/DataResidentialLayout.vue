<template>
  <div class="DataResidentialLayout">
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Nome do imóvel">
        <q-input
          outlined
          v-model="clientEdit.residential.register"
          @blur="onBlurResidential('register')"
          dense
          placeholder=""
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Matricula do imóvel">
        <q-input
          outlined
          v-model="clientEdit.residential.property"
          @blur="onBlurResidential('property')"
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
          @blur="onBlurResidential('real_state_registration')"
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
          @blur="onBlurResidential('address')"
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
          @blur="onBlurResidential('address_neighborhood')"
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
          @blur="onBlurResidential('address_city')"
          dense
          placeholder="av. das Startups"
          class="q-my-sm"
        ></q-input>
      </label-form>
      <label-form className="col" textLabel="Provincia/UF">
        <q-input
          outlined
          v-model="clientEdit.residential.address_state"
          @blur="onBlurResidential('address_state')"
          dense
          placeholder="000"
          class="q-my-sm"
        ></q-input>
      </label-form>
    </div>
    <div class="row justify-around q-gutter-sm">
      <label-form className="col" textLabel="Complemento">
        <q-input
          outlined
          v-model="clientEdit.residential.complemento"
          @blur="onBlurResidential('complemento')"
          dense
          placeholder="Apto / Bloco / Complemento"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="CEP">
        <q-input
          outlined
          v-model="clientEdit.residential.cep"
          dense
          placeholder="00000-000"
          mask="#####-###"
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
import { titleCase, normalizeStateValue } from 'src/utils/normalize'

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const onBlurResidential = (field) => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.residential) return
    const obj = clientEdit.value.residential
    let val = obj[field]
    if (val == null) return
    val = String(val).trim().replace(/\s+/g, ' ')
    if (/^(address_state|provincia|state)$/i.test(field)) {
      obj[field] = normalizeStateValue(val)
      return
    }
    // title case for textual residential fields
    obj[field] = titleCase(val)
  } catch (e) {
    void e
  }
}

defineComponent({
  name: 'DataResidentialLayout',
})
</script>
