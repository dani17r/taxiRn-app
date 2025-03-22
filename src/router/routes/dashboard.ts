import { getCurrentUser } from '@middlewares/authenticare'
import { isLogin } from '@middlewares/authenticare'

export default () => ({
  path: '/dashboard',
  component: () => import('@layouts/MainLayout.vue'),
  beforeEnter: [isLogin],
  meta: {
    auth: true,
  },
  children: [
    {
      path: '',
      name: 'vehicles',
      component: () => import('@pages/VehiclesPage.vue'),
    },
    {
      path: 'perfil',
      name: 'profile',
      component: () => import('@pages/ProfilePage.vue'),
    },
    {
      path: 'mi-vehiculo',
      name: 'my-vehicle',
      component: () => import('@pages/VehiclePage.vue'),
    },
    {
      path: 'contratos',
      name: 'contracts',
      component: () => import('@pages/ContractsPage.vue'),
    },
    {
      path: 'mapa',
      name: 'map',
      beforeEnter: [getCurrentUser],
      component: () => import('@pages/MapPage.vue'),
    },
    {
      path: 'settings',
      name: 'settings',
      beforeEnter: [getCurrentUser],
      component: () => import('@pages/SettingsPage.vue'),
    },
  ],
})
