import supabase from '@services/supabase.services'
import { computed } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (store: any) => {
  const avatarUrl = computed(() => {
    if (!store.auth.current?.images?.profile) return 'https://placehold.co/150x150'

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(store.auth.current.images.profile)

    return publicUrl
  })

  return {
    avatarUrl,
  }
}
