<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent">
      <q-toolbar class="z-[1000]">
        <q-toolbar-title class="text-gray-600">
          <q-img
            src="~/assets/taxirn-lg.svg"
            position="top"
            height="40px"
            width="106px"
            alt="Taxi Image"
          />
        </q-toolbar-title>

        <ButtonDarkMode />
      </q-toolbar>
    </q-header>
   
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const ButtonDarkMode = defineAsyncComponent(()=> import('@components/ButtonDarkMode.vue'))
</script>