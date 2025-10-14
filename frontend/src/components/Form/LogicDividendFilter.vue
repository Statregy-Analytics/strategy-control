<template>
  <q-card class="LogicDividendFilter col-12 q-mx-sm" bordered>
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
      <label-form className="col" textLabel="Contrato Atrelado">
        <q-select
          outlined
          v-model="filter.contrato"
          :options="optionContract"
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Data da Distribuição padrão">
        <q-input
          outlined
          v-model="filter.fatorialMensal"
          type="text"
          placeholder="5° dia útil do mês seguinte"
          dense
          reverse-fill-mask
          unmasked-value
        />
      </label-form>
      <label-form className="col" textLabel="Percentual sobre Valor Base(%)">
        <q-input
          outlined
          v-model="filter.fatorialAnual"
          type="text"
          placeholder="1%"
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
  name: 'LogicDividendFilter',
})
const filter = ref({
  contrato: '#231 Nome do contrato',
})
const editActive = ref(false)
const optionContract = ref([
  { label: '#231 Nome do contrato', value: 'contrato1' },
  { label: 'Contrato 2', value: 'contrato2' },
  { label: 'Contrato 3', value: 'contrato3' },
])
</script>
