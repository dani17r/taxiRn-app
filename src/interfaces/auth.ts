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
