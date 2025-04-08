<template>
  <q-dialog v-model="modelValue" full-width maximized>
    <q-card class="!shadow-none m-0 p-3 !w-full bg-one">
      <q-toolbar>
        <q-icon :name="isEditing ? 'edit' : 'add'" size="25px" color="yellow-9" />
        <q-toolbar-title>{{ isEditing ? 'Editar Administrador' : 'Nuevo Administrador' }}</q-toolbar-title>
        <q-btn flat round dense icon="close" color="red" v-close-popup />
      </q-toolbar>

      <q-card-section class="flex flex-col bg-one">
        <q-form @submit="handleSubmit" @reset="onReset" class="space-y-6">
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
            color="yellow-9"
            class="w-full"
            :rules="validationRules"
            maxlength="10"
          />

          <div class="mt-0">
            <q-btn
              :icon="isEditing ? 'save' : 'person_add'"
              color="yellow-9"
              class="!w-full"
              :label="isEditing ? 'Guardar Cambios' : 'Crear Administrador'"
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
import { required } from '@utils/validations'

const { store } = superComposable()
const { cedula, validationRules, resetCedula } = useCedula()
const emit = defineEmits(['update'])

const props = defineProps<{
  editingAdmin?: UserI | null
}>()

const modelValue = defineModel({ type: Boolean, default: false })

const isEditing = computed(() => !!props.editingAdmin)

const email = ref('')
const password = ref('') // Password only used for creation
const fullname = ref('')
const showPassword = ref(false)

// Watch for changes in editingAdmin prop to update form fields
watchEffect(() => {
  if (props.editingAdmin) {
    email.value = props.editingAdmin.email || ''
    fullname.value = props.editingAdmin.fullname || ''
    cedula.value = props.editingAdmin.cedula || ''
    password.value = '' // Clear password field when editing
  } else {
    // Reset form when creating a new admin (dialog opens without editingAdmin)
    email.value = ''
    fullname.value = ''
    resetCedula()
    password.value = ''
  }
})

const handleSubmit = async () => {
  try {
    if (isEditing.value && props.editingAdmin) {
      // Update existing admin
      const updateData: Partial<UserI> = {
        fullname: fullname.value,
        cedula: cedula.value,
      }
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', props.editingAdmin.id)

      if (error) throw error
      notification().success({ message: 'Administrador actualizado' })
      emit('update') // Emit event for parent component
      onReset() // Reset form after successful update
    } else {
      // Create new admin
      if (!password.value) {
         notification().error('La contraseña es requerida para nuevos administradores.'); // Use new error function
         return;
      }
      await store.auth
        .newUser({
          email: email.value,
          password: password.value,
          fullname: fullname.value,
          cedula: cedula.value,
          role: 'admin', // Ensure role is set to admin
        });
      notification().success({ message: 'Administrador registrado' });
      emit('update') // Emit event for parent component
      onReset(); // Reset form after successful creation
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    notification().errorCatch(error); // Use renamed errorCatch for error objects
  } finally {
    modelValue.value = false; // Close dialog regardless of success/failure
  }
}

const onReset = () => {
  // Reset based on whether we were editing or creating initially
  if (isEditing.value && props.editingAdmin) {
    // If editing, reset to original editing admin's data
    email.value = props.editingAdmin.email || ''
    fullname.value = props.editingAdmin.fullname || ''
    cedula.value = props.editingAdmin.cedula || ''
  } else {
    // If creating, reset to empty
    email.value = ''
    fullname.value = ''
    resetCedula()
  }
  password.value = '' // Always clear password on reset
}
</script>
