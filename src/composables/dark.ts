import { Dark, LocalStorage } from 'quasar';
import { computed, ref } from 'vue';

const val = ref(LocalStorage.getItem('darkMode') as boolean || false);
const isDark = computed(() => val.value);

export default () => {

  const init = () => {
    Dark.set(val.value);
  };

  const toggle = () => {
    val.value = !val.value;
    LocalStorage.set('darkMode', val.value);
    Dark.set(val.value);
  };

  const stylesDark = {
    bg: computed(() => isDark.value ? 'tw-bg-zinc-800 tw-border-zinc-800' : 'tw-bg-zinc-100 tw-border-zinc-200')
  }

  return {
    stylesDark,
    init,
    toggle,
    isDark,
    val,
  };
};
