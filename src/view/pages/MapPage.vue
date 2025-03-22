<template>
  <div class="fixed top-13 w-full h-screen">
    <div id="map" class="h-screen w-full"></div>
    <q-btn
      class="q-ma-md fixed top-9 -right-3 z-1000 text-grey-8 !shadow-0 opacity-70"
      @click="obtenerUbicacion"
      label="Obtener Ubicación"
      icon="my_location"
      color="white"
      unelevated
    />

    <div class="fixed bottom-18 right-3 z-1000 flex flex-col gap-2">
      <q-btn round color="white" icon="apps" text-color="yellow-9">
        <MenuDialogsOptionsMap/>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue'
import mapComposable from '@composables/map'

const MenuDialogsOptionsMap = defineAsyncComponent(()=> import('@modules/map/MenuDialogsOptionsMap.vue'))

const { obtenerUbicacion, initMap } = mapComposable()

onMounted(() => {
  initMap()
})
</script>

<style>
.custom-popup .leaflet-popup-content {
  min-width: 180px;
  padding: 8px;
}

.z-1000 {
  z-index: 1000;
}
</style>
