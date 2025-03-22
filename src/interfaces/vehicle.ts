export interface VehicleI {
  id: string
  user_id: string
  license_plate: string
  model: string
  brand: string
  year: string
  color: string
  vehicle_type: 'car' | 'motorcycle'
  created_at: string
  updated_at: string
  is_active: boolean
}

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
    year: string
    color: string
    vehicle_type: string
  }
  UpdateI: Partial<{
    user_id: string
    license_plate: string
    model: string
    brand: string
    year: string
    color: string
    vehicle_type: string
  }>
}
