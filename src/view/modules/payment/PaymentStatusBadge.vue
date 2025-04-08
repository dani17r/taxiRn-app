<template>
  <q-badge 
    :color="statusColor" 
    text-color="white"
    class="q-pa-xs text-capitalize"
    style="min-width: 80px; justify-content: center;"
  >
    {{ statusText }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return statusMap[props.status] || props.status
})

const statusColor = computed(() => {
  switch (props.status) {
    case 'completed': return 'green'
    case 'pending': return 'orange'
    case 'cancelled': return 'red'
    default: return 'grey'
  }
})
</script>