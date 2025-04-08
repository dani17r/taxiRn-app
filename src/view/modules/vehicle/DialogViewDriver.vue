<template>
  <q-dialog v-model="modelValue" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="full-height">
      <q-bar class="bg-yellow-9 text-white">
        <q-icon name="person" size="sm" />
        <div class="text-weight-bold">Detalles del Conductor</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>

      <q-card-section class="q-pa-none">
        <div class="row no-wrap full-height">
          <!-- Sección derecha - Información del conductor -->
          <div class="col-12 q-pa-md scroll" style="max-height: calc(100vh - 50px)">
            <div class="row items-center q-mb-md">
              <q-img
                :src="driver.vehicle?.images ? imageVehiclesUrls({ ...driver.vehicle?.images, ground: driver.vehicle?.images.ground || null }) : ''"
                :ratio="16/9"
                spinner-color="primary"
                spinner-size="82px"
                class="rounded-borders"
              />
              <q-avatar size="80px" class="q-mr-md">
                <q-img
                  :src="avatarsUrls({ profile: driver.images?.profile || null, ground: '' }, driver.fullname)"
                  referrerpolicy="no-referrer"
                />
              </q-avatar>
              <div>
                <div class="text-h5 text-weight-bold">{{ driver.fullname }}</div>
                <div class="text-subtitle1 text-grey-8">
                  {{ driver.vehicle?.vehicle_type === 'car' ? 'Conductor de Carro' : 'Conductor de Moto' }}
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Información personal -->
            <div class="q-mb-lg">
              <div class="text-h6 text-weight-medium q-mb-sm">Información Personal</div>
              <div class="row q-col-gutter-y-sm">
                <div class="col-6">
                  <div class="text-caption text-grey-7">Cédula</div>
                  <div>{{ driver.cedula || 'No registrada' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Teléfono</div>
                  <div>{{ driver.phone ? formatPhone('04'+driver.phone) : 'No registrado' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Email</div>
                  <div>{{ driver.email || 'No registrado' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Fecha de Registro</div>
                  <div>{{ formatCustomDate(String(driver.created_at)) }}</div>
                </div>
              </div>
            </div>

            <!-- Información del vehículo -->
            <div v-if="driver.vehicle" class="q-mb-lg">
              <div class="text-h6 text-weight-medium q-mb-sm">Información del Vehículo</div>
              <div class="row q-col-gutter-y-sm">
                <div class="col-6">
                  <div class="text-caption text-grey-7">Tipo</div>
                  <div>{{ driver.vehicle.vehicle_type === 'car' ? 'Carro' : 'Moto' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Placa</div>
                  <div>{{ driver.vehicle.license_plate || 'No registrada' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Marca</div>
                  <div>{{ driver.vehicle.brand || 'No registrada' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Modelo</div>
                  <div>{{ driver.vehicle.model || 'No registrado' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Año</div>
                  <div>{{ driver.vehicle.year || 'No registrado' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Color</div>
                  <div>{{ driver.vehicle.color || 'No registrado' }}</div>
                </div>
                <div class="col-12">
                  <div class="text-caption text-grey-7">Estado</div>
                  <q-badge :color="driver.vehicle.is_active ? 'positive' : 'negative'">
                    {{ driver.vehicle.is_active ? 'Activo' : 'Inactivo' }}
                  </q-badge>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="row q-gutter-sm q-mt-lg">
              <q-btn
                icon="handshake"
                color="yellow-9"
                label="Contratar"
                unelevated
                @click="handleContract"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { formatPhone } from '@utils/numbers'
import { formatCustomDate } from '@helpers/dateTime'
import useImagesComposable from '@composables/images'
import type { DriverT } from '@interfaces/user'

const { imageVehiclesUrls, avatarsUrls } = useImagesComposable()

const modelValue = defineModel('modelValue', { default: false })
defineProps({
  driver: {
    type: Object as () => DriverT,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'contract'])

const handleContract = () => {
  emit('contract')
  // emit('update:modelValue', false)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>