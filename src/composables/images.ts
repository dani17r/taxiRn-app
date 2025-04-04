import supabase from '@services/supabase.services'
import { computed } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (store?: any) => {
  const avatarUrl = computed(() => {
    if (!store) return

    const nameSplit = String(store.auth.current?.fullname).split(' ')
    if (!store.auth.current?.images?.profile)
      return `https://placehold.co/150x150?text=${nameSplit[0]!.charAt(0).toLocaleUpperCase()}${nameSplit[1]!.charAt(0).toLocaleUpperCase()}`

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(store.auth.current.images.profile)

    return publicUrl
  })

  const imageVehicleUrl = computed(() => {
    if (!store) return

    if (!store.vehicle.current?.images.ground)
      return 'https://placehold.co/150x150/gray/white?text=Portada'

    const {
      data: { publicUrl },
    } = supabase.storage.from('vehicles').getPublicUrl(store.vehicle.current.images.ground)

    return publicUrl
  })

  const avatarsUrls = (images: { profile: string | null; ground: string }, fullname: string) => {
    const nameSplit = String(fullname).split(' ')
    if (!images.profile)
      return `https://placehold.co/150x150?text=${nameSplit[0]!.charAt(0).toLocaleUpperCase()}${nameSplit[1]!.charAt(0).toLocaleUpperCase()}`

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(images.profile)

    return publicUrl
  }

  const imageVehiclesUrls = (images: { ground: string | null }) => {
    if (!images.ground) return 'https://placehold.co/150x150/gray/white?text=Portada'

    const {
      data: { publicUrl },
    } = supabase.storage.from('vehicles').getPublicUrl(images.ground)

    return publicUrl
  }

  return {
    imageVehiclesUrls,
    avatarsUrls,
    imageVehicleUrl,
    avatarUrl,
  }
}
