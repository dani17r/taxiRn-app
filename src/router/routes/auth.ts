import { isLogin } from '@middlewares/authenticare'

export default () => ({
  path: '/',
  component: () => import('@layouts/PublicLayout.vue'),
  children: [
    {
      path: 'login',
      name: 'login',
      beforeEnter: [isLogin],
      meta: {
        auth: false,
      },
      component: () => import('@pages/auth/LoginPage.vue'),
    },
    {
      path: 'register',
      name: 'register',
      beforeEnter: [isLogin],
      meta: {
        auth: false,
      },
      component: () => import('@pages/auth/RegisterPage.vue'),
    },
    {
      path: 'forgot-password',
      name: 'forgot-password',
      beforeEnter: [isLogin],
      meta: {
        auth: false,
      },
      component: () => import('@pages/auth/ForgotPasswordPage.vue'),
    },
    {
      path: 'reset-password',
      name: 'reset-password',
      beforeEnter: [isLogin],
      meta: {
        auth: false,
      },
      component: () => import('@pages/auth/ResetPasswordPage.vue'),
    },
  ],
})
