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
          v-model="email"
          label="Correo electrónico"
          type="email"
          :rules="emailRules"
          required
        />
        
        <q-input
          v-model="code"
          label="Código de verificación"
          :rules="codeRules"
          required
        />
        
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
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const email = ref('');
const code = ref('');
const newPassword = ref('');
const loading = ref(false);

const emailRules = [
  (val: string) => !!val || 'El correo electrónico es requerido',
  (val: string) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Correo electrónico inválido'
];
const codeRules = [(v: string) => !!v || 'Código requerido'];
const passwordRules = [
  (v: string) => !!v || 'Contraseña requerida',
  (v: string) => v.length >= 6 || 'Mínimo 6 caracteres'
];

const handleResetPassword = async () => {
  loading.value = true;
  try {
    const { error } = await supabase.functions.invoke('reset-password', {
      body: {
        email: email.value,
        code: code.value,
        new_password: newPassword.value
      }
    });

    if (error) throw error;
    
    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada exitosamente!'
    });
    
    await router.push('/login');
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