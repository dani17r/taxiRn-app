import { getCurrentUser } from '@middlewares/authenticare'
import { isLogin } from '@middlewares/authenticare'
import { isPermission } from '@middlewares/permits'
import { UserRoleI } from '@interfaces/user'

export default () => ({
  path: '/dashboard',
  component: () => import('@layouts/MainLayout.vue'),
  beforeEnter: [isLogin, isPermission],
  meta: {
    auth: true,
  },
  children: [
    {
      path: '',
      name: 'panel',
      component: () => import('@pages/PanelPage.vue'),
      meta: {
        roles: [UserRoleI.ADMIN],
      },
    },
    {
      path: 'admin-payment',
      name: 'admin-payment',
      component: () => import('@pages/admin/AdminPaymentsPage.vue'),
      meta: {
        roles: [UserRoleI.ADMIN],
      },
    },
    {
      path: 'admin-vehiculos',
      name: 'admin-vehicles',
      component: () => import('@pages/admin/vehiclesPage.vue'),
      meta: {
        roles: [UserRoleI.ADMIN],
      },
    },
    {
      path: 'datos-bancarios',
      name: 'banks',
      component: () => import('@pages/BanksDataPage.vue'),
      meta: {
        roles: [UserRoleI.USER],
      },
    },
    {
      path: 'pagos',
      name: 'paypal',
      component: () => import('@pages/PaypalPage.vue'),
      meta: {
        roles: [UserRoleI.USER, UserRoleI.DRIVER],
      },
    },
    {
      path: 'vehiculos',
      name: 'vehicles',
      component: () => import('@pages/VehiclesPage.vue'),
      meta: {
        roles: [UserRoleI.ALL],
      },
    },
    {
      path: 'perfil',
      name: 'profile',
      component: () => import('@pages/ProfilePage.vue'),
      meta: {
        roles: [UserRoleI.ALL],
      },
    },
    {
      path: 'mi-vehiculo',
      name: 'my-vehicle',
      component: () => import('@pages/VehiclePage.vue'),
      meta: {
        roles: [UserRoleI.DRIVER],
      },
    },
    {
      path: 'contratos',
      name: 'contracts',
      component: () => import('@pages/ContractsPage.vue'),
      meta: {
        roles: [UserRoleI.USER, UserRoleI.DRIVER],
      },
    },
    {
      path: 'usuarios',
      name: 'users',
      component: () => import('@pages/admin/usersPage.vue'),
      meta: {
        roles: [UserRoleI.ADMIN],
      },
    },
    {
      path: 'mapa',
      name: 'map',
      beforeEnter: [getCurrentUser],
      component: () => import('@pages/MapPage.vue'),
      meta: {
        roles: [UserRoleI.USER],
      },
    },
    {
      path: 'settings',
      name: 'settings',
      beforeEnter: [getCurrentUser],
      component: () => import('@pages/SettingsPage.vue'),
      meta: {
        roles: [UserRoleI.ALL],
      },
    },
    {
      path: 'admins',
      name: 'admins',
      component: () => import('@pages/admin/adminsPage.vue'),
      meta: {
        roles: [UserRoleI.ADMIN],
      },
    },
  ],
})
