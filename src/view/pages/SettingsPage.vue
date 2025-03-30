<template>
  <div class="bg-one flex flex-col items-center py-8 gap-4">
    <h1 class="!text-3xl font-bold text-yellow-8">User Settings</h1>
    <q-form @submit="updateSettings" class="flex flex-col w-full p-4 gap-6">
      <q-toggle
        v-model="settings.dark_mode"
        label="Modo Oscuro"
      />
      <q-toggle
        v-model="settings.show_online_status"
        label="Mostrar Estado en Línea"
      />
      <q-select
        v-model="settings.profile_visibility"
        :options="profileVisibilityOptions"
        label="Visibilidad del Perfil"
      />
      <q-select
        v-model="settings.preferred_language"
        :options="languageOptions"
        label="Idioma Preferido"
      />
      <q-input
        v-model="settings.time_zone"
        label="Zona Horaria"
      />
      <q-btn type="submit" label="Guardar Configuracion" color="yellow-9" unelevated class="w-full mt-4" />
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import useSuperComposable from 'src/composables/super';
import supabase from 'src/services/supabase.services';

const settings = ref({
  dark_mode: false,
  show_online_status: true,
  profile_visibility: 'public',
  preferred_language: 'es',
  time_zone: 'UTC',
});

const profileVisibilityOptions = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
];

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

const { store } = useSuperComposable();

const fetchSettings = async () => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', store.auth.current?.id ?? '')
    .single();

  if (data) {
    settings.value = data;
  } else if (error) {
    console.error('Error fetching settings:', error.message);
  }
};

const updateSettings = async () => {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      ...settings.value,
      user_id: store.auth.current?.id ?? '',
    });

  if (error) {
    console.error('Error updating settings:', error.message);
  } else {
    alert('Settings updated successfully!');
  }
};

onMounted(fetchSettings);
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
</style>
