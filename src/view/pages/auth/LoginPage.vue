<template>
  <q-page class="flex items-center justify-center">
    <div class="w-full max-w-md px-8 bg-one -mt-20">
      <h2 class="!text-2xl !font-semibold text-center mb-8 text-yellow-9">Iniciar Sesión</h2>

      <q-form @submit="handleSubmit" @reset="onReset" class="space-y-6">
        <!-- Email Input -->
        <div class="relative">
          <q-input v-model="email" label="Email/Correo" class="w-full">
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
            placeholder="Contraseña"
            class="w-full"
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

        <div class="relative">
          <q-select
            v-model="selectRole.role"
            :options="selectRole.roles"
            label="soy un"
            class="w-full"
            map-options
            emit-value
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>
        </div>

        <!-- Submit Button -->
        <q-btn type="submit" icon="login" color="yellow-9" no-caps class="q-mt-md !w-full" unelevated size="18px" label="Aceptar" />
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
import useRoleComposable from '@composables/role'
import superComposable from '@composables/super'
import notification from '@utils/notification'
import { reactive, ref } from 'vue'

const { store, router: useRouter } = superComposable()

const router = useRouter();
const { initTabsForRole } = useRoleComposable()

defineOptions({
  name: 'LoginPage',
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const selectRole = reactive({
  role: 'user',
  roles: [
    { label: 'Admin', value: 'admin' },
    { label: 'Conductor', value: 'driver' },
    { label: 'Usuario', value: 'user' },
  ],
})

/**
 * Función que se ejecuta al enviar el formulario de inicio de sesión.
 * Debe contener la lógica de autenticación.
 */
const handleSubmit = async () => {
  await store.auth
    .signIn({
      email: email.value,
      password: password.value,
    })
    .then(async () => {
      await router.push({ name: 'map' })
    })
    .finally(()=> initTabsForRole())
    .catch((error) => {
      notification().error(error.message)
    })
}

const onReset = () => {
  email.value = ''
  password.value = ''
  selectRole.role = 'user'
}
</script>
