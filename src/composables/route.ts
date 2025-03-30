// src/composables/route.ts
import { fetchRoute } from '@services/map.services'
import type { RouteI } from '@interfaces/route'
import { ref } from 'vue'
import L from 'leaflet'

const startPos = ref<L.LatLng | null>(null)
const endPos = ref<L.LatLng | null>(null)
const currentRoute = ref<RouteI | null>(null)
const thereIsNoRoute = ref(false)
const savedRoutes = ref<RouteI[]>([])
let routeLine: L.Polyline | null = null

export default () => {
  const parseRouteCoordinates = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): [number, number][] => {
    return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
  }

  const updateRoute = async (map: L.Map): Promise<void> => {
    if (routeLine) {
      map.removeLayer(routeLine)
      routeLine = null
      currentRoute.value = null
    }

    if (!startPos.value || !endPos.value) {
      thereIsNoRoute.value = true
      return
    }

    try {
      const response = await fetchRoute(startPos.value, endPos.value)
      if (!response.ok) throw new Error('API response error')

      const routeData = await response.json()
      if (!routeData.routes?.[0]?.geometry) throw new Error('Route not found')

      routeLine = L.polyline(parseRouteCoordinates(routeData), {
        color: '#1976D2',
        weight: 4,
        opacity: 0.7,
      }).addTo(map)

      map.fitBounds(L.latLngBounds([startPos.value, endPos.value]).pad(0.2))
    } catch (error) {
      console.error('Error calculating route:', error)
    }
  }

  const resetRouteState = (map: L.Map) => {
    if (routeLine) {
      map.removeLayer(routeLine)
      routeLine = null
    }

    startPos.value = null
    endPos.value = null
    currentRoute.value = null
    thereIsNoRoute.value = true
  }

  const saveRoute = (name: string) => {
    if (!startPos.value || !endPos.value) return

    const newRoute: RouteI = {
      id: String(Date.now()), // Placeholder ID
      user_id: 'user_placeholder', // Placeholder user_id
      created_at: new Date(), // Placeholder created_at as Date
      name,
      start_point: { type: 'Point', coordinates: [startPos.value.lng, startPos.value.lat] },
      end_point: { type: 'Point', coordinates: [endPos.value.lng, endPos.value.lat] },
      path: routeLine?.toGeoJSON() as unknown as GeoJSON.LineString, // Explicit cast
    }

    savedRoutes.value.push(newRoute)
    currentRoute.value = newRoute
    thereIsNoRoute.value = false
  }

  const loadRoute = (route: RouteI) => {
    currentRoute.value = route
    thereIsNoRoute.value = false
  }

  const deleteRoute = () => {
    if (!currentRoute.value) return

    savedRoutes.value = savedRoutes.value.filter((route) => route.id !== currentRoute.value?.id)
    currentRoute.value = null
    thereIsNoRoute.value = true
  }

  const loadSavedRoutes = () => {
    return savedRoutes.value
  }

  return {
    startPos,
    endPos,
    currentRoute,
    thereIsNoRoute,
    savedRoutes,
    updateRoute,
    resetRouteState,
    saveRoute,
    loadRoute,
    deleteRoute,
    loadSavedRoutes,
  }
}
