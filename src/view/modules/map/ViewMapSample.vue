<template>
  <div id="map-container" class="w-full h-full">
    <div id="view-map" class="w-full h-full"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@services/supabase.services';
import { useQuasar } from 'quasar';
import { baseLayers } from '@services/map.services';
import useMapStateComposable from '@composables/map/state';

const $q = useQuasar();
const {  startIcon, endIcon } = useMapStateComposable()

// Props
const props = defineProps({
  routeId: {
    type: String,
    default: null
  },
  locationId: {
    type: String,
    default: null
  },
  center: {
    type: Array as unknown as () => [number, number],
    default: () => [10.196805, -71.30903] // Coordenadas por defecto
  },
  zoom: {
    type: Number,
    default: 14
  }
});

// Estado del mapa
const map = ref<L.Map | null>(null);
const routeLayer = ref<L.Polyline | null>(null);
const markerLayer = ref<L.Marker | null>(null);

// Función para obtener una ruta específica
const getRoute = async (routeId: string) => {
  const { data, error } = await supabase.rpc('get_route', { route_id: routeId });
  if (error) throw error;
  return data;
};

// Función para obtener una ubicación específica
const getLocation = async (locationId: string) => {
  const { data, error } = await supabase.rpc('get_location', { location_id: locationId });
  if (error) throw error;
  return data;
};

// Inicializar mapa
const initMap = () => {
  if (map.value) map.value.remove();
  
  map.value = L.map('view-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(props.center, props.zoom);

  baseLayers.GoogleMaps.addTo(map.value as L.Map);

};

// Limpiar mapa
const clearMap = () => {
  if (!map.value) return;
  
  if (routeLayer.value) {
    map.value.removeLayer(routeLayer.value as unknown as L.Layer);
    routeLayer.value = null;
  }
  
  if (markerLayer.value) {
    map.value.removeLayer(markerLayer.value as unknown as L.Layer);
    markerLayer.value = null;
  }
};

// Mostrar ruta
const showRoute = async (routeId: string) => {
  if (!map.value) return;
  
  try {
    const routeData = await getRoute(routeId);
    if (!routeData) throw new Error('Ruta no encontrada');

    clearMap();

    // Convertir GeoJSON a coordenadas de Leaflet
    const startCoords: [number, number] = [
      routeData.start_point.coordinates[1],
      routeData.start_point.coordinates[0]
    ];
    const endCoords: [number, number] = [
      routeData.end_point.coordinates[1],
      routeData.end_point.coordinates[0]
    ];
    const pathCoords = routeData.path.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

    // Dibujar ruta
    routeLayer.value = L.polyline(pathCoords, {
      color: '#1976D2',
      weight: 4,
      opacity: 0.7
    }).addTo(map.value as L.Map);

    // Añadir marcadores
    L.marker(startCoords, {
      icon: startIcon,
    }).addTo(map.value as L.Map, )
      .bindPopup('Punto de inicio')

    L.marker(endCoords, {
      icon: endIcon,
    }).addTo(map.value as L.Map)
      .bindPopup('Punto de destino');

    // Ajustar vista
    map.value.fitBounds(routeLayer.value.getBounds());

  } catch (error) {
    console.error('Error al mostrar ruta:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la ruta en el mapa',
      position: 'top-right',
    });
    
    // Mostrar mapa vacío como fallback
    clearMap();
    map.value?.setView(props.center, props.zoom);
  }
};

// Mostrar ubicación
const showLocation = async (locationId: string) => {
  if (!map.value) return;
  
  try {
    const locationData = await getLocation(locationId);
    if (!locationData) throw new Error('Ubicación no encontrada');

    clearMap();

    const coords: [number, number] = [
      locationData.coordinates.coordinates[0]!,
      locationData.coordinates.coordinates[1]!
    ];
    
    markerLayer.value = L.marker(coords, { icon: startIcon })
      .addTo(map.value as L.Map, )
      .bindPopup('Ubicación del servicio')

    map.value.setView(coords, 15);
  } catch (error) {
    console.error('Error al mostrar ubicación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la ubicación en el mapa',
       position: 'top-right',
    });
    
    // Mostrar mapa vacío como fallback
    clearMap();
    map.value?.setView(props.center, props.zoom);
  }
};

// // Observar cambios en las props
// watch(() => props.routeId, (newVal) => {
//   if (!['null','', null, undefined].includes(newVal)) void showRoute(newVal);
// });

// watch(() => props.locationId, (newVal) => {
//   if (!['null','', null, undefined].includes(newVal)) void showLocation(newVal);
// });

// Ciclo de vida
onMounted(() => {
  initMap();
  if (!['null','', null, undefined].includes(props.routeId)) {
    void showRoute(props.routeId);
  } 
  if (!['null','', null, undefined].includes(props.locationId)) {
    void showLocation(props.locationId);
  }
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<style scoped>
#map-container {
  min-height: 200px;
}
</style>