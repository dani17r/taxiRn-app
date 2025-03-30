<template>
  <q-dialog v-model="modelValue" full-width>
    <q-card>
      <q-toolbar>
        <q-icon name="pin_drop" size="25px" />
        <q-toolbar-title>Ubicaciones</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <!-- Save Location Button Logic:
          - Disabled if no currentLocation is set.
          - Disabled if the currentLocation *is* already in the DB (isCurrentLocationInDB is true).
          - Disabled if there is an active route (hasRoute is true).
        -->
        <q-item
          clickable
          @click="dialogs.saveLocation.toggle()"
          :disable="!currentLocation || isCurrentLocationInDB || hasRoute"
        >
          <q-item-section class="block">
            <q-icon name="save" class="mr-3" size="17px" />
            <q-item-label class="inline">Guardar Ubicación actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dialogs.viewLocations.toggle()" :disable="!locations.length">
          <q-item-section class="block">
            <q-icon name="visibility" class="mr-3" size="17px" />
            <q-item-label class="inline">Ver mis Ubicaciones</q-item-label>
          </q-item-section>
        </q-item>
         <!-- Delete Location Button Logic:
          - Disabled if no currentLocation is set.
          - Disabled if the currentLocation is *not* in the DB (isCurrentLocationInDB is false).
          - Disabled if there is an active route (hasRoute is true).
        -->
        <q-item clickable @click="deleteCurrentLocationExists" :disable="!currentLocation || !isCurrentLocationInDB || hasRoute">
          <q-item-section class="block">
            <q-icon name="delete" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Ubicación Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="dialogs.deleteAllLocations.toggle()"
          :disable="locations.length <= 1"
        >
          <q-item-section class="block">
            <q-icon name="delete_forever" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Todas las Ubicaciones</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.viewLocations.value" full-width full-height>
    <q-card>
      <q-toolbar>
        <q-icon name="pin_drop" size="25px" />
        <q-toolbar-title>Mis Ubicaciones</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-list class="flex gap-4">
          <q-item
            v-for="(location, index) in locations"
            @click="loadLocation(location)"
            v-close-popup
            :key="index"
            clickable
            :class="[currentLocation?.id == location.id ? 'bg-yellow-8' : '', '!rounded-lg w-full']"
          >
            <q-item-section class="block">
              <q-icon name="person_pin_circle" class="mr-1" size="28px" />
              <q-item-label class="inline text-xl">{{ location.name }}</q-item-label>
              <q-item-label caption>
                Creado el:
                {{ formatCustomDate(String(location.created_at)) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.saveLocation.value" full-width>
    <q-card>
      <q-toolbar>
        <q-icon name="add" size="25px" color="yellow-9" />
        <q-toolbar-title>Nueva Ubicacion</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-input
          v-model="name"
          label="Titulo"
          aria-placeholder="Titulo"
          :rules="[required]"
          class="mb-8"
          autogrow
        />
        <q-btn
          color="yellow-9"
          icon="check"
          label="Guardar"
          :disable="!name.length"
          @click="validateAndSave()"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.deleteAllLocations.value">
  <q-card>
    <q-toolbar>
      <q-icon name="warning" color="red" size="25px" />
      <q-toolbar-title>Confirmar</q-toolbar-title>
    </q-toolbar>

    <q-card-section>
      ¿Estás seguro de eliminar todas las ubicaciones?
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" v-close-popup />
      <q-btn
        flat
        label="Eliminar"
        color="red"
        @click="deleteAllLocations()"
        v-close-popup
      />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script setup lang="ts">
import { formatCustomDate } from '@helpers/dateTime'
import supabase from '@services/supabase.services'
import { reactive, ref, computed, onMounted } from 'vue'
import { required } from '@utils/validations'
import locationComposable from '@composables/location'
import superComposable from '@composables/super'
import routeComposable from '@composables/route'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const { store } = superComposable()
// Import the correct reactive state and functions from location.ts
const {
  deleteCurrentLocation,
  initializeLocations, // Use this on mount
  loadLocation,
  saveLocation,
  currentLocation,
  locations,
  isCurrentLocationInDB, // Use this computed property
} = locationComposable
const { currentRoute } = routeComposable()

const modelValue = defineModel({ type: Boolean, default: false })

const name = ref('')

const dialogs = reactive({
  viewLocations: {
    value: false,
    toggle: () => (dialogs.viewLocations.value = !dialogs.viewLocations.value),
  },
  saveLocation: {
    value: false,
    toggle: () => (dialogs.saveLocation.value = !dialogs.saveLocation.value),
  },
  deleteAllLocations: {
    value: false,
    toggle: () => (dialogs.deleteAllLocations.value = !dialogs.deleteAllLocations.value),
  },
})

// Computed property to determine if a route is currently active
const hasRoute = computed(() => !!currentRoute.value)

const deleteAllLocations = async () => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('user_id', store.auth.current?.id);

  if (!error) {
    locations.value = [];
    currentLocation.value = null;
    $q.notify({
      message: 'Todas las ubicaciones eliminadas',
      type: 'positive'
    });
  }
};

const validateAndSave = async () => {
  if (name.value) {
    await saveLocation(name.value).then(() => {
      $q.notify({
        message: 'Ubicacion guardada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
      dialogs.saveLocation.toggle()
      name.value = '' // Clear name after saving
    })
  }
}

const deleteCurrentLocationExists = async () => {
    await deleteCurrentLocation().then(() => {
      $q.notify({
        message: 'Ubicacion Eliminada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
    })
}

onMounted(async () => {
  // Initialize locations when the component mounts
  await initializeLocations()
})
</script>
