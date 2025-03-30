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
          >
            <template #append>
              <q-icon name="mail" color="yellow-8" />
            </template>
          </q-input>

          <q-input v-model="fullname" label="Nombre completo" class="w-full" :rules="[required]">
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
          <q-item-label v-else caption class="text-orange-700">La contraseña no se puede editar desde aquí.</q-item-label>


          <q-input v-model="cedula" label="Cedula" class="w-full" />

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
import { required } from '@utils/validations'
import { ref, watchEffect, computed } from 'vue'
import { supabase } from '@services/supabase.services'

import superComposable from '@composables/super'
import notification from '@utils/notification'
import type { UserI } from '@interfaces/user'

const { store } = superComposable()
const emit = defineEmits(['user-created', 'user-updated'])

const props = defineProps<{
  editingUser?: UserI | null
}>()

const modelValue = defineModel({ type: Boolean, default: false })

const isEditing = computed(() => !!props.editingUser)

const email = ref('')
const password = ref('') // Password only used for creation
const fullname = ref('')
const cedula = ref('')
const showPassword = ref(false)

// Watch for changes in editingUser prop to update form fields
watchEffect(() => {
  if (props.editingUser) {
    email.value = props.editingUser.email || ''
    fullname.value = props.editingUser.fullname || ''
    cedula.value = props.editingUser.cedula || ''
    password.value = '' // Clear password field when editing
  } else {
    // Reset form when creating a new user (dialog opens without editingUser)
    email.value = ''
    fullname.value = ''
    cedula.value = ''
    password.value = ''
  }
})

const handleSubmit = async () => {
  try {
    if (isEditing.value && props.editingUser) {
      // Update existing user
      const updateData: Partial<UserI> = {
        fullname: fullname.value,
        cedula: cedula.value,
        // Email update requires special handling, usually not done here
        // Password update should ideally be a separate process
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
        });
      notification().success({ message: 'Usuario registrado' });
      emit('user-created') // Emit event for parent component
      onReset(); // Reset form after successful creation
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
  } else {
    // If creating, reset to empty
    email.value = ''
    fullname.value = ''
    cedula.value = ''
  }
  password.value = '' // Always clear password on reset
}
</script>
