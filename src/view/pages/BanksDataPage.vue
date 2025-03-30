<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="max-w-3xl mx-auto space-y-8">
        <!-- Título principal -->
        <h1 class="!text-[30px] text-yellow-9 text-weight-bold text-center q-mb-lg">
          Información de Pagos
        </h1>

        <div class="flex flex-col flex-wrap gap-6 justify-center p-3">
          <!-- Tarjeta de Transferencia Bancaria -->
          <q-card class="flex-1 rounded-borders !shadow-none bg-one">
            <q-card-section class="bg-yellow-9 text-white">
              <h2 class="text-h6 text-weight-bold q-my-none">
                <q-icon name="account_balance" class="q-mr-sm" />
                Transferencia Bancaria
              </h2>
            </q-card-section>

            <q-card-section class="space-y-4 text-left q-pt-xl">
              <div class="space-y-2">
                <p class="text-weight-medium text-gray-5 text-lg">ServicioTaxirn C.A</p>
                <div class="text-lg text-grey-6">
                  <p class="flex items-center gap-2">
                    RIF:
                    <span class="text-weight-bold">J-50108485-8</span>
                    <q-icon
                      name="content_copy"
                      class="cursor-pointer text-yellow-8 hover:text-secondary"
                      @click="copyToClipboard('J-50108485-8')"
                      size="20px"
                    />
                  </p>
                </div>
                <div>
                  <p class="text-grey-6 mb-1 text-lg">Número de cuenta:</p>
                  <div class="flex items-center gap-2">
                    <span class="text-weight-bold text-yellow-9 text-lg"> 0102-0874-2600-00807054 </span>
                    <q-icon
                      name="content_copy"
                      class="cursor-pointer text-yellow-9 hover:text-secondary"
                      @click="copyToClipboard('0102-0874-2600-00807054')"
                      size="20px"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tarjeta de Pago Mobile -->
          <q-card class="flex-1 rounded-borders !shadow-none bg-one">
            <q-card-section class="bg-yellow-9 text-white">
              <h2 class="text-h6 text-weight-bold q-my-none">
                <q-icon name="smartphone" class="q-mr-sm" />
                Pago Móvil
              </h2>
            </q-card-section>

            <q-card-section class="space-y-4 text-left q-pt-xl">
              <div class="space-y-2">
                <p class="text-weight-medium text-gray-5 text-lg">ServicioTaxirn C.A</p>
                <div class="text-lg text-grey-6">
                  <p class="flex items-center gap-2">
                    RIF:
                    <span class="text-weight-bold">J-50108485-8</span>
                    <q-icon
                      name="content_copy"
                      class="cursor-pointer text-yellow-8 hover:text-secondary"
                      @click="copyToClipboard('J-50108485-8')"
                      size="20px"
                    />
                  </p>
                </div>
                <div class="text-lg text-grey-6">
                  <p class="flex items-center gap-2">
                    <span class="text-weight-bold">Banco De Venezuela</span>
                  </p>
                </div>
                <div>
                  <p class="text-lg text-grey-6 mb-1">Número de Teléfono:</p>
                  <div class="flex items-center gap-2">
                    <span class="text-weight-bold text-yellow-9 text-lg"> 0414-0634673 </span>
                    <q-icon
                      name="content_copy"
                      class="cursor-pointer text-yellow-9 hover:text-secondary"
                      @click="copyToClipboard('0414-0634673')"
                      size="20px"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

const $q = useQuasar()

const copyToClipboard = (text: string) => {
  const cleanText = text.replace(/[^\d]/g, '')
  navigator.clipboard
    .writeText(cleanText)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Copiado al portapapeles',
        timeout: 1000,
        position: 'top',
      })
    })
    .catch((err) => {
      console.error('Error al copiar:', err)
    })
}
</script>
