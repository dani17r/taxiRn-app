/* eslint-disable  */
import type { Ref } from 'vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export type ToRouterT = RouteLocationNormalized
export type FromRouterT = RouteLocationNormalized
export type NextRouterT = NavigationGuardNext

export interface DialogI<Status> {
  value: boolean
  id: string | null
  status: Status
  changeId: (id: string | null) => void
  toggle: (value?: Status) => void
}

export interface BasicInputI {
  value: any
  rules: ((val: string) => boolean | string)[]
}

export interface InputI {
  set(val: string | number | boolean): void
  isChange(): boolean
  validate(): boolean
  isErrors(): boolean
  ref?: Ref | any
  view?: boolean
  reset(): void
  copy: any
  data?: any
  error: {
    status: boolean
    on: () => void
    off: () => void
  }
}

export interface FormI<T> {
  verifyIsNotChanges(): boolean
  checkValidation(): boolean
  checkIsErrors(): boolean
  getValues(): { [key in keyof T]: keyof T }
  updateForm(val: any): void
  update(): void
  reset(): void
  reset(): void
  getRef(val: any): void
  resetValidation(): void
  validate(): boolean
}

export type SuperInputUnionT = InputI & BasicInputI
export type SuperInputT<T> = { [key in keyof T]: SuperInputUnionT }
export type SuperFormT<T> = SuperInputT<T> & FormI<T>
