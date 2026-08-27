import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import usuarioRoutes from './routes/usuario'
import flycapsRoutes from './routes/catalogo/flycaps'
import adminProductosRoutes from './routes/admin/productos'
import publicProductosRoutes from './routes/public/productos'
import type { Env } from './services/supabase'

const app = new Hono<{ Bindings: Env }>()

// ============================================
// CORS configurado para cookies
// ============================================
app.use('/*', cors({
  origin: (origin) => {
    // Permitir localhost en desarrollo y dominios de producción
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      // Frontend en Cloudflare Workers (conectado con GitHub)
      'https://flystore.flycontact555.workers.dev',
      // Dominio final (cuando esté listo)
      'https://flystore.mx',
      'https://www.flystore.mx'
    ]

    // Si el origen está en la lista, permitirlo
    if (origin && allowedOrigins.includes(origin)) {
      return origin
    }

    // En desarrollo, permitir cualquier origen localhost
    if (origin && origin.includes('localhost')) {
      return origin
    }

    // Por defecto, retornar el primer origen permitido
    return allowedOrigins[0]
  },
  credentials: true, // IMPORTANTE: Permite envío de cookies
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight por 24 horas
}))

// ============================================
// Rutas
// ============================================
app.get('/', (c) => c.text('FlyStore backend OK'))

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================
app.route('/api/auth', authRoutes)
app.route('/api/public/productos', publicProductosRoutes)

// ============================================
// RUTAS PROTEGIDAS - CLIENTES
// ============================================
app.route('/api/usuario', usuarioRoutes)

// ============================================
// RUTAS PROTEGIDAS - ADMIN
// ============================================
app.route('/api/admin/productos', adminProductosRoutes)
app.route('/api/admin/catalogo/flycaps', flycapsRoutes)

// TODO: Más rutas admin
// app.route('/api/admin/pedidos', adminPedidosRoutes)
// app.route('/api/admin/usuarios', adminUsuariosRoutes)

export default app