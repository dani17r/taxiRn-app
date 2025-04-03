/* eslint-disable @typescript-eslint/no-explicit-any */
import { App } from '@capacitor/app'
// import { supabase } from '@services/supabase.services'
import { useRouter } from 'vue-router'

// Manejador principal actualizado

function handleDeepLinks() {
  void App.addListener('appUrlOpen', (event: any) => {
    void (async () => {
      const url = new URL(event.url)

      // Reset de contraseña
      if (url.pathname === '/reset-password') {
        const token = url.searchParams.get('token')
        const type = url.searchParams.get('type')

        const router = useRouter()
        if (token && type === 'recovery') {
          await router.push({ name: 'reset-password', params: { token } })
        }
      }
    })()
  })
}

export default handleDeepLinks
