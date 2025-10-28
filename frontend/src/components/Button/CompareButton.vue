<template>
  <div>
    <q-btn
      outline
      color="primary"
      size="sm"
      icon="compare_arrows"
      @click.prevent.stop="toggle"
      no-caps
    >
      <q-tooltip>Comparar</q-tooltip>
    </q-btn>
    <q-menu v-model="open" self="top middle" square>
      <q-list style="min-width: 320px; padding-top: 2px">
        <q-item v-for="c in options" :key="c.id" clickable @click.prevent.stop="select(c.id)">
          <q-item-section avatar>
            <q-avatar size="32px">
              <q-img :src="c.avatar" :alt="c.name" :title="c.name" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            {{ c.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import useCliente from 'src/composables/Fakes/useCliente'
import { useLayoutStore } from 'src/stores/layout'
import { useClientStore } from 'src/stores/client'

const open = ref(false)
const clienteApi = useCliente()
const { rowsClient } = clienteApi
const layoutStore = useLayoutStore()
const clientStore = useClientStore()

const options = computed(() => {
  try {
    const currentId =
      (layoutStore.clientEdit && layoutStore.clientEdit.id) ||
      (layoutStore.clientEdit && layoutStore.clientEdit.value && layoutStore.clientEdit.value.id)
    return (rowsClient || [])
      .filter((r) => String(r.id) !== String(currentId))
      .map((r) => ({
        id: r.id,
        name: (r.cliente && r.cliente.name) || r.name || '',
        avatar:
          (r.cliente && (r.cliente.avatar || r.cliente.avatar_url)) ||
          r.avatar ||
          r.avatar_url ||
          '',
      }))
  } catch {
    return []
  }
})

const toggle = () => (open.value = !open.value)

const select = (id) => {
  try {
    const selected = (rowsClient || []).find((r) => String(r.id) === String(id))
    if (!selected) return
    // use setCompareSelect to replace compare array
    const current = layoutStore.clientEdit || {}
    clientStore.setCompareSelect([current, selected])
    layoutStore.setDialogCompare(true)
  } catch (err) {
    console.debug('CompareButton select failed', err && err.message)
  } finally {
    open.value = false
  }
}
</script>
