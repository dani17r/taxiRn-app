<template>
  <q-page class="fixed left-0 top-13 w-full h-screen mobile-keyboard-fix">
     <div class="flex justify-center pt-6 w-full">
       <h2 class="!text-3xl/1 !font-bold text-yellow-8">
         Opciones de {{ store.auth.getRoleAdmin ? 'admin' : 'usuario' }}
       </h2>
     </div>
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="flex justify-center px-8 w-full">
        <q-form
          @submit.prevent="updatePassword"
          @reset="resetFormPassword"
          class="space-y-4 w-full mt-8"
        >
          <h3 class="!text-2xl !font-bold my-6 !w-full text-center">Cambiar contraseña</h3>
          <q-input
            v-model="currentPassword"
            label="Contraseña actual"
            type="password"
            :rules="[required]"
             color="yellow-9"
          />

          <q-input
            v-model="newPassword"
            label="Nueva contraseña"
            type="password"
            :rules="[required, isValidPassword]"
             color="yellow-9"
          />

          <q-input
            v-model="confirmPassword"
            label="Confirmar nueva contraseña"
            type="password"
            :rules="[required, passwordsMatch]"
             color="yellow-9"
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
import { ref } from 'vue'
import useSuperComposable from 'src/composables/super';
import supabase from 'src/services/supabase.services'
import { Notify } from 'quasar'
import { required } from '@utils/validations';

const { store } = useSuperComposable()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)

// const settings = ref({
//   dark_mode: false,
//   show_online_status: true,
//   profile_visibility: 'public',
//   preferred_language: 'es',
//   time_zone: 'UTC',
// });

// const profileVisibilityOptions = [
//   { label: 'Public', value: 'public' },
//   { label: 'Private', value: 'private' },
// ];

// const languageOptions = [
//   { label: 'Español', value: 'es' },
//   { label: 'English', value: 'en' },
// ];

// const { store } = useSuperComposable();

// const fetchSettings = async () => {
//   const { data, error } = await supabase
//     .from('user_settings')
//     .select('*')
//     .eq('user_id', store.auth.current?.id ?? '')
//     .single();

//   if (data) {
//     settings.value = data;
//   } else if (error) {
//     console.error('Error fetching settings:', error.message);
//   }
// };

// const updateSettings = async () => {
//   const { error } = await supabase
//     .from('user_settings')
//     .upsert({
//       ...settings.value,
//       user_id: store.auth.current?.id ?? '',
//     });

//   if (error) {
//     console.error('Error updating settings:', error.message);
//   } else {
//     alert('Settings updated successfully!');
//   }
// };

const updatePassword = async () => {
  passwordLoading.value = true

  if (!currentPassword.value || !newPassword.value) {
    throw new Error('Todos los campos son requeridos')
  }

  await supabase.auth
    .updateUser({
      password: newPassword.value,
      data: { current_password: currentPassword.value },
    })
    .then(() => {
      Notify.create({
        type: 'positive',
        message: 'Contraseña actualizada correctamente',
      })
    })
    .catch((error) => {
      if (error) throw error
      Notify.create({
        type: 'negative',
        message: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      })
    })
    .finally(() => (passwordLoading.value = false))
}

const resetFormPassword = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

const isValidPassword = (val: string) => {
  return val.length >= 6 || 'Mínimo 6 caracteres'
}

const passwordsMatch = (val: string) => {
  return val === newPassword.value || 'Las contraseñas no coinciden'
}
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
