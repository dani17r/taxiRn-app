<template>
  <div>
    <div class="text-h6 q-mb-md">Información del Contrato</div>
    <div v-if="contract" class="q-gutter-y-sm">
      <div><strong>ID:</strong> {{ contract.id_contract?.toString().slice(8) }}</div>
      <div><strong>Servicio:</strong> {{ translateServiceType(contract.service_type) }}</div>
      <div><strong>Estado:</strong> {{ translateStatus(contract.status) }}</div>
      <div><strong>Fecha:</strong> {{ formatDate(String(contract.created_at)) }}</div>
    </div>
    <div v-else class="text-grey-6">
      Cargando detalles del contrato...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@services/supabase.services'
import type { ContractI } from '@interfaces/contract'

const props = defineProps<{
  contractId: string
}>()

const contract = ref<ContractI | null>(null)

const fetchContract = async () => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', props.contractId)
      .single()

    if (error) throw error
    contract.value = data as ContractI
  } catch (error) {
    console.error('Error loading contract:', error)
  }
}

const translateServiceType = (type: string) => {
  const typeMap: Record<string, string> = {
    taxi: 'Taxi',
    delivery: 'Delivery',
    both: 'Taxi + Delivery'
  }
  return typeMap[type] || type
}

const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  await fetchContract()
})
</script>