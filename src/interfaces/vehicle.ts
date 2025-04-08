import type { UserI } from './user'

export interface VehicleImagesI {
  ground?: string | null
}

export interface VehicleI {
  id: string
  user_id: string
  is_active: boolean
  vehicle_type?: 'car' | 'motorcycle'
  license_plate: string
  model: string
  brand: string
  year: number
  color: string
  created_at: Date
  images: VehicleImagesI
}

export type VehicleWithShipT = VehicleI & { user?: Partial<UserI> }

export interface StateI {
  lifecycles: {
    onMounted: boolean
  }
  current: VehicleI | null
  data: VehicleI[] | null
  loading: boolean
  error: string | null
}

export interface InputsI {
  RegisterI: {
    user_id: string
    license_plate: string
    model: string
    brand: string
    year: number
    color: string
    vehicle_type: string
    is_active?: boolean
  }
  UpdateI: Partial<{
    user_id: string
    license_plate: string
    model: string
    brand: string
    year: number
    color: string
    vehicle_type: string
    is_active: boolean
  }>
}
