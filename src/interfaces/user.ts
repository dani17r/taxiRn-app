export interface UserAuthI {
  instance_id?: string
  id: string
  aud?: string
  role?: string
  email: string
  email_confirmed_at?: Date
  recovery_token?: string
  recovery_sent_at?: Date
  created_at?: Date
  updated_at?: Date
  phone?: string
  confirmed_at?: Date
  deleted_at?: Date
}

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

export interface UserPreferencesI {
  modeDark?: boolean
  fontSize?: number
}
export interface UserConfigI {
  types_modals: string[]
  types_notifications: string[]
}

export interface UserI {
  id: string
  user_id: string
  role: UserRoleI
  cedula: string
  email: string
  fullname: string
  description?: string | null
  images?: UserImagesI | null
  config?: UserConfigI | null
  preferences?: UserPreferencesI | null
  created_at?: Date | null
  updated_at?: Date | null
}
