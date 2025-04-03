<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <h5 class="text-yellow-700 !font-bold w-full text-center">Usuarios</h5>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="searchQuery"
          label="Buscar usuario"
          debounce="500"
          dense
          filled
          @update:model-value="handleSearchUpdate"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-22">
      <div class="q-pa-md">
        <!-- Lista de usuarios -->
        <q-list>
          <template v-if="!isLoading">
            <q-item v-for="user in users" :key="user.id" class="border-b border-amber-400 my-2">
              <q-item-section class="mb-3">
                <q-item-label>
                  <span class="text-weight-bold text-lg">{{ user.fullname }}</span>
                </q-item-label>
                <q-item-label caption class="!text-[14px]"
                  >Cédula: {{ user.cedula || 'No registrada' }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]">Email: {{ user.email }}</q-item-label>
                <q-item-label caption class="!text-[14px]"
                  >creado el: {{ formatCustomDate(String(user.created_at)) }}</q-item-label
                >
                 <q-item-label>
                   <div class="q-mt-sm flex q-gutter-sm"> <!-- Buttons below details -->
                     <q-btn
                       dense
                       flat
                       round
                       color="primary"
                       icon="edit"
                       @click="editUser(user)"
                     >
                       <q-tooltip>Editar</q-tooltip>
                     </q-btn>
                     <q-btn
                       dense
                       flat
                       round
                       :color="user.is_blocked ? 'green' : 'orange'"
                       :icon="user.is_blocked ? 'lock_open' : 'block'"
                       @click="user.is_blocked ? unblockUser(user.id) : blockUser(user.id)"
                     >
                       <q-tooltip>{{ user.is_blocked ? 'Desbloquear' : 'Bloquear' }}</q-tooltip>
                     </q-btn>
                     <q-btn
                       dense
                       flat
                       round
                       color="red"
                       icon="delete"
                       @click="deleteUser(user.id, user.user_id)"
                     >
                      <q-tooltip>Eliminar</q-tooltip>
                     </q-btn>
                   </div>
                 </q-item-label>
              </q-item-section>
              <!-- Removed the separate side section for buttons -->
            </q-item>

            <q-item v-if="!users.length">
              <q-item-section class="text-center text-grey-6">
                No se encontraron usuarios
              </q-item-section>
            </q-item>
          </template>

          <q-item v-else>
            <q-item-section class="flex justify-center items-center min-h-72">
              <q-spinner color="primary" size="3em" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-scroll-area>

    <div class="row justify-center">
      <q-pagination
        v-model="currentPage"
        :max="Math.ceil(totalusers / 10)"
        :max-pages="6"
        direction-links
        boundary-links
        color="yellow-9"
        active-design="unelevated"
        active-class="bg-yellow-9 text-white"
        @update:model-value="handlePaginationUpdate"
      >
        <span class="text-caption q-mx-sm"
          >Página {{ currentPage }} de {{ Math.ceil(totalusers / 10) }}</span
        >
      </q-pagination>
    </div>
    <q-btn
      fab
      fab-mini
      color="yellow-9"
      icon="person_add"
      class="fixed bottom-15 right-5"
      @click="newUser()"
    />

    <DialogNewUser
      v-model="dialogs.newuser.value"
      :editing-user="editingUser"
      @user-created="fetchusers(currentPage, 10).catch(() => {})"
      @user-updated="fetchusers(currentPage, 10).catch(() => {})"
    />
  </q-page>
</template>

<script setup lang="ts">
import { formatCustomDate } from '@helpers/dateTime'
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '@services/supabase.services'
import { defineAsyncComponent } from 'vue'
import type { UserI } from '@interfaces/user'

const DialogNewUser = defineAsyncComponent(() => import('@modules/user/DialogNewUser.vue'))

const $q = useQuasar()

const users = ref<UserI[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const totalusers = ref(0)
const currentPage = ref(1)
const editingUser = ref<UserI | null>(null)

async function fetchusers(page: number, itemsPerPage = 10) {
  try {
    isLoading.value = true
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'user')
      .range(from, to)
      .order('created_at', { ascending: false })

    if (searchQuery.value) {
      query = query.or(`fullname.ilike.%${searchQuery.value}%,cedula.ilike.%${searchQuery.value}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    users.value = data || []
    totalusers.value = count || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar usuarios',
      caption: error.message,
    })
  } finally {
    isLoading.value = false
  }
}

async function deleteUser(userId: string, authId: string) {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) throw error

    await supabase.auth.admin.deleteUser(authId)

    $q.notify({
      type: 'positive',
      message: 'Usuario eliminado correctamente',
    })

    fetchusers(currentPage.value, 10).catch(() => {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar usuario',
      caption: error.message,
    })
  }
}

async function blockUser(userId: string) {
  try {
    const { error } = await supabase.from('users').update({ is_blocked: true }).eq('id', userId)

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Usuario bloqueado correctamente',
    })

    fetchusers(currentPage.value, 10).catch(() => {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al bloquear usuario',
      caption: error.message,
    })
  }
}

async function unblockUser(userId: string) {
  try {
    const { error } = await supabase.from('users').update({ is_blocked: false }).eq('id', userId)

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Usuario desbloqueado correctamente',
    })

    fetchusers(currentPage.value, 10).catch(() => {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al desbloquear usuario',
      caption: error.message,
    })
  }
}

const dialogs = reactive({
  newuser: {
    value: false,
    toggle: () => (dialogs.newuser.value = !dialogs.newuser.value),
  },
})

const editUser = (user: UserI) => {
  editingUser.value = user;
  dialogs.newuser.toggle();
}

const newUser = () => {
  editingUser.value = null;
  dialogs.newuser.toggle();
}

// Function to handle search input update
const handleSearchUpdate = () => {
  currentPage.value = 1;
  fetchusers(currentPage.value, 10).catch(() => {});
};

// Function to handle pagination update
const handlePaginationUpdate = (newPage: number) => {
  // currentPage is already updated by v-model, just fetch data
  fetchusers(newPage, 10).catch(() => {});
};


onMounted(() => {
  fetchusers(currentPage.value, 10).catch(() => {})
})
</script>
