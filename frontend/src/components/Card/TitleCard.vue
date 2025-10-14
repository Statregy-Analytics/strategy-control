<template>
  <q-card-section class="row justify-between">
    <div class="text-h6 text-bold">
      <q-icon v-if="iconLeft" v-close-popup name="arrow_back" size="18px" class="q-mr-sm"></q-icon>
      {{ title }}

      <span v-if="advisor">
        <span class="text-primary"> {{ advisor }} </span>
      </span>
    </div>
    <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" @click="onClose" />
  </q-card-section>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TitleCard',
  emits: ['onClose'],
  props: {
    title: {
      type: String,
      required: true,
    },
    advisor: {
      type: String,
    },
    iconLeft: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const onClose = () => {
      emit('onClose')
    }

    return {
      onClose,
    }
  },
})
</script>
