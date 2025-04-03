import { ref, computed, watch } from 'vue'

export const useCedula = () => {
  const cedula = ref('')

  const formattedCedula = computed(() => {
    const digits = cedula.value.replace(/\D/g, '')
    let formatted = ''
    if (digits.length === 0) {
      formatted = ''
    } else if (digits.length <= 2) {
      formatted = digits
    } else if (digits.length <= 5) {
      formatted = `${digits.slice(0, digits.length - 3)}.${digits.slice(digits.length - 3)}`
    } else {
      formatted = `${digits.slice(0, digits.length - 6)}.${digits.slice(digits.length - 6, digits.length - 3)}.${digits.slice(digits.length - 3)}`
    }
    if (formatted.startsWith('.')) {
      formatted = formatted.substring(1)
    }
    if (formatted.endsWith('.') && digits.length <= 2) {
      formatted = formatted.substring(0, formatted.length - 1)
    }
    if (digits.length > 8) {
      formatted = formatted.slice(0, 10)
    }
    return formatted
  })

  const validationRules = [
    (val: string) => !!val || 'Campo requerido',
    (val: string) => /^(\d{1,2}\.)?\d{3}\.\d{3}$/.test(val) || 'Formato: x.xxx.xxx o xx.xxx.xxx',
  ]

  watch(
    () => cedula.value,
    (newValue) => {
      // Allow backspace/delete without reformatting immediately
      if (newValue === formattedCedula.value) return

      const digits = newValue.replace(/\D/g, '')
      let formatted = ''

      if (digits.length === 0) {
        formatted = ''
      } else if (digits.length <= 2) {
        formatted = digits
      } else if (digits.length <= 5) {
        formatted = `${digits.slice(0, digits.length - 3)}.${digits.slice(digits.length - 3)}`
      } else {
        formatted = `${digits.slice(0, digits.length - 6)}.${digits.slice(digits.length - 6, digits.length - 3)}.${digits.slice(digits.length - 3)}`
      }

      // Ensure the format starts correctly (e.g., avoid ".123")
      if (formatted.startsWith('.')) {
        formatted = formatted.substring(1)
      }
      // Handle cases like "1." -> "1" or "12." -> "12"
      if (formatted.endsWith('.') && digits.length <= 2) {
        formatted = formatted.substring(0, formatted.length - 1)
      }

      // Limit to xx.xxx.xxx format (max 8 digits -> 10 chars with dots)
      if (digits.length > 8) {
        formatted = formatted.slice(0, 10)
      }

      // Update the model value only if it changed to avoid infinite loops
      if (cedula.value !== formatted) {
        cedula.value = formatted
      }
    },
  )

  return {
    cedula,
    formattedCedula,
    validationRules,
    resetCedula: () => (cedula.value = ''),
  }
}
