<template>
  <q-page class="fixed left-0 top-13 w-full h-screen mobile-keyboard-fix">
    <h5 class="text-yellow-700 !font-bold w-full text-center">Administradores</h5>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="searchQuery"
          label="Buscar administrador"
          debounce="500"
          color="yellow-9"
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
        <!-- Lista de administradores -->
        <q-list>
          <template v-if="!isLoading">
            <q-item v-for="admin in admins" :key="admin.id" class="border-b border-amber-400 my-2">
              <q-item-section class="mb-3">
                <q-item-label>
                  <span class="text-weight-bold text-lg">{{ admin.fullname }}</span>
                </q-item-label>
                <q-item-label caption class="!text-[14px]"
                  >Cédula: {{ admin.cedula || 'No registrada' }}</q-item-label
                >
                <q-item-label caption class="!text-[14px]">Email: {{ admin.email }}</q-item-label>
                <q-item-label caption class="!text-[14px]"
                  >creado el: {{ formatCustomDate(String(admin.created_at)) }}</q-item-label
                >
                <q-item-label>
                  <div class="q-mt-sm flex q-gutter-sm">
                    <!-- Buttons below details -->
                    <q-btn
                      dense
                      flat
                      round
                      color="primary"
                      icon="edit"
                      @click="editAdmin(admin)"
                      v-if="canEdit(admin)"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>

                    <q-btn
                      dense
                      flat
                      round
                      :color="admin.is_blocked ? 'green' : 'orange'"
                      :icon="admin.is_blocked ? 'lock_open' : 'block'"
                      @click="admin.is_blocked ? unblockAdmin(admin.id) : blockAdmin(admin.id)"
                      v-if="canBlock(admin)"
                    >
                      <q-tooltip>{{ admin.is_blocked ? 'Desbloquear' : 'Bloquear' }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      flat
                      round
                      color="red"
                      icon="delete"
                      @click="deleteAdmin(admin.id)"
                      v-if="canDelete(admin)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-label>
              </q-item-section>
              <!-- Removed the separate side section for buttons -->
            </q-item>

            <q-item v-if="!admins.length">
              <q-item-section class="text-center text-grey-6">
                No se encontraron administradores
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
        :max="Math.ceil(totalAdmins / 10)"
        :max-pages="6"
        direction-links
        boundary-links
        color="yellow-9"
        active-design="unelevated"
        active-class="bg-yellow-9 text-white"
        @update:model-value="handlePaginationUpdate"
      >
        <span class="text-caption q-mx-sm"
          >Página {{ currentPage }} de {{ Math.ceil(totalAdmins / 10) }}</span
        >
      </q-pagination>
    </div>
    <q-btn
      fab
      fab-mini
      color="yellow-9"
      icon="person_add"
      class="fixed bottom-15 right-5"
      @click="addOrEditeAdmin()"
    />

    <DialogAddOrEditeAdmin
      v-model="dialogs.addOrEditeAdmin.value"
      :editing-admin="editingAdmin"
      @update="fetchAdmins(currentPage, 10).catch(() => {})"
    />
  </q-page>
</template>

<script setup lang="ts">
import { formatCustomDate } from '@helpers/dateTime'
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '@services/supabase.services'
import useSuperComposable from '@composables/super'
import { defineAsyncComponent } from 'vue'
import type { UserI } from '@interfaces/user'

const DialogAddOrEditeAdmin = defineAsyncComponent(
  () => import('@modules/admin/DialogAddOrEditeAdmin.vue'),
)

const $q = useQuasar()
const { store } = useSuperComposable()

const admins = ref<UserI[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const totalAdmins = ref(0)
const currentPage = ref(1)
const editingAdmin = ref<UserI | null>(null)
const currentAdminId = ref<string | null>(null)

async function fetchAdmins(page: number, itemsPerPage = 10) {
  try {
    isLoading.value = true
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'admin')
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false })

    if (searchQuery.value) {
      query = query.or(`fullname.ilike.%${searchQuery.value}%,cedula.ilike.%${searchQuery.value}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    admins.value = data || []
    totalAdmins.value = count || 0

    const {
      data: { session },
    } = await supabase.auth.getSession()

    currentAdminId.value = session?.user?.id || null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar administradores',
      caption: error.message,
    })
  } finally {
    isLoading.value = false
  }
}

const deleteAdmin = (p_user_id: string) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este admin?',
    cancel: 'Cancelar',
    ok: 'Si',
    persistent: true,
    color: 'yellow-9',
    class: '!shadow-none bg-one',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    try {
      const { error } = await supabase.rpc('delete_user', { p_user_id })
      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Administrador eliminado correctamente',
      })

      fetchAdmins(currentPage.value, 10).catch(() => {})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar administrador',
        caption: error.message,
      })
    }
  })
}

const blockAdmin = (adminId: string) => {
  $q.dialog({
    title: 'Confirmar Bloqueo',
    message: '¿Estás seguro de que deseas bloquear este admin?',
    cancel: 'Cancelar',
    ok: 'Si',
    persistent: true,
    color: 'yellow-9',
    class: '!shadow-none bg-one',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    try {
      const { error } = await supabase.from('users').update({ is_blocked: true }).eq('id', adminId)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Administrador bloqueado correctamente',
      })

      fetchAdmins(currentPage.value, 10).catch(() => {})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: 'Error al bloquear administrador',
        caption: error.message,
      })
    }
  })
}

const unblockAdmin = (adminId: string) => {
  $q.dialog({
    title: 'Confirmar Desbloqueo',
    message: '¿Estás seguro de que deseas desbloquear este admin?',
    cancel: 'Cancelar',
    ok: 'Si',
    persistent: true,
    color: 'yellow-9',
    class: '!shadow-none bg-one',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }).onOk(async () => {
    try {
      const { error } = await supabase.from('users').update({ is_blocked: false }).eq('id', adminId)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Administrador desbloqueado correctamente',
      })

      fetchAdmins(currentPage.value, 10).catch(() => {})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: 'Error al desbloquear administrador',
        caption: error.message,
      })
    }
  })
}

const dialogs = reactive({
  addOrEditeAdmin: {
    value: false,
    toggle: () => (dialogs.addOrEditeAdmin.value = !dialogs.addOrEditeAdmin.value),
  },
})

const editAdmin = (admin: UserI) => {
  editingAdmin.value = admin
  dialogs.addOrEditeAdmin.toggle()
}

const addOrEditeAdmin = () => {
  editingAdmin.value = null
  dialogs.addOrEditeAdmin.toggle()
}

// Function to handle search input update
const handleSearchUpdate = () => {
  currentPage.value = 1
  fetchAdmins(currentPage.value, 10).catch(() => {})
}

// Function to handle pagination update
const handlePaginationUpdate = (newPage: number) => {
  // currentPage is already updated by v-model, just fetch data
  fetchAdmins(newPage, 10).catch(() => {})
}

const canEdit = (admin: UserI) => {
  const currentUser = store.auth.current
  return (
    // El admin general puede editar a cualquiera
    currentUser?.email === 'admin@admin.com' ||
    // Otros admins pueden editar a cualquiera excepto al admin general
    (currentUser?.email !== 'admin@admin.com' && admin.email !== 'admin@admin.com')
  )
}

const canBlock = (admin: UserI) => {
  const currentUser = store.auth.current
  return (
    // Solo el admin general puede bloquear/desbloquear a otros
    currentUser?.email === 'admin@admin.com' && admin.email !== 'admin@admin.com'
  )
}

const canDelete = (admin: UserI) => {
  const currentUser = store.auth.current
  return (
    // El admin general puede eliminar a otros admins
    (currentUser?.email === 'admin@admin.com' && admin.email !== 'admin@admin.com') ||
    // Otros admins pueden eliminar solo a no-admins (si aplica)
    (currentUser?.email !== 'admin@admin.com' &&
      admin.email !== 'admin@admin.com' &&
      admin.id !== currentUser?.id)
  )
}

onMounted(() => {
  fetchAdmins(currentPage.value, 10).catch(() => {})
})
</script>
