<template>
  <q-page class="p-6">
    <h1 class="!text-2xl font-bold mb-6">Gestión de Vehículo</h1>
    
    <q-form @submit.prevent="handleSubmit" class="space-y-4">

    <q-toggle
        v-model="form.is_active"
        toggle-color="yellow"
        label="Activar vehiculo al publico"
    />
      <q-input
        :model-value="store.auth.current?.fullname"
        label="Conductor"
        readonly
        disable
      />

      <q-input
        :model-value="store.auth.current?.cedula"
        label="Cedula"
        readonly
        disable
      />

      <q-input
        :model-value="store.auth.current?.description"
        label="Descripcion"
        readonly
        disable
      />

      <q-input
        v-model="form.license_plate"
        label="Placa"
        :rules="[val => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="form.model"
        label="Modelo"
        :rules="[val => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="form.brand"
        label="Marca"
        :rules="[val => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="form.year"
        label="Año"
        type="number"
        :rules="[val => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="form.color"
        label="Color"
        :rules="[val => !!val || 'Campo requerido']"
      />

      <q-select
        v-model="form.vehicle_type"
        :options="vehicleOptions"
        label="Tipo de vehículo"
        map-options
        emit-value
      />
    
      <q-btn
        type="submit"
        label="Actualizar"
        color="yellow-9"
        :loading="store.vehicle.loading"
        class="!mt-8 !w-full"
        unelevated
      />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useSuperComposable from '@composables/super'
import { storeToRefs } from 'pinia'

const { store } = useSuperComposable()

const { current: vehicle } = storeToRefs(store.vehicle)

const vehicleOptions = [
  { label: 'Carro', value: 'car' },
  { label: 'Moto', value: 'motorcycle' }
]

const form = ref({
  license_plate: '',
  model: '',
  brand: '',
  year: '',
  color: '',
  vehicle_type: 'car',
  is_active: false,
})

onMounted(async () => {
   if (store.auth.current?.user_id) {
    await store.vehicle.fetchVehicle(store.auth.current.user_id)
    if (vehicle.value) {
      form.value = { ...vehicle.value }
    }
  }
})

const handleSubmit = async () => {
  if (!store.auth.current?.user_id) return
  try {
    await store.vehicle.saveVehicle({...form.value, user_id: store.auth.current.user_id})
  } catch (error) {
    console.error('Error saving vehicle:', error)
  }
}
</script>