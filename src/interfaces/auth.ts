import type { UserI, UserImagesI, UserRoleI } from '@interfaces/user'

export interface StateI {
  lifecycles: {
    onMounted: boolean
  }
  current: UserI | null
  data: UserI[] | null
}

export interface InputsI {
  RegisterI: {
    email: string
    password: string
    fullname: string
    role: string
  }
  LoginI: {
    email: string
    password: string
  }
  UpdateI: Partial<{
    email: string
    password: string
    role: UserRoleI
    cedula: string
    fullname: string
    description?: string | null
    images?: UserImagesI | null
  }>
}

export type ActionT = (data: UserI | null) => void
