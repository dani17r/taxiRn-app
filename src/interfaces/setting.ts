export interface UserSettingsI {
  user_id: string
  dark_mode: boolean
  show_online_status: boolean
  profile_visibility: 'public' | 'private'
  preferred_language: string
  time_zone: string
  created_at: Date
  updated_at: Date
}
