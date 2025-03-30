import { boot } from 'quasar/wrappers'
import { App } from '@capacitor/app'
import { useQuasar } from 'quasar'

const $q = useQuasar()

export default boot(({ router }) => {
  if ($q?.platform?.is.capacitor) {
    App.addListener('appUrlOpen', ({ url }) => {
      const slug = url.split('tuapp://').pop()?.split('?')[0]
      const params = new URLSearchParams(url.split('?')[1])

      if (slug === 'reset-password') {
        router
          .push({
            path: '/reset-password',
            query: {
              access_token: params.get('access_token'),
              refresh_token: params.get('refresh_token'),
            },
          })
          .catch((error) => console.log(error))
      }
    }).catch((error) => {
      console.error('Error setting up deep link listener:', error)
    })
  }
})
