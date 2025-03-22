import L from 'leaflet'

export const baseLayers = {
  OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }),

  GoogleMaps: L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: '© Google Maps',
  }),

  CartoPositron: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
  }),

  StamenTerrain: L.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {
    maxZoom: 18,
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  }),

  ArcGISWorldStreet: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: '© Esri',
    },
  ),
}

export const fetchRoute = (
  start: { lng: number; lat: number },
  end: { lng: number; lat: number },
): Promise<Response> => {
  return fetch(
    `https://router.project-osrm.org/route/v1/driving/` +
      `${start.lng},${start.lat};` +
      `${end.lng},${end.lat}?overview=full&geometries=geojson`,
  )
}
