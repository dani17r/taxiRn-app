<template>
  <div>
    <div class="text-h6 q-mb-md">Información del Cliente</div>
    <div v-if="client" class="q-gutter-y-sm">
      <div><strong>Nombre:</strong> {{ client.fullname }}</div>
      <div><strong>Cédula:</strong> {{ client.cedula || 'No registrada' }}</div>
      <div><strong>Teléfono:</strong> {{ formatPhone(client.phone) }}</div>
      <div><strong>Email:</strong> {{ client.email }}</div>
      <div><strong>Registrado:</strong> {{ formatDate(String(client.created_at)) }}</div>
    </div>
    <div v-else class="text-grey-6">
      Cargando información del cliente...
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserI } from '@interfaces/user'

defineProps<{
  client: UserI
}>()

const formatPhone = (phone: string | null) => {
  return phone ? `+58${phone}` : 'No disponible'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>