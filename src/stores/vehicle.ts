import { defineStore } from 'pinia'
import supabase from '@services/supabase.services'
import type { StateI, InputsI } from '@interfaces/vehicle'
import { useQuasar } from 'quasar'

export const useVehicleStore = defineStore('vehicleStore', {
  state: (): StateI => ({
    lifecycles: {
      onMounted: false,
    },
    current: null,
    data: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchVehicle(userId: string) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle() // Cambia a maybeSingle para permitir resultados nulos

        if (error) throw error
        this.current = data
        return data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error fetching vehicle'
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveVehicle(payload: InputsI['UpdateI']) {
      const $q = useQuasar()
      this.loading = true
      try {
        let result

        if (this.current?.id) {
          // Actualización
          const { data, error } = await supabase
            .from('vehicles')
            .update({ ...payload, updated_at: new Date() })
            .eq('id', this.current.id)
            .select()
            .single()

          if (error) throw error
          result = data
        } else {
          // Creación
          const { data, error } = await supabase
            .from('vehicles')
            .insert({
              ...payload,
              user_id: payload.user_id,
            })
            .select()
            .single()

          if (error) throw error
          result = data
        }

        $q.notify({ type: 'positive', message: 'Vehículo guardado' })
        this.current = result
        return result
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error saving vehicle'
        $q.notify({ type: 'negative', message: this.error })
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateVehicle(updates: InputsI['UpdateI']) {
      const $q = useQuasar()
      if (!this.current?.id) throw new Error('No vehicle selected')

      this.loading = true
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .update({ ...updates, updated_at: new Date() })
          .eq('id', this.current.id)
          .select()
          .single()

        if (error) throw error

        $q.notify({ type: 'positive', message: 'Vehículo actualizado' })
        this.current = data
        return data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Update failed'
        $q.notify({ type: 'negative', message: this.error })
        throw error
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.lifecycles.onMounted = false
      this.current = null
      this.data = null
      this.loading = false
      this.error = null
    },
  },
})
