<template>
     <q-dialog v-model="valueModel" full-width full-height maximized>
      <q-card class="!shadow-none">
        <q-toolbar>
        <q-toolbar-title></q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

        <q-card-section>
          <div class="text-[22px]">Contratar a <b>{{ driver?.fullname }}</b></div>
        </q-card-section>

        <q-card-section>
          <div class="column q-gutter-md">
            <!-- Opciones de Ubicación/Ruta -->
            <div class="text-subtitle2">Ubicación/Ruta</div>
            <q-btn
              label="Usar Ubicación Actual"
              color="yellow-8"
              icon="my_location"
              outline
              no-caps
              @click="useCurrentLocation"
            />
            {{ hasMapElements }} {{ currentLocation != null }}
            <!-- Aquí podrías mostrar la ubicación/ruta seleccionada -->
            <div v-if="selectedLocationInfo" class="text-caption text-grey">
              {{ selectedLocationInfo }}
            </div>

            <!-- Descripción del Servicio -->
            <q-input
              v-model="serviceDescription"
              label="Detalles de ubicacion"
              type="textarea"
              autogrow
            />

            <!-- Tipo de Servicio -->
            <q-select
              v-model="serviceType"
              :options="serviceTypeOptions"
              label="Tipo de Servicio"
              map-options
              emit-value
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="m-2">
          <q-btn label="Cancelar" color="negative" flat v-close-popup />
          <q-btn
            label="Enviar Contrato"
            color="bg-yellow-10"
            class="bg-yellow-10"
            @click="sendContract"
            :disable="!canSendContract"
            unelevated
            v-close-popup
          />
        </q-card-actions>
      </q-card>

    </q-dialog>
    <div id="dialogmap"></div>
</template>

<script setup lang="ts">
// import { supabase } from '@services/supabase.services'
import useLocationComposable from '@composables/location'
import useTabsComposable from '@composables/tabs'
import useMapComposable from '@composables/map'
import type { DriverT } from '@interfaces/user'
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const { hasMapElements,initMap } = useMapComposable()
const { currentLocation  } = useLocationComposable
const { tabs } = useTabsComposable()

const valueModel = defineModel({ default: false });
const props = defineProps<{ driver: DriverT|null }>()

const serviceDescription = ref('')
const serviceType = ref<string | null>(null)
const selectedLocationInfo = ref<string | null>(null) 

const serviceTypeOptions = [
  { label: 'Delivery', value: 'delivery' },
  { label: 'Traslado', value: 'transfer' },
  { label: 'Envío de Paquete', value: 'package_delivery' },
]

// Lógica del Modal
const canSendContract = computed(() => {
  return !!serviceType.value && !!selectedLocationInfo.value
})


const useCurrentLocation = () => {
  
}

const sendContract = () => {
  if (!canSendContract.value) return

  $q.notify({
    type: 'positive',
    message: `Contrato enviado para ${props.driver?.fullname}`,
  })

  // Resetear modal
  resetModal()
}

onMounted(()=> {
  if(tabs.select == 'map') {
  initMap('dialogmap')
  }
})

const resetModal = () => {
  serviceDescription.value = ''
  serviceType.value = null
  selectedLocationInfo.value = null
}

</script>

