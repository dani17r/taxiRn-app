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
  images?: UserImagesI
  created_at: Date
  updated_at: Date
}

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
