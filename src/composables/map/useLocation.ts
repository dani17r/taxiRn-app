import { Geolocation } from '@capacitor/geolocation'
import type { LocationI } from '@interfaces/location'
import supabase from '@services/supabase.services'
import routeMap from '@composables/map/useRoute'
import superComposable from '@composables/super'
import stateMap from '@composables/map/state'
import { computed, ref } from 'vue'
import { Loading, Notify } from 'quasar'

export default () => {
  const { location, route, map, L } = stateMap()
  const { store } = superComposable()
  const { getRouteLine, clearRouteLine } = routeMap()

  const disbleButtonLocation = ref(false)

  const getPermission = async (): Promise<boolean> => {
    disbleButtonLocation.value = true
    try {
      const { location } = await Geolocation.checkPermissions()
      if (location === 'granted') return true
      const { location: newPermission } = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation'],
      })
      if (newPermission === 'denied') {
        Notify.create({
          type: 'negative',
          message: 'Location permission denied!',
          position: 'top-right',
        })
        return false
      }
      if (newPermission === 'prompt') {
        Notify.create({
          type: 'info',
          message: 'Location permission is required!',
          position: 'top-right',
        })
        return false
      }
      if (newPermission !== 'granted') {
        Notify.create({
          type: 'negative',
          message: 'You must grant location permissions!',
          position: 'top-right',
        })
        return false
      }

      setTimeout(() => (disbleButtonLocation.value = false), 1000)
      return true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      Notify.create({ type: 'negative', message: error.message, position: 'top-right' })
      setTimeout(() => (disbleButtonLocation.value = false), 1000)
      return false
    }
  }

  const getCurrentLocation = async () => {
    if (!map.value) {
      Notify.create({ type: 'warning', message: 'El mapa no está listo', position: 'top-right' })
      return false
    }

    try {
      Loading.show()

      const isPermission = await getPermission()
      if (!isPermission) {
        Notify.create({
          type: 'warning',
          message: 'Permiso de ubicación denegado',
          position: 'top-right',
        })
        return false
      }

      const position = await Geolocation.getCurrentPosition()
      const pos = L.latLng(position.coords.latitude, position.coords.longitude)

      // Mostrar progreso adicional
      Loading.show()

      await getRouteLine()

      window.map.createPoint('start', pos.lat, pos.lng)
      map.value.setView(pos, 16)

      location.data.forEach((loc) => {
        if (loc.coordinates.coordinates[0] == pos.lat) {
          location.current = loc
        }
      })

      Notify.create({
        type: 'positive',
        message: 'Ubicación obtenida correctamente',
        position: 'top-right',
      })
      return true

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error getting current location:', error)
      Notify.create({
        type: 'negative',
        message: 'Error obteniendo ubicación',
        caption: error.message,
        position: 'top-right',
      })
      return false
    } finally {
      setTimeout(() => Loading.hide(), 500)
    }
  }

  const getLocations = async () => {
    const p_user_id = String(store.auth.current?.id)
    const { data, error } = await supabase.rpc('get_locations', { p_user_id })

    if (error) {
      console.error('Error loading locations:', error)
      Notify.create({
        type: 'negative',
        message: `Failed to load locations: ${error.message}`,
        position: 'top-right',
      })
      location.data = []
      return
    }

    if (data) {
      location.data = data
        .map((loc: LocationI & { coordinates: string }) => {
          try {
            const parsedGeoJson = JSON.parse(loc.coordinates)
            const coordinates = { type: 'Point', coordinates: parsedGeoJson.coordinates }
            const newLocation = {
              description: loc.description,
              created_at: loc.created_at,
              user_id: loc.user_id,
              name: loc.name,
              coordinates,
              id: loc.id,
            } as LocationI

            if (newLocation.coordinates.coordinates[0] == route.startPos?.lat) {
              location.current = newLocation
            }
            return newLocation
          } catch (error) {
            console.error(error)
            return null
          }
        })
        .filter((loc: LocationI) => loc != null)
    } else {
      location.data = []
    }
  }

  const getLocation = (locationSelect: LocationI) => {
    if (!map.value) return

    if (locationSelect.coordinates?.coordinates) {
      const coords = locationSelect.coordinates.coordinates
      const pos = L.latLng(Number(coords[0]), Number(coords[1]))

      window.map.deletePoint('end')
      window.map.deletePoint('start')
      window.map.createPoint('start', Number(coords[0]), Number(coords[1]))
      map.value.setView(pos, 16)
    }

    location.current = locationSelect
  }

  const saveLocation = async (name: string) => {
    if (isLocationExist.value) {
      Notify.create({
        type: 'info',
        message: 'This location is already saved.',
        position: 'top-right',
      })
      return
    }

    const coords = route.startPos
    const user_id = String(store.auth.current?.id)

    const { data, error } = await supabase
      .from('locations')
      .insert({
        coordinates: `POINT(${coords?.lat} ${coords?.lng})`,
        user_id,
        name,
      })
      .select('*')
      .single()

    if (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: `Error saving location: ${error.message}`,
        position: 'top-right',
      })
      return
    }

    if (data) {
      const newLocation: LocationI = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        description: data.description ?? '',
        coordinates: { type: 'Point', coordinates: [Number(coords?.lat), Number(coords?.lng)] },
        created_at: data.created_at,
      }

      await getLocations()

      location.current = newLocation

      Notify.create({
        message: 'Ubicacion guardada con exito',
        icon: 'check',
        type: 'positive',
        position: 'top-right',
      })
    }
  }

  const deleteCurrentLocation = async () => {
    if (!location.current) return

    const locationIdToDelete = location.current.id

    const { error } = await supabase.from('locations').delete().eq('id', locationIdToDelete)

    if (error) {
      console.error('Error deleting location:', error)
      Notify.create({
        type: 'negative',
        message: `Error deleting location: ${error.message}`,
        position: 'top-right',
      })
      return
    }

    location.data = location.data.filter((loc) => loc.id !== locationIdToDelete)
    location.current = null

    window.map.deletePoint('start')
    clearRouteLine()

    Notify.create({
      message: 'Ubicacion Eliminada con existo',
      icon: 'check',
      type: 'positive',
      position: 'top-right',
    })
  }

  const isLocationExist = computed(() => {
    if (!location.current) return false

    const coorsLocation = location.current.coordinates.coordinates
    return coorsLocation[0] == Number(route.startPos?.lat)
  })

  return {
    deleteCurrentLocation,
    getCurrentLocation,
    getPermission,
    saveLocation,
    getLocations,
    getLocation,
    disbleButtonLocation,
    isLocationExist,
    location,
  }
}
