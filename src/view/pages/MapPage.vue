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
          <q-btn flat label="Aceptar" color="yellow-9" @click="confirmResetAction" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, watch } from 'vue' // Importar watch
import mapComposable from '@composables/map'
import locationComposable from '@composables/location'
import useTabsComposable from '@composables/tabs'
import routeComposable from '@composables/route' // Importar routeComposable

const MenuDialogsOptionsMap = defineAsyncComponent(
  () => import('@modules/map/MenuDialogsOptionsMap.vue'),
)

const {
  saveStateToLocalStorage,
  resetMapState,
  initMap,
  hasMapElements,
  map, // Exponer map para invalidar tamaño
} = mapComposable()

// Inicializar routeComposable
const { updateRoute, startPos, endPos } = routeComposable()

const { getCurrentLocation } = locationComposable
const { tabs } = useTabsComposable()

const obtenerUbicacionConPersistencia = async () => {
  await getCurrentLocation()
  saveStateToLocalStorage() // Considerar si esto debe llamar a updateRoute también
}
const confirmReset = ref(false)

const confirmResetAction = () => {
  resetMapState()
}

onMounted(() => { // Hacer onMounted async
  if (tabs.select === 'map') {
    initMap() // Llamar sin await
  }
})

// Observar cambios en la pestaña seleccionada
watch(
  () => tabs.select,
  async (newTab) => {
    if (newTab === 'map') {
      // Esperar un ciclo de renderizado para asegurar que el div del mapa esté visible
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (map) { // Acceder directamente a map
        map.invalidateSize() // Ajustar tamaño del mapa
      }
      // Si no hay mapa inicializado aún (podría pasar si se cambia rápido)
      if (!map) { // Acceder directamente a map
         initMap() // Llamar sin await
      } else if (startPos.value && endPos.value) {
        // Si ya hay puntos, intentar redibujar la ruta
        await updateRoute()
      }
    }
  },
)
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
