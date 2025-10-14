<template>
  <q-banner
    inline-actions
    rounded
    class="border-pattern q-ma-md section-historic"
    :class="{ 'active-section': isActive }"
  >
    <div class="row align-center justify-between">
      <div class="col-1 flex flex-center">
        <q-avatar size="32px" :color="avatarColor">
          <component :is="icon" :color />
        </q-avatar>
      </div>
      <div class="col-4">
        <q-avatar size="22px" color="grey-5" text-color="grey-9"> j </q-avatar>
        <span class="q-mx-xs"> {{ name }} </span>
        <span class="text-muted" style="font-size: 12px">| {{ date }}</span>
        <div class="">
          <span v-if="section">{{ filter }}</span>
          <span v-else>{{ description }}</span>
        </div>
      </div>
      <div class="col text-end" style="text-align-last: end">
        <div class="" v-if="status !== 'approved'">
          <q-btn flat color="primary" class="q-mr-sm" no-caps v-if="status === 'pending'">
            <IconFile :size="14" class="q-mr-xs" />
            Visualiar Versão
          </q-btn>
          <q-btn v-else flat color="primary" class="q-mr-sm" no-caps>
            <IconMessage2 :size="14" class="q-mr-xs" />
            Ver FeedBalcks
          </q-btn>
          <q-btn flat color="grey" class="q-mr-sm" no-caps>
            <IconRefresh :size="14" class="q-mr-xs" />
            Restaurar
          </q-btn>
        </div>
        <div class="" v-else>
          <q-btn
            flat
            color="grey"
            class="q-mr-sm"
            icon="keyboard_arrow_down"
            no-caps
            @click="emit('select')"
            v-if="!isActive"
          >
          </q-btn>
          <q-btn
            v-else
            flat
            color="primary"
            class="q-mr-sm"
            icon="keyboard_arrow_up"
            no-caps
            @click="emit('closed')"
          ></q-btn>
        </div>
      </div>
    </div>
    <q-slide-transition>
      <div v-show="isActive" class="q-pa-md section-content">
        <slot />
      </div>
    </q-slide-transition>
  </q-banner>
</template>

<script setup>
import { defineProps, defineComponent } from 'vue'

defineComponent({
  name: 'SectionEditor',
})

defineProps({
  description: String,
  avatar: { type: String, default: '' },
  icon: { type: String, default: '' },
  date: { type: String, default: '' },
  name: { type: String, default: '' },
  color: { type: String, default: 'grey' },
  avatarColor: { type: String, default: 'grey-5' },
  status: {
    type: String,
    default: 'approved',
    validator: (value) => ['approved', 'pending', 'rejected'].includes(value),
  },
  isActive: Boolean,
  section: Boolean,
  filter: String,
})
const emit = defineEmits(['select', 'edit', 'closed'])
</script>

<style scoped>
.section-historic {
  border: 1px solid #ccc !important;
  border-radius: 8px !important;
  transition: border-color 0.3s !important;
  margin: 1rem !important;
  cursor: url('/icons/cursor.png'), pointer !important;
}
.section-historic.active-section > .section-content {
  border-color: var(--q-primary) !important; /* usa a variável $primary do Quasar */
  background-color: #dcdcdc !important;
  border-top: 2px solid #656565 !important;
}
.section-historic:hover {
  border-color: var(--q-primary) !important;
}
</style>
