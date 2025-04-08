<template>
  <div>
    <div class="text-h6 q-mb-md">Información del Conductor</div>
    <div class="q-gutter-y-sm">
      <div><strong>Nombre:</strong> {{ contract.vehicle?.user?.fullname }}</div>
      <div><strong>Teléfono:</strong> {{ formatPhone(String(contract.vehicle?.user?.phone)) }}</div>
      <div><strong>Email:</strong> {{ contract.vehicle?.user?.email }}</div>
      
      <div class="text-h6 q-mt-md q-mb-sm">Vehículo</div>
      <div><strong>Placa:</strong> {{ contract?.vehicle?.license_plate }}</div>
      <div><strong>Marca/Modelo:</strong> {{ contract?.vehicle?.brand }} {{ contract?.vehicle?.model }}</div>
      <div><strong>Año:</strong> {{ contract?.vehicle?.year }}</div>
      <div><strong>Color:</strong> {{ contract?.vehicle?.color }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContractWithShipT } from '@interfaces/contract';

defineProps<{
  contract: ContractWithShipT
}>()

const formatPhone = (phone: string | null) => {
  return phone ? `+58${phone}` : 'No disponible'
}
</script>