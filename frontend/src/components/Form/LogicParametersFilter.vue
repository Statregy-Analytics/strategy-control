<template>
  <q-card class="LogicParametersFilter col-12 q-mx-sm" bordered>
    <!-- <q-card-section class="row justify-between">
      <p class="text-h7">Parâmetros de Lógica</p>
      <q-btn flat size="sm" color="primary" label="Salvar" unelevated icon="checked" />
    </q-card-section> -->
    <q-card-section tag="div" class="row q-gutter-sm">
      <div class="col-12">
        <div class="row justify-between">
          <p class="text-h7">Parâmetros de Lógica</p>
          <q-btn
            flat
            color="primary"
            unelevated
            no-caps
            v-if="!editActive"
            @click.prevent="editActive = true"
          >
            <IconEdit size="16" />
            <span class="q-ml-sm">Editar</span>
          </q-btn>
          <div class="" v-else>
            <q-btn flat color="primary" unelevated no-caps>
              <IconCheck size="16" />
              <span class="q-ml-sm">Salvar</span>
            </q-btn>
            <q-btn unelevated no-caps color="grey" flat @click.prevent="editActive = false">
              <span class="q-ml-sm">Cancelar</span>
            </q-btn>
          </div>
        </div>
      </div>
      <label-form className="col" textLabel="Fatorial de valorização diária">
        <q-input
          outlined
          v-model="filter.fatorialDiaria"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Fatorial de valorização mensal">
        <q-input
          outlined
          v-model="filter.fatorialMensal"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Fatorial de valorização anual">
        <q-input
          outlined
          v-model="filter.fatorialAnual"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
    </q-card-section>
    <q-card-section tag="div" class="row q-gutter-sm">
      <label-form className="col" textLabel="Osciliação de Borda de Superior Máxima">
        <q-input
          outlined
          v-model="filter.fatorialDiaria"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Osciliação de Borda de Superior Mínima">
        <q-input
          outlined
          v-model="filter.fatorialMensal"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Osciliação de Borda de Inferior Máxima">
        <q-input
          outlined
          v-model="filter.fatorialAnual"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Osciliação de Borda de Superior Minima">
        <q-input
          outlined
          v-model="filter.fatorialAnual"
          type="text"
          placeholder=""
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { defineComponent, ref } from 'vue'
import LabelForm from './LabelForm.vue'
defineComponent({
  name: 'LogicParametersFilter',
})
const editActive = ref(false)

const filter = ref({})
</script>
