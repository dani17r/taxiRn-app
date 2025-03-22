import { UserRoleI } from '@interfaces/user'

import useSuperComposable from '@composables/super'
import useTabsComposable from '@composables/tabs'

const { store } = useSuperComposable()
const { tabs } = useTabsComposable()

export default () => {
  const isRoleActive = (roles: string[]) => {
    // 1. Si el tab está marcado para todos los roles
    if (roles.includes(UserRoleI.ALL)) return true

    // 3. Verificar si el rol del usuario está en los permitidos
    return roles.some((role) => role.toLowerCase() === store.auth.getRole.toLowerCase())
  }

  const isRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return 'Usuario'
      case 'driver':
        return 'Conductor'
      case 'admin':
        return 'Admin'
      default:
        return 'Usuario'
    }
  }

  const initTabsForRole = () => {
    tabs.values = tabs.values.filter(
      (tab) =>
        tab.roles.includes(UserRoleI.ALL) ||
        tab.roles.some((role) => role.toLowerCase() === store.auth.getRole.toLowerCase()),
    )

    // Opcional: Resetear la pestaña seleccionada si no existe
    if (!tabs.values.some((tab) => tab.name === tabs.select)) {
      tabs.select = tabs.values[0]?.name || 'map'
    }
  }

  return {
    isRoleActive,
    isRoleLabel,
    initTabsForRole,
  }
}
