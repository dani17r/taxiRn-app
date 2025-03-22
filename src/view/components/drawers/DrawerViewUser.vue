<template>
  <q-list>
    <q-item-label header>Menu</q-item-label>
    <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />

    <ButtonDarkMode class="!w-full fixed bottom-10" :activeTitle="true" />

    <q-btn
      class="!w-full fixed bottom-0"
      @click="closeSession()"
      label="cerrar sesión"
      color="yellow-9"
      icon="logout"
      no-caps
    />
  </q-list>
</template>

<script setup lang="ts">
import type { routerLink } from '@components/EssentialLink.vue'
import { defineAsyncComponent } from 'vue'

const EssentialLink = defineAsyncComponent(() => import('@components/EssentialLink.vue'))

const ButtonDarkMode = defineAsyncComponent(() => import('@components/ButtonDarkMode.vue'))

import superComposable from '@composables/super'
import notification from '@utils/notification'

const { store, router:useRouter } = superComposable()

const router = useRouter()

const linksList: routerLink[] = [
  {
    title: 'Datos Bancarios',
    caption: 'Ver datos para pagar',
    icon: 'account_balance',
    link: { name: 'banking' },
  },
]

const closeSession = async () => {
  await store.auth
    .signOut()
    .then(async() => {
      await router.push({ name: 'login' })
      store.reset()
    })
    .catch((error) => {
      notification().error(error.message)
    })
}
</script>
