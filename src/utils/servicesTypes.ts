// @/utils/serviceTypes.ts
export const translateServiceType = (type: string): string => {
  const typeMap: Record<string, string> = {
    taxi: 'Traslado Personal',
    delivery: 'Delivery',
    both: 'Ambos, Traslado + Delivery',
  }
  return typeMap[type] || type
}
