<template>
  <q-page class="TransctionPage">
    <title-page title="Edição de Landing Page">
      <section-header />
    </title-page>
    <div class="row q-pa-md q-gutter-md">
      <div class="col-6">
        <section-layout />
      </div>
      <div class="col"><preview-layout /></div>
    </div>
  </q-page>
</template>
<script setup>
import TitlePage from 'src/components/TitlePage.vue'
import PreviewLayout from 'src/layouts/LandingPage/PreviewLpLayout.vue'
import SectionLayout from 'src/layouts/LandingPage/SectionLPLayout.vue'
import SectionHeader from 'src/components/LandingPage/SectionHeader.vue'
</script>
