import type { Point } from 'geojson'

export interface LocationI {
  id: string
  user_id: string
  name?: string
  description?: string
  coordinates: Point
  created_at: Date
}
