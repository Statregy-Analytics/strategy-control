<template>
  <q-page
    class="CardAuthLayout row text-white items-center justify-center align-center bg-transparent card-authentication"
  >
    <q-card class="col-sm-8 col-5 col-md-5 card-auth">
      <slot> </slot>
    </q-card>
  </q-page>
</template>
<script setup>
import { defineComponent } from 'vue'
defineComponent({
  name: 'CardAuthLayout',
})
</script>
