# Scheduler

Plataforma de agendamiento con Next.js, Prisma, PostgreSQL y React Query.

## Requisitos

- **Node.js** 20 o superior
- **npm** 10+
- **PostgreSQL local**, usando una de estas opciones:
  - **Docker + Docker Compose** (recomendado)
  - **Prisma Dev** (alternativa sin Docker)
- **openssl** (solo si quieres generar tu propio `AUTH_SECRET`)

## Características

- **Login** con email/contraseña y Google OAuth
- **Calendario** con vistas mes/semana/día y CRUD completo de eventos
- **Reserva pública** en `/book/[calendarId]` sin necesidad de login
- **Disponibilidad** configurable por día y rango horario
- **Slots** de duración configurable (15–120 min)
- **Notas tipo chat** por evento (dueño e invitado)
- **Pagos** — módulo placeholder listo para Stripe/PayPal/Mercado Pago

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma + PostgreSQL
- NextAuth v5 (Auth.js)
- TanStack React Query
- react-big-calendar

---

## Compilar y correr en local

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd scheduler
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Variables necesarias:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL (ver sección de base de datos) |
| `AUTH_SECRET` | Secreto para firmar sesiones de NextAuth |
| `AUTH_URL` | URL de la app (`http://localhost:3000` en local) |
| `GOOGLE_CLIENT_ID` | Opcional — solo para login con Google |
| `GOOGLE_CLIENT_SECRET` | Opcional — solo para login con Google |

#### Generar `AUTH_SECRET`

```bash
openssl rand -base64 32
```

Pega el resultado en `.env`:

```env
AUTH_SECRET="tu-secreto-generado"
```

> El login con email/contraseña funciona sin configurar Google OAuth.

---

### 3. Base de datos local

Elige **una** de las dos opciones:

#### Opción A — Docker (recomendado)

**a) Permisos de Docker (WSL/Linux)**

Si ves `permission denied` al usar Docker:

```bash
sudo usermod -aG docker $USER
newgrp docker   # o cierra y reabre la terminal
```

**b) Levantar PostgreSQL**

```bash
npm run db:up
```

Esto inicia Postgres 16 en el puerto `5432` con:

| Campo | Valor |
|-------|-------|
| Usuario | `postgres` |
| Contraseña | `postgres` |
| Base de datos | `scheduler` |

**c) Configura `.env`**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scheduler?schema=public"
```

**d) Aplica migraciones**

```bash
npm run db:migrate:deploy
```

**Atajo completo:**

```bash
npm run setup:local
```

---

#### Opción B — Prisma Dev (sin Docker)

Útil si no tienes Docker disponible.

**a) Inicia el servidor embebido de Postgres**

```bash
npm run db:prisma-dev
```

El comando imprime una URL similar a:

```text
postgres://postgres:postgres@localhost:51214/template1?sslmode=disable
```

**b) Configura `.env` con esa URL** (usa el puerto que te muestre el comando):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable"
```

**c) Aplica migraciones**

```bash
npm run db:migrate:deploy
```

> **No uses `db:push` con Prisma Dev** si tienes `npm run dev` corriendo — puede fallar con `prepared statement "s3" already exists`. Prefiere siempre `db:migrate:deploy`.

---

### 4. Generar cliente Prisma

```bash
npm run db:generate
```

> `npm run build` ya ejecuta este paso automáticamente.

### 5. Modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Flujo sugerido para probar:

1. Regístrate en `/register`
2. Configura disponibilidad en `/dashboard/availability`
3. Copia el enlace de reserva desde el dashboard
4. Abre `/book/[calendarId]` en otra ventana para simular un visitante

### 6. Compilar para producción

```bash
npm run build
npm run start
```

---

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera Prisma Client y compila Next.js |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run db:up` | Levanta PostgreSQL con Docker |
| `npm run db:down` | Detiene PostgreSQL |
| `npm run db:prisma-dev` | Levanta Postgres embebido (sin Docker) |
| `npm run db:prisma-dev:stop` | Detiene Prisma Dev |
| `npm run db:prisma-dev:restart` | Reinicia Prisma Dev |
| `npm run db:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run db:migrate:deploy` | Aplica migraciones existentes (recomendado) |
| `npm run db:push` | Sincroniza schema sin migración (evitar con Prisma Dev) |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run setup:local` | `db:up` + `db:migrate:deploy` |

---

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/register` | Crear cuenta |
| `/login` | Iniciar sesión |
| `/dashboard` | Calendario del dueño (protegido) |
| `/dashboard/availability` | Configurar horarios |
| `/dashboard/settings` | Título, slots, zona horaria |
| `/book/[calendarId]` | Reserva pública |

---

## Google OAuth (opcional)

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Configura OAuth 2.0 con redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Copia Client ID y Secret a `.env`:

```env
GOOGLE_CLIENT_ID="tu-client-id"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

---

## Solución de problemas

### `permission denied` con Docker

```bash
sudo usermod -aG docker $USER
newgrp docker
docker compose ps
```

### Puerto 5432 ocupado

Cambia el mapeo en `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

Y actualiza `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scheduler?schema=public"
```

### `prepared statement "s3" already exists` (Prisma Dev)

Ocurre cuando Prisma Dev tiene conexiones activas (por ejemplo, con `npm run dev` abierto) y ejecutas `db:push`.

**Solución:**

```bash
# 1. Detén el servidor de Next.js (Ctrl+C)
npm run db:prisma-dev:restart

# 2. Usa migraciones en lugar de db:push
npm run db:migrate:deploy
```

Si el esquema ya existía por un `db:push` anterior y falla la migración inicial:

```bash
npx prisma migrate resolve --applied 20260716135700_init
npm run db:migrate:deploy
```

### Error de conexión a la base de datos

```bash
# Docker
docker compose ps
npm run db:down && npm run db:up

# Prisma Dev
npm run db:prisma-dev
```

### `AUTH_SECRET` faltante

```bash
openssl rand -base64 32
```

Pega el valor en `.env` y reinicia `npm run dev`.

---

## Pagos (futuro)

El módulo en `src/lib/payments/` expone `createPayment`, `confirmPayment` y `refundPayment` como stubs. La API `/api/payments` devuelve el estado del placeholder.

## Estructura

```
prisma/
├── schema.prisma
└── migrations/       # Migraciones versionadas
src/
├── app/
│   ├── api/          # REST endpoints
│   ├── book/         # Reserva pública
│   └── dashboard/    # Panel del dueño
├── components/
├── hooks/
├── lib/
│   └── payments/     # Placeholder pagos
└── generated/prisma/ # Cliente Prisma (generado)
docker-compose.yml    # PostgreSQL local
```
