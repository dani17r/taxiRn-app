import type { Point, LineString } from 'geojson'

export interface RouteI {
  id: string
  user_id: string
  name?: string
  description?: string
  start_point: Point
  end_point: Point
  path?: LineString
  created_at: Date
}
