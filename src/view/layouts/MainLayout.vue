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
          <q-tab
            v-for="tab in tabs.values"
            :label="tab.label"
            :icon="tab.icon"
            :name="tab.name"
            :key="tab.name"
            @click="$router.push({ name: tab.name })"
            no-caps
            ripple
          >
            <!-- <q-badge color="red" floating>2</q-badge> -->
          </q-tab>
        </q-tabs>
      </q-toolbar>
    </q-footer>

    <q-page-container>
      <q-tab-panels
        v-model="tabs.select"
        :swipeable="tabs.select != 'map'"
        animated
        @transition="$router.push({ name: tabs.select })"
      >
      <template v-for="tabItem in tabs.values">

        <q-tab-panel
        v-if="isRoleActive(tabItem.roles)"
        :key="tabItem.name"
        :name="tabItem.name"
        :class="tabs.select === 'map' ? '!p-0' : ''"
        >
          <router-view :key="tabItem.name" />
        </q-tab-panel>
      </template>
      </q-tab-panels>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import useDrawerMainComposable from '@composables/DrawerMain'
import { defineAsyncComponent, onMounted } from 'vue'
import useSuperComposable from '@composables/super'
import useTabsComposable from '@composables/tabs'
import useRoleComposable from '@composables/role'

const DrawerViewDriver = defineAsyncComponent(
  () => import('@components/drawers/DrawerViewDriver.vue'),
)
const DrawerViewAdmin = defineAsyncComponent(
  () => import('@components/drawers/DrawerViewAdmin.vue'),
)
const DrawerViewUser = defineAsyncComponent(() => import('@components/drawers/DrawerViewUser.vue'))

const { toggleLeftDrawer, leftDrawerOpen } = useDrawerMainComposable()
const { initTabsForRole, isRoleActive } = useRoleComposable()
const { store, route } = useSuperComposable()
const { tabs, initTabs } = useTabsComposable()

onMounted(()=>{
  initTabs(route())
  initTabsForRole()
})

</script>

<style scoped lang="css">
.q-tab__indicator {
  height: 5px !important;
}
</style>
