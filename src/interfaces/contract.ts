import type { LocationI } from './location'
import type { RouteI } from './route'
import type { UserI } from './user'
import type { VehicleWithShipT } from './vehicle'

export type ServiceTypeI = 'taxi' | 'delivery' | 'both'
export type ContractStatusI = 'pending' | 'accepted' | 'verified' | 'completed' | 'cancelled'

export interface ContractI {
  id?: string
  id_contract?: number
  client_id: string
  vehicle_id: string
  route_id?: string
  service_type: ServiceTypeI
  status: ContractStatusI
  description?: string
  location_id?: string
  price?: number
  estimated_time?: string
  created_at: Date
  updated_at: Date
}

export interface ContractInputsI {
  CreateI: Omit<ContractI, 'id' | 'preice' | 'updated_at' | 'estimated_time' | 'status'>
}

export type ContractWithShipT = ContractI & { route?: RouteI } & { location?: LocationI } & {
  client?: UserI
} & { vehicle?: VehicleWithShipT }
