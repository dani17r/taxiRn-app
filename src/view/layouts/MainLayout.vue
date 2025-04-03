<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent text-grey-8">
      <q-toolbar class="z-[1000]">
        <q-toolbar-title>
          <q-img
            src="~/assets/taxirn-lg.svg"
            position="top"
            height="40px"
            width="106px"
            alt="Taxi Image"
          />
        </q-toolbar-title>

        <div>
          <ButtonDarkMode />
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
            class="text-one"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="right">
      <DrawerViewUser v-if="store.auth.getRoleUser" />
      <DrawerViewAdmin v-if="store.auth.getRoleAdmin" />
      <DrawerViewDriver v-if="store.auth.getRoleDriver" />
    </q-drawer>

    <q-footer class="bg-white bg-one">
      <q-toolbar class="flex justify-center items-center">
        <q-tabs
          class="text-grey-9 text-one"
          indicator-color="yellow-9"
          active-color="yellow-9"
          v-model="tabs.select"
          narrow-indicator
          dense
        >
          <template v-for="tab in tabs.values" :key="tab.name">
            <q-tab
              @click="$router.push({ name: tab.name })"
              v-show="isRoleActive(tab.views)"
              :label="tab.label"
              :icon="tab.icon"
              :name="tab.name"
              no-caps
              ripple
            >
              <!-- <q-badge color="red" floating>2</q-badge> -->
            </q-tab>
          </template>
        </q-tabs>
      </q-toolbar>
    </q-footer>

    <q-page-container>
      <!-- @transition="$router.push({ name: tabs.select })" -->
      <q-tab-panels
        :swipeable="tabs.select != 'map'"
        :model-value="tabs.select"
        class="bg-one"
        animated
      >
        <q-tab-panel
          v-for="tab in tabs.values"
          :class="tabs.select == 'map' ? '!p-0' : ''"
          :name="tab.name"
          :key="tab.name"
          keep-alive
        >
          <router-view :key="tab.name"/>
        </q-tab-panel>
      </q-tab-panels>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import useDrawerMainComposable from '@composables/DrawerMain'
import { defineAsyncComponent, onMounted } from 'vue'
import useSuperComposable from '@composables/super'
import useRolesComposable from '@composables/role'
import useTabsComposable from '@composables/tabs'

const ButtonDarkMode = defineAsyncComponent(
  () => import('@components/ButtonDarkMode.vue'),
)
const DrawerViewDriver = defineAsyncComponent(
  () => import('@components/drawers/DrawerViewDriver.vue'),
)
const DrawerViewAdmin = defineAsyncComponent(
  () => import('@components/drawers/DrawerViewAdmin.vue'),
)
const DrawerViewUser = defineAsyncComponent(() => import('@components/drawers/DrawerViewUser.vue'))

const { toggleLeftDrawer, leftDrawerOpen } = useDrawerMainComposable()
const { tabs, initTabs, initTabsForRole } = useTabsComposable()
const { store, route } = useSuperComposable()
const { isRoleActive } = useRolesComposable()

onMounted(() => {
  initTabs(route())
  initTabsForRole(store)
})
</script>

<style scoped lang="css">
.q-tab__indicator {
  height: 5px !important;
}
</style>
