<template>
  <q-page class="row items-center justify-evenly">
    <q-scroll-area style="height: 90vh; width: 100%">
      <div
        v-for="work in filteredDrivers"
        :key="work.id"
        class="q-pa-md row items-center justify-center"
      >
        <div class="row items-center">
          <q-avatar color="yellow">
            {{ work.reputation }}
          </q-avatar>
          <q-item-label class="q-ml-md">
            <h1 class="text-h6">
              {{ work.user.name }}
            </h1>
            <p class="!m-0">{{ work.user.phone }}</p>
            <p class="!m-0">{{ work.car.brand }} {{ work.car.model }} ({{ work.car.year }})</p>
          </q-item-label>
          <q-item-label class="q-ml-md">
            {{ work.price.min }}$ - {{ work.price.max }}$
          </q-item-label>
        </div>
      </div>
    </q-scroll-area>
    <!-- <q-btn class="q-mt-md" label="Pedir" icon="add" color="primary" />
        <q-btn class="q-mt-md" label="View Details" icon="info" color="secondary" /> -->
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const drivers = ref([
  {
    id: 'uudd-v4',
    reputation: 2.5,
    price: {
      min: 2,
      max: 20,
    },
    banks: [
      {
        name: 'Bank Name',
        autor: 'Juan Perez',
        accountNumber: '123456789',
        payType: 'pago-movil',
        cedula: '123456789',
        email: 'example@example.com',
      },
      {
        name: '',
        autor: 'Juan Perez',
        accountNumber: '',
        payType: 'binance',
        cedula: '',
        email: 'example@example.com',
      },
    ],
    car: {
      brand: 'Chevrolet',
      model: 'Spark',
      year: 2019,
      color: 'Rojo',
      plate: 'ABC123',
    },
    year_experience: 2,
    alias: 'chucho',
    description: 'soy rapido y puntual',
    user_id: 1,
    user: {
      id: 1,
      name: 'Juan Perez',
      phone: '04121234567',
      email: 'example@example.com',
    },
  },
])

const filteredDrivers = computed(() => {
  return [...drivers.value].sort((a, b) => a.reputation - b.reputation)
})
</script>
