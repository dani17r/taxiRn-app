import type { RouteI, RouteResponse } from '@interfaces/route'
import { fetchRoute } from '@services/map.services'
import superComposable from '@composables/super'
import stateMap from '@composables/map/state'
import { Notify } from 'quasar'
import supabase from '@services/supabase.services'
import { computed } from 'vue'

export default () => {
  const { store } = superComposable()
  const { route, isRoute, L } = stateMap()
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

  const getRoutes = async () => {
    const user_id = String(store.auth.current?.id)

    try {
      const { data, error } = await supabase.rpc('get_routes', { user_id })

      if (error) {
        console.error('Error loading routes:', error)
        Notify.create({ type: 'negative', message: `Failed to load routes: ${error.message}` })
        route.data = []
        return
      }

      if (data) {
        route.data = data
          .map((rou: RouteI & { start_point: string; end_point: string; path: string }) => {
            const startPoint = rou.start_point || null
            const endPoint = rou.end_point || null
            const path = rou.path || null

            const newRoute = {
              id: rou.id,
              user_id: rou.user_id,
              name: rou.name,
              description: rou.description,
              start_point: startPoint ? JSON.parse(startPoint) : null,
              end_point: endPoint ? JSON.parse(endPoint) : null,
              path: path ? JSON.parse(path) : null,
              created_at: rou.created_at,
            } as RouteI

            if (newRoute.end_point.coordinates[1]! == route.endPos?.lat) {
              route.current = newRoute
            }

            return newRoute
          })
          .filter((route: RouteI) => route !== null)
      } else {
        route.data = []
      }
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: `Failed to load routes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      route.data = []
    }
  }

  const getRoute = (routeSelect: RouteI) => {
    if (!map.value) return

    if (routeSelect.start_point?.coordinates && routeSelect.end_point?.coordinates) {
      const startCoords = routeSelect.start_point.coordinates
      const endCoords = routeSelect.end_point.coordinates

      window.map.deletePoint('start')
      window.map.deletePoint('end')
      window.map.createPoint('start', startCoords[1]!, startCoords[0]!)
      window.map.createPoint('end', endCoords[1]!, endCoords[0]!)
    }

    route.current = routeSelect
  }

  const saveRoute = async (name: string, description?: string) => {
    const user_id = String(store.auth.current?.id)

    try {
      const pathLatLngs = route.line?.getLatLngs() as L.LatLng[] | undefined
      const pathWKT =
        pathLatLngs && pathLatLngs.length > 1
          ? `LINESTRING(${pathLatLngs.map((p: L.LatLng) => `${p.lng} ${p.lat}`).join(', ')})`
          : null

      const { data, error } = await supabase
        .from('routes')
        .insert({
          start_point: `POINT(${route.startPos?.lng} ${route.startPos?.lat})`,
          end_point: `POINT(${route.endPos?.lng} ${route.endPos?.lat})`,
          description: description,
          path: pathWKT,
          user_id,
          name,
        })
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        await getRoutes()

        const newRoute = route.data.find((rou) => rou.id == data.id)
        if (newRoute) getRoute(newRoute)

        Notify.create({
          message: 'Ruta guardada con exito',
          icon: 'check',
          type: 'positive',
        })
      }
    } catch (error) {
      console.error('Error saving route:', error)
      Notify.create({
        type: 'negative',
        message: `Error saving route: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  const deleteCurrentRoute = async () => {
    if (!route.current) return

    const locationIdToDelete = route.current.id

    const { error } = await supabase.from('routes').delete().eq('id', locationIdToDelete)

    if (error) {
      console.error('Error deleting route:', error)
      Notify.create({ type: 'negative', message: `Error deleting route: ${error.message}` })
      return
    }

    route.data = route.data.filter((loc) => loc.id !== locationIdToDelete)
    route.current = null

    // window.map.deletePoint('start')
    // window.map.deletePoint('end')
    // clearRouteLine()

    Notify.create({
      message: 'Ruta Eliminada con existo',
      icon: 'check',
      type: 'positive',
    })
  }

  const isRouteExist = computed(() => {
    if (!route.current) return false

    const coorsRouteStartLat = route.current.start_point.coordinates[1] == route.startPos!.lat
    const coorsRouteEndLat = route.current.end_point.coordinates[1] == route.endPos!.lat
    return coorsRouteStartLat && coorsRouteEndLat
  })

  return {
    deleteCurrentRoute,
    clearRouteLine,
    getRouteLine,
    getRoutes,
    saveRoute,
    getRoute,
    isRouteExist,
    isRoute,
    route,
  }
}
