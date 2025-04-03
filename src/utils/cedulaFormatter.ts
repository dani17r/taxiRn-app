export const cedulaFormatter = (value: string) => {
  const digits = value.replace(/\D/g, '')
  let formatted = ''

  if (digits.length <= 2) return digits

  if (digits.length <= 5) {
    formatted = `${digits.slice(0, -3)}.${digits.slice(-3)}`
  } else {
    formatted = `${digits.slice(0, -6)}.${digits.slice(-6, -3)}.${digits.slice(-3)}`
  }

  if (formatted.startsWith('.')) formatted = formatted.substring(1)
  if (formatted.endsWith('.') && digits.length <= 2) formatted = formatted.slice(0, -1)
  if (digits.length > 8) formatted = formatted.slice(0, 10)

  return formatted
}
