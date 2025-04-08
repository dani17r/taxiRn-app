<template>
  <div>
    <div class="text-h6 q-mb-md">Información del Pago</div>
    <div class="q-gutter-y-sm">
      <div><strong>Monto:</strong> {{ formatCurrency(payment.amount, payment.currency) }}</div>
      <div><strong>Método:</strong> {{ payment.payment_method }}</div>
      <div><strong>Referencia:</strong> {{ payment.transaction_id }}</div>
      <div><strong>Estado:</strong> <PaymentStatusBadge :status="payment.status" /></div>
      <div><strong>Fecha:</strong> {{ formatDate(payment.created_at) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PaymentStatusBadge from '@modules/payment/PaymentStatusBadge.vue'
import type { Payment } from '@interfaces/payment'

defineProps<{
  payment: Payment
}>()

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