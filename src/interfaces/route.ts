/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Point, LineString } from 'geojson'

export interface RouteI {
  id: string
  user_id: string
  name?: string
  description?: string
  start_point: Point
  end_point: Point
  path?: LineString
  created_at: string | number | Date
}

export interface FetchGeometryI {
  coordinates: [number, number][]
  type: 'LineString'
}

export interface FetchLegI {
  steps: any[]
  summary: string
  weight: number
  duration: number
  distance: number
}

export interface FetchRouteI {
  geometry: FetchGeometryI
  legs: FetchLegI[]
  weight_name: string
  weight: number
  duration: number
  distance: number
}

export interface FetchWaypointI {
  hint: string
  distance: number
  name: string
  location: [number, number]
}

export interface RouteResponse {
  code: string
  routes: FetchRouteI[]
  waypoints: FetchWaypointI[]
}
