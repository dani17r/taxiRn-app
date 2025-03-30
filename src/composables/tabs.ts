import type { RouteLocation } from 'vue-router'
import { UserRoleI } from '@interfaces/user'
import { reactive } from 'vue'

const tabsDefault = [
  {
    name: 'map',
    label: 'Mapa',
    icon: 'map',
    views: [UserRoleI.USER],
    viewsHidden: [],
  },
  {
    name: 'panel',
    label: 'Inicio',
    icon: 'apps',
    views: [UserRoleI.ADMIN],
    viewsHidden: [],
  },
  {
    name: 'my-vehicle',
    label: 'Mi vehiculo',
    icon: 'directions_car',
    views: [UserRoleI.DRIVER],
    viewsHidden: [],
  },
  {
    name: 'users',
    label: 'Usuarios',
    icon: 'person',
    views: [],
    viewsHidden: [UserRoleI.ADMIN],
  },
  {
    name: 'contracts',
    label: 'Contratos',
    icon: 'fact_check',
    views: [UserRoleI.DRIVER],
    viewsHidden: [UserRoleI.USER],
  },
  {
    name: 'vehicles',
    label: 'Vehiculos',
    icon: 'directions_bus',
    views: [UserRoleI.USER],
    viewsHidden: [UserRoleI.DRIVER],
  },
  {
    name: 'profile',
    label: 'Perfil',
    icon: 'person',
    views: [UserRoleI.ALL],
    viewsHidden: [],
  },
  {
    name: 'banks',
    label: 'Datos Bancarios',
    icon: 'account_balance',
    views: [],
    viewsHidden: [UserRoleI.ALL],
  },
  {
    name: 'paypal',
    label: 'Pagos',
    icon: 'paid',
    views: [],
    viewsHidden: [UserRoleI.USER, UserRoleI.DRIVER],
  },
  {
    name: 'settings',
    label: 'Opciones',
    icon: 'settings',
    views: [UserRoleI.ALL],
    viewsHidden: [],
  },
  {
    name: 'admin-vehicles',
    label: 'Vehiculos',
    icon: 'directions_bus',
    views: [],
    viewsHidden: [UserRoleI.ADMIN],
  },
  {
    name: 'admins',
    label: 'Admins',
    icon: 'person',
    views: [],
    viewsHidden: [UserRoleI.ADMIN],
  },
]

const tabs = reactive({
  values: [...tabsDefault],
  select: 'map',
})

export default () => {
  const initTabs = (route: RouteLocation) => {
    tabs.select = route.name?.toString() || ''
  }

  const emptyTabs = (route: string) => {
    tabs.select = route
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initTabsForRole = (store?: any) => {
    tabs.values = tabsDefault.filter(
      (tab) =>
        tab.views.includes(UserRoleI.ALL) ||
        tab.viewsHidden.includes(UserRoleI.ALL) ||
        tab.views.some((role) => role?.toLowerCase() == store.auth.getRole?.toLowerCase()) ||
        tab?.viewsHidden?.some((role) => role?.toLowerCase() == store.auth.getRole?.toLowerCase()),
    )
  }

  const reset = () => (tabs.values = tabsDefault)

  return {
    initTabsForRole,
    tabsDefault,
    emptyTabs,
    initTabs,
    reset,
    tabs,
  }
}
