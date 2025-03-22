import type { ToRouterT, FromRouterT, NextRouterT } from '@interfaces/global'
import { UserRoleI } from '@interfaces/user'
import { useAuthStore } from '@stores/auth'

export const isLogin = async (to: ToRouterT, _from: FromRouterT, next: NextRouterT) => {
  const isVerifyAuth = to.meta.auth

  const authStore = useAuthStore()

  await authStore.getUser((user) => {
    if (isVerifyAuth) {
      if (user) next()
      else next({ name: 'login' })
    } else {
      if (user) {
        if (user.role == UserRoleI.USER) next({ name: 'map' })
        if (user.role == UserRoleI.ADMIN) next({ name: 'panel' })
        if (user.role == UserRoleI.DRIVER) next({ name: 'my-vehicle' })
      } else next()
    }
  }, true)
}

export const getCurrentUser = async (to: ToRouterT, _from: FromRouterT, next: NextRouterT) => {
  const authStore = useAuthStore()
  await authStore.getUser()
  next()
}
