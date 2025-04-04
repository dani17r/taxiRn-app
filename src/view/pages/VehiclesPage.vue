<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <!-- Filtros y búsqueda -->
    <div class="row px-4">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="searchQuery"
          label="Buscar conductor"
          clearable
          debounce="300"
          dense
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-sm-6">
        <q-select
          v-model="vehicleTypeFilter"
          :options="vehicleTypeOptions"
          label="Tipo de vehículo"
          clearable
          map-options
          emit-value
          dense
        />
      </div>
    </div>
    <q-scroll-area style="height: 76vh; width: 100%" class="pb-22">
      <q-list separator v-if="!isLoading">
        <q-item v-for="driver in drivers" :key="driver.id" class="q-py-md flex flex-col">
          <div>
            <q-img
              :src="driver.vehicles[0]?.images ? imageVehiclesUrls({ ...driver.vehicles[0].images, ground: driver.vehicles[0].images.ground || null }) : ''"
              :ratio="16 / 9"
              spinner-color="primary"
              spinner-size="82px"
            />
          </div>
          <div class="mt-5">
            <q-item-section avatar class="absolute right-5 top-43">
              <q-avatar size="70px">
                <q-img
                  :src="avatarsUrls({ profile: driver.images?.profile || null, ground: '' }, driver.fullname)" referrerpolicy="no-referrer"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle1">{{
                driver.fullname
              }}</q-item-label>
              <q-item-label caption lines="1">
                <q-icon name="badge" size="xs" class="q-mr-xs" /> Cédula:
                {{ driver.cedula || 'No registrada' }}
              </q-item-label>
              <q-item-label caption lines="1">
                <q-icon name="phone" size="xs" class="q-mr-xs" /> Teléfono:
                {{ driver.phone || 'No registrado' }}
              </q-item-label>

              <!-- Detalles del Vehículo -->
              <div v-if="driver.vehicles[0]" class="q-mt-sm text-caption">
                <div class="text-weight-medium q-mb-xs">
                  Vehículo: {{ driver.vehicles[0].vehicle_type === 'car' ? 'Carro' : 'Moto' }}
                </div>
                <div class="row items-center q-mb-xs">
                  <q-icon name="directions_car" class="q-mr-sm" size="xs" />
                  <span
                    >{{ driver.vehicles[0].brand }} {{ driver.vehicles[0].model }} ({{
                      driver.vehicles[0].year
                    }})</span
                  >
                </div>
              </div>
              <div v-else class="text-italic text-grey q-mt-sm text-caption">
                Sin vehículo registrado
              </div>
            </q-item-section>

            <div class="flex mt-3 gap-3">
              <!-- Botón Contratar -->
              <q-btn
                icon="handshake"
                color="yellow-9"
                @click="openMapModal(driver)"
                label="Contratar"
                aria-label="Contratar"
                unelevated
              >
                <q-tooltip>Contratar</q-tooltip>
              </q-btn>
              <q-btn
                icon="visibility"
                color="yellow-10"
                label="Ver"
                aria-label="Ver el vehiculo"
                unelevated
              >
                <q-tooltip>Contratar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-item>

        <q-item v-if="!drivers.length && !isLoading">
          <q-item-section class="text-center text-grey-6 q-py-lg">
            No se encontraron conductores que coincidan con la búsqueda.
          </q-item-section>
        </q-item>
      </q-list>

      <q-inner-loading :showing="isLoading">
        <q-spinner-gears size="50px" color="yellow-9" />
      </q-inner-loading>
    </q-scroll-area>

    <!-- Paginación corregida -->
    <div class="row justify-center -mt-24">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        direction-links
        boundary-links
        @update:model-value="fetchDrivers"
        color="yellow-9"
      />
      <div class="text-caption q-mt-sm full-width text-center">
        Mostrando {{ drivers.length }} de {{ totalDrivers }} conductores
      </div>
    </div>

    <!-- Modal del Mapa -->
   <DialogContractDriver v-model="dialogs.viewContract.value" :driver="selectedDriver" />
  </q-page>
</template>

<script setup lang="ts">
import DialogContractDriver from '@modules/vehicle/DialogContractDriver.vue'
import { supabase } from '@services/supabase.services'
import { ref, computed, watchEffect, reactive } from 'vue'
import { useQuasar } from 'quasar'
import type { DriverT } from '@interfaces/user'
import useImagesComposable from '@composables/images'

const $q = useQuasar()
const { imageVehiclesUrls, avatarsUrls } = useImagesComposable()

const selectedLocationInfo = ref<string | null>(null)
const vehicleTypeFilter = ref<string | null>(null)
const selectedDriver = ref<DriverT|null>(null)
const drivers = ref<DriverT[]>([])
const serviceDescription = ref('')
const itemsPerPage = ref(10)
const isLoading = ref(false)
const totalDrivers = ref(0)
const searchQuery = ref('')
const currentPage = ref(1)

const dialogs = reactive({
  viewContract: {
    value: false,
    toggle: () => (dialogs.viewContract.value = !dialogs.viewContract.value),
  },
})

const vehicleTypeOptions = [
  { label: 'Carro', value: 'car' },
  { label: 'Moto', value: 'motorcycle' },
]

const resetModal = () => {
  serviceDescription.value = ''
  selectedLocationInfo.value = null
}

const openMapModal = (driver: DriverT) => {
  selectedDriver.value = driver
  dialogs.viewContract.toggle()
  resetModal() 
}

// Cálculos
const totalPages = computed(() => Math.ceil(totalDrivers.value / itemsPerPage.value))

// Observadores
watchEffect(() => {
  fetchDrivers().catch(() => null)
})

// Función para obtener conductores
async function fetchDrivers() {
  try {
    isLoading.value = true
    const from = (currentPage.value - 1) * itemsPerPage.value
    const to = from + itemsPerPage.value - 1

    const { data, error, count } = await supabase
      .from('users')
      .select('*, vehicles(*)', { count: 'exact' })
      .eq('role', 'driver')
      .range(from, to)
      .order('created_at', { ascending: false })
      .or(`fullname.ilike.%${searchQuery.value}%,cedula.ilike.%${searchQuery.value}%`)
      .filter(vehicleTypeFilter.value ? 'vehicles.vehicle_type' : '', 'eq', vehicleTypeFilter.value)

    if (error) throw error

    drivers.value = data || []
    totalDrivers.value = count || 0
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar conductores',
      caption: (error as Error).message,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.q-pagination {
  width: 100%;
  justify-content: center;
  padding: 20px 0;
}
.q-dialog__card {
  border-radius: 12px;
  overflow: hidden;
}

.q-item__section--avatar {
  min-width: 50px;
}
</style>
