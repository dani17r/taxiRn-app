import { getCurrentUser } from '@middlewares/authenticare'
import type { RouteRecordRaw } from 'vue-router'
import dashboard from '@router/routes/dashboard'
import errors from '@router/routes/errors'
import auth from '@router/routes/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
    beforeEnter: [getCurrentUser],
  },
  auth(),
  dashboard(),
  errors(),
]

export default routes
