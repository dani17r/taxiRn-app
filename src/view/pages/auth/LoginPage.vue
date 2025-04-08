<template>
  <q-page class="flex items-center justify-center mobile-keyboard-fix">
    <div class="w-full max-w-md px-8 bg-one -mt-20">
      <h2 class="!text-2xl !font-semibold text-center mb-8 text-yellow-9">Iniciar Sesión</h2>

      <q-form @submit="handleSubmit" @reset="onReset" class="space-y-6">
        <!-- Email Input -->
        <div class="relative">
          <q-input
            v-model="email"
            label="Email/Correo"
            color="yellow-9"
            class="w-full"
            :rules="[required]"
          >
            <template #append>
              <q-icon name="mail" color="yellow-8" />
            </template>
          </q-input>
        </div>

        <!-- Password Input -->
        <div class="relative">
          <q-input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            label="Contraseña"
            color="yellow-9"
            class="w-full"
            :rules="[required]"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                color="yellow-8"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>

        <q-btn
          type="submit"
          icon="login"
          color="yellow-9"
          no-caps
          class="!mt-6 !w-full"
          unelevated
          size="18px"
          label="Aceptar"
        />
        <q-btn
          type="reset"
          color="yellow-9"
          no-caps
          class="q-mt-sm !w-full"
          unelevated
          size="18px"
          label="Limpiar campos"
          flat
        />

        <div class="!mt-8">
          <router-link
            :to="{ name: 'forgot-password' }"
            class="text-yellow-9 hover:text-yellow-9-dark"
          >
            Olvide mi contraseña
          </router-link>
        </div>
      </q-form>
    </div>
    <q-btn
      class="absolute bottom-4 left-4"
      label="Quiero registrarme"
      :to="{ name: 'register' }"
      icon="person_add"
      color="yellow-9"
      no-caps
      round
      flat
    />
  </q-page>
</template>

<script lang="ts" setup>
import useTabsComposable from '@composables/tabs'
import superComposable from '@composables/super'
import notification from '@utils/notification'
import { required } from '@utils/validations'
import { ref } from 'vue'

const { store, router: useRouter, $q } = superComposable()
const { loading } = $q()

const router = useRouter()
const useTabs = useTabsComposable()

defineOptions({
  name: 'LoginPage',
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)

/**
 * Función que se ejecuta al enviar el formulario de inicio de sesión.
 * Debe contener la lógica de autenticación.
 */
const handleSubmit = async () => {
  loading.show()
  await store.auth
    .signIn({
      email: email.value,
      password: password.value,
    })
    .then(async () => {
      if (store.auth?.getRoleAdmin) await router.push({ name: 'panel' })
      if (store.auth?.getRoleDriver) await router.push({ name: 'my-vehicle' })
      if (store.auth?.getRoleUser) await router.push({ name: 'map' })
      useTabs.reset()
      useTabs.initTabsForRole(store)
    })
    .finally(() => {
      loading.hide()
    })
    .catch((error) => notification().error(error))
}

const onReset = () => {
  email.value = ''
  password.value = ''
}
</script>
