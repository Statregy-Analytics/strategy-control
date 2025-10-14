<template>
  <div class="row">
    <q-btn
      padding="none"
      flat
      icon="keyboard_backspace"
      label="Voltar"
      size="sm"
      no-caps
      @click="actionEmit"
    ></q-btn>
    <div class="col-12 q-mt-md" style="line-height: 2.1">
      <span class="text-h6 text-bold">{{ title }}</span>
      <br />
      <span class="q-mt-lg text-grey-5">{{ subTitle }}</span>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TitleAuth',
  props: {
    title: {
      type: String,
      default: 'Acesse sua conta',
    },
    subTitle: {
      type: String,
    },
  },
  emits: ['actionEmit'],
  setup(props, { emit }) {
    const actionEmit = () => {
      emit('actionEmit')
    }

    return {
      actionEmit,
    }
  },
})
</script>
