<template>
  <div class="row justify-between">
    <div class="col-10">
      <div class="" v-if="projection">
        <b>Atual vs Projeção</b>

        <span class="q-ml-md bg-negative-light q-pa-xs tag-warning-light"> Atual </span>
        <span
          class="q-ml-md bg-positive-light q-pa-xs tag-positive-light"
          v-if="projectionStatus == 1"
        >
          Projeção
        </span>
      </div>
    </div>
    <div class="col text-end" style="text-align-last: end">
      <q-btn
        size="xs"
        padding="4px"
        class="q-mx-xs"
        :outline="projectionStatus !== 1"
        :flat="projectionStatus == 1"
        :color="projectionStatus !== 1 ? 'primary' : 'grey'"
        @click="storeLayout.setProjectionStatus(2)"
        v-if="projection"
      >
        <IconLayoutList size="12" />
      </q-btn>
      <q-btn
        :outline="projectionStatus == 1"
        :flat="projectionStatus !== 1"
        :color="projectionStatus == 1 ? 'primary' : 'grey'"
        padding="4px"
        size="xs"
        class="q-mx-sm"
        @click="storeLayout.setProjectionStatus(1)"
        v-if="projection"
      >
        <IconLayoutColumns size="12" />
      </q-btn>
      <slot></slot>
    </div>
  </div>
</template>
<script setup>
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
const storeLayout = useLayoutStore()
defineComponent({
  name: 'ProjectionControlTable',
})
const { projectionStatus, projection } = storeToRefs(storeLayout)
</script>
