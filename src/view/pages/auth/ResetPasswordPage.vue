<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 px-8 bg-white">
      <div class="text-center">
        <h2 class="!text-3xl font-bold">
          Restablecer tu contraseña
        </h2>
      </div>

      <q-form @submit.prevent="handleResetPassword" class="space-y-6">
        <q-input
          v-model="newPassword"
          label="Nueva contraseña"
          type="password"
          :rules="passwordRules"
          required
        />
        
        <q-btn
          type="submit"
          color="yellow-9"
          class="!w-full"
          :loading="loading"
        >
          Restablecer contraseña
        </q-btn>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from '@services/supabase.services';
import { useRouter, useRoute } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const email = ref('');
const newPassword = ref('');
const loading = ref(false);

const passwordRules = [
  (v: string) => !!v || 'Contraseña requerida',
  (v: string) => v.length >= 6 || 'Mínimo 6 caracteres'
];

const handleResetPassword = async () => {
  loading.value = true;
  try {

    if (!route.params.token) throw new Error('Invalid token');
    
    await supabase.auth.verifyOtp({
      type: 'recovery',
      token: route.params.token as string,
      email: email.value,
    }).then(async ()=>{

      await supabase.auth.updateUser({
        password: newPassword.value,
        email: email.value
      }).then(async ()=>{
        
        $q.notify({
          type: 'positive',
          message: 'Contraseña actualizada exitosamente!'
        });
         
        await router.push('/login');
      })
    })

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al actualizar la contraseña'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(()=>{
  email.value = String(localStorage.getItem('forgotPasswordEmail') || '');
})
</script>