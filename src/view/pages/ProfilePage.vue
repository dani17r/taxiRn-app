<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="flex justify-center p-8 w-full">
        <h2 class="!text-3xl !font-bold mb-6">
          Perfil de {{ store.auth.getRoleAdmin ? 'admin' : 'usuario' }}
        </h2>

        <div class="flex flex-col items-center mb-8 w-full" v-if="!store.auth.getRoleAdmin">
          <q-avatar size="120px" class="mb-4">
            <q-img :src="avatarUrl" referrerpolicy="no-referrer" />
          </q-avatar>
          <q-file
            v-model="file"
            borderless
            label="Cambiar foto de perfil"
            accept=".jpg, .png, .jpeg"
            max-files="1"
            @update:model-value="handleImageUpload"
            class="w-full mod-input"
          />
        </div>

        <!-- Formulario de perfil -->
        <q-form @submit.prevent="updateProfile" @reset="resetFormPassword" class="space-y-6 w-full">
          <!-- Campos del formulario... -->
          <q-input v-model="userData.email" label="Email" readonly class="w-full" disable />

          <!-- Rol (solo lectura) -->
          <q-input v-model="userData.role" label="Rol" readonly disable class="w-full" />

          <!-- Nombre completo -->
          <q-input
            v-model="userData.fullname"
            label="Nombre completo"
            :rules="[(val) => !!val || 'Campo requerido']"
            class="w-full"
          />

          <!-- Descripción -->
          <q-input
            v-model="userData.description"
            label="Descripción"
            type="textarea"
            autogrow
            class="w-full"
          />

          <q-input
            v-model="userData.cedula"
            label="Cédula"
            :rules="[(val) => !!val || 'Campo requerido', isValidCedula]"
            class="w-full"
          />

          <!-- Botones de acción -->
          <div class="flex flex-col justify-end gap-3 mt-10">
            <q-btn
              label="Guardar cambios"
              type="submit"
              color="yellow-9"
              :loading="loading"
              unelevated
              no-caps
              size="15px"
            />
            <q-btn label="Limpiar" type="reset" flat @click="fetchUserData" no-caps size="15px" />
          </div>
        </q-form>

        <q-form @submit.prevent="updatePassword" class="space-y-6 w-full mt-10">
          <h3 class="!text-2xl !font-bold my-6 !w-full text-center">Cambiar contraseña</h3>
          <q-input
            v-model="currentPassword"
            label="Contraseña actual"
            type="password"
            :rules="[(val) => !!val || 'Campo requerido']"
          />

          <q-input
            v-model="newPassword"
            label="Nueva contraseña"
            type="password"
            :rules="[(val) => !!val || 'Campo requerido', isValidPassword]"
          />

          <q-input
            v-model="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            :rules="[(val) => !!val || 'Campo requerido', passwordsMatch]"
          />

          <q-btn
            label="Cambiar contraseña"
            type="submit"
            color="yellow-9"
            :loading="passwordLoading"
            unelevated
            no-caps
            class="!w-full"
            size="15px"
          />
          <q-btn
            id="btn-pass-form-reset"
            label="Limpiar"
            type="reset"
            flat
            no-caps
            class="!w-full !mt-5"
            size="15px"
          />
        </q-form>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import supabase from '@services/supabase.services'
import useRoleComposable from '@composables/role'
import { ref, onMounted, computed } from 'vue'
import type { UserI } from '@interfaces/user'
import useSuper from '@composables/super'
import { Notify } from 'quasar'

const { isRoleLabel } = useRoleComposable()
const { store } = useSuper()
const file = ref(null)
const loading = ref(false)

// Tipo para los datos editables del usuario
type EditableUserData = Pick<UserI, 'fullname' | 'description' | 'images'> & {
  email: string
  cedula: string
  role: string
}

const userData = ref<EditableUserData>({
  email: '',
  role: 'user',
  fullname: '',
  description: '',
  cedula: '',
  images: { profile: null },
})

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)

// URL del avatar computada
const avatarUrl = computed(() => {
  if (!store.auth.current?.images?.profile) return 'https://placehold.co/150x150'

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(store.auth.current.images.profile)

  return publicUrl
})

// Cargar datos iniciales
const fetchUserData = () => {
  if (!store.auth.current) return

  userData.value = {
    email: store.auth.current.email,
    role: isRoleLabel(store.auth.current.role),
    fullname: store.auth.current.fullname,
    description: store.auth.current.description || '',
    images: store.auth.current.images || { profile: null },
    cedula: store.auth.current.cedula || '',
  }
}

const isValidCedula = (val: string) => {
  const regex = /^[0-9]{9}$/
  return regex.test(val) || 'Cédula inválida (9 dígitos)'
}

const isValidPassword = (val: string) => {
  return val.length >= 6 || 'Mínimo 6 caracteres'
}

const passwordsMatch = (val: string) => {
  return val === newPassword.value || 'Las contraseñas no coinciden'
}

// Manejar carga de imagen
const handleImageUpload = async (file: File) => {
  try {
    loading.value = true

    const currentUser = store.auth.current
    if (!currentUser?.id) throw new Error('Usuario no autenticado')

    const filePath = `${currentUser.id}/${Date.now()}_${file.name}`

    // Subir imagen con política de almacenamiento
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    })

    if (uploadError) throw uploadError

    // Actualizar usando ID de autenticación
    const { error: updateError } = await supabase
      .from('users')
      .update({
        images: {
          ...userData.value.images,
          profile: filePath,
        },
      })
      .eq('id', currentUser.id)

    if (updateError) throw updateError

    await store.auth.getUser(() => {}, true)

    Notify.create({
      type: 'positive',
      message: 'Imagen actualizada correctamente',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: `Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    })
  } finally {
    loading.value = false
  }
}

// Actualizar datos del perfil
const updateProfile = async () => {
  try {
    loading.value = true

    // Verificar usuario autenticado
    const currentUser = store.auth.current
    if (!currentUser?.id) throw new Error('Usuario no autenticado')

    // Usar auth.uid() para seguridad
    const { error } = await supabase
      .from('users')
      .update({
        fullname: userData.value.fullname,
        description: userData.value.description,
        updated_at: new Date().toISOString(),
        cedula: userData.value.cedula,
      })
      .eq('id', currentUser.id) // Cambiar a columna 'id' en lugar de user_id

    if (error) throw error

    // Actualizar store local
    await store.auth.getUser(() => {}, true)

    Notify.create({
      type: 'positive',
      message: 'Perfil actualizado correctamente',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    })
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
    passwordLoading.value = true

    if (!currentPassword.value || !newPassword.value) {
      throw new Error('Todos los campos son requeridos')
    }

    await supabase.auth.updateUser({
      password: newPassword.value,
      data: { current_password: currentPassword.value },
    }).then(()=>{
      Notify.create({
        type: 'positive',
        message: 'Contraseña actualizada correctamente',
      })
    })
    .catch((error)=>{
      if (error) throw error
        Notify.create({
        type: 'negative',
        message: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      })
    })
    .finally(()=> passwordLoading.value = false)
}

const resetFormPassword = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

onMounted(async () => {
  await store.auth.getUser()
  fetchUserData()
})
</script>

<style>
.container {
  max-width: 800px;
}

.mod-input .q-field__label {
  justify-self: anchor-center !important;
}
</style>
