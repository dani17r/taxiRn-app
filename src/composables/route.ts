// src/composables/route.ts
import { ref, computed } from 'vue'
import L from 'leaflet'
import { Loading, Notify } from 'quasar'
import type { RouteI } from '@interfaces/route'
import { fetchRoute } from '@services/map.services'
import supabase from '@services/supabase.services'
import superComposable from '@composables/super'
import type { Point, LineString } from 'geojson'

const startPos = ref<L.LatLng | null>(null)
const endPos = ref<L.LatLng | null>(null)
const currentRoute = ref<RouteI | null>(null)
const savedRoutes = ref<RouteI[]>([])

let routeLine: L.Polyline | null
let startMarker: L.Marker | null = null
let endMarker: L.Marker | null = null

// Refs for map interaction functions, initialized dynamically
let setPoint: ((type: 'start' | 'end', lat: number, lng: number) => Promise<void>) | null = null
let map: L.Map | null = null
let saveStateToLocalStorage: (() => void) | null = null
let deletePoint: ((type: 'start' | 'end') => void) | null = null

// Exported composable
export default () => {
  const { store } = superComposable()
  // --- Initialization ---
  const initializeMapComposable = async () => {
    if (!setPoint || !map || !saveStateToLocalStorage || !deletePoint) {
      try {
        const mapModule = await import('@composables/map')
        const mapComposable = mapModule.default()
        setPoint = mapComposable.setPoint
        map = mapComposable.map
        saveStateToLocalStorage = mapComposable.saveStateToLocalStorage
        // Ensure deletePoint is also initialized if available in map.ts exports
        if (window.vueActions && typeof window.vueActions.deletePoint === 'function') {
          deletePoint = window.vueActions.deletePoint
        } else {
          console.warn('deletePoint function not found in map composable actions.')
        }
      } catch (error) {
        console.error('Failed to initialize map composable for routes:', error)
      }
    }
  }

  // --- Drawing Logic ---
  const drawRouteFromGeoJSON = (path: LineString | undefined) => {
    if (!map) {
      console.error('Map not available for drawing route.')
      return
    }
    // Remove existing route line if any
    if (routeLine) {
      map.removeLayer(routeLine)
      routeLine = null
    }

    if (!path?.coordinates || path.coordinates.length < 2) {
      console.warn('No valid path geometry provided to draw.')
      return
    }

    // Convert LngLat coordinates from GeoJSON to LatLng for Leaflet Polyline
    const coordinates = path.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])

    routeLine = L.polyline(coordinates, {
      color: '#1976D2',
      weight: 5,
      opacity: 0.8,
    }).addTo(map)

    // Optionally fit bounds if start/end points are also available
    if (startPos.value && endPos.value) {
      map.fitBounds(L.latLngBounds([startPos.value, endPos.value]).pad(0.15))
    }
  }

  // --- Route State Logic ---
  const isCurrentRouteInDB = computed(() => {
    return (
      currentRoute.value?.id &&
      !currentRoute.value.id.startsWith('temp-') &&
      savedRoutes.value.some((r) => r.id === currentRoute.value?.id)
    )
  })

  // --- Core Functions ---
  const parseGeoJsonPoint = (jsonString: string): Point | null => {
    try {
      const parsed = JSON.parse(jsonString)
      if (
        parsed?.type === 'Point' &&
        Array.isArray(parsed.coordinates) &&
        parsed.coordinates.length >= 2 &&
        typeof parsed.coordinates[0] === 'number' &&
        typeof parsed.coordinates[1] === 'number'
      ) {
        return parsed as Point
      }
      console.error('Invalid GeoJSON Point structure after parsing:', parsed)
      return null
    } catch (e) {
      console.error('Error parsing GeoJSON Point string:', jsonString, e)
      return null
    }
  }

  const parseGeoJsonLineString = (
    jsonString: string | null | undefined,
  ): LineString | undefined => {
    if (!jsonString) return undefined
    try {
      const parsed = JSON.parse(jsonString)
      if (
        parsed?.type === 'LineString' &&
        Array.isArray(parsed.coordinates) &&
        parsed.coordinates.every(
          (coord: unknown) =>
            Array.isArray(coord) &&
            coord.length >= 2 &&
            typeof coord[0] === 'number' &&
            typeof coord[1] === 'number',
        )
      ) {
        return parsed as LineString
      }
      console.error('Invalid GeoJSON LineString structure after parsing:', parsed)
      return undefined
    } catch (e) {
      console.error('Error parsing GeoJSON LineString string:', jsonString, e)
      return undefined
    }
  }

  const parseRouteCoordinates = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): [number, number][] => {
    return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
  }

  const updateRoute = async (): Promise<void> => {
    await initializeMapComposable()
    if (!map) {
      console.error('Map not initialized for route update.')
      return
    }

    // Remove existing route line if any
    if (routeLine) {
      map.removeLayer(routeLine)
      routeLine = null
    }

    // If no start or end position, clear current route and exit
    if (!startPos.value || !endPos.value) {
      currentRoute.value = null // Clear temporary route if points are missing
      if (saveStateToLocalStorage) saveStateToLocalStorage()
      return
    }

    Loading.show()
    console.log('llamando a updateRuta')
    try {
      const response = await fetchRoute(startPos.value, endPos.value)
      if (!response.ok) throw new Error(`API response error: ${response.statusText}`)

      const routeData = await response.json()
      if (!routeData.routes?.[0]?.geometry?.coordinates)
        throw new Error('Route geometry not found in API response')

      // // Removed unused 'coordinates' variable
      // const pathGeoJson: LineString = {
      //   type: 'LineString',
      //   coordinates: routeData.routes[0].geometry.coordinates, // Keep this for the path object
      // } // Store as LngLat

      // drawRouteFromGeoJSON(pathGeoJson)

      if (!routeData.routes?.[0]?.geometry) throw new Error('Route not found')

      routeLine = L.polyline(parseRouteCoordinates(routeData), {
        color: '#1976D2',
        weight: 4,
        opacity: 0.7,
      }).addTo(map)

      map.fitBounds(L.latLngBounds([startPos.value, endPos.value]).pad(0.2)) // Added non-null assertions

      // Define an interface for the base structure for clarity
      interface TempRouteBase {
        id: string
        user_id: string
        name: string
        description: string
        start_point: Point // Use Point type
        end_point: Point // Use Point type
        created_at: Date
      }

      // Base object for the temporary route, explicitly typed
      const tempRouteBase: TempRouteBase = {
        id: String(store.auth.current?.id),
        user_id: String(store.auth.current?.user_id),
        name: 'New Route', // Placeholder name
        description: '',
        // Ensure startPos/endPos are not null before accessing lng/lat (checked earlier in function)
        start_point: { type: 'Point', coordinates: [startPos.value.lng, startPos.value.lat] },
        end_point: { type: 'Point', coordinates: [endPos.value.lng, endPos.value.lat] },
        created_at: new Date(),
      }

      // Extract path geometry
      const pathGeometry = routeData?.routes?.[0]?.geometry as LineString | undefined

      // Create the final temporary route object, conditionally adding path
      const tempRoute: RouteI = {
        ...tempRouteBase,
        ...(pathGeometry && { path: pathGeometry }), // Add path only if it exists
      }

      // Check if this exact route (by start/end points) already exists in savedRoutes
      const existingSavedRoute = savedRoutes.value.find(
        (r) =>
          !r.id &&
          r.start_point.coordinates[0] === tempRoute.start_point.coordinates[0] &&
          r.start_point.coordinates[1] === tempRoute.start_point.coordinates[1] &&
          r.end_point.coordinates[0] === tempRoute.end_point.coordinates[0] &&
          r.end_point.coordinates[1] === tempRoute.end_point.coordinates[1],
      )

      if (existingSavedRoute) {
        currentRoute.value = existingSavedRoute // Use the existing saved route
        Notify.create({ type: 'info', message: 'This route is already saved.' })
      } else {
        currentRoute.value = tempRoute // Set the temporary route as current
      }

      if (saveStateToLocalStorage) saveStateToLocalStorage()
    } catch (error) {
      console.error('Error calculating or displaying route:', error)
      Notify.create({
        type: 'negative',
        message: `Error calculating route: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      // Clear temporary route if calculation fails
      currentRoute.value = null
      if (saveStateToLocalStorage) saveStateToLocalStorage()
    } finally {
      Loading.hide()
    }
  }

  const resetRouteState = (mapInstance?: L.Map | null) => {
    const currentMap = mapInstance ?? map // Use provided map or the composable's map
    if (routeLine && currentMap) {
      currentMap.removeLayer(routeLine)
      routeLine = null
    }
    startPos.value = null
    endPos.value = null
    currentRoute.value = null
    // Don't reset savedRoutes here
    if (saveStateToLocalStorage) saveStateToLocalStorage()
  }

  const loadRoutes = async () => {
    const userId = superComposable().store.auth.current?.id
    if (!userId) {
      console.warn('Cannot load routes: User not authenticated.')
      savedRoutes.value = []
      return
    }

    Loading.show({ message: 'Loading saved routes...' })
    try {
      const { data, error } = await supabase.rpc('get_routes', { user_id: userId })

      if (error) throw error

      if (data) {
        savedRoutes.value = data
          .map((routeData: RouteI & { start_point: string; end_point: string; path: string }) => {
            const startPoint = routeData.start_point || null
            const endPoint = routeData.end_point || null
            const path = routeData.path || null

            return {
              id: routeData.id,
              user_id: routeData.user_id, // user_id sí viene en el select
              name: routeData.name ?? 'Unnamed Route',
              description: routeData.description ?? '',
              start_point: startPoint ? JSON.parse(startPoint) : null,
              end_point: endPoint ? JSON.parse(endPoint) : null,
              path: path ? JSON.parse(path) : null,
              created_at: new Date(routeData.created_at),
            }
          })
          .filter((route: RouteI) => route !== null)
      } else {
        savedRoutes.value = []
      }
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: `Failed to load routes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      savedRoutes.value = []
    } finally {
      Loading.hide()
    }
  }

  const saveRoute = async (name: string, description?: string) => {
    await initializeMapComposable()
    if (!map || !setPoint || !saveStateToLocalStorage) return

    const userId = store.auth.current?.id
    if (!userId || !currentRoute.value || !startPos.value || !endPos.value) {
      Notify.create({ type: 'negative', message: 'No route selected or invalid data.' })
      return
    }

    // Use computed property to check if it's already saved
    if (isCurrentRouteInDB.value) {
      Notify.create({ type: 'info', message: 'This route is already saved.' })
      return
    }

    const tempId = currentRoute.value.id // Store temp ID

    Loading.show()
    try {
      const pathLatLngs = routeLine?.getLatLngs() as L.LatLng[] | undefined
      const pathWKT =
        pathLatLngs && pathLatLngs.length > 1
          ? `LINESTRING(${pathLatLngs.map((p: L.LatLng) => `${p.lng} ${p.lat}`).join(', ')})`
          : null

      const { data, error } = await supabase
        .from('routes')
        .insert({
          start_point: `POINT(${startPos.value.lng} ${startPos.value.lat})`,
          end_point: `POINT(${endPos.value.lng} ${endPos.value.lat})`,
          description: description,
          user_id: userId,
          path: pathWKT,
          name,
        })
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        const startP =
          typeof data.start_point === 'string'
            ? parseGeoJsonPoint(data.start_point)
            : data.start_point
        const endP =
          typeof data.end_point === 'string' ? parseGeoJsonPoint(data.end_point) : data.end_point
        const pathP = typeof data.path === 'string' ? parseGeoJsonLineString(data.path) : data.path

        // Validar que el parseo fue exitoso (si eran strings)
        if (!startP || !endP) {
          console.error('Failed to parse returned geography data:', data)
          throw new Error('Failed to parse saved route points after insert.')
        }

        const newRoute: RouteI = {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          description: data.description ?? '',
          start_point: startP,
          end_point: endP,
          ...(pathP && { path: pathP }),
          created_at: new Date(data.created_at),
        }

        const tempIndex = savedRoutes.value.findIndex((r) => r.id === tempId)
        if (tempIndex > -1) {
          savedRoutes.value.splice(tempIndex, 1, newRoute)
        } else {
          const exists = savedRoutes.value.some((r) => r.id === newRoute.id)
          if (!exists) {
            savedRoutes.value.push(newRoute)
          }
        }
        currentRoute.value = newRoute // Update current route to the saved one
        saveStateToLocalStorage() // Save map state
        Notify.create({ type: 'positive', message: 'Route saved successfully!' })
      }
    } catch (error) {
      console.error('Error saving route:', error)
      Notify.create({
        type: 'negative',
        message: `Error saving route: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      Loading.hide()
    }
  }

  const deleteCurrentRoute = async () => {
    await initializeMapComposable()
    if (!map || !setPoint || !saveStateToLocalStorage || !deletePoint) return

    if (!currentRoute.value || !isCurrentRouteInDB.value) {
      Notify.create({ type: 'warning', message: 'Cannot delete an unsaved or temporary route.' })
      return
    }

    const routeIdToDelete = currentRoute.value.id

    Loading.show({ message: 'Deleting route...' })
    try {
      const { error } = await supabase.from('routes').delete().eq('id', routeIdToDelete)
      if (error) throw error

      savedRoutes.value = savedRoutes.value.filter((route) => route.id !== routeIdToDelete)

      // Clear markers and route line from map
      if (deletePoint) {
        deletePoint('start')
        deletePoint('end') // This should also trigger resetRouteState via map.ts logic
      } else {
        // Fallback if deletePoint wasn't initialized
        resetRouteState(map)
        if (window.vueActions?.deletePoint) {
          // Try accessing global again
          window.vueActions.deletePoint('start')
          window.vueActions.deletePoint('end')
        }
      }
      // Explicitly clear currentRoute just in case
      currentRoute.value = null
      if (saveStateToLocalStorage) saveStateToLocalStorage() // Save cleared state

      Notify.create({ type: 'positive', message: 'Route deleted successfully.' })
    } catch (error) {
      console.error('Error deleting route:', error)
      Notify.create({
        type: 'negative',
        message: `Error deleting route: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      Loading.hide()
    }
  }

  const loadRoute = async (route: RouteI) => {
    await initializeMapComposable()
    if (!map || !setPoint || !saveStateToLocalStorage || !deletePoint) return

    currentRoute.value = route // Set the selected route as current

    // Clear existing markers first using deletePoint if available
    if (deletePoint) {
      deletePoint('start')
      deletePoint('end')
    } else {
      // Fallback: Manually remove markers if deletePoint is not available
      if (window.vueActions?.deletePoint) {
        // Try accessing global again
        window.vueActions.deletePoint('start')
        window.vueActions.deletePoint('end')
      } else {
        // Direct removal (less ideal as it bypasses map.ts logic)
        if (startMarker) map.removeLayer(startMarker)
        startMarker = null
        startPos.value = null
        if (endMarker) map.removeLayer(endMarker)
        endMarker = null
        endPos.value = null
      }
    }

    // Set new start and end points using setPoint
    if (route.start_point?.coordinates && route.end_point?.coordinates) {
      await new Promise((resolve) => setTimeout(resolve, 50))

      const startCoords = route.start_point.coordinates
      const endCoords = route.end_point.coordinates

      // Use setPoint which handles marker creation and route update
      // Add non-null assertions (!) as we've checked coordinates exist
      await setPoint('start', startCoords[1]!, startCoords[0]!) // Lat, Lng
      await setPoint('end', endCoords[1]!, endCoords[0]!) // Lat, Lng

      // updateRoute should be called within setPoint, but call again to be sure
      await updateRoute()

      // Fit map bounds
      // Add non-null assertions (!) here too for bounds calculation
      const bounds = L.latLngBounds([
        [startCoords[1]!, startCoords[0]!],
        [endCoords[1]!, endCoords[0]!],
      ])
      map.fitBounds(bounds.pad(0.15))

      if (saveStateToLocalStorage) saveStateToLocalStorage()
    } else {
      Notify.create({ type: 'negative', message: 'Selected route has invalid coordinates.' })
      resetRouteState(map) // Reset if coordinates are bad
    }
  }

  // Initial load function
  const initializeRoutes = async () => {
    await loadRoutes()
    await initializeMapComposable()
    if (startPos.value && endPos.value) {
      // Forzar actualización aunque currentRoute exista
      await updateRoute()
    }
  }

  return {
    startPos,
    endPos,
    currentRoute,
    savedRoutes,
    isCurrentRouteInDB, // Expose computed property
    updateRoute, // Use the new update function
    resetRouteState,
    saveRoute,
    loadRoute,
    deleteCurrentRoute, // Use the new delete function
    initializeRoutes, // Expose initialization function
    drawRouteFromGeoJSON, // Export the drawing function
    // loadSavedRoutes is implicitly handled by savedRoutes ref now
  }
}
