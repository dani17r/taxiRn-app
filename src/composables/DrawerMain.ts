import { ref } from 'vue'

const leftDrawerOpen = ref(false)

export default () => {
  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  return {
    leftDrawerOpen,
    toggleLeftDrawer,
  }
}
