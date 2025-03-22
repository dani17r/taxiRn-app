import { useVehicleStore } from '@stores/vehicle'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@stores/auth'
import { useQuasar } from 'quasar'

const auth = useAuthStore()
const vehicle = useVehicleStore()

export default () => {
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
