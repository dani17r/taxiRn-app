<template>
  <div>
    <div class="text-h6 q-mb-md">
      {{ store.auth.getRoleDriver ? 'Información del Cliente' : 'Información del Conductor' }}
    </div>
    <div v-if="user" class="q-gutter-y-sm">
      <div><strong>Nombre:</strong> {{ user.fullname }}</div>
      <div><strong>Teléfono:</strong> {{ formatPhone(user.phone) }}</div>
      <div><strong>Email:</strong> {{ user.email }}</div>
    </div>
    <div v-else class="text-grey-6">Cargando información del usuario...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@services/supabase.services'
import useSuperComposable from '@composables/super'
import type { User } from '@interfaces/payment'

const { store } = useSuperComposable()
const props = defineProps<{
  contractId: string
}>()

const user = ref<User | null>(null)

const fetchUser = async () => {
  try {
    // Primero obtener el contrato para saber el ID del usuario
    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .select('client_id, vehicle:vehicle_id(user_id)')
      .eq('id', props.contractId)
      .single()

    const contract = contractData as unknown as { client_id: string; vehicle: { user_id: string } }

    if (contractError) throw contractError

    const userIdToFetch = store.auth.getRoleDriver ? contract.client_id : contract.vehicle.user_id

    if (userIdToFetch) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, fullname, email, phone')
        .eq('id', userIdToFetch)
        .single()

      if (userError) throw userError
      user.value = userData as User
    }
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const formatPhone = (phone: string | null) => {
  return phone ? `04${phone}` : 'No disponible'
}

onMounted(async () => {
  await fetchUser()
})
</script>
