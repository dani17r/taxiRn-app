<template>
  <q-page class="fixed left-0 top-13 w-full h-screen mobile-keyboard-fix">
    <div class="flex justify-between items-center q-mb-md px-6 mt-4">
      <h1 class="!text-[28px]/10">Administración de Pagos</h1>
      <q-input
        v-model="searchTerm"
        outlined
        dense
        placeholder="Buscar pagos..."
        class="w-full mt-2"
        color="yellow-9"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-scroll-area style="height: 90vh; width: 100%" class="pb-56">
      <AdminPaymentsList
        class="px-3"
        :payments="filteredPayments"
        :loading="loading"
        @payment-selected="showPaymentDetails"
        @verify-payment="verifyPayment"
        @reject-payment="rejectPayment"
      />
    </q-scroll-area>

    <PaymentAdminDialog
      v-model="showDetailsDialog"
      :payment="selectedPayment"
      @verify="verifyPayment"
      @reject="rejectPayment"
    />
    <DraggableButton
      v-if="payments.length"
      :initialX="90"
      :initialY="87"
      color="yellow-9"
      icon="restart_alt"
      :offsetTopPx="50" 
      :offsetBottomPx="65"
      size="md"
      @click="fetchPayments"
    />
  </q-page>
</template>

<script setup lang="ts">
import PaymentAdminDialog from '@modules/admin/payment/PaymentAdminDialog.vue'
import AdminPaymentsList from '@modules/admin/payment/AdminPaymentsList.vue'
import DraggableButton from '@components/DroggableButton.vue'
import type { PaymentWithShipT } from '@interfaces/payment'
import { supabase } from '@services/supabase.services'
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const payments = ref<PaymentWithShipT[]>([])
const searchTerm = ref('')
const showDetailsDialog = ref(false)
const selectedPayment = ref<PaymentWithShipT | null>(null)

// Filtrar pagos por término de búsqueda
const filteredPayments = computed(() => {
  if (!searchTerm.value) return payments.value
  const term = searchTerm.value.toLowerCase()
  return payments.value.filter((p) => {
    return (
      p.transaction_id.toLowerCase().includes(term) ||
      p.contract_id.toLowerCase().includes(term) ||
      p.payment_method.toLowerCase().includes(term)
    )
  })
})

// Obtener todos los pagos
const fetchPayments = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *, 
        contract:contract_id (*),
        user:user_id (*)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    payments.value = data as PaymentWithShipT[]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar pagos',
      caption: error instanceof Error ? error.message : 'Error desconocido',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

// Verificar pago
const verifyPayment = async (paymentId: string) => {
  try {
    loading.value = true
    await updatePaymentStatus(paymentId, 'completed')
    await updateContractStatus(paymentId, 'completed')
    $q.notify({ type: 'positive', message: 'Pago verificado correctamente', position: 'top-right', })
    await fetchPayments()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al verificar pago',
      caption: error instanceof Error ? error.message : 'Error desconocido',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

// Rechazar pago
const rejectPayment = async (paymentId: string) => {
  try {
    loading.value = true
    await updatePaymentStatus(paymentId, 'cancelled')
    await updateContractStatus(paymentId, 'cancelled')
    $q.notify({ type: 'positive', message: 'Pago rechazado correctamente', position: 'top-right', })
    await fetchPayments()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al rechazar pago',
      caption: error instanceof Error ? error.message : 'Error desconocido',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

// Actualizar estado del pago
const updatePaymentStatus = async (paymentId: string, status: 'completed' | 'cancelled') => {
  const { error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', paymentId)

  if (error) throw error
}

// Actualizar estado del contrato
const updateContractStatus = async (paymentId: string, status: 'completed' | 'cancelled') => {
  // Primero obtener el contract_id asociado al pago
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .select('contract_id')
    .eq('id', paymentId)
    .single()

  if (paymentError) throw paymentError

  // Luego actualizar el contrato
  const { error: contractError } = await supabase
    .from('contracts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', paymentData.contract_id)

  if (contractError) throw contractError
}

const showPaymentDetails = (payment: PaymentWithShipT) => {
  selectedPayment.value = payment
  showDetailsDialog.value = true
}

onMounted(async () => {
  await fetchPayments()
})
</script>
