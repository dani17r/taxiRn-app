import { baseLayers } from '@services/map.services'
import locationComposable from '@composables/location'
import superComposable from '@composables/super'
import routeComposable from '@composables/route'
import * as template from '@utils/mapTemplates'
import { computed } from 'vue'
import L from 'leaflet'

let map: L.Map
let startMarker: L.Marker | null = null
let endMarker: L.Marker | null = null

const STORAGE_KEY = 'mapState'

const startIcon = template.createIcon('green')
const endIcon = template.createIcon('red')

export default () => {
  const routeInstance = routeComposable() // Get the instance
  const { startPos, endPos, currentRoute, updateRoute } = routeInstance // Destructure others
  const { currentLocation, locations } = locationComposable
  const { store } = superComposable()

  const saveStateToLocalStorage = () => {
    const state = {
      startPos: startPos.value
        ? {
            lat: startPos.value.lat,
            lng: startPos.value.lng,
          }
        : null,
      endPos: endPos.value
        ? {
            lat: endPos.value.lat,
            lng: endPos.value.lng,
          }
        : null,
      currentLocation: currentLocation.value,
      // Store the whole currentRoute, which includes the path if available
      currentRoute: currentRoute.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  const loadStateFromLocalStorage = () => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      const state = JSON.parse(savedState)

      startPos.value = state.startPos ? L.latLng(state.startPos.lat, state.startPos.lng) : null
      endPos.value = state.endPos ? L.latLng(state.endPos.lat, state.endPos.lng) : null
      currentLocation.value = state.currentLocation
      currentRoute.value = state.currentRoute

      // Adjust map view
      if (map && (startPos.value || endPos.value)) {
        if (startPos.value && endPos.value) {
          const bounds = L.latLngBounds([startPos.value, endPos.value]).pad(0.2)
          map.fitBounds(bounds)
        } else if (startPos.value) {
          map.setView(startPos.value, 16)
        }
      }
    }
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (startPos.value && endPos.value) return

    const popup = L.popup({ className: 'custom-popup' })
      .setLatLng(e.latlng)
      .setContent(template.createPopupContent(startPos.value, endPos.value, e.latlng))

    popup.openOn(map)
  }

  const switchLayer = (newLayer: L.TileLayer): void => {
    if (map) {
      map.eachLayer((layer) => map.removeLayer(layer))
      newLayer.addTo(map)
    }
  }

  const setPoint = async (type: 'start' | 'end', lat: number, lng: number): Promise<void> => {
    const pos = L.latLng(lat, lng)
    const marker = type === 'start' ? startMarker : endMarker

    if (marker) map.removeLayer(marker)

    const newMarker = L.marker(pos, {
      icon: type === 'start' ? startIcon : endIcon,
    }).bindPopup(template.createMarkerPopup(type))

    if (type === 'start') {
      startPos.value = pos
      startMarker = newMarker
    } else {
      endPos.value = pos
      endMarker = newMarker
    }

    newMarker.addTo(map)
    await updateRoute()
    saveStateToLocalStorage()

    const currentCoords = [pos.lng, pos.lat]
    const existing = locations.value.find(
      (l) =>
        !l.id?.startsWith('temp-') && // Important: Check only saved locations
        l.coordinates?.coordinates &&
        l.coordinates.coordinates.length >= 2 &&
        l.coordinates.coordinates[0] === currentCoords[0] &&
        l.coordinates.coordinates[1] === currentCoords[1],
    )

    if (existing) {
      currentLocation.value = existing // Use the existing DB record
    } else {
      // Create a temporary representation for this new location
      currentLocation.value = {
        id: String(store.auth.current?.id),
        user_id: String(store.auth.current?.user_id),
        name: 'Current Location', // Placeholder
        description: '',
        coordinates: { type: 'Point', coordinates: currentCoords },
        created_at: new Date(),
      }
    }

    map.closePopup()
  }

  const initMap = (name = 'map') => {
    map = L.map(name)
    map.setView([10.196805, -71.30903], 14)
    map.addLayer(baseLayers.GoogleMaps)
    switchLayer(baseLayers.GoogleMaps)

    map.on('click', handleMapClick)

    loadStateFromLocalStorage()

    if (startPos.value) {
      void setPoint('start', startPos.value.lat, startPos.value.lng)
      if (currentLocation.value) {
        startMarker?.bindPopup(template.createMarkerPopup('start'))
      }
    }

    if (endPos.value) {
      void setPoint('end', endPos.value.lat, endPos.value.lng)
    }

    window.vueActions = {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setPoint,
      deletePoint: (type: 'start' | 'end') => {
        if (type === 'start' && startMarker) {
          map.removeLayer(startMarker)
          startMarker = null
          startPos.value = null
          currentLocation.value = null // Clear current location if start point is deleted
        } else if (type === 'end' && endMarker) {
          map.removeLayer(endMarker)
          endMarker = null
          endPos.value = null
        }
        routeInstance.resetRouteState() // Call from instance
        void updateRoute() // No argument needed
        routeInstance.currentRoute.value = null // 👈 Añadir esta línea
        saveStateToLocalStorage() // Save state after deletion
      },
    }
  }

  const resetMapState = () => {
    if (startMarker) {
      map.removeLayer(startMarker)
      startMarker = null
    }
    if (endMarker) {
      map.removeLayer(endMarker)
      endMarker = null
    }

    routeInstance.resetRouteState() // Call from instance

    startPos.value = null
    endPos.value = null
    currentLocation.value = null
    currentRoute.value = null

    localStorage.removeItem(STORAGE_KEY)

    map.setView([10.196805, -71.30903], 14)
    map.closePopup()
  }

  const hasMapElements = computed(() => {
    return !!startPos.value || !!endPos.value || !!currentRoute.value || !!currentLocation.value
  })

  const centerToSavedPosition = () => {
    if (map) {
      if (startPos.value && endPos.value) {
        const bounds = L.latLngBounds([startPos.value, endPos.value])
        map.fitBounds(bounds.pad(0.2))
      } else if (startPos.value) {
        map.setView(startPos.value, 16)
      } else {
        map.setView([10.196805, -71.30903], 14)
      }
    }
  }

  const reloadMapState = () => {
    loadStateFromLocalStorage()
    centerToSavedPosition()
    map.invalidateSize()
  }

  return {
    loadStateFromLocalStorage,
    saveStateToLocalStorage,
    centerToSavedPosition,
    reloadMapState,
    handleMapClick,
    resetMapState,
    switchLayer,
    setPoint,
    initMap,
    hasMapElements,
    map,
  }
}
