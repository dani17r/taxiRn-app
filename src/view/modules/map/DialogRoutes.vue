<template>
  <q-dialog v-model="modelValue" full-width class="backdrop-blur-[3px]">
    <q-card>
      <q-toolbar>
        <q-icon name="map" size="25px" />
        <q-toolbar-title>Rutas</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <!-- Guardar Ruta Actual: Disable if no route OR if it's already in DB -->
        <q-item
          clickable
          @click="dialogs.saveRoute.toggle()"
        >
          <q-item-section class="block">
            <q-icon name="save" class="mr-3" size="17px" />
            <q-item-label class="inline">Guardar Ruta Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dialogs.viewRoute.toggle()" :disable="!route.data.length">
          <q-item-section class="block">
            <q-icon name="visibility" class="mr-3" size="17px" />
            <q-item-label class="inline">Ver mis Rutas</q-item-label>
          </q-item-section>
        </q-item>
        <!-- Borrar Ruta Actual: Disable if no route OR if it's temporary/not in DB -->
        <q-item
          clickable
          @click="deleteCurrentRouteWrapper"
        >
          <q-item-section class="block">
            <q-icon name="delete" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Ruta Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="dialogs.deleteAllRoutes.toggle()"
          :disable="!route.data.length"
        >
          <q-item-section class="block">
            <q-icon name="delete_forever" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Todas las Rutas</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.viewRoute.value" full-width full-height class="backdrop-blur-[3px]">
    <q-card>
      <q-toolbar>
        <q-icon name="map" size="25px" />
        <q-toolbar-title>Mis Rutas</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-list class="flex flex-col gap-2"> <!-- Changed to flex-col -->
          <q-item
            v-for="(rou) in route.data"
            @click="loadRouteWrapper(rou)"
            v-close-popup
            :key="rou.id"
            clickable
            :class="[route.current?.id == rou.id ? 'bg-yellow-8' : '', '!rounded-lg w-full']"
          >
            <q-item-section class="block">
              <q-icon name="route" class="mr-1" size="28px" />
              <q-item-label class="inline text-xl">{{ rou.name || 'Ruta sin nombre' }}</q-item-label>
              <q-item-label caption>
                Creado el:
                {{ formatDate(rou.created_at) }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="!route.data.length">
             <q-item-section class="text-center text-grey-7">No tienes rutas guardadas.</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.saveRoute.value" full-width class="backdrop-blur-[3px]">
    <q-card>
      <q-toolbar>
        <q-icon name="save" size="25px" color="yellow-9" />
        <q-toolbar-title>Guardar Ruta</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-input
          v-model="title"
          label="Nombre de la Ruta"
          aria-placeholder="Ej: Casa al Trabajo"
          :rules="[required]"
          class="mb-4"
          autogrow
        />
         <q-input
          v-model="description"
          label="Descripción (Opcional)"
          aria-placeholder="Descripción breve"
          class="mb-8"
          autogrow
          type="textarea"
        />
        <q-btn
          color="yellow-9"
          icon="check"
          label="Guardar"
          :disable="!title.length"
          @click="validateAndSave"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.deleteAllRoutes.value" class="backdrop-blur-[3px]">
    <q-card>
      <q-toolbar>
        <q-icon name="warning" color="red" size="25px" />
        <q-toolbar-title>Confirmar Eliminación Total</q-toolbar-title>
      </q-toolbar>

      <q-card-section> ¿Estás seguro de que deseas eliminar TODAS tus rutas guardadas? Esta acción no se puede deshacer. </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn flat label="Eliminar Todo" color="red" @click="deleteAllRoutes" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import supabase from '@services/supabase.services'
import superComposable from '@composables/super'
import { onMounted, reactive, ref } from 'vue'
import { required } from '@utils/validations'
import routeComposable from '@composables/map/useRoute'
import { useQuasar, date, Loading } from 'quasar' // Import date and Loading
import type { RouteI } from '@interfaces/route' // Import RouteI type

const $q = useQuasar()

const { store } = superComposable()
const { route } = routeComposable()

const modelValue = defineModel({ type: Boolean, default: false })
const title = ref('')
const description = ref('') // Added description ref

const dialogs = reactive({
  saveRoute: {
    value: false,
    toggle: () => dialogs.saveRoute.value = !dialogs.saveRoute.value,
  },
  viewRoute: {
    value: false,
    toggle: () => (dialogs.viewRoute.value = !dialogs.viewRoute.value),
  },
  deleteAllRoutes: {
    value: false,
    toggle: () => (dialogs.deleteAllRoutes.value = !dialogs.deleteAllRoutes.value),
  },
})

// Wrapper for loadRoute to potentially add logic later
const loadRouteWrapper = (route: RouteI) => {
  console.log(route)

}

const deleteAllRoutes = async () => {
  try {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('user_id', store.auth.current?.id) // Ensure user_id matches

    if (error) throw error

    // Clear local state after successful deletion
    // savedRoutes.value = []
    // if (currentRoute.value && !currentRoute.value.id.startsWith('temp-')) {
    //    currentRoute.value = null;
    // }

    $q.notify({
      message: 'Todas las rutas han sido eliminadas.',
      type: 'positive',
      icon: 'delete_forever',
    })
  } catch (error) {
    console.error('Error deleting all routes:', error)
    $q.notify({
      message: `Error al eliminar rutas: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      type: 'negative',
      icon: 'warning',
    })
  } finally {
    Loading.hide()
  }
}

const validateAndSave = async () => {
  // if (!title.value) {
  //    $q.notify({ message: 'Por favor, ingresa un nombre para la ruta.', type: 'warning'})
  //    return;
  // }

  // await saveRoute(title.value, description.value)

     
    //  modelValue.value = false 
    //  dialogs.saveRoute.value = false
    //  title.value = ''
    //  description.value = ''
  
}

// Renamed function and made async
const deleteCurrentRouteWrapper = async () => {
  // Call the async deleteCurrentRoute from the composable
  // await deleteCurrentRoute()
  // Notification and state clearing are handled within deleteCurrentRoute

  // Optionally close the main dialog
  // modelValue.value = false
}

// Helper to format date
const formatDate = (dateInput: Date | string | number): string => {
  return date.formatDate(dateInput, 'DD/MM/YYYY HH:mm')
}

onMounted(async () => {
  // Initialize routes when component mounts
  // await initializeRoutes()
})
</script>
