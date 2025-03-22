<template>
  <q-menu anchor="bottom start" self="bottom end">
      <q-item clickable @click="dialogs.locations.toggle" v-close-popup>
        <q-item-section class="block">
          <q-icon name="pin_drop" class="mr-3" size="17px" />
          <q-item-label class="inline">Ubicaciones</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="dialogs.routes.toggle" v-close-popup>
        <q-item-section class="block">
          <q-icon name="map" class="mr-3" size="17px" />
          <q-item-label class="inline">Rutas</q-item-label>
        </q-item-section>
      </q-item>
  </q-menu>
  <DialogLocations v-model="dialogs.locations.value"/>
  <DialogRoutes v-model="dialogs.routes.value" />
</template>

<script setup lang="ts">
const DialogLocations = defineAsyncComponent(() => import("@modules/map/DialogLocations.vue"))
const DialogRoutes = defineAsyncComponent(() => import("@modules/map/DialogRoutes.vue"))
import { defineAsyncComponent, reactive } from 'vue'

const dialogs = reactive({
  locations: {
    value: false,
    toggle: () => (dialogs.locations.value = !dialogs.locations.value),
  },
  routes: {
    value: false,
    toggle: () => (dialogs.routes.value = !dialogs.routes.value),
  },
})
</script>
