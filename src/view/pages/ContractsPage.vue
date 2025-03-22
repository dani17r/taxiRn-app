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
        <q-item-section side>
          <q-btn label="Ver Ruta" @click="openDialog(contract.id)" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-dialog v-model="dialogVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Ruta del contrato</div>
        </q-card-section>
        <q-card-section>
          <p>Detalles de la ruta para el contrato con id: {{ selectedContractId }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const dialogVisible = ref(false)
const selectedContractId = ref<number | null>(null)

const openDialog = (id: number) => {
  selectedContractId.value = id
  dialogVisible.value = true
}
interface Contract {
  id: number
  numero: string
  usuario: string
  hora: string
  estado: string
}

const contracts = ref<Contract[]>([
  { id: 1, numero: '001', usuario: 'Juan Perez', hora: '10:00 AM', estado: 'Activo' },
  { id: 2, numero: '002', usuario: 'Maria Lopez', hora: '11:00 AM', estado: 'Pendiente' },
  { id: 3, numero: '003', usuario: 'Carlos Sanchez', hora: '12:00 PM', estado: 'Completado' },
  { id: 4, numero: '004', usuario: 'Ana Gomez', hora: '01:00 PM', estado: 'Cancelado' },
  { id: 5, numero: '005', usuario: 'Luis Fernandez', hora: '02:00 PM', estado: 'Activo' },
  { id: 6, numero: '006', usuario: 'Laura Martinez', hora: '03:00 PM', estado: 'Pendiente' },
])
</script>
