<template>
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
          Contrato: {{ payment.contract_id.slice(0, 8) }} | 
          Método: {{ payment.payment_method }}
        </q-item-label>
        <q-item-label caption>
          Fecha: {{ formatDate(payment.created_at) }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label class="text-weight-bold q-mb-xs">
          {{ formatCurrency(payment.amount, payment.currency) }}
        </q-item-label>
        <PaymentStatusBadge :status="payment.status" />
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
</template>

<script setup lang="ts">
import PaymentStatusBadge from '@modules/payment/PaymentStatusBadge.vue'
import type { Payment } from '@interfaces/payment'

defineProps<{
  payments: Payment[]
  loading: boolean
}>()

defineEmits(['payment-selected'])

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount)
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