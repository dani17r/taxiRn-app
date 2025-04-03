<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8 p-8 rounded-lg">
      <div class="text-center">
        <h2 class="mt-6 !text-3xl font-bold">
          Recupera tu contraseña
        </h2>
        <p class="mt-2 text-sm text-gray-5">
          Ingresa tu correo electrónico para restablecer tu contraseña
        </p>
      </div>

      <q-form @submit.prevent="handleForgotPassword" class="space-y-6">
        <q-input
          v-model="email"
          label="Correo electrónico"
          type="email"
          :rules="emailRules"
          required
        />
        
        <q-btn
          type="submit"
          color="yellow-9"
          class="!w-full"
          :loading="loading"
          @click="saveEmail"
        >
          Aceptar
        </q-btn>

        <div class="text-center text-sm mt-10">
          <router-link
            :to="{ name: 'login' }"
            class="text-yellow-9 hover:text-yellow-9-dark"
          >
            Volver al inicio de sesión
          </router-link>
        </div>
      </q-form>

      <q-dialog v-model="showSuccessDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">Éxito!</div>
          </q-card-section>
          <q-card-section>
            Hemos enviado un enlace de recuperación a tu correo electrónico.
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="yellow-9" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { supabase } from '@services/supabase.services';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

const $q = useQuasar();

const email = ref('');
const loading = ref(false);
const showSuccessDialog = ref(false);

const emailRules = [
  (val: string) => !!val || 'El correo electrónico es requerido',
  (val: string) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Correo electrónico inválido'
];

const handleForgotPassword = async () => {
  loading.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: 'taxirnapp://reset-password',
    });

    if (error) throw error;
    
    $q.notify({
      type: 'positive',
      message: 'Código enviado a tu correo'
    });
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al enviar el código'
    });
  } finally {
    loading.value = false;
  }
};

const saveEmail = () => {
  localStorage.setItem('forgotPasswordEmail', email.value);
};
</script>