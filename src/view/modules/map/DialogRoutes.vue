<template>
  <q-dialog v-model="modelValue" full-width>
    <q-card>
      <q-toolbar>
        <q-icon name="map" size="25px" />
        <q-toolbar-title>Rutas</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-item
          clickable
          @click="dialogs.saveRoute.toggle()"
          :disable="!currentRoute || !thereIsNoRoute"
        >
          <q-item-section class="block">
            <q-icon name="save" class="mr-3" size="17px" />
            <q-item-label class="inline">Guardar Ruta Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dialogs.viewRoute.toggle()" :disable="!savedRoutes.length">
          <q-item-section class="block">
            <q-icon name="visibility" class="mr-3" size="17px" />
            <q-item-label class="inline">Ver mis Rutas</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="deleteCurrentRouteExists"
          :disable="!currentRoute || thereIsNoRoute"
        >
          <q-item-section class="block">
            <q-icon name="delete" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Ruta Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="dialogs.deleteAllRoutes.toggle()"
          :disable="!savedRoutes.length"
        >
          <q-item-section class="block">
            <q-icon name="delete_forever" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Todas las Rutas</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.viewRoute.value" full-width full-height>
    <q-card>
      <q-toolbar>
        <q-icon name="map" size="25px" />
        <q-toolbar-title>Mis Rutas</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col">
        <q-list class="flex gap-">
          <q-item
            v-for="(route, index) in savedRoutes"
            @click="loadRoute(route)"
            v-close-popup
            :key="index"
            clickable
            :class="[currentRoute?.id == route.id ? 'bg-yellow-8' : '', '!rounded-lg w-full']"
          >
            <q-item-section class="block">
              <q-icon name="public" class="mr-1" size="28px" />
              <q-item-label class="inline text-xl">{{ route.name }}</q-item-label>
              <q-item-label caption>
                Creado el:
                {{ String(route.path) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogs.saveRoute.value" full-width>
    <q-card>
      <q-toolbar>
        <q-icon name="add" size="25px" color="yellow-9" />
        <q-toolbar-title>Nueva Ruta</q-toolbar-title>
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

  <q-dialog v-model="dialogs.deleteAllRoutes.value">
    <q-card>
      <q-toolbar>
        <q-icon name="warning" color="red" size="25px" />
        <q-toolbar-title>Confirmar</q-toolbar-title>
      </q-toolbar>

      <q-card-section> ¿Estás seguro de eliminar todas las rutas? </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn flat label="Eliminar" color="red" @click="deleteAllRoutes()" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import supabase from '@services/supabase.services'
import superComposable from '@composables/super'
import { onMounted, reactive, ref } from 'vue'
import { required } from '@utils/validations'
import routeComposable from '@composables/route'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const { store } = superComposable()
const { thereIsNoRoute, currentRoute, saveRoute, savedRoutes, loadRoute, deleteRoute, loadSavedRoutes } = routeComposable()

const modelValue = defineModel({ type: Boolean, default: false })
const title = ref('')

const dialogs = reactive({
  saveRoute: {
    value: false,
    toggle: () => (dialogs.saveRoute.value = !dialogs.saveRoute.value),
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

const deleteAllRoutes = async () => {
  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('user_id', store.auth.current?.id);

  if (!error) {
    savedRoutes.value = [];
    currentRoute.value = null;
    $q.notify({
      message: 'Todas las rutas eliminadas',
      type: 'positive'
    });
  }
};

const validateAndSave = () => {
  if (title.value) {
    saveRoute(title.value)
    
      $q.notify({
        message: 'Ruta guardada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
      dialogs.saveRoute.toggle()
  }
}

const deleteCurrentRouteExists = () => {
  deleteRoute()
    $q.notify({
      message: 'Ruta Eliminada con existo',
      icon: 'check',
      type: 'positive',
    })
    modelValue.value = false
}

onMounted(() => {
  loadSavedRoutes()
})
</script>
