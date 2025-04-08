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

      <div style="margin-top: 50px; overflow-y: auto; max-height: calc(100vh - 90px)">
        <q-card-section v-if="payment" class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Información del Pago -->
            <div class="col-12 col-md-6">
              <PaymentInfoSection :payment="payment" />
            </div>
             <!-- Comprobante de Pago -->
            <div class="col-12">
              <PaymentProofSection :image-url="payment.image" />
            </div>

            <!-- Acciones para Admin -->
            <div v-if="payment.status === 'pending' && paymentStatusBtn" class="col-12 flex flex-col justify-end gap-4">
              <q-btn
                label="Rechazar Pago"
                color="negative"
                icon="close"
                @click="confirmReject(payment.id)"
              />
              <q-btn
                label="Verificar Pago"
                color="positive"
                icon="check"
                @click="confirmVerify(payment.id)"
              />
            </div>

            <!-- Información del Contrato -->
            <div class="col-12 col-md-6">
              <ContractAdminSection  v-if="contract" :contract="contract" />
            </div>

            <!-- Información del Cliente -->
            <div class="col-12 col-md-6">
              <ClientAdminSection v-if="payment.user" :client="payment.user" />
            </div>

            <!-- Información del Conductor y Vehículo -->
            <div class="col-12 col-md-6">
              <DriverVehicleSection v-if="contract" :contract="contract" />
            </div>

            <!-- Mapa y Ruta -->
            <div class="col-12">
              <div class="text-h6 q-mb-md">Ubicación del Servicio</div>
              <div class="border rounded-borders" style="height: 400px">
                <ViewMapSample 
                  v-if="contract"
                  :route-id="String(contract?.route_id)" 
                  :location-id="String(contract?.location_id)" 
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import ContractAdminSection from '@modules/admin/payment/ContractAdminSection.vue'
import DriverVehicleSection from '@modules/admin/payment/DriverVehicleSection.vue'
import ClientAdminSection from '@modules/admin/payment/ClientAdminSection.vue'
import PaymentProofSection from '@modules/payment/PaymentProofSection.vue'
import PaymentInfoSection from '@modules/payment/PaymentInfoSection.vue'
import type { ContractWithShipT } from '@interfaces/contract'
import type { PaymentWithShipT } from '@interfaces/payment'
import ViewMapSample from '@modules/map/ViewMapSample.vue'
import supabase from '@services/supabase.services'
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

const $q = useQuasar()
const modelValue = defineModel('modelValue', { default: false })
const props = defineProps<{
  payment: PaymentWithShipT | null
}>()

const emit = defineEmits(['update:modelValue', 'verify', 'reject'])
const paymentStatusBtn = ref(true)
const contract = ref<ContractWithShipT | null>(null)

const confirmVerify = (paymentId: string) => {
  $q.dialog({
    title: 'Confirmar Verificación',
    message: '¿Estás seguro de que deseas verificar este pago?',
    cancel: true,
    persistent: true,
    ok: 'Si',
    color: 'yellow-9',
  }).onOk(() => {
    emit('verify', paymentId)
    paymentStatusBtn.value = false
    modelValue.value = false
  })
}

const confirmReject = (paymentId: string) => {
  $q.dialog({
    title: 'Confirmar Rechazo',
    message: '¿Estás seguro de que deseas rechazar este pago?',
    cancel: true,
    persistent: true,
    color: 'yellow-9',
    ok: 'Si',
    class:'!shadow-none bg-one',
  }).onOk(() => {
    emit('reject', paymentId)
    modelValue.value = false
  })
}

const fetchContract = async () => {
  if (!props.payment?.contract_id) return
  
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        vehicle:vehicle_id (*, user:user_id (*))
      `)
      .eq('id', props.payment.contract_id)
      .single()

      if (error) throw error
    contract.value = data as unknown as ContractWithShipT
  } catch (err) {
    console.error('Error loading contract details:', err)
    contract.value = null
  }
}

watch(()=> props.payment?.contract_id, async ()=>{
  await fetchContract()
})
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.rounded-borders {
  border-radius: 4px;
}
</style>