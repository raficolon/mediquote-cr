# MediQuote CR

Plataforma de cotizaciones médicas para Costa Rica.  
Stack: **Next.js 14 · Supabase · Tailwind CSS · TypeScript**

---

## Flujo de la aplicación

```
Doctor crea RFP → Hospitales reciben notificación (WhatsApp + app)
→ Admisiones cotiza o rechaza → Doctor ve comparación
→ Doctor envía opciones al paciente → Paciente elige → Todos notificados
```

## Estructura del proyecto

```
src/
├── app/
│   ├── auth/
│   │   ├── login/          # Página de ingreso
│   │   └── registro/       # Registro con selección de rol
│   ├── dashboard/
│   │   ├── page.tsx        # Redirige según rol
│   │   ├── layout.tsx      # Shell con TopBar
│   │   ├── doctor/         # Dashboard del médico
│   │   ├── admisiones/     # Dashboard del hospital
│   │   ├── paciente/       # Dashboard del paciente
│   │   └── notificaciones/ # Centro de notificaciones
│   ├── rfp/
│   │   ├── nueva/          # Formulario nueva RFP (doctor)
│   │   └── [id]/           # Detalle RFP + comparar cotizaciones
│   ├── quotes/
│   │   └── responder/[id]/ # Cotizar o rechazar (admisiones)
│   ├── paciente/
│   │   └── [id]/           # Ver y aceptar cotizaciones (paciente)
│   └── api/
│       ├── rfp/            # POST crear RFP
│       └── quotes/
│           ├── route.ts    # POST enviar cotización
│           ├── aceptar/    # POST aceptar cotización
│           └── rechazar/   # POST rechazar RFP
├── components/
│   └── layout/TopBar.tsx
├── lib/
│   ├── db.ts               # Todas las queries a Supabase
│   └── supabase/
│       ├── client.ts       # Cliente browser
│       └── server.ts       # Cliente server (SSR)
├── types/index.ts          # Tipos TypeScript
└── middleware.ts           # Protección de rutas por auth
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## Configuración paso a paso

### 1. Crear proyecto en Supabase

1. Ir a [app.supabase.com](https://app.supabase.com) y crear un proyecto nuevo
2. Copiar las credenciales: **Project URL** y **anon key**

### 2. Aplicar el esquema de base de datos

En el **SQL Editor** de Supabase, ejecutar el contenido de:
```
supabase/migrations/001_initial_schema.sql
```

Esto creará todas las tablas, políticas RLS, índices y datos de ejemplo de hospitales.

### 3. Instalar y configurar el proyecto

```bash
# Clonar / descomprimir el proyecto
cd mediquote-cr

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.local.example .env.local
# Editar .env.local con sus credenciales de Supabase
```

### 4. Correr en desarrollo

```bash
npm run dev
# → http://localhost:3000
```

### 5. Crear usuarios de prueba

En Supabase → **Authentication → Users → Add user**, cree tres usuarios:

| Email | Contraseña | Rol a seleccionar en registro |
|-------|-----------|-------------------------------|
| doctor@test.com | Test1234! | Médico |
| admisiones@test.com | Test1234! | Hospital — Admisiones |
| paciente@test.com | Test1234! | Paciente |

Luego complete el registro de cada uno en `/auth/registro` para crear su perfil.

---

## Deploy en Vercel (recomendado)

```bash
npm install -g vercel
vercel
```

Agregar las variables de entorno en el dashboard de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Próximas funcionalidades sugeridas

- [ ] Integración real con WhatsApp Business API (Twilio o Meta)
- [ ] Realtime con Supabase Realtime (notificaciones sin recargar)
- [ ] Subida de documentos clínicos adjuntos a la RFP
- [ ] Historial de paciente (múltiples procedimientos)
- [ ] Panel de métricas para hospitales (tasa de aceptación, precio promedio)
- [ ] Exportar cotizaciones a PDF para el paciente
- [ ] Onboarding guiado para nuevos médicos
