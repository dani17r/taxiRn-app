<template>
  <q-page class="p-6 mobile-keyboard-fix">
    <h1 class="!text-2xl font-bold mb-6">Gestión de Vehículo</h1>

    <q-form @submit.prevent="handleSubmit" class="space-y-4">
      <q-toggle
        v-model="form.is_active"
        toggle-color="yellow"
        label="Activar vehiculo al publico"
      />

      <div class="relative mb-8">
        <q-img :src="imageVehicleUrl" referrerpolicy="no-referrer" height="200px" />

        <q-avatar size="100px" class="absolute -bottom-11 right-3">
          <q-img :src="avatarUrl" referrerpolicy="no-referrer" />
        </q-avatar>
      </div>
      <q-file
          @update:model-value="handleImageUpload"
          label="Cambiar Portada"
          accept=".jpg, .png, .jpeg"
          class="-mt-8"
          dense
          v-model="currentFile"
          borderless
          max-files="1"
        />


      <q-input :model-value="store.auth.current?.fullname" label="Conductor" readonly disable   color="yellow-9"/>

      <q-input :model-value="store.auth.current?.cedula" label="Cedula" readonly disable   color="yellow-9"/>

      <q-input
        :model-value="store.auth.current?.description"
        label="Descripcion"
        readonly
        disable  
        color="yellow-9"
      />

      <q-input v-model="form.license_plate" label="Placa" :rules="[required]"  color="yellow-9"/>

      <q-input v-model="form.model" label="Modelo" :rules="[required]"  color="yellow-9"/>

      <q-input v-model="form.brand" label="Marca" :rules="[required]"  color="yellow-9"/>

      <q-input v-model="form.year" label="Año" type="number" color="yellow-9"/>

      <q-input v-model="form.color" label="Color" :rules="[required]" color="yellow-9" />

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
import imageProfileComposable from '@composables/images'
import useSuperComposable from '@composables/super'
import { required } from '@utils/validations'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Notify } from 'quasar'
import supabase from '@services/supabase.services'

const { store } = useSuperComposable()

const { current: vehicle } = storeToRefs(store.vehicle)
const { avatarUrl, imageVehicleUrl } = imageProfileComposable(store)

const vehicleOptions = [
  { label: 'Carro', value: 'car' },
  { label: 'Moto', value: 'motorcycle' },
]

const form = ref({
  user_id: '',
  license_plate: '',
  model: '',
  brand: '',
  year: 0,
  color: '',
  vehicle_type: 'car',
  is_active: false,
  images: { ground: <string|null>null },
})

const loading = ref(false)
const currentFile = ref(null)

const handleImageUpload = async (file: File) => {
  try {
    loading.value = true
    const currentUser = store.auth.current

    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado')
    }

    // Generar nombre único para el archivo
    const fileName = `${currentUser.id}-${Date.now()}-${file.name.replace(/\s/g, '_')}`

    // Subir archivo con opciones de caché
    const { error: uploadError } = await supabase.storage.from('vehicles').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

    if (uploadError) throw uploadError

    // Actualizar referencia en la base de datos
    const { error: dbError } = await supabase
      .from('vehicles')
      .update({
        images: { ground: fileName },
      })
      .eq('user_id', currentUser.id)

    if (dbError) throw dbError

    // Forzar actualización de la URL
    supabase.storage.from('vehicles').getPublicUrl(fileName)

    // Actualizar estado local
    form.value.images.ground = fileName
    store.vehicle.current!.images.ground = fileName
    currentFile.value = null

    Notify.create({
      type: 'positive',
      message: 'Imagen actualizada correctamente',
      icon: 'check_circle',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      icon: 'error',
    })
    console.error('Error detallado:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (store.auth.current?.user_id) {
    await store.vehicle.fetchVehicle(store.auth.current.id)
    if (vehicle.value) {
      form.value = {
        ...vehicle.value,
        vehicle_type: vehicle.value.vehicle_type || 'car',
        images: {
          ground: vehicle.value.images?.ground || null,
        },  
      } 
    }
  }
})

const handleSubmit = async () => {
  if (!store.auth.current?.user_id) return
  try {
    await store.vehicle.saveVehicle({
      ...form.value,
      user_id: store.auth.current.user_id,
    })
  } catch (error) {
    console.error('Error saving vehicle:', error)
  }
}
</script>
