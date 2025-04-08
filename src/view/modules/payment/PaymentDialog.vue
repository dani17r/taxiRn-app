<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 300px" class="bg-one !shadow-none">
      <q-card-section>
        <div class="text-h6">Procesar Pago - Contrato N° {{ contractNumberId.slice(8) }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Información del pago -->
        <div class="q-gutter-y-sm">
          <div><strong>Monto a pagar:</strong> ${{ amount.toFixed(2) }}</div>
          <div><strong>Servicio:</strong> {{ serviceType }}</div>
          <div><strong>Fecha:</strong> {{ formattedDate }}</div>
        </div>

        <q-select
          v-model="paymentMethod"
          :options="paymentMethods"
          label="Método de pago*"
          outlined
          dense
          class="q-mt-md"
          :rules="[val => !!val || 'Seleccione un método']"
        />

        <q-input
          v-model="transactionId"
          label="Número de referencia*"
          outlined
          dense
          color="yellow-9"
          class="q-mt-md"
          mask="#####"
          hint="Los ultimos 5 digitos"
          :rules="[
            val => !!val || 'Ingrese referencia',
            val => val.length === 5 || 'Deben ser 5 dígitos'
          ]"
        />

        <q-file
          v-model="image"
          label="Comprobante de pago (captura o foto)*"
          accept="image/*"
          class="q-mt-md"
          outlined
          :rules="[val => !!val || 'Suba un comprobante']"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

      </q-card-section>

      <q-card-actions align="right" class="text-primary q-pa-md">
        <q-btn flat label="Cancelar" class="text-one" v-close-popup :disable="loading" />
        <q-btn 
          label="Confirmar Pago" 
          color="yellow-9" 
          @click="confirmPayment" 
          :loading="loading"
          unelevated
          icon="payment"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '@services/supabase.services'
import useSuperComposable from '@composables/super'

const $q = useQuasar()
const { store } = useSuperComposable()

const emit = defineEmits(['update'])

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  contractId: {
    type: String,
    required: true
  },
  contractNumberId: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  }
})

const visible = ref(false)
const loading = ref(false)
const paymentMethod = ref('Pago móvil')
const transactionId = ref('')
const image = ref<File | null>(null)
const paymentMethods = ['Transferencia', 'Pago móvil']

const formattedDate = computed(() => {
  return new Date(props.createdAt).toLocaleString('es-ES')
}) 

const open = () => {
  visible.value = true
  // Resetear campos al abrir
  paymentMethod.value = ''
  transactionId.value = ''
  image.value = null
}

const confirmPayment = async () => {
  if(!validateFields()) return

  try {
    loading.value = true

    // 1. Subir imagen al bucket
    const fileExt = image.value?.name.split('.').pop()
    const fileName = `payment_${props.contractId}_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(`payment-images/${fileName}`, image.value!)
    
    if (uploadError) throw uploadError

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(`payment-images/${fileName}`)

    // 3. Actualizar el contrato en Supabase
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        contract_id: props.contractId,
        user_id: String(store.auth.current?.id),
        amount: props.amount,
        payment_method: paymentMethod.value,
        transaction_id: transactionId.value,
        image: publicUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()

    if (paymentError) throw paymentError

    const { error: contractError } = await supabase
      .from('contracts')
      .update({
        status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', props.contractId)

      if (contractError) throw contractError

    $q.notify({
      type: 'positive',
      message: `Pago registrado para contrato ${props.contractId.slice(8)}`,
      caption: `Referencia: ${transactionId.value} - Monto: $${props.amount.toFixed(2)}`,
       position: 'top-right',
    })

    visible.value = false
    emit('update')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al procesar pago',
      caption: error.message,
       position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

const validateFields = () => {
  if (!paymentMethod.value) {
    $q.notify({ type: 'warning', message: 'Seleccione un método de pago', position: 'top-right', })
    return false
  }
  if (!transactionId.value || transactionId.value.length !== 5) {
    $q.notify({ type: 'warning', message: 'Ingrese un número de referencia válido (5 dígitos)', position: 'top-right', })
    return false
  }
  if (!image.value) {
    $q.notify({ type: 'warning', message: 'Suba un comprobante de pago', position: 'top-right',})
    return false
  }
  return true
}

defineExpose({ open })
</script>