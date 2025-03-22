<template>
  <div v-if="map" ref="controlContainer" class="leaflet-control-layer-menu">
    <div class="layer-menu">
      <button
        v-for="layer in layers"
        :key="layer.name"
        class="layer-button"
        :class="{ active: activeLayer === layer.name }"
        @click="switchLayerHandler(layer)"
      >
        {{ layer.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'

const props = defineProps<{
  map: L.Map,
  switchLayer: (layer: L.TileLayer) => void,
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright',
  baseLayers: Record<string, L.TileLayer>
}>()

const activeLayer = ref<string>('OpenStreetMap')
const controlContainer = ref<HTMLElement | null>(null)

const layers = [
  { name: 'OpenStreetMap', label: 'OpenStreetMap' },
  { name: 'CartoPositron', label: 'Carto Positron' },
  { name: 'GoogleMaps', label: 'Google Maps' },
  { name: 'StamenTerrain', label: 'Stamen Terrain' },
  { name: 'ArcGISWorldStreet', label: 'ArcGIS Street' }
]

const switchLayerHandler = (layer: typeof layers[number]) => {
  activeLayer.value = layer.name
  const tileLayer = props.baseLayers[layer.name]
  if (tileLayer) {
    props.switchLayer(tileLayer)
  }
}

onMounted(() => {
  if (controlContainer.value && props.map) {
    const control = new L.Control({
      position: props.position
    })

    control.onAdd = () => {
      return controlContainer.value!
    }

    control.addTo(props.map)
  }
})
</script>

<style scoped>
.leaflet-control-layer-menu {
  background: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
}

.layer-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.layer-button {
  padding: 8px 12px;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  text-align: left;
  border-radius: 3px;
  transition: all 0.2s;
}

.layer-button:hover {
  background: #e9ecef;
}

.layer-button.active {
  background: #007bff;
  color: white;
}
</style>