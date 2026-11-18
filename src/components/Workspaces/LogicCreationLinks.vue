<template>
  <profile-section
    class="logic-create-links"
    title="Vincular Papéis/Contratos (Opcional)"
    caption="Associe contratos ou papéis existentes agora ou faça depois."
    icon-src="/icons/logics/create/1484-77978-imgLink.svg"
  >
    <template #actions
      ><small
        >{{ modelValue.length }}
        {{ modelValue.length === 1 ? 'selecionado' : 'selecionados' }}</small
      ></template
    >
    <q-input
      v-model="search"
      outlined
      dense
      dark
      hide-bottom-space
      placeholder="Buscar contrato ou papel por nome ou ID..."
      aria-label="Buscar contrato ou papel por nome ou ID"
      ><template #prepend><img src="/icons/logics/directory/cards-imgSearch.svg" alt="" /></template
    ></q-input>
    <resource-state :state="state" @retry="$emit('retry')"
      ><q-list v-if="filtered.length" class="logic-create-link-list"
        ><q-item v-for="row in filtered" :key="row.id" tag="label"
          ><q-item-section avatar
            ><q-checkbox
              :model-value="modelValue"
              :val="row.id"
              :aria-label="'Vincular ' + row.name"
              dense
              @update:model-value="$emit('update:modelValue', $event)" /></q-item-section
          ><q-item-section
            ><span>{{ row.name }}</span
            ><small
              >{{ row.publicCode || row.id
              }}<template v-if="row.clients?.length">
                ·
                {{
                  row.clients
                    .map((c) => c.displayName || c.name)
                    .filter(Boolean)
                    .join(', ')
                }}</template
              ></small
            ></q-item-section
          ></q-item
        ></q-list
      >
      <p v-else class="logic-create-no-links">Nenhum contrato encontrado.</p></resource-state
    >
    <div class="logic-create-link-note">
      <img src="/icons/logics/create/1484-77978-imgCircleAlert.svg" alt="" />
      <div>
        <strong>Importante sobre Vínculos</strong>
        <p>
          Papéis vinculados após o início do ciclo não herdam performance anterior. A valorização
          passa a ser calculada a partir do índice na conexão.
        </p>
      </div>
    </div>
  </profile-section>
</template>
<script setup>
import { computed, ref } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { foldSearch } from 'src/services/adminWorkspaceModel'
const props = defineProps({
  modelValue: { type: Array, required: true },
  state: { type: Object, required: true },
})
defineEmits(['update:modelValue', 'retry'])
const search = ref('')
const filtered = computed(() =>
  (props.state.data || []).filter((r) =>
    foldSearch(r.name + ' ' + r.publicCode).includes(foldSearch(search.value)),
  ),
)
</script>
<style scoped>
.logic-create-link-list {
  margin-top: 16px;
  max-height: 192px;
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.logic-create-link-list .q-item {
  min-height: 52px;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 20px;
}
.logic-create-link-list .q-item__section--avatar {
  min-width: 28px;
  padding-right: 12px;
}
.logic-create-link-list small {
  display: block;
  font:
    10px/15px Consolas,
    monospace;
  overflow-wrap: anywhere;
}
.logic-create-link-note {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 12px;
  line-height: 20px;
}
.logic-create-link-note img {
  flex: none;
  align-self: flex-start;
}
.logic-create-link-note strong {
  color: #fee685;
  font-weight: 600;
}
.logic-create-link-note p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.6);
}
.logic-create-no-links {
  padding: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
}
</style>
