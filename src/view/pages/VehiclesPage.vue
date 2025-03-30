<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="q-pa-md">
        <!-- Filtros y búsqueda -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="searchQuery"
              label="Buscar conductor"
              outlined
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
              outlined
              clearable
              map-options
              emit-value
              dense
            />
          </div>
        </div>

       <div v-if="!isLoading">
          <q-card 
            v-for="driver in drivers"
            :key="driver.id"
            class="q-mb-md !shadow-none"
          >
            <q-card-section class="row items-center justify-between">
              <div class="row items-center">
                <q-avatar color="yellow-9" text-color="white" size="60px">
                  {{ driver.fullname?.charAt(0) }}
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-h6">{{ driver.fullname }}</div>
                  <div class="text-caption">
                    <q-icon name="badge" class="q-mr-xs" />
                    {{ driver.cedula }}
                  </div>
                  <div class="text-caption">
                    <q-icon name="phone" class="q-mr-xs" />
                    {{ driver.phone || 'Sin teléfono' }}
                  </div>
                </div>
              </div>

              <!-- Vehículo -->
              <div class="column q-ml-md" v-if="driver.vehicles">
                <div class="row items-center">
                  <q-icon name="directions_car" class="q-mr-sm" />
                  <div>
                    {{ driver.vehicles.brand }} {{ driver.vehicles.model }}
                    <span class="text-caption">({{ driver.vehicles.year }})</span>
                  </div>
                </div>
                <div class="row items-center">
                  <q-icon name="confirmation_number" class="q-mr-sm" />
                  <div>{{ driver.vehicles.license_plate }}</div>
                </div>
                <div class="row items-center">
                  <q-icon name="category" class="q-mr-sm" />
                  <div>{{ driver.vehicles.vehicle_type }}</div>
                </div>
              </div>

              <div v-else class="text-italic text-grey">
                Sin vehículo registrado
              </div>
              <q-btn 
                label="Contratar" 
                color="yellow-9" 
                @click="openMapModal(driver)"
                class="q-ml-md"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Paginación corregida -->
        <div class="row justify-center q-mt-xl">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="6"
            direction-links
            boundary-links
            @update:model-value="fetchDrivers"
          />
          <div class="text-caption q-mt-sm full-width text-center">
            Mostrando {{ drivers.length }} de {{ totalDrivers }} conductores
          </div>
        </div>
      </div>

      <!-- Modal del Mapa -->
      <q-dialog v-model="showMapModal">
        <q-card style="min-width: 300px" class="!shadow-none">
          <q-card-section>
            <div class="text-h6">Seleccionar ubicación para {{ selectedDriver?.fullname }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="column q-gutter-y-md">
              <q-btn 
                label="Obtener ruta del mapa" 
                color="yellow-9" 
                icon="map"
              />
              <q-btn 
                label="Obtener lugar actual" 
                color="secondary" 
                icon="my_location"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Cancelar" color="negative" flat v-close-popup />
            <q-btn label="Aceptar" color="positive" @click="confirmSelection" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-inner-loading :showing="isLoading">
        <q-spinner-gears size="50px" color="yellow-9" />
      </q-inner-loading>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { supabase } from '@services/supabase.services';
import { ref, computed, watchEffect } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Estado reactivo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const drivers = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const vehicleTypeFilter = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalDrivers = ref(0);
const showMapModal = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedDriver = ref<any>(null);

// Opciones de filtro
const vehicleTypeOptions = [
  { label: 'Carro', value: 'car' },
  { label: 'Moto', value: 'motorcycle' }
];

const confirmSelection = () => {
  // Lógica para confirmar la selección
  console.log('Contratación confirmada para:', selectedDriver.value);
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openMapModal = (driver: any) => {
  selectedDriver.value = driver;
  showMapModal.value = true;
};

// Cálculos
const totalPages = computed(() => Math.ceil(totalDrivers.value / itemsPerPage.value));

// Cálculos
// const totalPages = computed(() => Math.ceil(totalDrivers.value / itemsPerPage.value));

// Observadores
watchEffect(() => {
  fetchDrivers().catch(() => null);
});

// Función para obtener conductores
async function fetchDrivers() {
  try {
    isLoading.value = true;
    const from = (currentPage.value - 1) * itemsPerPage.value;
    const to = from + itemsPerPage.value - 1;

    const { data, error, count } = await supabase
      .from('users')
      .select('*, vehicles(*)', { count: 'exact' })
      .eq('role', 'driver')
      .range(from, to)
      .order('created_at', { ascending: false })
      .or(`fullname.ilike.%${searchQuery.value}%,cedula.ilike.%${searchQuery.value}%`)
      .filter(vehicleTypeFilter.value ? 'vehicles.vehicle_type' : '', 'eq', vehicleTypeFilter.value);

    if (error) throw error;
    
    drivers.value = data || [];
    totalDrivers.value = count || 0;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar conductores',
      caption: (error as Error).message,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.q-pagination {
  width: 100%;
  justify-content: center;
  padding: 20px 0;
}

.q-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
}

.q-dialog__card {
  border-radius: 12px;
  overflow: hidden;
}
</style>