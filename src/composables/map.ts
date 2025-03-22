import { fetchRoute, baseLayers } from '@services/map.services'
import type { LocationI, RouteI } from '@interfaces/map'
import { Geolocation } from '@capacitor/geolocation'
import supabase from '@services/supabase.services'
import superComposable from '@composables/super'
import * as template from '@utils/mapTemplates'
import { Loading } from 'quasar'
import { ref, computed, watch } from 'vue'
import L from 'leaflet'

const startPos = ref<L.LatLng | null>(null)
const endPos = ref<L.LatLng | null>(null)

const locations = ref<LocationI[]>([])
const currentLocation = ref<LocationI | null>(null)
const rutasGuardadas = ref<RouteI[]>([])
const currentRoute = ref<RouteI | null>(null)
const thereIsNoLocalization = ref(false)
const thereIsNoRoute = ref(false)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any
let startMarker: L.Marker | null = null
let endMarker: L.Marker | null = null
let routeLine: L.Polyline | null = null

const startIcon = template.createIcon('green')
const endIcon = template.createIcon('red')

export default () => {
  const { store } = superComposable()

  // eslint-disable-next-line
  const parseRouteCoordinates = (data: any): [number, number][] => {
    return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
  }

  const checkPermissions = async (): Promise<boolean> => {
    try {
      const { location } = await Geolocation.checkPermissions()
      if (location === 'granted') return true

      const { location: newPermission } = await Geolocation.requestPermissions()
      if (newPermission !== 'granted') {
        alert('¡Debes otorgar permisos de ubicación!')
        return false
      }
      return true
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.eachLayer((layer: any) => map.removeLayer(layer))
      newLayer.addTo(map)
    }
  }

  // Gestión de puntos de ruta
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

    map.closePopup()
  }

  // Actualización de ruta
  const updateRoute = async (): Promise<void> => {
    if (routeLine) {
      map.removeLayer(routeLine)
      routeLine = null
      currentRoute.value = null // Limpiar ruta actual al modificar puntos
    }

    if (!startPos.value || !endPos.value) {
      thereIsNoRoute.value = true
      return
    }

    try {
      const response = await fetchRoute(startPos.value, endPos.value)
      if (!response.ok) throw new Error('Error en la respuesta de la API')

      const routeData = await response.json()
      if (!routeData.routes?.[0]?.geometry) throw new Error('Ruta no encontrada')

      routeLine = L.polyline(parseRouteCoordinates(routeData), {
        color: '#1976D2',
        weight: 4,
        opacity: 0.7,
      }).addTo(map)

      map.fitBounds(L.latLngBounds([startPos.value, endPos.value]).pad(0.2))
    } catch (error) {
      console.error('Error al calcular la ruta:', error)
    }
  }

  // Gestión de ubicación
  const obtenerUbicacion = async (): Promise<void> => {
    if (!(await checkPermissions())) return

    Loading.show()
    try {
      // Limpiar elementos existentes
      if (endMarker) {
        map.removeLayer(endMarker)
        endMarker = null
        endPos.value = null
      }
      if (routeLine) {
        map.removeLayer(routeLine)
        routeLine = null
      }

      // Obtener nueva posición
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
      const pos = L.latLng(position.coords.latitude, position.coords.longitude)

      // Actualizar currentLocation con las nuevas coordenadas
      const existing = locations.value.find((l) => {
        return l.coordinates.coordinates[0] == pos.lng && l.coordinates.coordinates[1] == pos.lat
      })
      currentLocation.value = existing || null

      // Establecer punto y vista
      await setPoint('start', pos.lat, pos.lng)
      map.setView(pos, 16, { animate: true })
    } catch (error) {
      console.log(`Error: ${(error as Error).message}`)
    } finally {
      Loading.hide()
    }
  }

  const loadingLocations = async () => {
    if (!store.auth.current) return

    const { data, error } = await supabase.rpc('get_locations', {
      user_id: store.auth.current.user_id,
    })

    if (!error && data) {
      locations.value = data.map(
        (loc: Omit<LocationI, 'coordinates'> & { coordinates: string }) => ({
          ...loc,
          coordinates: JSON.parse(loc.coordinates),
        }),
      )
    }
  }

  const saveLocation = async (title: string) => {
    if (!store.auth.current || !startPos.value) return
    if (!title) return

    // Insertar y obtener el registro creado
    const { data, error } = await supabase
      .from('locations')
      .insert({
        user_id: store.auth.current.user_id,
        title,
        coordinates: `POINT(${startPos.value.lng} ${startPos.value.lat})`,
      })
      .select('*')

    if (!error && data && data.length > 0) {
      await loadingLocations()
      currentLocation.value = data[0]
    }
  }

  const borrarcurrentLocation = async () => {
    if (!currentLocation.value) return

    return await supabase
      .from('locations')
      .delete()
      .eq('id', currentLocation.value.id)
      .then(async () => {
        // // Limpiar marcadores y ruta
        // if (startMarker) {
        //   map.removeLayer(startMarker)
        //   startMarker = null
        //   startPos.value = null
        // }
        // if (routeLine) {
        //   map.removeLayer(routeLine)
        //   routeLine = null
        // }
        // if (endMarker) {
        //   map.removeLayer(endMarker)
        //   endMarker = null
        //   endPos.value = null
        // }

        // Resetear estado
        await loadingLocations()
        currentLocation.value = null
        map.closePopup() // Cerrar cualquier popup abierto
      })
  }

  const loadingLocation = (location: LocationI) => {
    const [lng, lat] = location.coordinates.coordinates
    const latLng = L.latLng(lat, lng)

    if (startMarker) map.removeLayer(startMarker)

    startPos.value = latLng
    startMarker = L.marker(latLng, { icon: startIcon })
      .bindPopup(template.createMarkerPopup('start'))
      .addTo(map)

    currentLocation.value = location
    map.flyTo(latLng, 14)

    map.closePopup()
  }

  const guardarRuta = async (title: string) => {
    if (!store.auth.current || !startPos.value || !endPos.value) return

    if (!title) return

    const { data, error } = await supabase
      .from('routes')
      .insert({
        user_id: store.auth.current.user_id,
        route_name: title,
        start_point: `POINT(${startPos.value.lng} ${startPos.value.lat})`,
        end_point: `POINT(${endPos.value.lng} ${endPos.value.lat})`,

        path: `LINESTRING(${routeLine
          ?.getLatLngs()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => `${p.lng} ${p.lat}`)
          .join(', ')})`,
      })
      .select('*')

    if (!error && data?.[0]) {
      await cargarRutasGuardadas()

      const nuevaRuta = rutasGuardadas.value.find((r) => r.id === data[0].id)

      // Actualizar estados
      currentRoute.value = nuevaRuta || data[0]
      thereIsNoRoute.value = false

      // Limpiar selección actual
      startPos.value = null
      endPos.value = null
      map.fitBounds([[10.196805, -71.30903]], { animate: true })
    }
  }

  const cargarRutasGuardadas = async () => {
    if (!store.auth.current) return

    const { data, error } = await supabase.rpc('get_routes', {
      user_id: store.auth.current.user_id,
    })

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rutasGuardadas.value = data.map((r: any) => ({
        id: r.id,
        route_name: r.route_name,
        start_point: JSON.parse(r.start_point),
        end_point: JSON.parse(r.end_point),
        path: r.path ? JSON.parse(r.path) : null,
      }))

      if (currentRoute.value) {
        currentRoute.value =
          rutasGuardadas.value.find((r) => r.id === currentRoute.value?.id) || null
      }
    }
  }

  const cargarRuta = async (ruta: RouteI) => {
    currentRoute.value = null
    thereIsNoRoute.value = true

    // Limpiar marcadores y ruta existente
    if (startMarker) map.removeLayer(startMarker)
    if (endMarker) map.removeLayer(endMarker)
    if (routeLine) map.removeLayer(routeLine)

    // Cargar puntos inicial y final
    const startCoords = ruta.start_point.coordinates
    const endCoords = ruta.end_point.coordinates

    startPos.value = L.latLng(startCoords[1], startCoords[0])
    endPos.value = L.latLng(endCoords[1], endCoords[0])

    // Crear nuevos marcadores
    startMarker = L.marker(startPos.value, { icon: startIcon })
      .bindPopup(template.createMarkerPopup('start'))
      .addTo(map)

    endMarker = L.marker(endPos.value, { icon: endIcon })
      .bindPopup(template.createMarkerPopup('end'))
      .addTo(map)

    // Si hay geometría de ruta guardada
    if (ruta.path) {
      routeLine = L.polyline(
        ruta.path.coordinates.map((c) => [c[1], c[0]]),
        {
          color: '#1976D2',
          weight: 4,
          opacity: 0.7,
        },
      ).addTo(map)
    } else {
      await updateRoute()
    }

    // Ajustar vista del mapa
    const bounds = L.latLngBounds([startPos.value, endPos.value])
    map.fitBounds(bounds.pad(0.2))
    currentRoute.value = ruta

    map.closePopup()
  }

  const borrarRuta = async () => {
    if (!currentRoute.value) return

    const { error } = await supabase.from('routes').delete().eq('id', currentRoute.value.id)

    if (!error) {
      currentRoute.value = null
      await cargarRutasGuardadas()
      map.closePopup()
    } else {
      console.error('Error borrando ruta:', error)
    }
  }

  const initMap = () => {
    map = L.map('map')
    map.setView([10.196805, -71.30903], 14)
    map.addLayer(baseLayers.GoogleMaps)
    switchLayer(baseLayers.GoogleMaps)

    map.on('click', handleMapClick)
  }

  window.vueActions = {
    setPoint: (type: 'start' | 'end', lat: number, lng: number) => {
      setPoint(type, lat, lng).catch((error) => console.error('Error setting point:', error))
    },
    deletePoint: (type: 'start' | 'end'): void => {
      const marker = type === 'start' ? startMarker : endMarker
      if (marker) map.removeLayer(marker)

      if (type === 'start') {
        startPos.value = null
        if (currentRoute.value) currentRoute.value = null
      } else {
        endPos.value = null
        // Limpiar estado de ruta
        if (routeLine) {
          map.removeLayer(routeLine)
          routeLine = null
        }
        currentRoute.value = null
        thereIsNoRoute.value = true
      }

      if (startPos.value && !endPos.value) {
        currentLocation.value = null
        thereIsNoLocalization.value = locations.value.every(
          (l) =>
            l.coordinates.coordinates[0] !== startPos.value?.lng ||
            l.coordinates.coordinates[1] !== startPos.value?.lat,
        )
      }

      thereIsNoRoute.value = true
      currentLocation.value = null
      updateRoute().catch((error) => console.error('Error updating route:', error))
    },
  }

  const isRoute = computed(() => !!startPos.value && !!endPos.value)
  const isLocation = computed(() => {
    return !!startPos.value && !endPos.value && !routeLine
  })

  watch(
    () => currentLocation.value,
    () => {
      thereIsNoLocalization.value = !locations.value.some((val: LocationI) => {
        return val.id === currentLocation.value?.id
      })
    },
    { deep: true },
  )

  watch(
    () => currentRoute.value,
    (newRoute) => {
      thereIsNoRoute.value = !rutasGuardadas.value.some((r) => r.id === newRoute?.id)
    },
    { deep: true, immediate: true },
  )

  watch(
    rutasGuardadas,
    (newRoutes) => {
      if (currentRoute.value) {
        thereIsNoRoute.value = !newRoutes.some((r) => r.id === currentRoute.value?.id)
      }
    },
    { deep: true },
  )

  watch([() => startPos.value, () => endPos.value], () => {
    if (!startPos.value || !endPos.value) {
      currentRoute.value = null
      thereIsNoRoute.value = true
    }
  })

  watch([() => endPos.value, () => routeLine], () => {
    if (!endPos.value && !routeLine) {
      currentRoute.value = null
      thereIsNoRoute.value = true
      // Forzar recálculo de ubicación
      if (startPos.value) {
        const exists = locations.value.some(
          (l) =>
            l.coordinates.coordinates[0] === startPos.value?.lng &&
            l.coordinates.coordinates[1] === startPos.value?.lat,
        )
        thereIsNoLocalization.value = !exists
      }
    }
  })

  return {
    parseRouteCoordinates,
    borrarcurrentLocation,
    cargarRutasGuardadas,
    loadingLocations,
    obtenerUbicacion,
    checkPermissions,
    loadingLocation,
    handleMapClick,
    saveLocation,
    updateRoute,
    switchLayer,
    guardarRuta,
    borrarRuta,
    cargarRuta,
    setPoint,
    initMap,
    thereIsNoLocalization,
    currentLocation,
    thereIsNoRoute,
    rutasGuardadas,
    currentRoute,
    startMarker,
    isLocation,
    locations,
    routeLine,
    endMarker,
    startPos,
    map: map,
    isRoute,
    endPos,
  }
}
