<template>
  <div
    class="section-editor q-mb-md"
    :class="{ 'active-section': isActive }"
    @mouseenter="emit('hover')"
  >
    <div class="row items-center justify-between q-pa-md">
      <div class="section-title">{{ title }}</div>
      <div class="row items-center">
        <q-btn
          v-if="!isActive"
          flat
          dense
          :icon="$filtersString.resolveUrl('img:icons/edit.svg')"
          label="Editar"
          no-caps
          color="primary"
          @click.stop="emit('select')"
        />
        <div class="" v-if="isActive">
          <q-btn
            outline
            dense
            icon="check"
            label="Salvar"
            no-caps
            color="primary"
            padding="sm md"
            class="q-ml-sm border-radius-pattern"
            @click.stop="emit('edit')"
          />
          <q-btn
            flat
            dense
            icon="replay"
            label="Restaurar padrão"
            color="grey"
            @click.stop="emit('closed')"
          />
        </div>
      </div>
    </div>

    <q-slide-transition>
      <div v-show="isActive" class="q-pa-md section-content">
        <slot />
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup>
import { defineProps, defineComponent } from 'vue'

defineComponent({
  name: 'SectionEditor',
})

defineProps({
  title: String,
  isActive: Boolean,
})

const emit = defineEmits(['select', 'edit', 'closed'])
</script>

<style scoped>
.section-editor {
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.3s;
  cursor: url('/icons/cursor.png'), pointer;
}
.section-editor.active-section > .section-content {
  border-color: var(--q-primary); /* usa a variável $primary do Quasar */
  background-color: #dcdcdc;
  border-top: 1px solid #656565;
}
.section-editor:hover {
  border-color: var(--q-primary);
}
.section-title {
  font-size: 17px;
  font: 500;
  color: #656565;
}
</style>
