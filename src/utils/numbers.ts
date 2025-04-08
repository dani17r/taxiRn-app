export function formatPhone(numero: string) {
  // Convertir el número a string
  const numStr = numero.toString()

  // Asegurarnos que tiene al menos 8 dígitos (rellenar con ceros al inicio si es necesario)
  const numRellenado = numStr.padStart(8, '0')

  // Extraer las partes del número
  const codigoArea = numRellenado.substring(0, 4)
  const primeraParte = numRellenado.substring(4, 7)
  const segundaParte = numRellenado.substring(7)

  // Formatear el número con guiones
  return `${codigoArea}-${primeraParte}-${segundaParte}`
}
