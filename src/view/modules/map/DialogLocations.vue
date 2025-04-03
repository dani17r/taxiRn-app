<template>
  <q-dialog v-model="modelValue" full-width class="backdrop-blur-[3px]">
    <q-card class="bg-one !shadow-none">
      <q-toolbar>
        <q-icon name="pin_drop" size="25px" />
        <q-toolbar-title>Ubicaciones</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-item
          clickable
          @click="dialogs.saveLocation.toggle()"
          :disable="!isStartPos || isLocalitacionExist"
        >
          <q-item-section class="block">
            <q-icon name="save" class="mr-3" size="17px" />
            <q-item-label class="inline">Guardar Ubicación actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dialogs.viewLocations.toggle()" :disable="!location.data.length">
          <q-item-section class="block">
            <q-icon name="visibility" class="mr-3" size="17px" />
            <q-item-label class="inline">Ver mis Ubicaciones</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-item clickable @click="deleteCurrentLocationExists" :disable="!isStartPos || !isLocalitacionExist || isRoute">
          <q-item-section class="block">
            <q-icon name="delete" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Ubicación Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="dialogs.deleteAllLocations.toggle()"
          :disable="location.data.length <= 1"
        >
          <q-item-section class="block">
            <q-icon name="delete_forever" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Todas las Ubicaciones</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.viewLocations.value" full-width full-height class="backdrop-blur-[3px]">
    <q-card class="bg-one !shadow-none">
      <q-toolbar>
        <q-icon name="pin_drop" size="25px" />
        <q-toolbar-title>Mis Ubicaciones</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-list class="flex gap-4">
          <q-item
            v-for="(loc, index) in location.data"
            @click="getLocation(loc)"
            v-close-popup
            :key="index"
            clickable
            :class="[loc.id == location.current?.id ? 'bg-yellow-8' : '', '!rounded-lg w-full']"
          >
            <q-item-section class="block">
              <q-icon name="person_pin_circle" class="mr-1" size="28px" />
              <q-item-label class="inline text-xl">{{ loc.name }}</q-item-label>
              <q-item-label caption>
                Creado el:
                {{ formatCustomDate(String(loc.created_at)) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.saveLocation.value" full-width class="backdrop-blur-[3px]">
    <q-card class="bg-one !shadow-none">
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

  <q-dialog v-model="dialogs.deleteAllLocations.value" class="backdrop-blur-[3px]">
  <q-card class="bg-one !shadow-none">
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
import locationComposable from '@composables/map/useLocation'
import useStateMapComposable from '@composables/map/state'
import { formatCustomDate } from '@helpers/dateTime'
import supabase from '@services/supabase.services'
import superComposable from '@composables/super'
import { reactive, ref, onMounted } from 'vue'
import { required } from '@utils/validations'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const { store } = superComposable()
const {
  deleteCurrentLocation,
  getLocations,
  saveLocation,
  getLocation,
 location,
 isLocalitacionExist
} = locationComposable()

const { isStartPos, isRoute } = useStateMapComposable()

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

const deleteAllLocations = async () => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('user_id', store.auth.current?.id);

  if (!error) {
    location.data = [];
    location.current = null;
    $q.notify({
      message: 'Todas las ubicaciones eliminadas',
      type: 'positive'
    });
  }
};

const validateAndSave = async () => {
  if (name.value) {
    await saveLocation(name.value).then(() => {
      modelValue.value = false
      dialogs.saveLocation.toggle()
      name.value = ''
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
  await getLocations()
})
</script>
