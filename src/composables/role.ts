import { UserRoleI } from '@interfaces/user'

import useSuperComposable from '@composables/super'

export default () => {
  const { store } = useSuperComposable()

  const isRoleActive = (views: string[]) => {
    if (views.includes(UserRoleI.ALL)) return true
    return views.some((role) => role?.toLowerCase() === store.auth.getRole?.toLowerCase())
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

  return {
    isRoleActive,
    isRoleLabel,
  }
}
