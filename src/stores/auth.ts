import type { StateI, InputsI, ActionT } from '@interfaces/user'

import { UserRoleI, type UserI } from '@interfaces/user'
import supabase from '@services/supabase.services'
import notification from '@utils/notification'
import { defineStore } from 'pinia'

const notify = notification()

export const useAuthStore = defineStore('authStore', {
  state: () =>
    <StateI>{
      lifecycles: {
        onMounted: false,
      },
      current: null,
      data: null,
    },
  getters: {
    isAuth: (state) => state.current !== null,
    getRoleUser: (state) => String(state.current?.role || '') == String(UserRoleI.USER),
    getRoleAdmin: (state) => String(state.current?.role || '') == String(UserRoleI.ADMIN),
    getRoleDriver: (state) => String(state.current?.role || '') == String(UserRoleI.DRIVER),
    getRole: (state) => state.current?.role || '',
    isBlocked: (state) => Boolean(state.current?.is_blocked),
  },
  actions: {
    // Register
    async newUser(user: InputsI['RegisterI'], action?: (id: string) => void) {
      try {
        const { data: user_id, error } = await supabase.rpc('add_new_user', {
          p_email: user.email,
          p_password: user.password,
          p_fullname: user.fullname,
          p_cedula: user.cedula,
          p_role: user.role || 'user',
        })

        if (error) throw error
        if (action) action(user_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        notify.errorCatch(error)
      }
    },

    //Login
    async signIn(user: InputsI['LoginI'], action?: ActionT) {
      await supabase.auth.signInWithPassword(user).then(async ({ data: dataAuth, error }) => {
        if (error) return notify.errorCatch(error) // Use errorCatch
        if (dataAuth) {
          await supabase
            .from('users')
            .select()
            .eq('user_id', dataAuth.user?.id)
            .then(({ data: dataUser, error }) => {
              if (error) return notify.errorCatch(error) // Use errorCatch
              this.current = dataUser[0]
              if (action) action(dataUser[0] as unknown as UserI)
            })
        }
      })
    },

    // Logout
    async signOut(action?: ActionT) {
      await supabase.auth.signOut().then(({ error }) => {
        if (error) return notify.errorCatch(error) // Use errorCatch
        if (action) action(null)
      })
    },

    //one user
    async getUser(action?: ActionT, isMounted = false) {
      if (!this.lifecycles.onMounted || isMounted) {
        this.lifecycles.onMounted = true
        await supabase.auth.getUser().then(async ({ data: dataAuth, error }) => {
          if (error) {
            if (action) action(null)
            return 'Not Authenticated User'
          }
          if (dataAuth) {
            await supabase
              .from('users')
              .select()
              .eq('user_id', dataAuth.user?.id)
              .then(({ data: dataUser, error }) => {
                if (error) return notify.errorCatch(error) // Use errorCatch
                if (action) action(dataUser[0] as UserI)
                this.current = dataUser[0] as UserI
              })
          }
        })
      }
    },

    async getSimpleUser() {
      await supabase
        .from('users')
        .select()
        .eq('id', this.current?.id)
        .single()
        .then(({ data, error }) => {
          if (error) return notify.errorCatch(error)
          this.current = data as UserI
        })
    },

    //update user
    async updateUser(user: InputsI['UpdateI'], action?: ActionT) {
      await supabase.auth.updateUser(user).then(({ data, error }) => {
        if (error) return notify.errorCatch(error) // Use errorCatch
        if (action) action(data as unknown as UserI)
        setTimeout(() => (this.current = data.user as unknown as UserI), 200)
      })
    },

    async resetPassword(email: string, action?: ActionT) {
      await supabase.auth.resetPasswordForEmail(email).then(({ error }) => {
        if (error) return notify.errorCatch(error) // Use errorCatch
        if (action) action(null)
      })
    },

    // reset default values
    reset() {
      this.lifecycles.onMounted = false
      this.current = null
      this.data = null
    },
  },
})
