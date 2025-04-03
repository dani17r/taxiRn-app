-------------------------
-- Tabla: users
-- Índices: Índice único en cedula si se requiere búsqueda frecuente
-------------------------
create table public.users (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  user_id uuid not null unique,
  role varchar(255) not null default 'user',
  email varchar(255) not null unique,
  fullname varchar(255) not null,
  cedula varchar(255) null unique, -- Añadido UNIQUE para evitar duplicados
  description text,
  is_blocked boolean null default false,
  phone varchar(255) null,
  year_of_birth varchar(255) null
  images jsonb default '{"ground": null, "profile": null}',
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
) tablespace pg_default;

create index if not exists idx_users_cedula on public.users(cedula); -- Índice para búsquedas por cédula

-------------------------
-- Tabla: user_settings
-- Optimización: Eliminado campo id redundante (user_id ya es unique)
-------------------------
create table public.user_settings (
  user_id uuid primary key references public.users(id), -- Simplificación de estructura
  dark_mode boolean default false,
  show_online_status boolean default true,
  profile_visibility varchar(20) default 'public' check (profile_visibility in ('public', 'private')),
  preferred_language varchar(5) default 'es',
  time_zone varchar(50) default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
) tablespace pg_default;

-------------------------
-- Tabla: vehicles
-- Índices: Índice en license_plate para validaciones rápidas
-------------------------
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  is_active boolean default false,
  vehicle_type text check (vehicle_type in ('car', 'motorcycle')),
  license_plate text not null unique, -- Restricción única añadida
  model text not null,
  brand text not null,
  year smallint not null check (year between 1900 and extract(year from current_date)), -- Tipo y validación mejorados
  color text not null,
  created_at timestamptz default now()
) tablespace pg_default;

create index if not exists idx_vehicles_user on public.vehicles(user_id);

-------------------------
-- Tabla: routes
-- Índices: Índice espacial para consultas geo
-------------------------
create table public.routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  name varchar(255),
  description varchar(255),
  start_point geography not null,
  end_point geography not null,
  path geography,
  created_at timestamptz default now()
) tablespace pg_default;

create index if not exists idx_routes_user on public.routes(user_id);
create index if not exists idx_routes_geo on public.routes using gist(path); -- Índice espacial para operaciones geo

-------------------------
-- Extensión PostGIS (requerida para funciones geoespaciales)
-------------------------
create extension if not exists postgis;

-------------------------
-- Función: get_routes
-- Propósito: Devuelve rutas en formato GeoJSON optimizado
-- Correcciones:
--   - Usa columnas actualizadas (name en lugar de route_name)
--   - Incluye campo description
-------------------------
create or replace function get_routes(user_id uuid)
returns json language sql as $$
  select coalesce(json_agg(json_build_object(
    'id', id,
    'name', name,  -- Corregido: Columna renombrada
    'description', description,  -- Nuevo campo añadido
    'created_at', created_at,
    'start_point', st_asgeojson(start_point),
    'end_point', st_asgeojson(end_point),
    'path', st_asgeojson(path)
  ) order by created_at desc), '[]'::json)
  from public.routes
  where user_id = user_id;  -- Usamos nombre de parámetro consistente
$$;


-------------------------
-- Tabla: locations
-- Índices: Índice espacial y por usuario
-------------------------
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  name varchar(255),
  description varchar(255),
  coordinates geography not null,
  created_at timestamptz default now()
) tablespace pg_default;

create index if not exists idx_locations_user on public.locations(user_id);
create index if not exists idx_locations_geo on public.locations using gist(coordinates);

-------------------------
-- Función: get_locations
-- Propósito: Obtiene ubicaciones en formato GeoJSON estandarizado
-- Correcciones:
--   - Usa name en lugar de title
--   - Eliminado campo duplicado created_at (ya está en el ordenamiento)
-------------------------
create or replace function get_locations(_user_id uuid)
returns json language sql as $$
  select coalesce(json_agg(json_build_object(
    'id', id,
    'name', name,  -- Corregido: Columna renombrada
    'created_at', created_at,
    'coordinates', st_asgeojson(coordinates)
  ) order by created_at desc), '[]'::json)
  from public.locations
  where user_id = _user_id;
$$;

-------------------------
-- Tabla: contracts
-- Índices: Índices para filtros comunes (status, service_type)
-------------------------
create table public.contracts (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references public.users(id),
  vehicle_id uuid not null references public.vehicles(id),
  route_id uuid references public.routes(id),
  service_type varchar(20) check (service_type in ('taxi', 'delivery', 'both')),
  status varchar(20) default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  pickup_location_id uuid not null references public.locations(id),
  delivery_location_id uuid references public.locations(id),
  price numeric(10,2),
  estimated_time interval,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
) tablespace pg_default;

create index if not exists idx_contracts_status on public.contracts(status);
create index if not exists idx_contracts_service_type on public.contracts(service_type);
create index if not exists idx_contracts_client on public.contracts(client_id);

-------------------------
-- Tabla: payments
-- Índices: Índice en status y fechas para reportes
-------------------------
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  contract_id uuid not null references public.contracts(id),
  amount numeric(10,2) not null,
  currency varchar(3) default 'USD',
  status varchar(20) default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  payment_method varchar(50),
  transaction_id varchar(255) unique, -- Evita transacciones duplicadas
  created_at timestamptz default now()
) tablespace pg_default;

create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created on public.payments(created_at);

-------------------------
-- Tabla: settings
-------------------------
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  app_name varchar(255) not null,
  logo text null,
  primary_color varchar(7) not null,
  secondary_color varchar(7) not null,
  accent_color varchar(7) not null,
  success_color varchar(7) not null,
  warning_color varchar(7) not null,
  error_color varchar(7) not null,
  info_color varchar(7) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
) tablespace pg_default;

-------------------------
-- Tabla: notify
-------------------------
create table public.notify (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  title varchar(255) not null,
  description text null,
  is_read boolean null default false,
  created_at timestamptz default now()
) tablespace pg_default;
