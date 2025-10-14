<template>
  <div class="AddClientCompare">
    <avatar-initials
      size="32px"
      class="q-mr-sm"
      :src="optionsAdd && optionsAdd[0] && optionsAdd[0].avatar"
      :name="optionsAdd && optionsAdd[0] && optionsAdd[0].name"
    />
    <q-btn
      flat
      dense
      color="grey-6"
      icon-right="keyboard_arrow_down"
      label="Selecionar Cliente"
      no-caps
      @click.prevent.stop="showOptions = !showOptions"
    />
    <q-menu v-model="showOptions" self="top middle" square>
      <q-list style="min-width: 420px; padding-top: 2px">
        <q-item
          dense
          v-for="userClient in optionsAdd"
          :key="userClient"
          clickable
          @click.prevent.stop="selectClientCompare(userClient.id)"
          style="border-radius: 6px; margin-inline: 2px"
        >
          <q-item-section avatar>
            <avatar-initials size="32px" :src="userClient?.avatar" :name="userClient?.name" />
          </q-item-section>
          <q-item-section align="left">
            {{ userClient.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'
import { useClientStore } from 'src/stores/client'
import useCliente from 'src/composables/Fakes/useCliente'

export default defineComponent({
  name: 'AddClientCompare',
  components: { AvatarInitials },
  props: {
    slotIndex: {
      type: Number,
      default: -1,
    },
  },
  setup(props) {
    const storeClient = useClientStore()
    const { getClient } = useCliente()
    const selectClientCompare = (id) => {
      const selectClient = getClient(id)
      console.log('Selected Client ID:', id)
      // if a specific slotIndex was provided, replace that index
      if (typeof props.slotIndex === 'number' && props.slotIndex >= 0) {
        if (storeClient.compare && storeClient.compare.length > props.slotIndex) {
          // replace in place to preserve ordering
          storeClient.compare.splice(props.slotIndex, 1, selectClient)
        } else {
          // fallback: append
          storeClient.setCompare([selectClient])
        }
      } else {
        // replace first empty slot (id === 0) if present, otherwise append
        const idxEmpty = storeClient.compare
          ? storeClient.compare.findIndex((it) => it && it.id === 0)
          : -1
        if (idxEmpty >= 0) {
          storeClient.compare.splice(idxEmpty, 1, selectClient)
        } else {
          storeClient.setCompare([selectClient])
        }
      }
      showOptions.value = false
    }
    const showOptions = ref(false)
    return {
      optionsAdd: storeClient.clientSelected,
      showOptions,
      selectClientCompare,
    }
  },
})
</script>
