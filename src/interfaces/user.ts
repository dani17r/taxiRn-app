import type { VehicleI } from './vehicle'

export enum UserRoleI {
  ADMIN = 'admin',
  USER = 'user',
  DRIVER = 'driver',
  ALL = 'all',
}

export interface UserImagesI {
  profile?: string | null
  ground?: string | null
}

export interface UserI {
  id: string
  user_id: string
  role: string
  email: string
  fullname: string
  cedula?: string
  is_blocked?: boolean
  description?: string
  phone: string
  birthdate: string
  images?: UserImagesI
  created_at: Date
  updated_at: Date
}

export type DriverT = UserI & { vehicles: VehicleI[] }

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
    cedula?: string
    role?: string
  }
  LoginI: {
    email: string
    password: string
  }
  UpdateI: Pick<UserI, 'fullname' | 'description' | 'images'> & {
    email: string
    cedula?: string
    role: string
    phone: string
    birthdate: string
  }
}

export type ActionT = (data: UserI | null) => void
