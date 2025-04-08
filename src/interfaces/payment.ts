import type { ContractI } from './contract'
import type { UserI } from './user'

export interface PaymentI {
  id: string
  user_id: string
  contract_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'cancelled'
  payment_method?: string
  transaction_id?: string
  created_at: Date
}

export interface Payment {
  id: string
  contract_id: string
  user_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'cancelled'
  payment_method: string
  transaction_id: string
  image: string | null
  created_at: string
}

export interface Contract {
  id: string
  client_id: string
  vehicle_id: string
  service_type: 'taxi' | 'delivery' | 'both'
  status: string
  created_at: string
}

export interface User {
  id: string
  fullname: string
  email: string
  phone: string | null
}

export type PaymentWithShipT = Payment & { contract?: ContractI } & { user?: UserI }
