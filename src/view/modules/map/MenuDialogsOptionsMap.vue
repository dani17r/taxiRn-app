<template>
  <q-menu anchor="bottom start" self="bottom end" class="flex flex-col self-center bg-one">
      <q-item clickable @click="dialogs.locations.toggle" v-close-popup>
        <q-item-section class="inline-block self-center">
          <q-icon name="pin_drop" class="mr-2" size="17px" />
          <q-item-label class="inline">Ubicaciones</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="dialogs.routes.toggle" v-close-popup>
        <q-item-section class="inline-block self-center">
          <q-icon name="map" class="mr-2" size="17px" />
          <q-item-label class="inline">Rutas</q-item-label>
        </q-item-section>
      </q-item>
  </q-menu>
  <DialogLocations v-model="dialogs.locations.value"/>
  <DialogRoutes v-model="dialogs.routes.value" />
</template>

<script setup lang="ts">
import DialogLocations from "@modules/map/DialogLocations.vue"
import DialogRoutes from "@modules/map/DialogRoutes.vue"
import { reactive } from 'vue'

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
