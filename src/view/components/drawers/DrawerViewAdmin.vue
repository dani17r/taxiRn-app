<template>
  <q-list>
     <div class="mt-2 -mb-1">
      <q-item>
        <q-item-section>
          <q-item-label>{{ truncate(store.auth.current?.fullname, { length: 20 }) }}</q-item-label>
          <q-item-label caption>{{
            truncate(store.auth.current?.email, { length: 25 })
          }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption
            ><q-chip size="10px" class="!m-0" :label="isRoleLabel(store.auth.getRole)"
          /></q-item-label>
        </q-item-section>
      </q-item>
    </div>
    <q-separator spaced />

    <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />

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
import superComposable from '@composables/super'
import notification from '@utils/notification'
import roleComposable from '@composables/role'
import { defineAsyncComponent } from 'vue'
import { truncate } from 'lodash'

const EssentialLink = defineAsyncComponent(() => import('@components/EssentialLink.vue'))

const { store, router:useRouter } = superComposable()
const { isRoleLabel } = roleComposable()
const router = useRouter()

const linksList: routerLink[] = [
  {
    title: 'Conductores',
    caption: 'Ver los conductores',
    icon: 'directions_bus',
    link: { name: 'admin-vehicles' },
  },
  {
    title: 'Usuarios',
    caption: 'Ver los usuarios',
    icon: 'person',
    link: { name: 'users' },
  },
  {
    title: 'Admins',
    caption: 'Ver los admins',
    icon: 'manage_accounts',
    link: { name: 'admins' },
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
