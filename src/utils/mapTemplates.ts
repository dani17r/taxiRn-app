import L from 'leaflet'

export const createPopupButton = (type: 'start' | 'end', latlng: L.LatLng): string => {
  return `
  <button class="full-width q-mt-sm q-btn q-btn--flat text-${type === 'start' ? 'positive' : 'negative'}"
      onclick="window.vueActions.setPoint('${type}', ${latlng.lat}, ${latlng.lng})">
      Establecer ${type === 'start' ? 'inicio' : 'fin'} aquí
  </button>
  `
}

export const createMarkerPopup = (type: 'start' | 'end'): string => `
  <div class="q-pa-sm">
    <h6 class="q-my-none">Punto de ${type === 'start' ? 'inicio' : 'fin'}</h6>
    <button class="full-width q-mt-sm q-btn q-btn--flat text-negative"
      onclick="window.vueActions.deletePoint('${type}')">
      Eliminar
    </button>
  </div>
`

export const createPopupContent = (
  startPos: L.LatLng | null,
  endPos: L.LatLng | null,
  latlng: L.LatLng,
): HTMLElement => {
  const content = document.createElement('div')
  content.className = 'q-pa-sm'
  content.innerHTML = `
    <h6 class="q-my-none">Seleccionar punto</h6>
    ${!startPos ? createPopupButton('start', latlng) : ''}
    ${!endPos ? createPopupButton('end', latlng) : ''}
  `
  return content
}

export const createIcon = (color: string): L.Icon =>
  L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })
