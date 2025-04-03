// src/types/vue-shim.d.ts
// import type { ComputedRef } from 'vue';
import type { Pinia } from 'pinia' // Importa Pinia si lo necesitas
import type { Quasar } from 'quasar'
import type { I18nT } from 'vue-i18n'
import type { Router, Route } from 'vue-router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // $isDark: ComputedRef<boolean>;
    // $stylesDark: {
    //   bg: ComputedRef<string>
    // };
    $router: Router
    $route: Route
    $pinia: Pinia
    $q: Quasar
    $t: I18nT
  }
}

declare global {
  interface Window {
    vueActions: {
      setPoint: (type: 'start' | 'end', lat: number, lng: number) => void
      deletePoint: (type: 'start' | 'end') => void
    }
    map: {
      createPoint: (type: 'start' | 'end', lat: number, lng: number) => void
      deletePoint: (type: 'start' | 'end') => void
    }
  }
}

declare module 'leaflet' {
  // interface Map {
  //   transform: {
  //     setRotation: (degree: number) => void
  //     setRotationX: (degree: number) => void
  //   }
  // }
}
