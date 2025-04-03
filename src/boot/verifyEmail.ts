/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@services/supabase.services'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

type VerifyEmailResponse = {
  error?: Error | null
  data?: any
}

// Función para verificar el token con Supabase
async function verifyEmailWithSupabase(token: string): Promise<VerifyEmailResponse> {
  try {
    const { error, data } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: token,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { data }
  } catch (error: any) {
    console.error('Error verifying email:', error.message)
    return { error }
  }
}

// Manejador principal de Deep Links
function handleDeepLinks() {
  void App.addListener('appUrlOpen', (event: any) => {
    try {
      const url = new URL(event.url)

      // Manejar verificación de email
      if (url.pathname === '/verify-email') {
        const token = url.searchParams.get('token')

        if (token) {
          verifyEmailWithSupabase(token)
            .then((response) => {
              if (response.error) {
                // Manejar error (puedes usar un store de Pinia/Vuex aquí)
                console.error('Email verification failed:', response.error.message)
              } else {
                // Éxito (redirigir o actualizar estado)
                console.log('Email verified successfully!', response.data)
              }
            })
            .catch(() => {})
        }
      }
    } catch (error: any) {
      console.error('Error processing deep link:', error.message)
    }
  })

  void App.getLaunchUrl().then((launchUrl: any) => {
    if (launchUrl?.url) {
      try {
        const url = new URL(launchUrl.url)

        // Manejar verificación de email
        if (url.pathname === '/verify-email') {
          const token = url.searchParams.get('token')

          if (token) {
            verifyEmailWithSupabase(token)
              .then((response) => {
                if (response.error) {
                  // Manejar error (puedes usar un store de Pinia/Vuex aquí)
                  console.error('Email verification failed:', response.error.message)
                } else {
                  // Éxito (redirigir o actualizar estado)
                  console.log('Email verified successfully!', response.data)
                }
              })
              .catch(() => {})
          }
        }
      } catch (error: any) {
        console.error('Error processing deep link:', error.message)
      }
    }
  })
}

export default () => {
  if (Capacitor.isNativePlatform()) {
    handleDeepLinks()
  }
}
