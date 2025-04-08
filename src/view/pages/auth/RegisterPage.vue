<template>
  <q-page class="flex flex-center justify-center mobile-keyboard-fix">
    <div class="w-full max-w-md p-8 bg-one -mt-10">
      <h2 class="!text-2xl !font-semibold text-center mb-4 text-yellow-9">Nuevo Registro</h2>

      <q-form @submit="handleSubmit" @reset="onReset" class="space-y-4">
        <div class="relative">
          <q-input v-model="email" label="Email/Correo" color="yellow-9" class="w-full" :rules="[required]">
            <template #append>
              <q-icon name="mail" color="yellow-8" />
            </template>
          </q-input>
        </div>

        <div class="relative">
          <q-input v-model="fullname" color="yellow-9" label="Nombre completo" class="w-full" :rules="[required]">
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
            color="yellow-9"
            label="Contraseña"
            :rules="[required]"
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
           <q-input
            v-model="cedula"
            label="Cédula"
            color="yellow-9"
            class="w-full"
            :rules="validationRules"
            maxlength="10"
          >
            <template #append>
              <q-icon name="tag" color="yellow-8" />
            </template>
          </q-input>
        </div>

        <div class="mt-8">
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
import { useCedula } from '@composables/useCedula'
import superComposable from '@composables/super'
import notification from '@utils/notification'
import { required } from '@utils/validations'
import { ref } from 'vue'

const { store, router:useRouter } = superComposable()
const { cedula, validationRules, resetCedula } = useCedula()
const router = useRouter();

const email = ref('')
const password = ref('')
const fullname = ref('')

const showPassword = ref(false)

const handleSubmit = async () => {
  await store.auth
    .newUser({
      email: email.value,
      password: password.value,
      fullname: fullname.value,
      cedula: cedula.value,
      role: 'user'
    }, ()=> {
      notification().success({ message: 'Usuario registrado' })
      void router.push({ name: 'login' })
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
  resetCedula()
}
</script>
