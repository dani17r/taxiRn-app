<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="q-pa-md">
        <div class="flex justify-between items-center q-mb-md">
          <h1 class="text-h4">Historial de Transacciones</h1>
        </div>

        <!-- Lista de Transacciones -->
        <q-list separator v-if="!loading">
          <q-item 
            v-for="transaction in paginatedTransactions" 
            :key="transaction.reference_number" 
            class="q-py-md"
          >
            <q-item-section>
              <q-item-label class="text-weight-bold">
                Ref: {{ transaction.reference_number }}
              </q-item-label>
              <q-item-label caption>
                Usuario: {{ transaction.user_name }} | Conductor: {{ transaction.driver_name }}
              </q-item-label>
              <q-item-label caption>
                Ruta: {{ transaction.route_details }}
              </q-item-label>
              <q-item-label caption>
                Fecha: {{ formatDate(transaction.created_at) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-item-label class="text-weight-bold q-mb-xs">
                {{ formatCurrency(transaction.amount, transaction.currency) }}
              </q-item-label>
              <q-badge 
                :color="getStatusColor(transaction.status)" 
                text-color="white"
                class="q-pa-xs text-capitalize"
                style="min-width: 80px; justify-content: center;"
              >
                {{ transaction.status === 'completed' ? 'Lista' : (transaction.status === 'pending' ? 'Pendiente' : 'Cancelado') }}
              </q-badge>
            </q-item-section>
          </q-item>

          <q-item v-if="!paginatedTransactions.length && !loading">
            <q-item-section class="text-center text-grey-6 q-py-lg">
              No se encontraron transacciones.
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Indicador de Carga -->
        <div v-else class="flex justify-center items-center q-py-xl">
           <q-spinner-gears size="50px" color="yellow-9" /> {/* Cambiado color a yellow-9 */}
        </div>

        <!-- Paginación -->
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
            Mostrando {{ paginatedTransactions.length }} de {{ totalTransactions }} transacciones
          </div>
        </div>

      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
// import { supabase } from '@services/supabase.services'; // Se comenta si solo usamos datos ficticios

const $q = useQuasar();
const loading = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allTransactions = ref<any[]>([]); // Almacenará todas las transacciones ficticias
const currentPage = ref(1);
const itemsPerPage = ref(10); // Puedes ajustar cuántos items mostrar por página

// --- Datos Ficticios ---
const generateMockTransactions = (count: number) => {
  const transactions = [];
  const statuses = ['completed', 'pending', 'cancelled'];
  const users = ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince'];
  const drivers = ['Juan Perez', 'Maria Garcia', 'Carlos Rodriguez', 'Ana Martinez'];
  const routes = [
    'Centro Comercial Sambil - Plaza Venezuela',
    'Aeropuerto Maiquetía - Hotel Tamanaco',
    'Parque del Este - El Hatillo',
    'Chacao - Las Mercedes',
    'La Candelaria - Sabana Grande'
  ];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    transactions.push({
      user_name: users[Math.floor(Math.random() * users.length)],
      driver_name: drivers[Math.floor(Math.random() * drivers.length)],
      reference_number: Math.floor(10000 + Math.random() * 90000).toString(), // 5 dígitos
      status: status,
      route_details: routes[Math.floor(Math.random() * routes.length)],
      amount: parseFloat((Math.random() * 9 + 0.5).toFixed(2)), // Entre 0.50 y 9.50
      currency: 'USD',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Fechas en los últimos 30 días
    });
  }
  // Ordenar por fecha descendente
  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
// --- Fin Datos Ficticios ---

// --- Lógica de Paginación ---
const totalTransactions = computed(() => allTransactions.value.length);
const totalPages = computed(() => Math.ceil(totalTransactions.value / itemsPerPage.value));

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allTransactions.value.slice(start, end);
});
// --- Fin Lógica de Paginación ---

// --- Funciones Auxiliares ---
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short', // 'short' para mes abreviado
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Para formato AM/PM
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Fecha inválida';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'green';
    case 'pending': return 'orange';
    case 'cancelled': return 'red';
    default: return 'grey';
  }
}
// --- Fin Funciones Auxiliares ---

// --- Carga de Datos ---
async function fetchTransactions() {
  try {
    loading.value = true;
    // Simulación de carga
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Usando datos ficticios
    allTransactions.value = generateMockTransactions(5); // Genera 55 transacciones de ejemplo
    currentPage.value = 1; // Resetear a la primera página al cargar nuevos datos

    // Si usaras Supabase:
    // const { data, error, count } = await supabase
    //   .from('transactions') // Asegúrate que la tabla se llame así
    //   .select('*', { count: 'exact' }) // Necesitas el count para la paginación del backend
    //   .order('created_at', { ascending: false })
    //   .range(from, to); // Necesitarías calcular 'from' y 'to' basado en currentPage e itemsPerPage
    // if (error) throw error;
    // allTransactions.value = data || [];
    // totalTransactions.value = count || 0; // Si usas paginación de backend

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar transacciones',
      caption: (error as Error).message
    });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchTransactions();
});
// --- Fin Carga de Datos ---

</script>

<style lang="scss" scoped>
.q-pagination {
  width: 100%;
  justify-content: center;
  padding: 20px 0;
}

.q-item__section--side {
  align-items: flex-end; // Alinea el contenido a la derecha
}

.q-badge {
  font-size: 0.75rem; // Ajusta tamaño de fuente si es necesario
}
</style>
