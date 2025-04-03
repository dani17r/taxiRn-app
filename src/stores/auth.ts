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
    getRole: (state) => state.current!.role || '',
  },
  actions: {
    // Register
    async newUser(user: InputsI['RegisterI'], action?: ActionT) {
      await supabase.auth
        .signUp({ email: user.email, password: user.password })
        .then(async ({ data: dataAuth, error }) => {
          if (error) return notify.errorCatch(error) // Use errorCatch
          if (dataAuth) {
            await supabase
              .from('users')
              .insert([
                {
                  fullname: user.fullname,
                  user_id: dataAuth.user?.id,
                  email: user.email,
                  cedula: user.cedula,
                  role: user.role || 'user',
                },
              ])
              .select()
              .then(({ data: dataUser, error }) => {
                if (error) return notify.errorCatch(error) // Use errorCatch
                if (action) action(dataUser[0] as UserI)
              })
          }
        })
    },

    async signUp(user: InputsI['RegisterI'], action?: (id: string) => void) {
      try {
        const { data: user_id, error } = await supabase.rpc('add_new_user', {
          email: user.email,
          password: user.password,
          fullname: user.fullname,
          cedula: user.cedula,
          role: user.role,
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
                if (action) action(dataUser[0] as unknown as UserI)
                this.current = dataUser[0] as unknown as UserI
              })
          }
        })
      }
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
