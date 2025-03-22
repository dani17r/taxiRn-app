<template>
  <q-dialog v-model="modelValue" full-width>
    <q-card>
      <q-toolbar>
        <q-icon name="pin_drop" size="25px" />
        <q-toolbar-title>Ubicaciones</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-item
          clickable
          @click="dialogs.saveLocation.toggle()"
           :disable="!isLocation || !!currentLocation || !thereIsNoLocalization"
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
        <q-item clickable @click="deleteCurrentLocationExists" :disable="!isLocation || !currentLocation || thereIsNoLocalization">
          <q-item-section class="block">
            <q-icon name="delete" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Ubicación Actual</q-item-label>
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
            @click="loadingLocation(location)"
            v-close-popup
            :key="index"
            clickable
            :class="[currentLocation?.id == location.id ? 'bg-yellow-8' : '', '!rounded-lg w-full']"
          >
            <q-item-section class="block">
              <q-icon name="person_pin_circle" class="mr-1" size="28px" />
              <q-item-label class="inline text-xl">{{ location.title }}</q-item-label>
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
          v-model="title"
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
          :disable="!title.length"
          @click="validateAndSave()"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { formatCustomDate } from '@helpers/dateTime'
import { reactive, ref, onMounted } from 'vue'
import { required } from '@utils/validations'
import mapComposable from '@composables/map'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const {
  borrarcurrentLocation,
  loadingLocations,
  loadingLocation,
  saveLocation,
  thereIsNoLocalization,
  currentLocation,
  isLocation,
  locations,
} = mapComposable()

const modelValue = defineModel({ type: Boolean, default: false })

const title = ref('')

const dialogs = reactive({
  viewLocations: {
    value: false,
    toggle: () => (dialogs.viewLocations.value = !dialogs.viewLocations.value),
  },
  saveLocation: {
    value: false,
    toggle: () => (dialogs.saveLocation.value = !dialogs.saveLocation.value),
  },
})

const validateAndSave = async () => {
  if (title.value) {
    await saveLocation(title.value).then(() => {
      $q.notify({
        message: 'Ubicacion guardada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
      dialogs.saveLocation.toggle()
    })
  }
}

const deleteCurrentLocationExists = async () => {
    await borrarcurrentLocation().then(() => {
      $q.notify({
        message: 'Ubicacion Eliminada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
    })
}


onMounted(async () => {
  await loadingLocations()
})
</script>
