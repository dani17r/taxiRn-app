import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export type ToRouterT = RouteLocationNormalized
export type FromRouterT = RouteLocationNormalized
export type NextRouterT = NavigationGuardNext

export interface DialogI<Status> {
  value: boolean
  toggle: (value?: Status) => void
}
