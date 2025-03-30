export interface ContractI {
  id: string
  client_id: string
  vehicle_id: string
  route_id?: string
  service_type: 'taxi' | 'delivery' | 'both'
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  pickup_location_id: string
  delivery_location_id?: string
  price?: number
  estimated_time?: string // ISO 8601 duration format
  created_at: Date
  updated_at: Date
}
