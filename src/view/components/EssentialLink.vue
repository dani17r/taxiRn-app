<template>
  <q-item
    clickable
    exact-active-class="text-yellow-9"
    @click="changeRoute"
    :to="props.link"
    exact
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import useTabsComposable from '@composables/tabs'
import { useRouter } from 'vue-router';

const { emptyTabs } = useTabsComposable()
const router = useRouter();

export interface routerLink {
  title: string;
  caption?: string;
  link: { name: string; params?: Record<string, string | number> };
  icon?: string;
};

const props = withDefaults(defineProps<routerLink>(), {
  caption: '',
  icon: '',
  title: '',
});


const changeRoute = async (e: Event) => {
  e.preventDefault();
  emptyTabs(props.link.name)
  await router.replace(props.link);
};
</script>
