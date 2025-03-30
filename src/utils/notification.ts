import type { NotifyI } from '@interfaces/notify'
import { Notify } from 'quasar'

export default () => ({
  // Renamed from 'error' to 'errorCatch'
  errorCatch: (error: NotifyI['ErrorI']) =>
    Notify.create({
      message: error.message,
      position: 'top-right',
      type: 'negative',
    }),

  // New error function accepting a message string
  error: (message: string) =>
    Notify.create({
      message: message,
      position: 'top-right',
      type: 'negative',
    }),

  success: (data: NotifyI['SuccessI']) =>
    Notify.create({
      type: 'positive',
      message: data.message,
      onDismiss: () => data.ok && data.ok(),
    }),
})
