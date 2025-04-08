<template>   
  <router-view />
</template>

<script setup lang="ts">
import supabase from '@services/supabase.services'
import useSuperComposable from '@composables/super'
import { useQuasar } from 'quasar'
import { watch } from 'vue'

const $q = useQuasar()
const { store } = useSuperComposable()

supabase
  .channel('notify-driver')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notify',
      filter: `user_id=eq.${store.auth.current?.user_id}`,
    },
    (payload) => {
      // Mostrar notificación con Quasar
      $q.notify({
        message: payload.new.title,
        caption: payload.new.description,
        color: 'primary',
        icon: 'assignment',
         position: 'top-right',
      });
    }
  )
  .subscribe();

watch(() => $q.dark.isActive, (darkMode) => {
  document.documentElement.classList.toggle('dark', darkMode)
  document.body.classList.toggle('body--dark', darkMode)
})
</script>
