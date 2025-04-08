<template>
  <div>
    <div class="text-h6 q-mb-md">Información del Contrato</div>
    <div v-if="contract" class="q-gutter-y-sm">
      <div><strong>ID:</strong> {{ contract.id_contract?.toString().slice(8) }}</div>
      <div><strong>Servicio:</strong> {{ translateServiceType(contract.service_type) }}</div>
      <div><strong>Estado:</strong> <PaymentStatusBadge :status="contract.status" /></div>
      <div><strong>Precio:</strong> ${{ contract.price?.toFixed(2) || '0.00' }}</div>
      <div><strong>Fecha:</strong> {{ formatDate(String(contract.created_at)) }}</div>
      <div v-if="contract.route_id"><strong>Tipo:</strong> Ruta</div>
      <div v-else-if="contract.location_id"><strong>Tipo:</strong> Ubicación</div>
    </div>
    <div v-else class="text-grey-6">
      Cargando detalles del contrato...
    </div>
  </div>
</template>

<script setup lang="ts">
import PaymentStatusBadge from '@modules/payment/PaymentStatusBadge.vue'
import type { ContractI } from '@interfaces/contract'

defineProps<{
  contract: ContractI
}>()

const translateServiceType = (type: string) => {
  const typeMap: Record<string, string> = {
    taxi: 'Taxi',
    delivery: 'Delivery',
    both: 'Taxi + Delivery'
  }
  return typeMap[type] || type
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>