<template>
  <q-dialog v-model="modelValue" maximized>
    <q-card class="bg-one">
      <q-toolbar
        class="bg-yellow-9 text-white"
        style="position: fixed; top: 0; left: 0; right: 0; z-index: 1"
      >
        <q-toolbar-title> Detalles de Pago - Ref: {{ payment?.transaction_id }} </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>
      <q-card-section
        v-if="payment"
        style="margin-top: 56px; overflow-y: auto; max-height: calc(100vh - 90px)"
      >
        <div class="row q-col-gutter-md">
          <PaymentInfoSection :payment="payment" class="col-12 col-md-6" />
          <ContractInfoSection :contract-id="payment.contract_id" class="col-12 col-md-6" />
          <UserInfoSection :contract-id="payment.contract_id" class="col-12 col-md-6" />
          <PaymentProofSection :image-url="payment.image" class="col-12 col-md-6" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import PaymentInfoSection from '@modules/payment/PaymentInfoSection.vue'
import ContractInfoSection from '@modules/payment/ContractInfoSection.vue'
import UserInfoSection from '@modules/payment/UserInfoSection.vue'
import PaymentProofSection from '@modules/payment/PaymentProofSection.vue'
import type { PaymentWithShipT } from '@interfaces/payment'

const modelValue = defineModel('modelValue', { default: false })

defineProps<{
  payment: PaymentWithShipT | null
}>()

defineEmits(['update:modelValue'])
</script>
