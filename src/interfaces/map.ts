export type FunctPoint = (type: 'start' | 'end', lat: number, lng: number) => Promise<void>

export interface LocationI {
  id: number
  title: string
  created_at?: string // Opcional si necesitas la fecha
  coordinates: {
    type: 'Point'
    coordinates: [number, number]
  }
}
export interface RouteI {
  id: string
  route_name: string
  start_point: { coordinates: [number, number] }
  end_point: { coordinates: [number, number] }
  path?: { coordinates: [number, number][] }
}
