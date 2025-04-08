import type { LocationI } from '@interfaces/location'
import type { RouteI } from '@interfaces/route'
import * as template from '@utils/mapTemplates'
import { computed, reactive, ref } from 'vue'
import L from 'leaflet'

const map = ref<L.Map>()
const marker = reactive({
  start: <L.Marker | null>null,
  end: <L.Marker | null>null,
})

const STORAGE_KEY = 'mapState'
const startIcon = template.createIcon('green')
const endIcon = template.createIcon('red')

/**Rutas */
const route = reactive({
  startPos: <L.LatLng | null>null,
  endPos: <L.LatLng | null>null,
  line: <L.Polyline | null>null,
  data: <RouteI[]>[],
  current: <RouteI | null>null,
})

/**Ubicacion */
const location = reactive({
  data: <LocationI[]>[],
  current: <LocationI | null>null,
})

export default () => {
  const updateMapLayer = (newLayer: L.TileLayer): void => {
    if (!map.value) return
    map.value.eachLayer((layer) => map.value?.removeLayer(layer))
    newLayer.addTo(map.value)
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!map.value) return
    if (route.startPos && route.endPos) return

    const popupTemplate = template.createPopupContent(route.startPos, route.endPos, e.latlng)
    const popup = L.popup({ className: 'custom-popup' })
      .setLatLng(e.latlng)
      .setContent(popupTemplate)

    popup.openOn(map.value)
  }

  const setMapPersisten = () => {
    const state = {
      startPos: route.startPos
        ? {
            lat: route.startPos.lat,
            lng: route.startPos.lng,
          }
        : null,
      endPos: route.endPos
        ? {
            lat: route.endPos.lat,
            lng: route.endPos.lng,
          }
        : null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  const getMapPersisten = () => {
    if (!map.value) return

    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      const state = JSON.parse(savedState)

      route.startPos = state.startPos ? L.latLng(state.startPos.lat, state.startPos.lng) : null
      route.endPos = state.endPos ? L.latLng(state.endPos.lat, state.endPos.lng) : null

      if (route.startPos && route.endPos) {
        const bounds = L.latLngBounds([route.startPos, route.endPos]).pad(0.2)
        map.value.fitBounds(bounds)
      } else if (route.startPos) {
        map.value.setView(route.startPos, 16)
      } else if (route.endPos) {
        map.value.setView(route.endPos, 16)
      }
    }
  }

  const isStartPos = computed(() => route.startPos != null)
  const isEndPos = computed(() => route.endPos != null)
  const isRoute = computed(() => isStartPos.value && isEndPos.value)
  const isLocation = computed(() => isStartPos.value && !isEndPos.value)
  const isStateLocation = computed(() => location.current != null)
  const isStateRoute = computed(() => route.current != null)

  return {
    STORAGE_KEY,
    setMapPersisten,
    getMapPersisten,
    handleMapClick,
    updateMapLayer,
    isStateLocation,
    isStateRoute,
    isLocation,
    isStartPos,
    startIcon,
    location,
    isEndPos,
    template,
    isRoute,
    endIcon,
    marker,
    route,
    map,
    L,
  }
}
