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
