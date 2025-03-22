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

        <div>
          <q-btn
            type="submit"
            icon="person_add"
            color="yellow-9"
            no-caps
            class="!w-full"
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
import { reactive, ref, watchEffect } from 'vue'
import superComposable from '@composables/super'
import notification from '@utils/notification'

const { store, router:useRouter } = superComposable()
const router = useRouter();

const email = ref('')
const password = ref('')
const fullname = ref('')
const showPassword = ref(false)
const selectRole = reactive({
  role: 'user',
  roles: [
    { label: 'Conductor', value: 'driver' },
    { label: 'Usuario', value: 'user' },
  ],
})

const handleSubmit = async () => {
  await store.auth
    .signUp({
      email: email.value,
      password: password.value,
      fullname: fullname.value,
      role: selectRole.role,
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

watchEffect(()=>{
  console.log(selectRole.role);
})

const onReset = () => {
  email.value = ''
  password.value = ''
  fullname.value = ''
}
</script>
