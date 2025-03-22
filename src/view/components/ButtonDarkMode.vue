<template>
  <q-btn
    :label="activeTitle ? $q.dark.isActive ? 'Modo claro' : 'Modo oscuro' : ''"
    :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
    @click="toggleDarkMode"
    color="yellow-9"
    fab-mini
    no-caps
    flat
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted } from 'vue'

const $q = useQuasar()

defineProps({
  activeTitle: Boolean,
});

defineOptions({
  inheritAttrs: true,
})

const toggleDarkMode = () => {
  $q.dark.toggle()
  localStorage.theme = $q.dark.isActive.toString()
}

onMounted(() => {
  const savedDarkMode = localStorage.theme
  if (savedDarkMode !== undefined) {
    $q.dark.set(savedDarkMode === 'true')
  }
})
</script>
