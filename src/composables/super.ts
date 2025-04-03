import { useVehicleStore } from '@stores/vehicle'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@stores/auth'
import { useQuasar } from 'quasar'

export default () => {
  const auth = useAuthStore()
  const vehicle = useVehicleStore()

  const reset = () => {
    auth.reset()
    vehicle.reset()
  }

  return {
    router: () => useRouter(),
    route: () => useRoute(),
    store: {
      reset,
      auth,
      vehicle,
    },
    $q: () => useQuasar(),
  }
}
