<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <div id="map" class="h-screen w-full"></div>

    <q-btn
      round
      color="red"
      icon="close"
      class="fixed bottom-32 right-3 z-1000"
      @click="confirmReset = true"
      v-if="hasMapElements"
    />
    <q-btn
      class="q-ma-md fixed top-9 -right-3 z-1000 text-grey-8 !shadow-0 opacity-70"
      @click="obtenerUbicacionConPersistencia"
      label="Obtener Ubicación"
      icon="my_location"
      color="white"
      unelevated
    />

    <div class="fixed bottom-18 right-3 z-1000 flex flex-col gap-2">
      <q-btn round color="white" icon="apps" text-color="yellow-9">
        <MenuDialogsOptionsMap />
      </q-btn>
    </div>

    <q-dialog v-model="confirmReset">
      <q-card>
        <q-card-section class="text-[19px]">
          Esto borrara cualquier ubicacion o ruta, esta seguro?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            label="Aceptar"
            color="yellow-9"
            @click="confirmResetAction"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onActivated, onMounted, ref } from 'vue'
import mapComposable from '@composables/map'
import routeComposable from '@composables/route'
import locationComposable from '@composables/location'

const MenuDialogsOptionsMap = defineAsyncComponent(() =>
  import('@modules/map/MenuDialogsOptionsMap.vue'),
)

const {
  saveStateToLocalStorage,
  resetMapState,
  loadStateFromLocalStorage,
  initMap,
  map,
  hasMapElements,
} = mapComposable()
const { updateRoute } = routeComposable()
const locationComposableInstance = locationComposable
const { getCurrentLocation } = locationComposableInstance

const obtenerUbicacionConPersistencia = async () => {
  await getCurrentLocation()
  saveStateToLocalStorage()
}
const confirmReset = ref(false)

const confirmResetAction = () => {
  resetMapState()
}

onMounted(() => {
  initMap()

  if (map) {
    map?.invalidateSize()
  }

  // Load last location from local storage
  void loadStateFromLocalStorage()
})

onActivated(() => {
  void updateRoute(map)
  if (map) {
    loadStateFromLocalStorage()
    map?.invalidateSize() // Asegurar redimensionamiento
  }
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
