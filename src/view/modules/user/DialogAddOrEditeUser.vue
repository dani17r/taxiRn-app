<template>
  <q-dialog v-model="modelValue" full-width maximized>
    <q-card class="!shadow-none p-3 !w-full bg-one">
      <q-toolbar>
        <q-icon :name="isEditing ? 'edit' : 'add'" size="25px" color="yellow-9" />
        <q-toolbar-title>{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col bg-one">
        <q-form @submit="handleSubmit" @reset="onReset" class="space-y-6">
          <q-input
            v-model="email"
            label="Email/Correo"
            class="w-full"
            :rules="[required]"
            :readonly="isEditing"
             color="yellow-9"
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
             color="yellow-9"
            label="Contraseña"
            class="w-full"
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
            color="yellow-9"
            class="w-full"
            :rules="validationRules"
            maxlength="10"
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

          <div class="mt-0">
            <q-btn
              :icon="isEditing ? 'save' : 'person_add'"
              color="yellow-9"
              class="!w-full"
              :label="isEditing ? 'Guardar Cambios' : 'Crear Usuario'"
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
import { useCedula } from '@composables/useCedula'
import { ref, watchEffect, computed } from 'vue'
import superComposable from '@composables/super'
import notification from '@utils/notification'
import type { UserI } from '@interfaces/user'
import { phoneNumberVe, required, validateBirthdate } from '@utils/validations'

const { store } = superComposable()
const { cedula, validationRules, resetCedula } = useCedula()
const emit = defineEmits(['user-created', 'user-updated'])

const props = defineProps<{
  editingUser?: UserI | null
}>()

const modelValue = defineModel({ type: Boolean, default: false })

const isEditing = computed(() => !!props.editingUser)

const email = ref('')
const password = ref('') // Password only used for creation
const fullname = ref('')
const phone = ref('')
const birthdate = ref('')
const showPassword = ref(false)

// Watch for changes in editingUser prop to update form fields
watchEffect(() => {
  if (props.editingUser) {
    email.value = props.editingUser.email || ''
    fullname.value = props.editingUser.fullname || ''
    cedula.value = props.editingUser.cedula || ''
    phone.value = props.editingUser.phone || ''
    birthdate.value = props.editingUser.birthdate || ''
    password.value = '' // Clear password field when editing
  } else {
    // Reset form when creating a new user (dialog opens without editingUser)
    fullname.value = ''
    password.value = ''
    email.value = ''
    birthdate.value = ''
    phone.value = ''
    resetCedula()
  }
})

const handleSubmit = async () => {
  try {
    if (isEditing.value && props.editingUser) {
      // Update existing user
      const updateData: Partial<UserI> = {
        fullname: fullname.value,
        cedula: cedula.value,
        birthdate: birthdate.value,
        phone: phone.value,
      }
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', props.editingUser.id)

      if (error) throw error
      notification().success({ message: 'Usuario actualizado' })
      emit('user-updated') // Emit event for parent component
      onReset() // Reset form after successful update
    } else {
      // Create new user
      if (!password.value) {
         notification().error('La contraseña es requerida para nuevos usuarios.'); // Use new error function
         return;
      }
      await store.auth
        .newUser({
          email: email.value,
          password: password.value, // Password is required for new user
          fullname: fullname.value,
          cedula: cedula.value,
        }, ()=> {
          notification().success({ message: 'Usuario registrado' });
          emit('user-created') // Emit event for parent component
          onReset(); // Reset form after successful creation
        })
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    //no tocar
    notification().errorCatch(error); // Use renamed errorCatch for error objects
  } finally {
    modelValue.value = false; // Close dialog regardless of success/failure
  }
}

const onReset = () => {
  // Reset based on whether we were editing or creating initially
  if (isEditing.value && props.editingUser) {
    // If editing, reset to original editing user's data
    email.value = props.editingUser.email || ''
    fullname.value = props.editingUser.fullname || ''
    cedula.value = props.editingUser.cedula || ''
    birthdate.value = props.editingUser.birthdate || ''
    phone.value = props.editingUser.phone || ''
  } else {
    // If creating, reset to empty
    email.value = ''
    fullname.value = ''
    birthdate.value = ''
    phone.value = ''
    resetCedula()
  }
  password.value = '' // Always clear password on reset
}
</script>
