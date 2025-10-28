<template>
  <!-- <q-banner class="ClientSimple bg-grey-2" bordered flat> -->
  <q-item clickable v-ripple class="rounded-borders nameCliente">
    <q-item-section avatar>
      <avatar-initials :src="avatar" :name="name" rounded />
    </q-item-section>

    <q-item-section>
      <q-item-label caption>ID #{{ id }} </q-item-label>
      <q-item-label class="text-no-wrap ellipsis" style="max-width: 100px">
        {{ name }}
      </q-item-label>
    </q-item-section>

    <q-item-section side v-if="showLevel && level">
      <q-btn
        size="sm"
        outline
        no-caps
        class="custom-btn-muted"
        :label="'Classificação: ' + level"
      />
    </q-item-section>
    <q-btn
      flat
      dense
      size="xs"
      color="grey-6"
      icon="keyboard_arrow_down"
      @click.prevent.stop="showClients = !showClients"
    />
    <q-menu v-model="showClients" self="top middle" square style="position: fixed">
      <q-list style="min-width: 320px; padding-top: 2px">
        <q-item
          dense
          v-for="userClient in clientSelected"
          :key="userClient"
          clickable
          @click="toReplaceSelect(userClient.id)"
          style="border-radius: 6px; margin-inline: 2px"
        >
          <q-item-section avatar>
            <avatar-initials :src="userClient.avatar" :name="userClient.name" size="32px" />
          </q-item-section>
          <q-item-section align="left">
            {{ userClient.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
  <!-- </q-banner> -->
</template>
<script>
import { defineComponent, ref, computed } from 'vue'
import AvatarInitials from 'src/components/Avatar/AvatarInitials.vue'
import useCliente from 'src/composables/Fakes/useCliente'

import { useClientStore } from 'src/stores/client'
import { storeToRefs } from 'pinia'
export default defineComponent({
  name: 'ClientSimple',
  components: {
    AvatarInitials,
  },
  props: {
    id: {
      type: [String, Number],
    },
    avatar: {
      type: String,
    },
    name: {
      type: String,
    },
    level: {
      type: String,
    },
    showLevel: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const showClients = ref(false)
    const storeClient = useClientStore()
    const { compare } = storeToRefs(storeClient)
    const { getClientIdName } = useCliente()
    const toReplaceSelect = (id) => {
      storeClient.setToReplace(id, props.id)
      showClients.value = false
    }
    return {
      showClients,
      clientSelected: computed(() => {
        return getClientIdName(compare.value)
      }),
      toReplaceSelect,
    }
  },
})
</script>
<style lang="sass">
.nameCliente
  display: inline-flex
</style>
