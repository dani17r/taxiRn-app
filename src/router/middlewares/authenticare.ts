import type { ToRouterT, FromRouterT, NextRouterT } from '@interfaces/global'
import { removeLoading } from '@utils/initHtml'
import { UserRoleI } from '@interfaces/user'
import { useAuthStore } from '@stores/auth'

export const isLogin = async (to: ToRouterT, _from: FromRouterT, next: NextRouterT) => {
  const isVerifyAuth = to.meta.auth

  const authStore = useAuthStore()

  await authStore.getUser((user) => {
    removeLoading()

    if (isVerifyAuth) {
      if (user) next()
      else next({ name: 'login' })
    } else {
      if (user) {
        if (user.role == String(UserRoleI.USER)) next({ name: 'map' })
        if (user.role == String(UserRoleI.ADMIN)) next({ name: 'panel' })
        if (user.role == String(UserRoleI.DRIVER)) next({ name: 'my-vehicle' })
      } else next()
    }
  }, true)
}

export const getCurrentUser = async (to: ToRouterT, _from: FromRouterT, next: NextRouterT) => {
  const authStore = useAuthStore()
  await authStore.getUser()

  removeLoading()
  next()
}
