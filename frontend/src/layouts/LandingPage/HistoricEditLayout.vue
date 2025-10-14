<template>
  <q-card class="HistoricEditLayout">
    <q-card-section class="row justify-between">
      <div class="text-h6">Historíco de Mudanças</div>
      <q-btn v-close-popup flat icon="close" size="sm" rounded color="grey-6" />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row text-start items-start">
        <q-toggle
          v-model="select"
          label="Visualizar Mudanças por Seção:"
          left-label
          class="col-5"
          @update:model-value="listView = 'Selecione uma Seção'"
        />
        <q-select
          v-if="select"
          v-model="listView"
          :options="['Selecione uma Seção', 'Seção Principal', 'Segunda Seção']"
          placeholder="Selecione uma Seção"
          class="col"
          dense
          outlined
          dropdown-icon="keyboard_arrow_down"
          @geOptionValue="listHistoric = listHistoric.filter((item) => item.filter === value)"
        />
      </div>
    </q-card-section>

    <q-card-section
      class="text-center q-mt-xl q-pt-lg"
      v-if="select && listView == 'Selecione uma Seção'"
    >
      <p class="text-h6 text-bold">Selecione uma Seção para visualizar as mudanças</p>
      <p class="text-muted q-px-lg">
        Os salvamentos serão exibidos aqui e você poderá ver os parâmentros de cadas edição do
        histórico
      </p>
    </q-card-section>
    <section-historic
      v-else
      v-for="(item, index) in selectList"
      :key="index"
      :description="item.description"
      :date="item.date"
      :status="item.status"
      :icon="item.icon"
      :color="item.color"
      :name="item.user.name"
      :avatar-color="item.avatarColor"
      :isActive="activeSection === item.id"
      :filter="item.filter"
      @select="actionSelected(item.id)"
      :section="select"
      @closed="activeSection = null"
    >
      <main-title :data="item.data.titleData" />
    </section-historic>
  </q-card>
</template>

<script setup>
import { computed, defineComponent, ref } from 'vue'
import SectionHistoric from 'src/components/LandingPage/SectionHistoric.vue'
import MainTitle from 'src/components/Form/LandingPage/MainTitle.vue'

defineComponent({
  name: 'HistoricEditLayout',
})
// Seu código aqui
const activeSection = ref(null)
const select = ref(false)
const listView = ref('Selecione uma Seção')

const actionSelected = (id) => {
  console.log('Selected section ID:', id)
  activeSection.value = id
}

const selectSection = (value) => {
  let lista = []
  if (value === 'Seção Principal') {
    lista = listHistoric.filter((item) => item.filter === 'Seção Principal')
  } else if (value === 'Segunda Seção') {
    lista = listHistoric.filter((item) => item.filter === 'Segunda Seção')
  } else {
    lista = [...listHistoric] // Reset to original list
  }
  return lista
}

const selectList = computed(() => selectSection(listView.value))

const listHistoric = [
  {
    id: 1,
    date: '21/06/2025 10:24',
    description: 'Edições publicadas!',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'approved',
    icon: 'IconRocket',
    color: '#52C41A',
    avatarColor: 'green-11',
    filter: 'Seção Principal',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
  {
    id: 2,
    date: '21/06/2025 10:24',
    description: 'Edições Aprovadas!',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'approved',
    icon: 'IconFileCheck',
    color: '#52C41A',
    avatarColor: 'green-11',
    filter: 'Seção Principal',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
  {
    id: 3,
    date: '21/06/2025 10:24',
    description: 'Enviado para Revisão e Aprovação!',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'approved',
    icon: 'IconFileSearch',
    color: 'grey',
    avatarColor: 'grey-11',
    filter: 'Segunda Seção',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
  {
    id: 4,
    date: '19/06/2025 10:24',
    description: '5 campos editados',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'pending',
    icon: 'IconEdit',
    color: 'grey',
    avatarColor: 'grey-11',
    filter: 'Seção Principal',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
  {
    id: 5,
    date: '19/06/2025 10:24',
    description: 'Edições Reprovadas!',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'rejected',
    icon: 'iconFileAlert',
    color: 'red',
    avatarColor: 'red-2',
    filter: 'Segunda Seção',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
  {
    id: 6,
    date: '21/06/2025 10:24',
    description: 'Enviado para Revisão e Aprovação!',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'approved',
    icon: 'IconFileSearch',
    color: 'grey',
    avatarColor: 'grey-11',
    filter: 'Segunda Seção',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
  {
    id: 7,
    date: '21/06/2025 10:24',
    description: '3 campos editados',
    user: {
      name: 'João',
      role: 'Assessor',
    },
    status: 'pending',
    icon: 'IconEdit',
    color: 'grey',
    avatarColor: 'grey-11',
    filter: 'Segunda Principal',
    data: {
      parametersData: {
        styleBackground: 'color',
        background: '#ffffff',
        layout: 'text-imagem',
        alignImage: 'left',
      },
      titleData: {
        text: 'Título Principal',
        tipografia: 'Arial',
        pesoText: 'bold',
        tamanhoText: '24px',
        corTexto: '#ffffff',
        textAlign: 'left',
      },
      buttonData: {
        text: 'Aqui vem o texto do botão',
        link: 'external',
        corTexto: '#FFFFFF',
        background: '#00A3FF',
      },
    },
  },
]
</script>

<style scoped>
/* Seus estilos aqui */
</style>
