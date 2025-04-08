<template>
  <q-page class="fixed left-0 top-13 w-full h-screen mobile-keyboard-fix">
    <div class="mt-5 px-8">
      <div class="flex justify-between items-center q-mb-md">
        <h1 class="text-h4">Historial de Pagos</h1>
      </div>
    </div>
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-36">
      <div class="q-px-md">
        <PaymentListItems
          :payments="paginatedPayments"
          :loading="loading"
          @payment-selected="showPaymentDetails"
        />

        <div class="row justify-center q-mt-xl" v-if="totalPages > 1">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="6"
            direction-links
            boundary-links
            color="yellow-9"
            active-design="unelevated"
            active-color="yellow-9"
            active-text-color="white"
          />
          <div class="text-caption q-mt-sm full-width text-center">
            Mostrando {{ paginatedPayments.length }} de {{ totalPayments }} pagos
          </div>
        </div>
      </div>
    </q-scroll-area>
    <PaymentDetailsDialog
      v-model="showDetailsDialog"
      :payment="selectedPayment"
      v-if="selectedPayment"
    />
  </q-page>
</template>

<script setup lang="ts">
import PaymentDetailsDialog from '@modules/payment/PaymentDetailsDialog.vue'
import PaymentListItems from '@modules/payment/PaymentListItems.vue'
import { supabase } from '@services/supabase.services'
import useSuperComposable from '@composables/super'
import type { Payment } from '@interfaces/payment'
import { ref, computed, onMounted } from 'vue'

const { store } = useSuperComposable()
const loading = ref(false)
const payments = ref<Payment[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showDetailsDialog = ref(false)
const selectedPayment = ref<Payment | null>(null)

const fetchPayments = async () => {
  try {
    loading.value = true
    payments.value = []

    let query = supabase
      .from('payments')
      .select(
        `
        *, 
        contract:contracts!contract_id (*)
      `,
      )
      .order('created_at', { ascending: false })

    if (store.auth.getRoleUser) {
      query = query.eq('user_id', store.auth.current?.id)
    }
    if (store.auth.getRoleDriver) {
      query = query.eq('contract.vehicle_id', store.auth.current?.id)
    } else if (store.auth.getRoleAdmin) {
      query = query.eq('user_id', store.auth.current?.id)
    }

    const { data, error } = await query

    if (error) throw error
    payments.value = data as Payment[]
  } catch (error) {
    console.error('Error loading payments:', error)
  } finally {
    loading.value = false
  }
}

const showPaymentDetails = (payment: Payment) => {
  selectedPayment.value = payment
  showDetailsDialog.value = true
}

const totalPayments = computed(() => payments.value.length)
const totalPages = computed(() => Math.ceil(totalPayments.value / itemsPerPage.value))
const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return payments.value.slice(start, end)
})

onMounted(async () => {
  await fetchPayments()
})
</script>
