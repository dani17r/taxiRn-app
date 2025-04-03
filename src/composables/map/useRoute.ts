import { fetchRoute } from '@services/map.services'
import type { RouteResponse } from '@interfaces/route'
import stateMap from '@composables/map/state'
import { Notify } from 'quasar'

export default () => {
  const { route, L } = stateMap()
  const { map } = stateMap()

  const parseRouteCoordinates = (data: RouteResponse): [number, number][] => {
    return data.routes[0]!.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
  }

  const getRouteLine = async () => {
    if (!map.value) return
    if (!route.startPos || !route.endPos) return

    clearRouteLine()

    try {
      const routeData = await fetchRoute(route.startPos as L.LatLng, route.endPos as L.LatLng)

      route.line = L.polyline(parseRouteCoordinates(routeData), {
        color: '#1976D2',
        weight: 4,
        opacity: 0.7,
      }).addTo(map.value)

      map.value.fitBounds(
        L.latLngBounds([route.startPos as L.LatLng, route.endPos as L.LatLng]).pad(0.2),
      )
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: `${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  const clearRouteLine = () => {
    if (!map.value || !route.line) return

    map.value.removeLayer(route.line as unknown as L.Layer)
    route.line = null
  }

  return {
    clearRouteLine,
    getRouteLine,
    route,
  }
}
