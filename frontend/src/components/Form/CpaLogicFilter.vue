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
      <label-form className="col" textLabel="Valor da Parcela da Dívida padrão">
        <q-input
          outlined
          v-model="filter.fatorialDiaria"
          type="text"
          placeholder="2.500,00"
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
const filter = ref({})
const editActive = ref(false)
</script>
