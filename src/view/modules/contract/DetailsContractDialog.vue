<template>
  <q-dialog v-model="visible" maximized>
    <q-card class="bg-one relative">
      <q-toolbar
        class="bg-yellow-9 text-white"
        style="position: fixed; top: 0; left: 0; right: 0; z-index: 1"
      >
        <q-toolbar-title>
          Detalles del Contrato N° {{ contract?.id_contract?.toString().slice(8) }}
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <div style="margin-top: 50px; overflow-y: auto; max-height: calc(100vh - 90px)">
        <q-card-section class="q-pa-none" style="height: calc(90vh - 250px)">
          <ViewMapSample
            :route-id="String(contract.route_id)"
            :location-id="String(contract.location_id)"
          />
        </q-card-section>

        <q-card-section class="mx-5">
          <div class="q-gutter-y-md">
            <!-- Información del cliente/conductor -->
            <template v-if="store.auth.getRoleUser">
              <div class="text-h6">Información del Conductor</div>
              <div><strong>Nombre:</strong> {{ contract.vehicle?.user?.fullname }}</div>
              <div>
                <strong>Teléfono:</strong>
                {{
                  contract?.vehicle?.user?.phone
                    ? '04' + contract?.vehicle.user.phone
                    : 'Sin Número de teléfono'
                }}
              </div>
            </template>
            <template v-if="store.auth.getRoleDriver">
              <div class="text-h6">Información del Cliente</div>
              <div><strong>Nombre:</strong> {{ contract?.client?.fullname }}</div>
              <div v-if="contract?.client?.phone">
                <strong>Teléfono:</strong> {{ '04' + contract.client.phone }}
              </div>
              <div>
                <strong>Descripcion del cliente:</strong> {{ contract.description }}
              </div>
            </template>

            <!-- Detalles del servicio -->
            <div class="text-h6 q-mt-md">Detalles del Servicio</div>
            <div><strong>Tipo:</strong> {{ translateServiceType(contract?.service_type) }}</div>
            <div>
              <strong>Fecha/Hora:</strong> {{ formatFullDate(String(contract?.created_at)) }}
            </div>

            <!-- Ruta o Ubicación -->
            <div v-if="contract?.route">
              <strong>Ruta:</strong> {{ contract.route.name || 'Sin nombre' }}
              <div class="q-mt-sm" v-if="contract.route.description">
                <strong>Descripción:</strong> {{ contract.route.description }}
              </div>
            </div>
            <div v-else-if="contract?.location">
              <strong>Ubicación:</strong> {{ contract.location.name || 'Sin nombre' }}
              <div class="q-mt-sm" v-if="contract.location.description">
                <strong>Descripción:</strong> {{ contract.location.description }}
              </div>
            </div>

            <!-- Sección de precio -->
            <div v-if="contract?.price && contract?.status === 'accepted'" class="text-h6 q-mt-md">
              <strong>Precio Establecido:</strong> ${{ contract.price.toFixed(2) }}
            </div>

            <!-- Acciones para conductores -->
            <template v-if="store.auth.getRoleUser">
              <div v-if="contract?.status === 'pending'" class="text-h6 q-mt-md">
                Aceptar Servicio
              </div>

              <div class="q-mt-md row q-gutter-sm">
                <q-btn
                  v-if="contract?.status === 'accepted'"
                  label="Rechazar"
                  color="red"
                  @click="rejectService"
                  unelevated
                  class="col"
                  icon="cancel"
                  no-caps
                />

                <q-btn
                  v-if="contract?.status === 'accepted'"
                  label="Pagar"
                  color="positive"
                  @click="paymentDialog.open()"
                  unelevated
                  class="col"
                  icon="payment"
                  no-caps
                />
              </div>
            </template>

            <template v-if="store.auth.getRoleDriver">
              <div v-if="contract?.status === 'pending'" class="text-h6 q-mt-md">
                Completar estado del Servicio
              </div>

              <div class="q-mt-md row q-gutter-sm">
                <q-input
                  :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
                  v-if="contract?.status === 'pending'"
                  label="Precio a cobrar"
                  v-model="priceInput"
                  class="w-full"
                  color="yellow-9"
                  type="number"
                  prefix="$"
                  outlined
                  dense
                />

                <q-input
                  v-if="contract?.status === 'pending'"
                  label="Tiempo estimado en llegar"
                  v-model="estimated_time"
                  :rules="[required]"
                  color="yellow-9"
                  class="w-full"
                  outlined
                  dense
                />

                <q-btn
                  v-if="contract?.status === 'pending'"
                  label="Aceptar"
                  color="positive"
                  @click="acceptService"
                  :disable="!priceInput && !estimated_time"
                  unelevated
                  class="col"
                  icon="check_circle"
                  no-caps
                />
              </div>
            </template>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>

  <PaymentDialog
    ref="paymentDialog"
    :amount="Number(contract?.price) || 0"
    :contract-id="String(contract?.id)"
    :contract-number-id="String(contract?.id_contract)"
    :service-type="String(translateServiceType(contract?.service_type))"
    :created-at="String(contract?.created_at)"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '@services/supabase.services'
import ViewMapSample from '@modules/map/ViewMapSample.vue'
import useSuperComposable from '@composables/super'
import PaymentDialog from '@modules/payment/PaymentDialog.vue'
import { required } from '@utils/validations'
import type { ContractWithShipT } from '@interfaces/contract'

const { store } = useSuperComposable()
const $q = useQuasar()

const props = defineProps<{ modelValue: boolean; contract: ContractWithShipT }>()

const emit = defineEmits(['update:modelValue', 'update'])

const priceInput = ref<number | null>(null)
const estimated_time = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const paymentDialog = ref()

// Funciones de formato
const formatFullDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES')
}

const translateServiceType = (type: string) => {
  const typeMap: Record<string, string> = {
    taxi: 'Traslado Personal',
    delivery: 'Delivery',
    both: 'Ambos, Traslado + Delivery',
  }
  return typeMap[type] || type
}

// // Función para aceptar servicio
const acceptService = async () => {
  try {
    if (!props.contract?.id || !priceInput.value) {
      throw new Error('Falta el precio del servicio')
    }

    const { error } = await supabase
      .from('contracts')
      .update({
        status: 'accepted',
        price: priceInput.value,
        estimated_time: estimated_time.value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', props.contract.id)

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Servicio aceptado correctamente',
      position: 'top-right',
    })

    emit('update')
    visible.value = false
    priceInput.value = null
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al aceptar servicio',
      caption: (err as Error).message,
      position: 'top-right',
    })
  }
}

// Función para rechazar servicio
const rejectService = () => {
  try {
    const action = async () => {
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', props.contract.id)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Servicio rechazado correctamente',
        position: 'top-right',
      })

      emit('update')
      visible.value = false
    }
    $q.dialog({
      title: 'Confirmar Rechazo',
      message: '¿Estás seguro de que deseas rechazar este servicio?',
      cancel: true,
      persistent: true,
      color: 'negative',
    }).onOk(() => {
      void action()
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al rechazar servicio',
      caption: (err as Error).message,
      position: 'top-right',
    })
  }
}
</script>
