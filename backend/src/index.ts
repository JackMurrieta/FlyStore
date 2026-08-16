import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import usuarioRoutes from './routes/usuario'
import type { Env } from './services/supabase'

const app = new Hono<{ Bindings: Env }>()

// ============================================
// CORS configurado para cookies
// ============================================
app.use('/*', cors({
  origin: (origin) => {
    // Permitir localhost en desarrollo y tu dominio en producción
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://tu-dominio.com' // Cambia esto por tu dominio real
    ]
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
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

// Autenticación (público)
app.route('/api/auth', authRoutes)

// Usuario (protegido)
app.route('/api/usuario', usuarioRoutes)

// TODO: Montar rutas de pedidos, productos, etc.
// app.route('/api/pedidos', pedidoRoutes)

export default app