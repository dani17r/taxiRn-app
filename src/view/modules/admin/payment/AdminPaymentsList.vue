<template>
  <div>
    <q-list separator v-if="!loading">
      <q-item 
        v-for="payment in payments" 
        :key="payment.id" 
        class="q-py-md"
        clickable
        @click="$emit('payment-selected', payment)"
      >
        <q-item-section>
          <q-item-label class="text-weight-bold">
            Ref: {{ payment.transaction_id }}
          </q-item-label>
          <q-item-label caption>
            Contrato: {{ payment.contract?.id_contract?.toString().slice(8) }} | 
            Método: {{ payment.payment_method }}
          </q-item-label>
          <q-item-label caption>
            Fecha: {{ formatDate(payment.created_at) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label class="text-weight-bold q-mb-xs">
            ${{ payment.amount.toFixed(2) }}
          </q-item-label>
          <q-badge 
            :color="getStatusColor(payment.status)" 
            text-color="white"
            class="q-pa-xs text-capitalize"
            style="min-width: 80px; justify-content: center;"
          >
            {{ translateStatus(payment.status) }}
          </q-badge>
        </q-item-section>

       
      </q-item>

      <q-item v-if="!payments.length && !loading">
        <q-item-section class="text-center text-grey-6 q-py-lg">
          No se encontraron pagos.
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else class="flex justify-center items-center q-py-xl">
      <q-spinner-gears size="50px" color="yellow-9" />
    </div>

    <div class="row justify-center q-mt-md" v-if="payments.length > 0">
      <div class="text-caption text-grey-6">
        Mostrando {{ payments.length }} pagos
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { PaymentWithShipT } from '@interfaces/payment'

defineProps<{
  payments: PaymentWithShipT[]
  loading: boolean
}>()

defineEmits(['payment-selected', 'verify-payment', 'reject-payment'])

const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'green'
    case 'pending': return 'orange'
    case 'cancelled': return 'red'
    default: return 'grey'
  }
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

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>