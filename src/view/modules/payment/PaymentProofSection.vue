<template>
  <div>
    <div class="text-h6 q-mb-md">Comprobante de Pago</div>
    <div v-if="imageUrl" class="flex flex-center">
      <q-img
        :src="imageUrl"
        style="max-width: 300px; max-height: 300px"
        class="rounded-borders"
      />
    </div>
    <div v-else class="text-grey-6">
      No hay comprobante disponible
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl: string | null
}>()
</script>