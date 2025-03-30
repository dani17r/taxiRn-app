<template>
  <q-page class="fixed left-0 top-13 w-full h-screen">
    <q-scroll-area style="height: 90vh; width: 100%" class="pb-10">
      <div class="q-pa-md">
        <div class="flex justify-center p-8 w-full">
          <h1 class="!text-4xl text-yellow-9">Panel de Control</h1>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="row">
            <div class="col-6 col-sm-6 col-md-3 p-1 md:p-0">
              <q-card class="text-white bg-blue-8 !shadow-none">
                <q-card-section>
                  <div class="text-lg">Usuarios Totales</div>
                  <div class="text-h4 q-mt-sm">{{ stats.totalUsersRoleUser }}</div>
                  <q-icon name="people" class="absolute top-1 right-2" size="lg" />
                </q-card-section>
              </q-card>
            </div>
  
            <div class="col-6 col-sm-6 col-md-3 p-1 md:p-0">
              <q-card class="text-white bg-green-8 !shadow-none">
                <q-card-section>
                  <div class="text-lg">Conductores Activos</div>
                  <div class="text-h4 q-mt-sm">{{ stats.activeDrivers }}</div>
                  <q-icon name="directions_car" class="absolute top-1 right-2" size="lg" />
                </q-card-section>
              </q-card>
            </div>

          <div class="col-6 col-sm-6 col-md-3 p-1 md:p-0">
            <q-card class="text-white bg-orange-8 !shadow-none">
              <q-card-section>
                <div class="text-lg">Vehículos Disponibles</div>
                <div class="text-h4 q-mt-sm">{{ stats.totalUsersRoleDriver }}</div>
                <q-icon name="electric_car" class="absolute top-1 right-2" size="lg" />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-6 col-md-3 p-1 md:p-0">
            <q-card class="text-white bg-orange-8 !shadow-none">
              <q-card-section>
                <div class="text-lg">Usuarios Administradores</div>
                <div class="text-h4 q-mt-sm">{{ stats.totalUsersRoleAdmin }}</div>
                <q-icon name="electric_car" class="absolute top-1 right-2" size="lg" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="!shadow-none bg-one">
            <q-card-section>
              <div class="text-h6">Últimos Registros</div>
              <q-list separator>
                <q-item v-for="user in latestUsers" :key="user.id">
                  <q-item-section avatar>
                    <q-avatar color="yellow-9" text-color="white">
                      {{ user.initials }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ user.fullname }}</q-item-label>
                    <q-item-label caption>Registrado hace {{ timeAgo(user.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@services/supabase.services';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const stats = ref({
  totalUsers: 0,
  activeDrivers: 0,
  totalUsersRoleUser: 0,
  totalUsersRoleAdmin: 0,
  totalUsersRoleDriver: 0
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const latestUsers = ref<any[]>([]);

const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
};

const timeAgo = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: es
  });
};

const fetchStats = async () => {
  try {
    // Total de usuarios
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Conductores activos (usuarios con vehículos activos)
    const { count: activeDrivers } = await supabase
      .from('vehicles')
      .select('user_id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Usuarios con rol "user"
    const { count: totalUsersRoleUser } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    // Usuarios con rol "driver"
    const { count: totalUsersRoleDriver } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver');

    const { count: totalUsersRoleAdmin } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    stats.value = {
      totalUsers: totalUsers || 0,
      activeDrivers: activeDrivers || 0,
      totalUsersRoleUser: totalUsersRoleUser || 0,
      totalUsersRoleAdmin: totalUsersRoleAdmin || 0,
      totalUsersRoleDriver: totalUsersRoleDriver || 0
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchLatestUsers = async () => {
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      latestUsers.value = data.map(user => ({
        ...user,
        initials: getInitials(user.fullname)
      }));
    }
  } catch (error) {
    console.error('Error fetching latest users:', error);
  }
};

onMounted(async() => {
  await fetchStats();
  await fetchLatestUsers();
});
</script>
