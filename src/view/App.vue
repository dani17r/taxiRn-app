<template>   
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { watch } from 'vue'

const $q = useQuasar()

watch(() => $q.dark.isActive, (darkMode) => {
  document.documentElement.classList.toggle('dark', darkMode)
  document.body.classList.toggle('body--dark', darkMode)
})
</script>
