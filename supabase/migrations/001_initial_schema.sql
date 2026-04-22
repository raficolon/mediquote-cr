-- ============================================================
-- MediQuote CR — Esquema inicial
-- ============================================================

-- Tipos de usuario
create type user_role as enum ('doctor', 'admisiones', 'paciente');

-- Urgencia del procedimiento
create type urgencia_type as enum ('electiva', 'semi_urgente', 'urgente');

-- Estado de una RFP
create type rfp_status as enum ('borrador', 'enviada', 'con_cotizaciones', 'completada', 'cancelada');

-- Estado de una cotización
create type quote_status as enum ('pendiente', 'enviada', 'aceptada', 'rechazada');

-- ============================================================
-- Perfiles (extiende auth.users de Supabase)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  nombre text not null,
  email text not null,
  telefono text,
  -- Para doctores
  especialidad text,
  cedula_medica text,
  -- Para hospitales
  hospital_id uuid,
  -- Para pacientes
  cedula text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Hospitales
-- ============================================================
create table hospitales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  zona text,
  provincia text,
  telefono text,
  email_admisiones text,
  whatsapp text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Añadir FK de profiles a hospitales
alter table profiles
  add constraint profiles_hospital_fk
  foreign key (hospital_id) references hospitales(id);

-- ============================================================
-- RFPs (Solicitudes de cotización)
-- ============================================================
create table rfps (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references profiles(id),
  paciente_id uuid references profiles(id),

  -- Datos del procedimiento
  procedimiento text not null,
  especialidad text not null,
  urgencia urgencia_type not null default 'electiva',
  fecha_deseada text,
  notas_clinicas text,
  tags text[],

  -- Datos del paciente (capturados en el momento)
  paciente_nombre text not null,
  paciente_cedula text,

  status rfp_status not null default 'borrador',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Destinos de RFP (qué hospitales reciben cada RFP)
-- ============================================================
create table rfp_hospitales (
  id uuid primary key default gen_random_uuid(),
  rfp_id uuid not null references rfps(id) on delete cascade,
  hospital_id uuid not null references hospitales(id),
  notificado_at timestamptz,
  unique(rfp_id, hospital_id)
);

-- ============================================================
-- Cotizaciones
-- ============================================================
create table cotizaciones (
  id uuid primary key default gen_random_uuid(),
  rfp_id uuid not null references rfps(id) on delete cascade,
  hospital_id uuid not null references hospitales(id),
  admisiones_id uuid references profiles(id),

  precio integer not null, -- en colones
  disponibilidad text not null,
  tiempo_estimado text,
  incluye text[],
  observaciones text,

  status quote_status not null default 'enviada',
  enviada_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Notificaciones
-- ============================================================
create table notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references profiles(id),
  tipo text not null, -- 'nueva_rfp', 'nueva_cotizacion', 'cotizacion_aceptada', etc.
  titulo text not null,
  cuerpo text,
  leida boolean default false,
  rfp_id uuid references rfps(id),
  cotizacion_id uuid references cotizaciones(id),
  created_at timestamptz default now()
);

-- ============================================================
-- Índices
-- ============================================================
create index on rfps(doctor_id);
create index on rfps(status);
create index on rfps(created_at desc);
create index on cotizaciones(rfp_id);
create index on cotizaciones(hospital_id);
create index on notificaciones(usuario_id, leida);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table rfps enable row level security;
alter table rfp_hospitales enable row level security;
alter table cotizaciones enable row level security;
alter table notificaciones enable row level security;
alter table hospitales enable row level security;

-- Profiles: cada usuario ve su propio perfil
create policy "perfil_propio" on profiles
  for all using (auth.uid() = id);

-- Hospitales: lectura pública autenticada
create policy "hospitales_lectura" on hospitales
  for select using (auth.role() = 'authenticated');

-- RFPs: doctores ven las suyas; admisiones ven las de su hospital
create policy "rfps_doctor" on rfps
  for all using (
    auth.uid() = doctor_id
  );

create policy "rfps_admisiones" on rfps
  for select using (
    exists (
      select 1 from profiles p
      join rfp_hospitales rh on rh.rfp_id = rfps.id
      where p.id = auth.uid()
        and p.role = 'admisiones'
        and rh.hospital_id = p.hospital_id
    )
  );

create policy "rfps_paciente" on rfps
  for select using (auth.uid() = paciente_id);

-- Cotizaciones
create policy "cotizaciones_hospital" on cotizaciones
  for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.hospital_id = cotizaciones.hospital_id
    )
  );

create policy "cotizaciones_doctor" on cotizaciones
  for select using (
    exists (
      select 1 from rfps r
      where r.id = cotizaciones.rfp_id
        and r.doctor_id = auth.uid()
    )
  );

create policy "cotizaciones_paciente" on cotizaciones
  for select using (
    exists (
      select 1 from rfps r
      where r.id = cotizaciones.rfp_id
        and r.paciente_id = auth.uid()
    )
  );

-- Notificaciones: cada usuario ve las suyas
create policy "notificaciones_propias" on notificaciones
  for all using (auth.uid() = usuario_id);

-- ============================================================
-- Función: actualizar updated_at automáticamente
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger rfps_updated_at before update on rfps
  for each row execute function handle_updated_at();

create trigger cotizaciones_updated_at before update on cotizaciones
  for each row execute function handle_updated_at();

-- ============================================================
-- Datos de ejemplo (hospitales)
-- ============================================================
insert into hospitales (nombre, zona, provincia, email_admisiones, whatsapp) values
  ('Hospital La Católica', 'La Uruca', 'San José', 'admisiones@lacatolica.com', '+50688880001'),
  ('CIMA San José', 'Escazú', 'San José', 'admisiones@cimasanjose.com', '+50688880002'),
  ('Clínica Bíblica', 'Paso Ancho', 'San José', 'admisiones@clinicabiblica.com', '+50688880003'),
  ('Hospital Metropolitano', 'Sabanilla', 'San José', 'admisiones@metropol.com', '+50688880004'),
  ('Hospital Bíblico', 'Centro', 'San José', 'admisiones@hospitalbiblico.com', '+50688880005');
