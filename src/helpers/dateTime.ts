export const formatCustomDate = (dateString: string): string => {
  // Parsear la fecha incluyendo la zona horaria
  const date = new Date(dateString)

  // Opciones para formatear la fecha
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long', // "lunes"
    day: 'numeric', // "2"
    month: 'long', // "marzo"
    year: 'numeric', // "2025"
    timeZone: 'UTC', // Usar zona horaria original del string
  }

  // Opciones para formatear la hora
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // "10"
    minute: '2-digit', // "42"
    hour12: true, // formato 12h
    timeZone: 'UTC', // Usar zona horaria original
  }

  // Formatear partes de la fecha
  const dateFormatter = new Intl.DateTimeFormat('es-ES', dateOptions)
  const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions)

  // Obtener partes de la fecha
  const dateParts = dateFormatter.formatToParts(date)
  const weekday = dateParts.find((part) => part.type === 'weekday')?.value || ''
  const day = dateParts.find((part) => part.type === 'day')?.value || ''
  const month = dateParts.find((part) => part.type === 'month')?.value || ''
  const year = dateParts.find((part) => part.type === 'year')?.value || ''

  // Formatear la hora y convertir a minúsculas
  const time = timeFormatter.format(date).toLowerCase().replace(/\s/g, '') // Eliminar espacios

  // Construir el string final
  return `${weekday.toLowerCase()} ${day} de ${month.toLowerCase()}, ${year} - ${time}`
}
