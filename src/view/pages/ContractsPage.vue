<template>
  <q-page class="!p-0 !m-0 fixed">
    <h3 class="!text-2xl mb-5">Lista de contratos</h3>

    <q-list style="max-height: 700px; overflow-y: auto;" class="pt-2 pb-20">
      <q-item v-for="contract in contracts" :key="contract.id" class="q-mb-md rounded-2xl border-amber-400">
        <q-item-section>
          <q-item-label>N° contrato: {{ contract.numero }}</q-item-label>
          <q-item-label class="text-lg">Usuario: {{ contract.usuario }}</q-item-label>
          <q-item-label class="text-caption">Hora: {{ contract.hora }}</q-item-label>
          <q-item-label>
            <q-chip :color="contract.estado == 'Activo' ? 'green': contract.estado == 'Cancelado' ? 'red': contract.estado == 'Pendiente' ? 'orange' : 'yellow'">{{ contract.estado }}</q-chip>
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <div class="column q-gutter-y-md items-end"> <!-- Aumentado el gutter -->
            <q-btn 
              label="Ver Ruta" 
              icon="map" 
              @click="openMapDialog(contract)" 
              color="yellow-9" 
              unelevated 
            />
            <q-btn 
              v-if="contract.estado === 'Pendiente'" 
              label="Pagar" 
              icon="payment" 
              @click="openPaymentDialog(contract)" 
              color="positive" 
              unelevated 
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Modal Mapa -->
    <q-dialog v-model="mapDialogVisible" maximized>
      <q-card>
        <q-toolbar class="bg-yellow-9 text-white">
          <q-toolbar-title>
            Ruta del Contrato N° {{ selectedContract?.numero }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 50px);">
          <!-- Contenedor del Mapa (usando el ID esperado por el composable) -->
          <div id="map" style="height: 100%; width: 100%;"></div>
        </q-card-section>
      </q-card>
      <!-- Se elimina el link CSS de Leaflet, ya que el composable debería manejar dependencias -->
    </q-dialog>

    <!-- Modal Pago -->
    <q-dialog v-model="paymentDialogVisible" class="backdrop-blur-[3px]">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Registrar Pago - Contrato N° {{ selectedContract?.numero }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-file
            v-model="paymentImage"
            label="Adjuntar imagen de referencia"
            outlined
            dense
            accept="image/*"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-input
            v-model="paymentReference"
            label="Número de Referencia"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn 
            label="Confirmar Pago" 
            color="positive" 
            @click="confirmPayment" 
            :disable="!paymentReference || !paymentImage" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { useQuasar } from 'quasar';
// import mapComposable from '@composables/map'; // Importar el composable del mapa

const $q = useQuasar();
// const { initMap, map: mapInstanceComposable } = mapComposable(); // Obtener funciones del composable

// Estado de los modales
const mapDialogVisible = ref(false);
const paymentDialogVisible = ref(false);

// Datos para los modales
const selectedContract = ref<Contract | null>(null);
const paymentImage = ref<File | null>(null);
const paymentReference = ref<string>('');

// Interfaz del Contrato
interface Contract {
  id: number;
  numero: string;
  usuario: string;
  hora: string;
  estado: string; // 'Activo', 'Pendiente', 'Completado', 'Cancelado'
}

// Datos de ejemplo (se mantienen los mismos)
const contracts = ref<Contract[]>([
  { id: 1, numero: '001', usuario: 'Juan Perez', hora: '10:00 AM', estado: 'Activo' },
  { id: 2, numero: '002', usuario: 'Maria Lopez', hora: '11:00 AM', estado: 'Pendiente' },
  { id: 3, numero: '003', usuario: 'Carlos Sanchez', hora: '12:00 PM', estado: 'Completado' },
  { id: 4, numero: '004', usuario: 'Ana Gomez', hora: '01:00 PM', estado: 'Cancelado' },
  { id: 5, numero: '005', usuario: 'Luis Fernandez', hora: '02:00 PM', estado: 'Activo' },
  { id: 6, numero: '006', usuario: 'Laura Martinez', hora: '03:00 PM', estado: 'Pendiente' },
]);

// Funciones para abrir modales
const openMapDialog = async (contract: Contract) => {
  selectedContract.value = contract;
  mapDialogVisible.value = true;
  // Esperar a que el DOM del modal esté listo antes de inicializar el mapa
  await nextTick();
  // Llamar a la función initMap del composable
  // initMap(); 
  // Forzar redimensionamiento por si acaso
  setTimeout(() => {
      // mapInstanceComposable?.invalidateSize();
  }, 100);
  // TODO: Cargar la ruta específica del contrato 'selectedContract.value' en el mapa
  // Esto requerirá probablemente una nueva función en el composable o lógica adicional aquí.
  // Por ahora, solo muestra el mapa inicializado por el composable.
};

const openPaymentDialog = (contract: Contract) => {
  selectedContract.value = contract;
  paymentImage.value = null; // Resetear campos
  paymentReference.value = '';
  paymentDialogVisible.value = true;
};

// Función para confirmar pago (simulada)
const confirmPayment = () => {
  console.log('Confirmando pago para contrato:', selectedContract.value?.numero);
  console.log('Referencia:', paymentReference.value);
  console.log('Imagen:', paymentImage.value);

  // TODO: Implementar lógica real de subida de imagen y actualización de estado del contrato

  $q.notify({
    type: 'positive',
    message: `Pago para contrato ${selectedContract.value?.numero} registrado (simulado).`,
  });

  paymentDialogVisible.value = false; // Cerrar modal
  
  // Opcional: Actualizar estado del contrato en la lista localmente
  const index = contracts.value.findIndex(c => c.id === selectedContract.value?.id);
  if (index !== -1) {
    // Simular cambio a un estado como 'Procesando Pago' o similar si es necesario
    // contracts.value[index].estado = 'Procesando Pago'; 
  }
};

// --- Se elimina la lógica de Leaflet local ---

</script>
