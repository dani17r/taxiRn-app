<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="q-pa-md">
        <div class="flex justify-between items-center q-mb-md">
          <h1 class="text-h4">Historial de Pagos</h1>
          <q-btn label="Nuevo pago" color="primary" icon="add" />
        </div>

        <q-table
          :rows="payments"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge color="red" class="q-pa-sm">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-amount="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.amount, props.row.currency) }}
            </q-td>
          </template>

          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at) }}
            </q-td>
          </template>
        </q-table>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from '@services/supabase.services';

const $q = useQuasar();
const loading = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payments = ref<any[]>([]);

// Datos ficticios
const mockPayments = [
  {
    id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
    user_id: 'u123e4567-e89b-12d3-a456-426614174000',
    contract_id: 'c0ntr4ct-1d-9999-8888-777766665555',
    amount: 150.75,
    currency: 'USD',
    status: 'completed',
    payment_method: 'credit_card',
    transaction_id: 'txn_1JfC6d2eZvKYlo2C',
    created_at: '2023-08-15T14:30:00Z'
  },
  {
    id: 'b2c3d4e5-f6g7-8901-h2i3-j4k5l6m7n8o9',
    user_id: 'u123e4567-e89b-12d3-a456-426614174000',
    contract_id: 'c0ntr4ct-1d-1111-2222-333344445555',
    amount: 299.99,
    currency: 'EUR',
    status: 'pending',
    payment_method: 'paypal',
    transaction_id: 'PAYID-MK732432',
    created_at: '2023-08-16T09:45:00Z'
  },
  {
    id: 'c3d4e5f6-g7h8-9012-i3j4-k5l6m7n8o9p0',
    user_id: 'u987f6543-e21b-12d3-a456-426614174000',
    contract_id: 'c0ntr4ct-1d-4444-5555-666677778888',
    amount: 89.50,
    currency: 'USD',
    status: 'cancelled',
    payment_method: 'crypto',
    transaction_id: '0x4c6f...7261',
    created_at: '2023-08-17T16:20:00Z'
  }
];

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'amount', label: 'Monto', field: 'amount', sortable: true },
  { name: 'currency', label: 'Moneda', field: 'currency' },
  { name: 'status', label: 'Estado', field: 'status', sortable: true },
  { name: 'payment_method', label: 'Método de Pago', field: 'payment_method' },
  { name: 'created_at', label: 'Fecha', field: 'created_at', sortable: true },
  { name: 'transaction_id', label: 'ID Transacción', field: 'transaction_id' }
];

// const statusColor = {
//   pending: 'orange',
//   completed: 'green',
//   cancelled: 'red'
// };

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10
});

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function fetchPayments() {
  try {
    loading.value = true;
    // Para usar con Supabase:
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

      console.log(data, error)
    
    // Usando datos ficticios
    payments.value = mockPayments;
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar pagos',
      caption: (error as Error).message
    });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchPayments();
});
</script>

<style lang="scss" scoped>
.q-table {
  thead tr {
    background-color: #f5f5f5;
  }
  
  th {
    font-weight: 600;
  }
  
  tbody tr:hover {
    background-color: #f8f9fa;
  }
}

.q-badge {
  text-transform: capitalize;
  min-width: 90px;
  justify-content: center;
}
</style>