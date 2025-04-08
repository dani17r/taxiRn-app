<template>
  <q-dialog v-model="valueModel" full-width class="backdrop-blur-[3px]">
    <q-card class="!shadow-none bg-one h-screen">
      <q-toolbar>
        <q-toolbar-title></q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup @click="reset"/>
      </q-toolbar>

      <q-card-section>
        <div class="text-[22px]">
          Contratar a <b>{{ driver?.fullname }}</b>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <!-- Opciones de Ubicación/Ruta -->
          <div class="text-subtitle2">Ubicación/Ruta</div>
          <q-btn
            :label="isRoute ? 'Usar Ruta Actual' : 'Usar Ubicación Actual'"
            color="yellow-8"
            icon="my_location"
            :class="selectLocationOrRoute.status ? 'bg-yellow-8 !text-white' : ''"
            outline
            no-caps
            @click="useCurrentLocation"
          />
          <div class="text-caption text-grey" v-if="selectLocationOrRoute.status">
            {{ selectLocationOrRoute.select }}
          </div>

          <!-- Descripción del Servicio -->
          <q-input
            v-model="contract.description"
            label="Detalles necesarios"
            type="textarea"
            color="yellow-9"
            autogrow
          />

          <!-- Tipo de Servicio -->
          <q-select
            v-model="contract.service_type"
            :options="service_type.data"
            label="Tipo de Servicio"
            map-options
            emit-value
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="m-2 absolute bottom-0 right-0">
        <q-btn label="Cancelar" flat v-close-popup @click="reset"/>
        <q-btn
          label="Gestionar Contrato"
          color="bg-yellow-9"
          class="bg-yellow-9"
          @click="sendContract"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { ContractInputsI, ServiceTypeI } from '@interfaces/contract'
import useMapLocationComposable from '@composables/map/useLocation'
import useMapRouteComposable from '@composables/map/useRoute'
import useMapStateComposable from '@composables/map/state'
import useMapComposable from '@composables/map/main'
import useSuperComposable from '@composables/super'
import supabase from '@services/supabase.services'
import useTabsComposable from '@composables/tabs'
import type { DriverT } from '@interfaces/user'
import { ref, onMounted, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { omit } from 'lodash'

const $q = useQuasar()
const { isStateLocation, isLocation, isRoute, isStateRoute, route, location } =
  useMapStateComposable()
const { getLocations } = useMapLocationComposable()
const { getRoutes } = useMapRouteComposable()
const { map, initMap } = useMapComposable()
const { tabs } = useTabsComposable()
const { store } = useSuperComposable()

const valueModel = defineModel({ default: false })
const props = defineProps<{ driver: DriverT | null }>()

const selectLocationOrRoute = reactive({
  status: false,
  select: '',
})

const selectType = ref<'location_id' | 'route_id'>('location_id')

const service_type = reactive({
  data: [
    { label: 'Delivery', value: 'delivery' },
    { label: 'Traslado Personal', value: 'taxi' },
    { label: 'Ambos', value: 'both' },
  ],
  value: '' as ServiceTypeI,
})

const contract = ref<ContractInputsI['CreateI']>({
  service_type: service_type.value,
  created_at: new Date(),
  description: '',
  location_id: '',
  vehicle_id:  String(props.driver?.vehicle?.id),
  client_id: String(store.auth.current?.id),
  route_id: '',
})

const useCurrentLocation = () => {
  if (!isLocation.value && !isRoute.value) {
    $q.dialog({
      title: 'Ubicación Actual',
      message: 'NO TIENES RUTA NI UBICACION MARCADA',
      cancel: false,
      color: 'yellow-9',
      class:'!shadow-none bg-one',
    })
    return
  }

  if (isLocation.value) {
    if (isStateLocation.value) {
      selectLocationOrRoute.status = true
      selectLocationOrRoute.select = String(location.current?.name)
      contract.value.location_id = String(location.current?.id)
      contract.value = omit(contract.value, 'route_id')
      selectType.value = 'location_id'
      return
    }

    $q.dialog({
      title: 'Ubicación Actual',
      message: 'Debes guardar primero la Ubicacion. Ve al mapa y guardala.',
      cancel: false,
      color: 'yellow-9',
      class:'!shadow-none bg-one',
    })
    selectLocationOrRoute.status = false
  }

  if (isRoute.value) {
    if (isStateRoute.value) {
      selectLocationOrRoute.status = true
      selectLocationOrRoute.select = String(route.current?.name)
      contract.value.route_id = String(route.current?.id)
      contract.value = omit(contract.value, 'location_id')
      selectType.value = 'route_id'
      return
    }

    $q.dialog({
      title: 'Ruta Actual',
      message: 'Debes guardar primero la ruta. Ve al mapa y guardala.',
      cancel: false,
      color: 'yellow-9',
      class:'!shadow-none bg-one',
    })
    selectLocationOrRoute.status = false
  }

}

const sendContract = async () => {
  console.log(contract.value)
  if(!contract.value[selectType.value] || !contract.value.service_type){
    return $q.notify({
        type: 'negative',
        message: `Porfavor completa los campos.`,
      })
  }
  try {
    
    const { data, error } = await supabase
    .from('contracts')
    .insert([
      { ...contract.value }
    ])
    .select()

    if(error) throw error

    if (data) {
       $q.notify({
        type: 'positive',
        message: `Contrato enviado para ${props.driver?.fullname}`,
      })

      $q.dialog({
        title: 'Contrato enviado',
        message: 'Esperar el precio del conductor para aceptar o rechazar el contrato. Puedes ir a la badeja de contratos.',
        cancel: false,
        color: 'yellow-9',
        class:'!shadow-none bg-one',
      }).onOk(()=> valueModel.value = false)
    }
   }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error:any) {
     $q.notify({
    type: 'negative',
    message: error.message,
  })
  }

  reset()
}

onMounted(async () => {
  if (tabs.select == 'vehicles') {
    contract.value.client_id = String(store.auth.current?.id)

    if (!map.value) {
      if (location.data.length === 0) await getLocations()
      if (route.data.length === 0) await getRoutes()
      setTimeout(() => initMap(), 400)
    }
  }
})

const reset = () => {
  contract.value.service_type = service_type.value
  contract.value.created_at = new Date()
  selectLocationOrRoute.status = false
  selectLocationOrRoute.select = ''
  contract.value.description = ''
}

watch(()=> props.driver, (newVal)=> {
  contract.value.vehicle_id = String(newVal?.vehicle?.id)
})
</script>
