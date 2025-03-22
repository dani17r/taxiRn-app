<template>
  <q-item
    clickable
    exact-active-class="text-primary"
    :to="props.link"
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
</script>
