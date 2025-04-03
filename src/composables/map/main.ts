import { baseLayers } from '@services/map.services'
import stateMap from '@composables/map/state'
import useRoute from '@composables/map/useRoute'

export default () => {
  const {
    updateMapLayer,
    handleMapClick,
    getMapPersisten,
    setMapPersisten,
    isLocalitacion,
    STORAGE_KEY,
    isStartPos,
    startIcon,
    isEndPos,
    template,
    isRoute,
    endIcon,
    marker,
    route,
    map,
    L,
  } = stateMap()
  const { getRouteLine, clearRouteLine } = useRoute()

  const createPoint = (type: 'start' | 'end', lat: number, lng: number, save = true) => {
    if (!map.value) return

    const pos = L.latLng(lat, lng)
    const typeMarker = type === 'start' ? marker.start : marker.end

    if (typeMarker) map.value.removeLayer(typeMarker as unknown as L.Layer)

    const newMarker = L.marker(pos, {
      icon: type === 'start' ? startIcon : endIcon,
    }).bindPopup(template.createMarkerPopup(map.value, type))

    if (type === 'start') {
      route.startPos = pos
      marker.start = newMarker
    } else {
      route.endPos = pos
      marker.end = newMarker
    }

    if (save) setMapPersisten()
    newMarker.addTo(map.value)
    map.value.closePopup()
  }

  const deletePoint = (type: 'start' | 'end', save = true) => {
    if (!map.value) return

    if (type === 'start' && marker.start) {
      map.value.removeLayer(marker.start as unknown as L.Layer)
      marker.start = null
      route.startPos = null
    } else if (type === 'end' && marker.end) {
      map.value.removeLayer(marker.end as unknown as L.Layer)
      marker.end = null
      route.endPos = null
    }

    if (save) setMapPersisten()
  }

  const loadPoints = () => {
    if (route.startPos) {
      createPoint('start', route.startPos.lat, route.startPos.lng, false)
    }

    if (route.endPos) {
      createPoint('end', route.endPos.lat, route.endPos.lng, false)
    }
  }

  const initMap = (name = 'map') => {
    map.value = L.map(name)
    map.value.setView([10.196805, -71.30903], 14)
    map.value.on('click', (e) => handleMapClick(e))
    map.value.addLayer(baseLayers.GoogleMaps)
    updateMapLayer(baseLayers.GoogleMaps)

    getMapPersisten()
    loadPoints()

    void getRouteLine()

    window.map = {
      createPoint: (type: 'start' | 'end', lat: number, lng: number) => {
        createPoint(type, lat, lng)
        void getRouteLine()
      },
      deletePoint: (type: 'start' | 'end') => {
        deletePoint(type)
        clearRouteLine()
      },
    }
  }

  const resetMap = () => {
    if (!map.value) return

    if (marker.start) {
      map.value.removeLayer(marker.start as unknown as L.Layer)
      marker.start = null
    }
    if (marker.end) {
      map.value.removeLayer(marker.end as unknown as L.Layer)
      marker.end = null
    }

    route.startPos = null
    route.endPos = null

    clearRouteLine()

    localStorage.removeItem(STORAGE_KEY)

    map.value.setView([10.196805, -71.30903], 14)
    map.value.closePopup()
  }

  return {
    createPoint,
    deletePoint,
    loadPoints,
    resetMap,
    initMap,
    isLocalitacion,
    isStartPos,
    isRoute,
    isEndPos,
    map,
  }
}
