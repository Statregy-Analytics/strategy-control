<template>
  <div class="section-actions">
    <span v-if="saved && !editing" class="section-saved" role="status"
      ><img src="/icons/section-edit/check.svg" alt="" />Alterações salvas</span
    >
    <template v-if="editing">
      <q-btn outline dense no-caps label="Descartar" :disable="busy" @click="$emit('discard')" />
      <q-btn
        outline
        dense
        no-caps
        class="section-save"
        :disable="!changed || loading || busy"
        @click="$emit('save')"
      >
        <img v-if="busy" src="/icons/section-edit/loading.svg" alt="" class="section-spinner" />{{
          busy ? 'Salvando…' : 'Salvar'
        }}
      </q-btn>
    </template>
    <template v-else>
      <span v-if="locked" class="section-lock">Conclua a edição de {{ activeLabel }}</span>
      <span :title="blocked ? blockedReason : locked ? 'Conclua a edição atual.' : 'Editar seção'">
        <q-btn
          outline
          dense
          class="section-pencil"
          :disable="locked || blocked"
          :aria-label="'Editar ' + label"
          @click="$emit('edit')"
        >
          <img src="/icons/section-edit/pencil.svg" alt="" /><q-tooltip>Editar seção</q-tooltip>
        </q-btn>
      </span>
    </template>
  </div>
</template>
<script setup>
defineProps({
  label: String,
  activeLabel: String,
  editing: Boolean,
  locked: Boolean,
  blocked: Boolean,
  blockedReason: String,
  changed: Boolean,
  busy: Boolean,
  loading: Boolean,
  saved: Boolean,
})
defineEmits(['edit', 'save', 'discard'])
</script>
<style scoped>
.section-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
.section-actions .q-btn {
  min-height: 32px;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.06);
}
.section-actions .section-pencil {
  width: 32px;
  padding: 0;
}
.section-pencil img {
  width: 16px;
  height: 16px;
  flex: none;
}
.section-saved img,
.section-spinner {
  width: 14px;
  height: 14px;
  flex: none;
}
.section-actions .section-save {
  color: rgba(191, 219, 255, 0.92);
  background: rgba(190, 219, 255, 0.08);
}
.section-lock {
  color: var(--sa-muted);
  font-size: 12px;
}
.section-saved {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid rgba(0, 166, 62, 0.4);
  background: rgba(0, 166, 62, 0.14);
  border-radius: 8px;
  color: #99f2b2;
  font-size: 12px;
}
.section-spinner {
  margin-right: 6px;
  animation: section-spin 1s linear infinite;
}
@keyframes section-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .section-spinner {
    animation: none;
  }
}
</style>
