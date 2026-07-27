# FLY Store

E-commerce de moda y lifestyle con estética dark/luxury, construido con React 19 + TypeScript + Vite y Supabase como backend.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) |
| Routing | React Router DOM v6 |
| Estilos | CSS puro + variables CSS globales |
| Tipografías | Cormorant Garamond (display), Montserrat (body) |

---

## Estructura del proyecto

```
FlyStore/src/
│
├── models/
│   └── DTO/
│       ├── LoginDto.ts          # { correo, pin }
│       └── RegisterDto.ts       # { nombre, telefono, direccion, correo, pin }
│
├── services/
│   ├── supabase.ts              # Cliente Supabase (env vars)
│   └── authService.ts           # login, register, loginWithGoogle, logout
│
├── hooks/
│   └── auth/
│       └── useAuth.ts           # Hook: estado de sesión + wrapping del service
│
├── components/
│   ├── header/
│   │   ├── header.tsx           # Barra superior sticky con logo 3D, carrito, perfil
│   │   └── header.css
│   ├── navbar/
│   │   ├── navbar.tsx           # Drawer slide-out + Bottom nav mobile
│   │   └── navbar.css
│   └── footer/
│       └── footer.tsx           # (pendiente)
│
├── pages/
│   └── auth/
│       ├── login.tsx            # Página login/registro con Google OAuth
│       └── login.css
│
├── routes/
│   └── appRoutes.tsx            # createBrowserRouter: / y /login
│
├── App.tsx                      # Layout: Header + Navbar + <Outlet />
├── main.tsx                     # Entry point con <RouterProvider />
└── index.css                    # Variables CSS globales, reset, tema dark
```

---

## Variables CSS globales (`index.css`)

```css
--bg: #000          /* fondo principal */
--bg2: #060606      /* fondo tarjetas */
--bg3: #0a0a0a
--gold: #D4AF37     /* acento luxury */
--border: rgba(255,255,255,.09)
--wa: #25D366       /* WhatsApp */
--red: #e74c3c
--fd: 'Cormorant Garamond', serif
--fb: 'Montserrat', sans-serif
```

---

## Rutas

| Path | Componente | Descripción |
|---|---|---|
| `/` | `App` + `<Outlet>` | Layout principal (Header + Navbar) |
| `/login` | `LoginPage` | Formulario standalone sin layout |

---

## Autenticación

### Modelos (`src/models/DTO/`)

```typescript
// LoginDto.ts
interface LoginDto {
  correo: string
  pin: string
}

// RegisterDto.ts
interface RegisterDto {
  nombre: string
  telefono: string
  direccion: string
  correo: string
  pin: string
}
```

### Servicio (`src/services/authService.ts`)

Conectado directamente a Supabase Auth. Lanza `Error` con mensajes en español para que el hook los capture.

| Función | Descripción |
|---|---|
| `login({ correo, pin })` | `signInWithPassword` |
| `register({ nombre, telefono, direccion, correo, pin })` | `signUp` + guarda metadata |
| `loginWithGoogle()` | `signInWithOAuth` con redirect a `window.location.origin` |
| `logout()` | `signOut` |

`register` devuelve `'ok'` si la sesión está activa o `'confirm_email'` si Supabase requiere confirmación. También detecta el caso silencioso donde el correo ya existe (`identities: []`).

`mapError()` usa `error.code` (SDK v2) con fallback a `error.message` para cubrir versiones anteriores.

### Hook (`src/hooks/auth/useAuth.ts`)

Envuelve el service con manejo de errores y estado reactivo.

```typescript
const {
  user,           // AuthUser | null
  loading,        // carga inicial de sesión
  submitting,     // acción en progreso
  error,          // mensaje de error en español
  registerResult, // 'ok' | 'confirm_email' | null
  clearError,
  login,
  register,
  loginWithGoogle,
  logout,
} = useAuth()
```

`AuthUser`:
```typescript
interface AuthUser {
  id: string
  correo: string
  nombre: string
  telefono: string
  direccion: string
}
```

Los campos `nombre`, `telefono` y `direccion` se almacenan en `user_metadata` de Supabase y se mapean con `fromSupabase(user)`.

### Página de login (`src/pages/auth/login.tsx`)

- Alterna entre modo `'login'` y `'register'` con `key={mode}` (fade animation al cambiar)
- En registro: avatar circular que muestra iniciales al escribir el nombre
- Google OAuth: botón con separador "o" sobre el formulario
- Cuando `registerResult === 'confirm_email'` → pantalla de confirmación con el correo enviado
- Todos los errores vienen del hook (sin estado local de error/loading)

---

## Navbar

Drawer slide-out desde la izquierda + bottom navigation bar en mobile.

| Item | Acción |
|---|---|
| Inicio, FLY Essence, Caps, Clothes, Shoes | `onNavigate(id)` — sección |
| Mi perfil | `navigate('/login')` — ruta |
| Favoritos, Mis pedidos | `onNavigate(id)` — sección |
| WhatsApp | `onNavigate('whatsapp')` |
| Bottom nav → Cuenta | `navigate('/login')` |

**Diseño:**
- Overlay con `backdrop-filter: blur(6px)`
- Transición `cubic-bezier(.4,0,.2,1)` en el drawer
- Indicador activo: línea `var(--gold)` con glow lateral (inspirado en alzaid-superadmin)
- Secciones con labels `letter-spacing: 3px` (inspirado en FlyZIP)
- Bottom nav visible en `max-width: 767px` con `safe-area-inset-bottom` para notch

---

## Variables de entorno

Crear `FlyStore/.env.local`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## Comandos

```bash
# Desarrollo
npm run dev

# Type-check
npx tsc --noEmit

# Build (requiere reinstalar deps si falla rolldown en Windows)
npm run build

# Fix rolldown en Windows (bug npm + dependencias opcionales)
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

## Pendiente

- [ ] Páginas de categorías (Essence, Caps, Clothes, Shoes)
- [ ] Página de perfil (`/profile`)
- [ ] Página de favoritos y pedidos
- [ ] Footer component
- [ ] Integración carrito con Supabase
- [ ] Protección de rutas (redirect a `/login` si no autenticado)
