import type { RouteLocation } from 'vue-router'
import { UserRoleI } from '@interfaces/user'
import { reactive } from 'vue'

const tabs = reactive({
  values: [
    { name: 'map', label: 'Mapa', icon: 'map', roles: [UserRoleI.USER] },
    { name: 'my-vehicle', label: 'Mi vehiculo', icon: 'directions_car', roles: [UserRoleI.DRIVER] },
    { name: 'contracts', label: 'Contratos', icon: 'fact_check', roles: [UserRoleI.DRIVER] },
    { name: 'vehicles', label: 'Vehiculos', icon: 'directions_bus', roles: [UserRoleI.USER] },
    { name: 'profile', label: 'Perfil', icon: 'person', roles: [UserRoleI.ALL] },
    { name: 'settings', label: 'Opciones', icon: 'settings', roles: [UserRoleI.ALL] },
  ],
  select: 'map',
})

export default () => {
  const initTabs = (route: RouteLocation) => {
    tabs.select = route.name?.toString() || 'map'
  }

  return {
    initTabs,
    tabs,
  }
}
