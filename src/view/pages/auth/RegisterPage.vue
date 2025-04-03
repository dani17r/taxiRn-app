<template>
  <q-page class="flex flex-center justify-center">
    <div class="w-full max-w-md p-8 bg-one -mt-10">
      <h2 class="!text-2xl !font-semibold text-center mb-4 text-yellow-9">Nuevo Registro</h2>

      <q-form @submit="handleSubmit" @reset="onReset" class="space-y-6">
        <div class="relative">
          <q-input v-model="email" label="Email/Correo" class="w-full">
            <template #append>
              <q-icon name="mail" color="yellow-8" />
            </template>
          </q-input>
        </div>

        <div class="relative">
          <q-input v-model="fullname" label="Nombre completo" class="w-full">
            <template #append>
              <q-icon name="person" color="yellow-8" />
            </template>
          </q-input>
        </div>

        <!-- Password Input -->
        <div class="relative">
          <q-input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            label="Contraseña"
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
          <q-input v-model="cedula" label="Cedula" class="w-full">
            <template #append>
              <q-icon name="tag" color="yellow-8" />
            </template>
          </q-input>
        </div>

        <div class="mt-12">
          <q-btn
            icon="person_add"
            color="yellow-9"
            class="!w-full"
            label="Aceptar"
            type="submit"
            size="18px"
            unelevated
            no-caps
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
        </div>
      </q-form>
    </div>

    <q-btn
      class="absolute bottom-4 left-4"
      label="Quiero iniciar sesión"
      :to="{ name: 'login' }"
      icon="login"
      color="yellow-9"
      no-caps
      round
      flat
    />
  </q-page>
</template>

<script setup lang="ts">
import superComposable from '@composables/super'
import notification from '@utils/notification'
import { ref } from 'vue'

const { store, router:useRouter } = superComposable()
const router = useRouter();

const email = ref('')
const password = ref('')
const fullname = ref('')
const cedula = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  await store.auth
    .signUp({
      email: email.value,
      password: password.value,
      fullname: fullname.value,
      cedula: cedula.value,
      role: 'user'
    })
    .then(async () => {
      notification().success({ message: 'Usuario registrado' })
      await router.push({ name: 'login' })
      onReset()
    })
    .catch((error) => {
      notification().error(error.message)
    })
}

const onReset = () => {
  email.value = ''
  password.value = ''
  fullname.value = ''
}
</script>
