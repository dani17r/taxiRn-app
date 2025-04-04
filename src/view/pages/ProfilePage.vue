<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="flex justify-center p-8 w-full">
        <h2 class="!text-3xl !font-bold mb-6 text-yellow-8">
          Perfil de {{ store.auth.getRoleAdmin ? 'admin' : 'usuario' }}
        </h2>

        <div class="flex flex-col items-center mb-8 w-full" v-if="!store.auth.getRoleAdmin">
          <q-avatar size="120px" class="mb-4">
            <q-img :src="avatarUrl" referrerpolicy="no-referrer" />
          </q-avatar>
          <q-file
            @update:model-value="handleImageUpload"
            label="Cambiar foto de perfil"
            accept=".jpg, .png, .jpeg"
            class="w-full mod-input"
            v-model="currentFile"
            borderless
            max-files="1"
          />
        </div>

        <!-- Formulario de perfil -->
        <q-form @submit.prevent="updateProfile" @reset="resetForm" class="space-y-6 w-full">
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

          <!-- Cédula -->
          <q-input
            v-model="cedula"
            label="Cédula"
            class="w-full"
            :rules="validationRules"
            maxlength="10"
          />

          <!-- Número de Teléfono -->
          <q-input
            v-model="userData.phone"
            label="Número de teléfono"
            mask="04##-###-####"
            unmasked-value
            :rules="[required, phoneNumberVe]"
            class="w-full"
          />

          <!-- Fecha de Nacimiento -->
          <q-input
            v-model="userData.birthdate"
            label="Fecha de nacimiento"
            mask="##/##/####"
            :rules="[validateBirthdate]"
            class="w-full"
            hint="DD/MM/AAAA"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="userData.birthdate" mask="DD/MM/YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

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
            <div class="flex justify-around mt-3">
              <q-btn label="Reiniciar" type="reset" flat no-caps size="15px" @click="resetForm()" />
              <q-btn label="Limpiar" flat @click="clearForm()" no-caps size="15px" />
            </div>
          </div>
        </q-form>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { phoneNumberVe, required, validateBirthdate } from '@utils/validations'
import type { InputsI } from '@interfaces/user'
import { useCedula } from '@composables/useCedula'
import supabase from '@services/supabase.services'
import useRoleComposable from '@composables/role'
import { ref, onMounted } from 'vue'
import useSuper from '@composables/super'
import { Notify, date } from 'quasar'
import imageProfileComposable from '@composables/images'

const { cedula, validationRules, resetCedula } = useCedula()

const { isRoleLabel } = useRoleComposable()
const { store } = useSuper()
const { avatarUrl } = imageProfileComposable(store)

const loading = ref(false)
const currentFile = ref(null)
const userData = ref<InputsI['UpdateI']>({
  images: { profile: null },
  description: '',
  birthdate: '',
  role: 'user',
  fullname: '',
  email: '',
  phone: '',
})


// Cargar datos iniciales
const fetchUserData = () => {
  if (!store.auth.current) return

  const dateFormatter = store.auth.current.birthdate
    ? date.formatDate(store.auth.current.birthdate, 'DD/MM/YYYY')
    : ''

  userData.value = {
    email: store.auth.current.email,
    role: isRoleLabel(store.auth.current.role),
    fullname: store.auth.current.fullname,
    description: store.auth.current.description || '',
    images: store.auth.current.images || { profile: null },
    phone: store.auth.current.phone || '', // Fetch phone
    birthdate: dateFormatter,
  }

  cedula.value = String(store.auth.current.cedula)
}

// Manejar carga de imagen
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
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

    if (uploadError) throw uploadError

    // Actualizar referencia en la base de datos
    const { error: dbError } = await supabase
      .from('users')
      .update({
        images: { profile: fileName },
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id)

    if (dbError) throw dbError

    // Forzar actualización de la URL
    supabase.storage.from('avatars').getPublicUrl(fileName)

    // Actualizar estado local
    store.auth.current!.images!.profile = fileName
    userData.value.images!.profile = fileName
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
        cedula: cedula.value,
        phone: userData.value.phone, // Add phone to update
        // Convert date from DD/MM/YYYY back to ISO for DB
        birthdate: userData.value.birthdate
          ? date.formatDate(date.extractDate(userData.value.birthdate, 'DD/MM/YYYY'), 'YYYY-MM-DD')
          : null, // Add birthdate to update
      })
      .eq('id', currentUser.id)

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

const resetForm = () => {
  const dateFormatter = store.auth.current?.birthdate
    ? date.formatDate(store.auth.current?.birthdate, 'DD/MM/YYYY')
    : ''

  userData.value.email = store.auth.current?.email || ''
  userData.value.role = isRoleLabel(String(store.auth.current?.role)) || 'user'
  userData.value.fullname = store.auth.current?.fullname || ''
  userData.value.description = store.auth.current?.description || ''
  userData.value.phone = store.auth.current?.phone || ''
  userData.value.birthdate = dateFormatter
  userData.value.images = store.auth.current?.images || { profile: null }
  cedula.value = String(store.auth.current?.cedula) || ''
}

const clearForm = () => {
  userData.value.fullname = ''
  userData.value.description = ''
  userData.value.phone = ''
  userData.value.birthdate = ''
  userData.value.cedula = ''
  userData.value.images = store.auth.current?.images || { profile: null }
  resetCedula()
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
