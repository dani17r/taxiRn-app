// src/composables/location.ts

import { Geolocation } from '@capacitor/geolocation'
import supabase from '@services/supabase.services'
import type { LocationI } from '@interfaces/location'
import { Loading, Notify } from 'quasar'
import { ref, computed } from 'vue' // Import computed
import L from 'leaflet'
import superComposable from '@composables/super'
import routeComposable from '@composables/route'

// Define the expected structure from the Supabase RPC call
interface DbLocation {
  coordinates: string // Expecting a JSON string
  id: string
  user_id: string
  name: string
  description?: string | null // Optional description
  created_at: string | number | Date
}

const locations = ref<LocationI[]>([])
const currentLocation = ref<LocationI | null>(null)

const { store } = superComposable()
const { resetRouteState } = routeComposable()

// Refs for map interaction functions, initialized dynamically
let setPoint: ((type: 'start' | 'end', lat: number, lng: number) => Promise<void>) | null = null
let map: L.Map | null = null
let saveStateToLocalStorage: (() => void) | null = null

// --- Initialization ---
const initializeMapComposable = async () => {
  // Ensure map composable is initialized only once if needed concurrently
  if (!setPoint || !map || !saveStateToLocalStorage) {
    try {
      // Dynamically import map composable to avoid circular dependency issues
      const mapModule = await import('@composables/map')
      const mapComposable = mapModule.default() // Assuming default export returns the composable object
      setPoint = mapComposable.setPoint
      map = mapComposable.map
      saveStateToLocalStorage = mapComposable.saveStateToLocalStorage
    } catch (error) {
      console.error('Failed to initialize map composable:', error)
    }
  }
}

// --- Permissions ---
const checkPermissions = async (): Promise<boolean> => {
  try {
    const { location } = await Geolocation.checkPermissions()
    if (location === 'granted') return true
    const { location: newPermission } = await Geolocation.requestPermissions()
    if (newPermission !== 'granted') {
      Notify.create({ type: 'negative', message: 'You must grant location permissions!' })
      return false
    }
    return true
  } catch (error) {
    console.error('Error checking permissions:', error)
    Notify.create({ type: 'negative', message: 'Error checking location permissions.' })
    return false
  }
}

// --- Location State Logic ---
// Computed property: true if currentLocation represents a location saved in the database
const isCurrentLocationInDB = computed(() => {
  if (
    !currentLocation.value ||
    currentLocation.value.id?.startsWith('temp-') // Temporary IDs mean it's not saved
  ) {
    return false
  }
  // Check if a location with the same non-temporary ID exists in the list
  return locations.value.some(
    (l) => l.id === currentLocation.value?.id && !l.id?.startsWith('temp-'),
  )
})

// --- Core Functions ---

const getCurrentLocation = async (): Promise<void> => {
  await initializeMapComposable()
  if (!map || !setPoint || !saveStateToLocalStorage) {
    console.error('Map interaction functions not initialized.')
    Notify.create({ type: 'negative', message: 'Map not ready.' })
    return
  }
  if (!(await checkPermissions())) return

  Loading.show()
  try {
    const position = await Geolocation.getCurrentPosition()
    const pos = L.latLng(position.coords.latitude, position.coords.longitude)
    // const currentCoords = [pos.lng, pos.lat]

    // Reset route and clear map layers before setting new point
    resetRouteState(map)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map!.removeLayer(layer)
      }
    })

    await setPoint('start', pos.lat, pos.lng)
    map.setView(pos, 16)
    saveStateToLocalStorage()

    Notify.create({ type: 'positive', message: 'Location obtained successfully!' })
  } catch (error) {
    console.error('Error getting current location:', error)
    Notify.create({ type: 'negative', message: 'Error getting current location.' })
  } finally {
    Loading.hide()
  }
}

const loadLocations = async () => {
  if (!store.auth.current?.id) {
    console.warn('Cannot load locations: User not authenticated.')
    locations.value = []
    return
  }
  const { data, error } = await supabase.rpc('get_locations', { user_id: store.auth.current.id })

  if (error) {
    console.error('Error loading locations:', error)
    Notify.create({ type: 'negative', message: `Failed to load locations: ${error.message}` })
    locations.value = []
    return
  }

  if (data) {
    locations.value = data
      .map((loc: DbLocation) => {
        // Use the defined interface
        try {
          if (typeof loc.coordinates !== 'string') {
            console.error('Invalid coordinates format (not a string):', loc.coordinates)
            return null
          }
          const parsedGeoJson = JSON.parse(loc.coordinates)
          if (
            parsedGeoJson?.type === 'Point' &&
            Array.isArray(parsedGeoJson.coordinates) &&
            parsedGeoJson.coordinates.length >= 2 &&
            typeof parsedGeoJson.coordinates[0] === 'number' &&
            typeof parsedGeoJson.coordinates[1] === 'number'
          ) {
            return {
              id: loc.id,
              user_id: loc.user_id,
              name: loc.name,
              description: loc.description ?? '',
              coordinates: { type: 'Point', coordinates: parsedGeoJson.coordinates },
              created_at: loc.created_at ? new Date(loc.created_at) : new Date(),
            } as LocationI
          } else {
            console.error('Invalid GeoJSON structure after parsing:', parsedGeoJson)
            return null
          }
        } catch (parseError) {
          // Catch parsing errors specifically
          console.error('Error parsing coordinates string:', loc.coordinates, parseError)
          return null
        }
      })
      .filter((loc: LocationI) => loc !== null)
  } else {
    locations.value = []
  }
}

const saveLocation = async (name: string) => {
  await initializeMapComposable()
  if (!map || !setPoint || !saveStateToLocalStorage) return

  if (
    !store.auth.current?.id ||
    !name ||
    !currentLocation.value?.coordinates?.coordinates ||
    currentLocation.value.coordinates.coordinates.length < 2
  ) {
    Notify.create({ type: 'negative', message: 'No location selected or invalid data.' })
    return
  }

  // Use the computed property which already checks for temp ID
  if (isCurrentLocationInDB.value) {
    Notify.create({ type: 'info', message: 'This location is already saved.' })
    return
  }

  const coords = currentLocation.value.coordinates.coordinates
  const tempId = currentLocation.value.id // Store temp ID if exists

  const { data, error } = await supabase
    .from('locations')
    .insert({
      user_id: store.auth.current.id,
      name,
      coordinates: `POINT(${coords[0]} ${coords[1]})`,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error saving location:', error)
    Notify.create({ type: 'negative', message: `Error saving location: ${error.message}` })
    return
  }

  if (data) {
    const newLocation: LocationI = {
      id: data.id, // Use the real ID from DB
      user_id: data.user_id,
      name: data.name,
      description: data.description ?? '',
      coordinates: { type: 'Point', coordinates: coords }, // Use original coords
      created_at: new Date(data.created_at),
    }
    // Replace temporary location in the array if it exists, otherwise add
    const tempIndex = locations.value.findIndex((l) => l.id === tempId)
    if (tempIndex > -1) {
      locations.value.splice(tempIndex, 1, newLocation)
    } else {
      // This case might happen if loadLocations ran between selection and save
      // Check again by coords before pushing to avoid duplicates
      const exists = locations.value.some((l) => l.id === newLocation.id)
      if (!exists) {
        locations.value.push(newLocation)
      }
    }
    currentLocation.value = newLocation // Update current location to the saved one
    saveStateToLocalStorage() // Save map state
    Notify.create({ type: 'positive', message: 'Location saved successfully!' })
  }
}

const deleteCurrentLocation = async () => {
  await initializeMapComposable()
  if (!map || !setPoint || !saveStateToLocalStorage) return

  // Use the computed property to check if it's actually saved
  if (!currentLocation.value || !isCurrentLocationInDB.value) {
    Notify.create({ type: 'warning', message: 'Cannot delete an unsaved location.' })
    return
  }

  const locationIdToDelete = currentLocation.value.id

  const { error } = await supabase.from('locations').delete().eq('id', locationIdToDelete)

  if (error) {
    console.error('Error deleting location:', error)
    Notify.create({ type: 'negative', message: `Error deleting location: ${error.message}` })
    return
  }

  locations.value = locations.value.filter((loc) => loc.id !== locationIdToDelete)
  currentLocation.value = null // Clear current location ref

  // Use the globally exposed deletePoint action from map.ts
  if (window.vueActions && typeof window.vueActions.deletePoint === 'function') {
    window.vueActions.deletePoint('start') // This should clear the start marker/pos and save state
  } else {
    console.warn('vueActions.deletePoint not found, map state might be inconsistent.')
    if (saveStateToLocalStorage) saveStateToLocalStorage() // Save state with currentLocation=null
  }

  Notify.create({ type: 'positive', message: 'Location deleted successfully.' })
}

const loadLocation = async (location: LocationI) => {
  await initializeMapComposable()
  if (!map || !setPoint || !saveStateToLocalStorage) return

  currentLocation.value = location // Set the selected location as current

  if (location.coordinates?.coordinates) {
    const coords = location.coordinates.coordinates
    resetRouteState(map)
    // Use vueActions to clear end point if it exists
    if (window.vueActions && typeof window.vueActions.deletePoint === 'function') {
      window.vueActions.deletePoint('end')
    } else {
      console.warn('vueActions.deletePoint not found, end marker might persist.')
    }

    await setPoint(
      'start',
      coords[1] ?? 0, // Lat
      coords[0] ?? 0, // Lng
    )
    map.setView(L.latLng(coords[1] ?? 0, coords[0] ?? 0), 16)
    saveStateToLocalStorage()
  }
}

// Initial load function
const initializeLocations = async () => {
  await loadLocations()
}

export default {
  initializeLocations,
  checkPermissions,
  getCurrentLocation,
  saveLocation,
  deleteCurrentLocation,
  loadLocation,
  locations,
  currentLocation,
  isCurrentLocationInDB, // Expose the computed property
}
