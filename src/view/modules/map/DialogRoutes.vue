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
           :disable="!isRoute || !!currentRoute || !thereIsNoRoute"
        >
          <q-item-section class="block">
            <q-icon name="save" class="mr-3" size="17px" />
            <q-item-label class="inline">Guardar Ruta Actual</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dialogs.viewRoute.toggle()" :disable="!rutasGuardadas.length">
          <q-item-section class="block">
            <q-icon name="visibility" class="mr-3" size="17px" />
            <q-item-label class="inline">Ver mis Rutas</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="deleteCurrentRouteExists" :disable="!currentRoute || thereIsNoRoute">
          <q-item-section class="block">
            <q-icon name="delete" class="mr-3" size="17px" />
            <q-item-label class="inline">Borrar Ruta Actual</q-item-label>
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
            v-for="(route, index) in rutasGuardadas"
            @click="cargarRuta(route)"
            v-close-popup
            :key="index"
            clickable
            :class="[currentRoute?.id == route.id ? 'bg-yellow-8' : '', '!rounded-lg w-full']"
          >
            <q-item-section class="block ">
              <q-icon name="public" class="mr-1" size="28px" />
              <q-item-label class="inline text-xl">{{ route.route_name }}</q-item-label>
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
</template>

<script setup lang="ts">
import mapComposable from '@composables/map'
import { required } from '@utils/validations';
import { onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar'

const $q = useQuasar()

const { 
  thereIsNoRoute, 
  isRoute, 
  currentRoute, 
  rutasGuardadas,
  cargarRutasGuardadas,
  guardarRuta,
  cargarRuta,
  borrarRuta,
} = mapComposable()

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
})

const validateAndSave = async () => {
  if (title.value) {
    await guardarRuta(title.value).then(() => {
      $q.notify({
        message: 'Ruta guardada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
      dialogs.saveRoute.toggle()
    })
  }
}

const deleteCurrentRouteExists = async () => {
    await borrarRuta().then(() => {
      $q.notify({
        message: 'Ruta Eliminada con existo',
        icon: 'check',
        type: 'positive',
      })
      modelValue.value = false
    })
}


onMounted(async () => {
  await cargarRutasGuardadas()
})
</script>
