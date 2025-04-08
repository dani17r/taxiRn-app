<template>
  <q-dialog v-model="modelValue" full-width maximized>
    <q-card class="!shadow-none p-3 !w-full bg-one">
      <q-toolbar>
        <q-icon :name="isEditing ? 'edit' : 'add'" size="25px" color="yellow-9" />
        <q-toolbar-title>{{
          isEditing ? 'Editar Conductor/Vehículo' : 'Nuevo Conductor'
        }}</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col bg-one">
        <q-form @submit="handleSubmit" @reset="onReset" class="space-y-6">
          <!-- User Fields -->
          <q-input
            v-model="email"
            label="Email/Correo"
            class="w-full"
            color="yellow-9"
            :rules="[required]"
            :readonly="isEditing"
          >
            <template #append>
              <q-icon name="mail" color="yellow-8" />
            </template>
          </q-input>

          <q-input v-model="fullname" label="Nombre completo" class="w-full" :rules="[required]"  color="yellow-9">
            <template #append>
              <q-icon name="person" color="yellow-8" />
            </template>
          </q-input>

          <!-- Password Input - Optional when editing -->
          <q-input
            v-if="!isEditing"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            label="Contraseña"
            class="w-full"
            color="yellow-9"
            :rules="isEditing ? [] : [required]"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                color="yellow-8"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="cedula"
            label="Cédula"
            class="w-full"
            :rules="validationRules"
            maxlength="10"
            color="yellow-9"
          />

          <q-input
            v-model="phone"
            label="Número de teléfono"
            mask="04##-###-####"
            unmasked-value
            :rules="[required, phoneNumberVe]"
            class="w-full"
            color="yellow-9"
          />

           <q-input
            v-model="birthdate"
            label="Fecha de nacimiento"
            mask="##/##/####"
            :rules="[validateBirthdate]"
            class="w-full"
            hint="DD/MM/AAAA"
            color="yellow-9"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="birthdate" mask="DD/MM/YYYY" color="yellow-9">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="vehicle_type"
            :options="vehicleOptions"
            label="Tipo de vehículo"
            map-options
            emit-value
            class="w-full"
            :rules="[required]"
          />

          <q-input v-model="license_plate" label="Placa"  color="yellow-9" :rules="[required]" class="w-full" />

          <q-input v-model="model" label="Modelo"  color="yellow-9" :rules="[required]" class="w-full" />

          <q-input v-model="brand" label="Marca"  color="yellow-9" :rules="[required]" class="w-full" />

          <q-input v-model="year" label="Año" type="number"  color="yellow-9" :rules="[required]" class="w-full" />

          <q-input v-model="color" label="Color"  color="yellow-9" :rules="[required]" class="w-full" />

          <div class="mt-0">
            <q-btn
              :icon="isEditing ? 'save' : 'person_add'"
              color="yellow-9"
              class="!w-full"
              :label="isEditing ? 'Guardar Cambios' : 'Crear Conductor'"
              type="submit"
              size="18px"
              unelevated
              no-caps
            />
            <q-btn
              type="reset"
              color="yellow-9"
              no-caps
              class="q-mt-sm !w-full"
              unelevated
              size="18px"
              label="Limpiar campos"
              flat
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { supabase } from '@services/supabase.services'
import type { DriverT, UserI } from '@interfaces/user'
import type { VehicleI } from '@interfaces/vehicle'
import { useCedula } from '@composables/useCedula'
import superComposable from '@composables/super'
import { ref, watchEffect, computed } from 'vue'
import notification from '@utils/notification'
import { phoneNumberVe, required, validateBirthdate } from '@utils/validations'


const notify = notification()

const { store } = superComposable()
const { cedula, validationRules, resetCedula } = useCedula()
const emit = defineEmits(['driver-created', 'driver-updated'])

const props = defineProps<{
  editingDriver?: DriverT | null
}>()

const modelValue = defineModel({ type: Boolean, default: false })

const isEditing = computed(() => !!props.editingDriver)

// User fields
const email = ref('')
const password = ref('')
const fullname = ref('')
const phone = ref('')
const birthdate = ref('')
const showPassword = ref(false)

// Vehicle fields
const license_plate = ref('')
const model = ref('')
const brand = ref('')
const year = ref<number>(new Date().getFullYear()) // Default to current year or handle null appropriately
const color = ref('')
const vehicle_type = ref<'car' | 'motorcycle'>('car') // Explicitly type vehicle_type

const vehicleOptions = [
  { label: 'Carro', value: 'car' as const }, // Use 'as const' for type safety
  { label: 'Moto', value: 'motorcycle' as const },
]

const handleSubmit = async () => {
  try {
    if (isEditing.value && props.editingDriver) {
      // --- Update Existing Driver and Vehicle ---
      const userId = props.editingDriver.id
      const vehicleId = props.editingDriver.vehicle?.id

      // 1. Update User Data
      const userData: Partial<UserI> = {
        fullname: fullname.value,
        cedula: cedula.value,
        phone: phone.value,
        birthdate: birthdate.value,
      }
      const { error: userError } = await supabase.from('users').update(userData).eq('id', userId)
      if (userError) throw userError

      // 2. Update Vehicle Data (if vehicle exists)
      if (vehicleId) {
        const vehicleData: Partial<VehicleI> = {
          license_plate: license_plate.value,
          vehicle_type: vehicle_type.value,
          brand: brand.value,
          color: color.value,
          model: model.value,
          year: year.value, // Assert as number since it has a default
        }
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicleId) // Use vehicle's own ID for update
        if (vehicleError) throw vehicleError
      } else {
        // Handle case where driver exists but vehicle doesn't (optional: create vehicle?)
        console.warn(`Driver ${userId} has no vehicle to update.`)
        // Optionally, create a new vehicle here if needed
        // await store.vehicle.saveVehicle(...)
      }

      notify.success({ message: 'Conductor actualizado' })
      emit('driver-updated')
      onReset() // Reset form
    } else {
      // --- Create New Driver and Vehicle ---
      if (!password.value) {
        notify.error('La contraseña es requerida para nuevos conductores.')
        return
      }
      // Use the existing newUser action which handles user and vehicle creation
      await store.auth.newUser(
        {
          email: email.value,
          password: password.value,
          fullname: fullname.value,
          cedula: cedula.value,
          role: 'driver',
        },
        (user_id) => {
          // Callback after user is created
          if (user_id) {
            store.vehicle
              .saveVehicle({
                // Save vehicle linked to the new user
                license_plate: license_plate.value,
                vehicle_type: vehicle_type.value,
                user_id, // Use the ID from the created user
                brand: brand.value,
                color: color.value,
                model: model.value,
                year: year.value, // Assert as number
              })
              .then(() => {
                notify.success({ message: 'Conductor registrado' })
                emit('driver-created')
                onReset()
              })
              .catch((vehicleError) => {
                // Handle vehicle saving error specifically
                console.error('Error saving vehicle:', vehicleError)
                notify.errorCatch(vehicleError) // Use errorCatch for Supabase errors
                // Consider rolling back user creation or notifying admin
              })
          } else {
            console.error('User ID not available after creation.')
            notify.error('Error al crear el usuario, ID no disponible.')
          }
        },
      )
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    //no tocar
    console.error('Error in handleSubmit:', error)
    notify.errorCatch(error) // Use errorCatch for potential Supabase errors
  } finally {
    modelValue.value = false // Close dialog
  }
}

const onReset = () => {
  // Reset based on whether we were editing or creating initially
  if (isEditing.value && props.editingDriver) {
    // If editing, reset to original driver's data
    email.value = props.editingDriver.email || ''
    fullname.value = props.editingDriver.fullname || ''
    cedula.value = props.editingDriver.cedula || ''
    phone.value = props.editingDriver.phone || ''
    birthdate.value = props.editingDriver.birthdate || ''
    const vehicle = props.editingDriver.vehicle
    if (vehicle) {
      license_plate.value = vehicle.license_plate || ''
      model.value = vehicle.model || ''
      brand.value = vehicle.brand || ''
      year.value = vehicle.year || new Date().getFullYear() // Reset to default
      color.value = vehicle.color || ''
      vehicle_type.value = vehicle.vehicle_type || 'car'
    } else {
      license_plate.value = ''
      model.value = ''
      brand.value = ''
      year.value = new Date().getFullYear() // Reset to default
      color.value = ''
      vehicle_type.value = 'car'
    }
  } else {
    // If creating, reset all fields to empty/default
    email.value = ''
    birthdate.value = ''
    phone.value = ''
    fullname.value = ''
    resetCedula()
    license_plate.value = ''
    model.value = ''
    brand.value = ''
    year.value = new Date().getFullYear() // Reset to default year instead of null
    color.value = ''
    vehicle_type.value = 'car'
  }
  password.value = '' // Always clear password on reset
}

// Watch for changes in editingDriver prop to update form fields
watchEffect(() => {
  if (props.editingDriver) {
    // Populate user fields
    email.value = props.editingDriver.email || ''
    fullname.value = props.editingDriver.fullname || ''
    cedula.value = props.editingDriver.cedula || ''
    birthdate.value = props.editingDriver.birthdate || ''
    phone.value = props.editingDriver.phone || ''
    password.value = '' // Clear password

    // Populate vehicle fields (assuming one vehicle per driver for now)
    const vehicle = props.editingDriver.vehicle
    if (vehicle) {
      license_plate.value = vehicle.license_plate || ''
      model.value = vehicle.model || ''
      brand.value = vehicle.brand || ''
      year.value = vehicle.year || new Date().getFullYear() // Provide default if null
      color.value = vehicle.color || ''
      vehicle_type.value = vehicle.vehicle_type || 'car'
    } else {
      // Reset vehicle fields if no vehicle data
      license_plate.value = ''
      model.value = ''
      brand.value = ''
      year.value = new Date().getFullYear() // Reset to default
      color.value = ''
      vehicle_type.value = 'car'
    }
  } else {
    // Reset all fields for new driver
    onReset()
  }
})
</script>
