<template>
  <q-card class="q-dialog q-px-md">
    <q-card-section class="row justify-between" style="padding-inline: 0px">
      <div class="text-h7">{{ title }}</div>
      <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" />
    </q-card-section>
    <q-separator />

    <div class="text-subtitle2 text-grey-6 q-mt-xs">
      Somente usuários permitidos podem executar essa ação.
    </div>
    <q-card-section style="padding-inline: 0px">
      <label-form textLabel="Senha para Edição" class="q-mt-md">
        <q-input
          ref="passwordRef"
          outlined
          v-model="password"
          type="password"
          dense
          :rules="[(val) => val.length > 0 || 'Por favor, insira sua senha!']"
        />
      </label-form>
    </q-card-section>
    <q-card-actions class="justify-end">
      <q-btn label="Cancelar" color="primary" flat v-close-popup />
      <q-btn label="Enviar" color="primary" @click="submitForm" />
    </q-card-actions>
  </q-card>
</template>
<script>
import { ref, defineComponent } from 'vue'
import labelForm from 'src/components/Form/LabelForm.vue'
import useNotification from 'src/composables/global/useNotification'
export default defineComponent({
  name: 'PasswordConfirm',
  components: {
    labelForm,
  },
  props: {
    sendPasswordAction: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: 'Forneça sua Senha de Acesso para executar essa ação',
    },
  },
  emits: ['update:sendPasswordAction', 'passwordSubmitted'],
  setup(_, { emit }) {
    const password = ref('')
    const passwordRef = ref(null)
    const { errorNotify } = useNotification()
    const submitForm = () => {
      passwordRef.value.validate()

      if (passwordRef.value.hasError) {
        errorNotify('Por favor, insira sua senha.')
        return
      }

      emit('passwordSubmitted', password.value)
      emit('update:sendPasswordAction', false)
    }

    return {
      password,
      passwordRef,
      submitForm,
    }
  },
})
</script>
