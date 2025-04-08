import type { ToRouterT, FromRouterT, NextRouterT } from '@interfaces/global'
import { UserRoleI } from '@interfaces/user'
import { useAuthStore } from '@stores/auth'
import { removeLoading } from '@utils/initHtml'

export const isPermission = (to: ToRouterT, _from: FromRouterT, next: NextRouterT) => {
  const rolesOfView = to.meta.roles as string[]

  const authStore = useAuthStore()

  removeLoading()
  if (rolesOfView.includes(UserRoleI.ALL)) next()
  if (rolesOfView.includes(authStore?.getRole || '')) next()
  else {
    next({ name: 'login' })
  }
}
