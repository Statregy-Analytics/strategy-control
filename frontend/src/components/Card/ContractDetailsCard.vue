<template>
  <q-card class="ContractDetailsCard q-pa-sm q-pb-md row q-gutter-sm" bordered flat>
    <q-item
      v-for="(item, index) in item"
      :key="index"
      clickable
      class="rounded-borders col-3 bg-white bordered-grey"
      @click.prevent="actionItem(item)"
      :class="paramentroLogic && item.title == 'Parâmentros de Lógica' ? 'bordered-primary' : ''"
    >
      <q-item-section avatar>
        <q-btn round text-color="dark" color="grey-3" unelevated>
          <component :is="item.icon" />
        </q-btn>
        <!-- <q-avatar rounded>IconAdjustments
          <q-icon name="description" />
        </q-avatar> -->
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-muted text-grey-9 text-h7">{{ item.title }} </q-item-label>
      </q-item-section>
      <q-item-section side class="q-pa-none">
        <q-item-label class="text-info text-weight-bold">
          <q-toggle v-model="projection" v-if="item.selectd" />
          {{ item.linkText }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <slot></slot>
  </q-card>
</template>
<script>
import { defineComponent } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: 'ContractDetailsCard',
  props: {
    item: {
      type: Array,
      default: () => [
        {
          title: 'Detalhes do Contrato',
          icon: 'IconFileText',
          linkTo: '/contracts/logic',
          linkText: 'Ver Contrato',
          selectd: false,
        },
      ],
    },
  },
  setup() {
    const storeLayout = useLayoutStore()
    const { paramentroLogic, projection } = storeToRefs(storeLayout)
    const router = useRouter()

    const actionItem = (item) => {
      if (item.linkTo) {
        router.push(item.linkTo)
        return
      }
      if (item.selectd) {
        console.log('clicou no select')
        storeLayout.setProjection(!projection.value)
        return
      }
      storeLayout.setParamentroLogic(!paramentroLogic.value)
    }

    return {
      paramentroLogic,
      projection,
      actionItem,
    }
  },
})
</script>
<style scoped lang="sass">
.bordered-grey
  border: 1px solid #ececec !important
  border-radius: 8px !important
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2)
.bordered-primary
  border: 1px solid #00A3FF !important
  box-shadow: 0px 1px 3px rgba(0, 123, 255, 0.2)
</style>
