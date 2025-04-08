<template>
  <q-page class="!px-5 !m-0 fixed left-0 !w-full mobile-keyboard-fix">
    <h3 class="!text-2xl mb-5 px-2">Lista de contratos</h3>

    <q-scroll-area style="height: 90vh; width: 100%" class="pb-30">
      <q-list class="pt-2 pr-2 !w-full">
        <q-item
          v-for="(contract, index) in contracts"
          :key="index"
          class="!w-full q-mb-md border-amber-400 border-b-1"
        >
          <q-item-section class="!w-full">
            <template v-if="store.auth.getRoleUser">
              <q-item-label
                >N° contrato: {{ contract.id_contract?.toString().slice(0, 8) }}</q-item-label
              >
              <q-item-label class="text-lg"
                >Conductor: {{ contract.vehicle?.user?.fullname }}
              </q-item-label>
              <q-item-label class="text-caption"
                >Vehículo: {{ contract.vehicle?.license_plate }} ({{ contract.vehicle?.brand }}
                {{ contract.vehicle?.model }})</q-item-label
              >
              <q-item-label class="text-caption">
                <template v-if="contract.route">
                  Ruta: {{ contract.route.name || 'Sin nombre' }}
                </template>
                <template v-else-if="contract.location">
                  Ubicación: {{ contract.location.name || 'Sin nombre' }}
                </template>
                <template v-else> Sin ubicación definida </template>
              </q-item-label>
              <q-item-label class="text-caption"
                >Fecha/Hora: {{ formatDate(String(contract.created_at)) }}</q-item-label
              >
              <q-item-label class="absolute right-0 top-0">
                <q-chip class="" :color="getStatusColor(contract.status)">{{
                  translateStatus(contract.status)
                }}</q-chip>
              </q-item-label>
              <q-item-label class="text-caption"
                >Precio:
                {{
                  contract.status != 'pending' && contract.price
                    ? '$' + contract.price?.toFixed(2) || '0.00'
                    : 'Sin asignar'
                }}
              </q-item-label>
            </template>
            <template v-else>
              <q-item-label
                >N° contrato: {{ contract.id_contract?.toString().slice(0, 8) }}</q-item-label
              >
              <q-item-label class="text-lg">Cliente: {{ contract.client?.fullname }}</q-item-label>
              <q-item-label class="text-caption"
                >Teléfono: {{ contract.client?.phone }}</q-item-label
              >
              <q-item-label class="text-caption">
                <template v-if="contract.route">
                  Ruta: {{ contract.route.name || 'Sin nombre' }}
                </template>
                <template v-else-if="contract.location">
                  Ubicación: {{ contract.location.name || 'Sin nombre' }}
                </template>
                <template v-else> Sin ubicación definida </template>
              </q-item-label>
              <q-item-label class="text-caption"
                >Fecha/Hora: {{ formatDate(String(contract.created_at)) }}</q-item-label
              >
              <q-item-label class="absolute right-0 top-0">
                <q-chip class="" :color="getStatusColor(contract.status)">{{
                  translateStatus(contract.status)
                }}</q-chip>
              </q-item-label>
              <q-item-label class="text-caption !mt-3"
                >Precio:
                <span
                  v-html="
                    contract.status !== 'pending' && contract.price
                      ? '$' + contract.price?.toFixed(2) || '0.00'
                      : '<div class=\'inline bg-red text-white py-1 px-2 rounded-full\'>Debes Asignarlo</div>'
                  "
                >
                </span>
              </q-item-label>
            </template>

            <q-item-label class="py-3">
              <div class="flex gap-4">
                <q-btn
                  label="Ver Detalles"
                  icon="map"
                  @click="openMapDialog(contract)"
                  color="yellow-9"
                  outline
                  unelevated
                  no-caps
                />
                <q-btn
                  v-if="['accepted'].includes(contract.status) && store.auth.getRoleUser"
                  label="Pagar"
                  icon="payment"
                  outline
                  @click="openPaymentDialog(contract)"
                  color="positive"
                  unelevated
                  no-caps
                />
                <q-btn
                  v-if="
                    !['cancelled', 'verified', 'completed'].includes(contract.status) &&
                    store.auth.getRoleUser
                  "
                  label="Rechazar"
                  icon="cancel"
                  @click="cancelContract(contract)"
                  color="red"
                  outline
                  no-caps
                />
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="!contracts.length">
          <q-item-section class="text-center text-grey-6 q-py-lg">
            No se encontraron contratos.
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>

    <!-- Modal Detalles -->
    <DetailsContractDialog
      v-if="selectedContract"
      v-model="mapDialogVisible"
      :contract="selectedContract"
      @update="fetchContracts"
    />

    <!-- Modal Pago -->
    <PaymentDialog
      ref="paymentDialog"
      :amount="Number(selectedContract?.price) || 0"
      :contract-id="String(selectedContract?.id)"
      :contract-number-id="String(selectedContract?.id_contract)"
      :service-type="String(translateServiceType(String(selectedContract?.service_type)))"
      :created-at="String(selectedContract?.created_at)"
      @update="fetchContracts"
    />
  </q-page>
</template>

<script lang="ts" setup>
import DetailsContractDialog from '@modules/contract/DetailsContractDialog.vue'
import PaymentDialog from '@modules/payment/PaymentDialog.vue'
import type { ContractWithShipT } from '@interfaces/contract'
import { translateServiceType } from '@utils/servicesTypes'
import { supabase } from '@services/supabase.services'
import useSuperComposable from '@composables/super'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const { store } = useSuperComposable()

// Estado
const mapDialogVisible = ref(false)
const selectedContract = ref<ContractWithShipT>()
const contracts = ref<ContractWithShipT[]>([])
const loading = ref(true)
const paymentDialog = ref()

const openMapDialog = (contract: ContractWithShipT) => {
  selectedContract.value = contract
  mapDialogVisible.value = true
}

// Formatear fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' - ' +
    date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  )
}

// Traducir estados
const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    verified: 'Verificar pago',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
  }
  return statusMap[status] || status
}

// Colores según estado
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    accepted: 'blue',
    verified: 'pink',
    completed: 'green',
    cancelled: 'red',
  }
  return colorMap[status] || 'grey'
}

// Obtener contratos con relaciones
const fetchContracts = async () => {
  try {
    loading.value = true

    // Verificar si hay usuario autenticado
    if (!store.auth.current) {
      throw new Error('Usuario no autenticado')
    }

    // Consulta base
    let query = supabase
      .from('contracts')
      .select(
        `
        *,
        client:client_id (id, fullname, phone),
        vehicle:vehicle_id (*, user:user_id (fullname, phone)),
        route:route_id (id, name, description),
        location:location_id (id, name, description)
      `,
      )
      .order('created_at', { ascending: false })

    if (store.auth.getRoleDriver) {
      query = query.eq('vehicle.user_id', String(store.auth.current?.id))
    } else if (store.auth.getRoleUser) {
      query = query.eq('client_id', store.auth.current.id)
    } else if (store.auth.getRoleAdmin) {
      // Para admins: traer todos los contratos sin filtro
    } else {
      throw new Error('Rol de usuario no reconocido')
    }

    const { data, error } = await query

    if (error) throw error

    contracts.value = (data as ContractWithShipT[]) || []
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar contratos',
      caption: (err as Error).message,
    })
    contracts.value = []
  } finally {
    loading.value = false
  }
}

// Funciones para modales
const openPaymentDialog = (contract: ContractWithShipT) => {
  selectedContract.value = contract
  paymentDialog.value?.open()
}

const cancelContract = (contract: ContractWithShipT) => {
  const cancelContractAsync = async (contract: ContractWithShipT) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contract.id)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: `Contrato ${contract.id?.slice(0, 8)} cancelado correctamente`,
      })

      // Actualizar lista
      await fetchContracts()
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Error al cancelar contrato',
        caption: (err as Error).message,
      })
    }
  }

  $q.dialog({
    title: 'Confirmar Cancelación',
    message: `¿Estás seguro de que deseas cancelar el contrato ${contract.id?.slice(0, 8)}?`,
    cancel: false,
    persistent: false,
    color: 'yellow-9',
    class: '!shadow-none bg-one',
    ok: 'Si',
  }).onOk(() => {
    void cancelContractAsync(contract)
  })
}

// Cargar datos al montar
onMounted(async () => {
  await fetchContracts()
})
</script>
