<template>
  <q-page class="fixed left-0 top-13 w-full h-screen mobile-keyboard-fix">
    <h5 class="text-yellow-8 !font-bold w-full text-center">Conductores</h5>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="searchQuery"
          label="Buscar conductor"
          debounce="500"
          color="yellow-9"
          dense
          filled
          @update:model-value="handleSearchUpdate"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="vehicleTypeFilter"
          :options="vehicleTypeOptions"
          label="Filtrar por tipo de vehículo"
          dense
          filled
          map-options
          emit-value
          clearable
          @update:model-value="currentPage = 1"
        />
      </div>
    </div>
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-36">
      <div class="q-pa-md">
        <!-- Lista de conductores -->
        <q-list>
          <template v-if="!isLoading">
            <q-item
              v-for="driver in drivers"
              :key="driver.id"
              class="border-b border-amber-400 my-2"
            >
              <q-item-section class="mb-3">
                <q-item-label
                  ><span class="text-weight-bold text-lg">{{ driver.fullname }}</span></q-item-label
                >
                <q-item-label caption class="!text-[14px]"
                  >Cédula: {{ driver.cedula || 'No registrada' }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]">Email: {{ driver.email }}</q-item-label>
                <q-item-label caption class="!text-[14px]"
                  >creado el: {{ formatCustomDate(String(driver.created_at)) }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]"
                  >Vehículo:
                  {{ driver.vehicle?.vehicle_type == 'car' ? 'Carro' : 'Moto' }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]"
                  >Marca: {{ driver.vehicle?.brand }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]"
                  >Modelo: {{ driver.vehicle?.model || 'No contiene' }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]"
                  >Color: {{ driver.vehicle?.color || 'No contiene' }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]"
                  >Online: {{ driver.vehicle?.is_active ? 'Si' : 'No' }}</q-item-label
                >

                <q-item-label>
                  <div class="q-mt-sm flex q-gutter-sm">
                    <!-- Use flex and q-gutter -->
                    <q-btn dense flat round color="primary" icon="edit" @click="editDriver(driver)">
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      flat
                      round
                      :color="driver.is_blocked ? 'green' : 'orange'"
                      :icon="driver.is_blocked ? 'lock_open' : 'block'"
                      @click="driver.is_blocked ? unblockDriver(driver.id) : blockDriver(driver.id)"
                    >
                   <q-tooltip>{{ driver.is_blocked ? 'Desbloquear' : 'Bloquear' }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      flat
                      round
                      color="red"
                      icon="delete"
                      @click="deleteDriver(driver)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="!drivers.length">
              <q-item-section class="text-center text-grey-6">
                No se encontraron conductores
              </q-item-section>
            </q-item>
          </template>

          <q-item v-else>
            <q-item-section class="flex justify-center items-center min-h-72">
              <q-spinner color="primary" size="3em" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-scroll-area>

    <div class="row justify-center">
      <q-pagination
        v-model="currentPage"
        :max="Math.ceil(totalDrivers / 10)"
        :max-pages="6"
        direction-links
        boundary-links
        color="yellow-9"
        active-design="unelevated"
        active-class="bg-yellow-9 text-white"
        @update:model-value="handlePaginationUpdate"
      >
        <span class="text-caption q-mx-sm"
          >Página {{ currentPage }} de {{ Math.ceil(totalDrivers / 10) }}</span
        >
      </q-pagination>
    </div>
    <q-btn
      fab
      fab-mini
      color="yellow-9"
      icon="person_add"
      class="fixed bottom-15 right-5"
      @click="newDriver()"
    />

    <DialogAddOrEditeDriver
      v-model="dialogs.newDriver.value"
      :editing-driver="editingDriver"
      @driver-created="
        () => {
          fetchDrivers(currentPage, 10).catch(() => {})
        }
      "
      @driver-updated="
        () => {
          fetchDrivers(currentPage, 10).catch(() => {})
        }
      "
    />
  </q-page>
</template>

<script setup lang="ts">
import type { DriverT } from '@interfaces/user'
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue' // Import defineAsyncComponent
import { useQuasar } from 'quasar'
import { supabase } from '@services/supabase.services'
import { formatCustomDate } from '@helpers/dateTime'

const DialogAddOrEditeDriver = defineAsyncComponent(() => import('@modules/vehicle/DialogAddOrEditeDriver.vue'))

const $q = useQuasar()

const drivers = ref<DriverT[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const vehicleTypeFilter = ref<string | null>(null)
const totalDrivers = ref(0)
const currentPage = ref(1)
const editingDriver = ref<DriverT | null>(null) // Add state for editing driver

const vehicleTypeOptions = [
  { label: 'Carro', value: 'car' },
  { label: 'Moto', value: 'motorcycle' },
]

const fetchDrivers = async (page: number, itemsPerPage = 10) => {
  try {
    isLoading.value = true
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
      .from('users')
      .select('*, vehicle:vehicles!user_id (*)', { count: 'exact' })
      .eq('role', 'driver')
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false })

    if (searchQuery.value) {
      query = query.or(`fullname.ilike.%${searchQuery.value}%,cedula.ilike.%${searchQuery.value}%`)
    }

    if (vehicleTypeFilter.value) {
      query.select('*, vehicles!inner(*)')
      query = query.eq('vehicles.vehicle_type', vehicleTypeFilter.value)
    }

    const { data, error, count } = await query

    if (error) throw error

    drivers.value = data as DriverT[] || []
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

const dialogs = reactive({
  newDriver: {
    value: false,
    toggle: () => (dialogs.newDriver.value = !dialogs.newDriver.value),
  },
})

const editDriver = (driver: DriverT) => {
  editingDriver.value = driver
  dialogs.newDriver.toggle()
}

const newDriver = () => {
  editingDriver.value = null
  dialogs.newDriver.toggle()
}

const deleteDriver = (driver: DriverT) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este conductor?',
    cancel: 'Cancelar',
    ok: 'Si',
    persistent: true,
    color: 'yellow-9',
    class:'!shadow-none bg-one',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    try {
      const { error } = await supabase.rpc('delete_user', { p_user_id:driver.id })
      if (error) throw error

      const { error:errorDriver } = await supabase.from('vehicles').delete().eq('id', driver.id)
      if (errorDriver) throw errorDriver

      $q.notify({
        type: 'positive',
        message: 'Conductor eliminado exitosamente',
      })

      fetchDrivers(currentPage.value, 10).catch(() => {})

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: error.message,
      })
    }
  })
}

const blockDriver = (driverId: string) => {
  $q.dialog({
    title: 'Confirmar bloqueo',
    message: '¿Estás seguro de que deseas bloquear este conductor?',
    cancel: 'Cancelar',
    ok: 'Si',
    persistent: true,
    color: 'yellow-9',
    class:'!shadow-none bg-one',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    await supabase.from('users').update({ is_blocked: true }).eq('id', driverId)

    $q.notify({
      type: 'positive',
      message: 'Conductor bloqueado exitosamente',
    })
    fetchDrivers(currentPage.value, 10).catch(() => {})
  })
}

const unblockDriver = (driverId: string) => {
  $q.dialog({
    title: 'Confirmar desbloqueo',
    message: '¿Estás seguro de que deseas desbloquear este conductor?',
    cancel: 'Cancelar',
    ok: 'Si',
    persistent: true,
    color: 'yellow-9',
    class:'!shadow-none bg-one',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    await supabase.from('users').update({ is_blocked: false }).eq('id', driverId)

    $q.notify({
      type: 'positive',
      message: 'Conductor desbloqueado exitosamente',
    })

    fetchDrivers(currentPage.value, 10).catch(() => {})
  })
}

onMounted(() => {
  fetchDrivers(currentPage.value, 10).catch(() => {})
})

const handleSearchUpdate = () => {
  currentPage.value = 1
  fetchDrivers(currentPage.value, 10).catch(() => {})
}

const handlePaginationUpdate = (newPage: number) => {
  fetchDrivers(newPage, 10).catch(() => {})
}
</script>
