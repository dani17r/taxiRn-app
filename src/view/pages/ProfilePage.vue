<template>
  <!-- Mantenemos el mismo template -->
  <q-page class="container mx-auto p-4 max-w-2xl">
    <div class="bg-white p-6">
      <h2 class="!text-3xl !font-bold mb-6">Perfil de Usuario</h2>

      <!-- Avatar y carga de imagen -->
      <div class="flex flex-col items-center mb-8">
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
      <q-form @submit.prevent="updateProfile" class="space-y-6">
        <!-- Campos del formulario... -->
        <q-input v-model="userData.email" label="Email" readonly class="w-full" disable />

        <!-- Rol (solo lectura) -->
        <q-input
          v-model="userData.role"
          label="Rol"
          readonly
          disable
          class="w-full"
        />

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

        <!-- Botones de acción -->
        <div class="flex flex-col justify-end gap-4">
          <q-btn label="Limpiar" type="reset" flat @click="fetchUserData" />
          <q-btn label="Guardar cambios" type="submit" color="yellow-9" :loading="loading" unelevated />
        </div>
      </q-form>
    </div>
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
  role: string
}

const userData = ref<EditableUserData>({
  email: '',
  role: 'user',
  fullname: '',
  description: '',
  images: { profile: null },
})

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
  }
}

// Manejar carga de imagen
const handleImageUpload = async (file: File) => {
  try {
    loading.value = true
    if (!store.auth.current?.id) throw new Error('Usuario no autenticado')

    const filePath = `${store.auth.current.id}/${Date.now()}_${file.name}`

    // Subir imagen
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

    if (uploadError) throw uploadError

    // Actualizar referencia en la base de datos
    const { error: updateError } = await supabase
      .from('users')
      .update({ images: { ...userData.value.images, profile: filePath } })
      .eq('user_id', store.auth.current.id)

    if (updateError) throw updateError

    // Actualizar store
    await store.auth.getUser(() => {}, true)
    Notify.setDefaults({
      color: 'positive',
      message: 'Imagen actualizada correctamente',
    })
  } catch (error) {
    Notify.setDefaults({
      color: 'negative',
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
    if (!store.auth.current?.id) throw new Error('Usuario no autenticado')

    const { error } = await supabase
      .from('users')
      .update({
        fullname: userData.value.fullname,
        description: userData.value.description,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', store.auth.current.id)

    if (error) throw error

    // Actualizar store
    await store.auth.getUser(() => {}, true)
    Notify.setDefaults({
      color: 'positive',
      message: 'Perfil actualizado correctamente',
    })
  } catch (error) {
    Notify.setDefaults({
      color: 'negative',
      message: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    })
  } finally {
    loading.value = false
  }
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

.mod-input .q-field__label{
    justify-self: anchor-center !important;
}
</style>
