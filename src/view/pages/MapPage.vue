<template>
  <q-page class="fixed left-0 top-13 w-full h-screen mobile-keyboard-fix">
    <div id="map" class="h-screen w-full"></div>

    <q-btn
      round
      color="red"
      icon="close"
      class="fixed bottom-32 right-3 z-1000"
      @click="dialogs.resetMap.togle()"
      :disable="!isLocation && !isRoute && !isEndPos"
    />

    <q-btn
      class="q-ma-md fixed top-9 -right-3 z-1000 text-grey-8 !shadow-0 opacity-70"
      :disable="disbleButtonLocation"
      @click="getCurrentLocationAction"
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

    <q-dialog v-model="dialogs.resetMap.value" class="backdrop-blur-[3px]">
      <q-card>
        <q-card-section class="text-[19px]">
          Se borrara la seleccion actual, estas seguro?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Aceptar" color="yellow-9" @click="resetMap()" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import MenuDialogsOptionsMap from '@modules/map/MenuDialogsOptionsMap.vue'
import useLocationComposable from '@composables/map/useLocation'
import useRouteComposable from '@composables/map/useRoute'
// import useMapStateComposable from '@composables/map/state'
import useMapComposable from '@composables/map/main'
import useTabsComposable from '@composables/tabs'
import { onMounted, reactive } from 'vue'

const { tabs } = useTabsComposable()
const { getCurrentLocation, disbleButtonLocation } = useLocationComposable()
const { initMap, resetMap, isLocation, isEndPos } = useMapComposable()
// const { isStateLocation } = useMapStateComposable()
const { isRoute } = useRouteComposable()

const dialogs = reactive({
  resetMap: {
    value: false,
    togle: () => (dialogs.resetMap.value = !dialogs.resetMap.value),
  },
})

const getCurrentLocationAction = async () => {
  disbleButtonLocation.value = true;

  try {
    await getCurrentLocation();
  } finally {
    setTimeout(() => {
      disbleButtonLocation.value = false;
    }, 1000);
  }
};

onMounted(() => {
  if (tabs.select === 'map') {
    const div = document.querySelector('body>#map');
    if (div) div.remove();
    
    initMap();
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
