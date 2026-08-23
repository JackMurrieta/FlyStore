import type {
  LoginDto,
  RegisterDto,
  LoginResponse,
  SessionResponse,
  RefreshResponse,
  RegisterResult,
  DireccionDetallada,
} from '../types';
import { serializeDireccion } from '../types';

// URL de tu backend (configúrala en .env.local)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Re-exportar para retrocompatibilidad
export type { RegisterResult };

/**
 * Opciones de configuración para las peticiones HTTP
 */
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean; // Si requiere autenticación (por defecto: true)
}

/**
 * Cliente HTTP para comunicarse con el backend
 * Usa HTTP-only cookies para autenticación automática
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  // Preparar headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // NO necesitas agregar Authorization header manualmente
  // Las cookies se envían automáticamente con credentials: 'include'

  // Hacer la petición
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // IMPORTANTE: Envía cookies automáticamente
  });

  // Manejo de errores
  if (!response.ok) {
    // Token expirado o inválido
    if (response.status === 401) {
      // Intentar refrescar la sesión
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Reintentar la petición original
        return apiRequest<T>(endpoint, options);
      } else {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }
    }

    // Otros errores
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  // Respuesta exitosa
  return response.json();
}

/**
 * API Endpoints organizados por dominio
 */
export const api = {
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  auth: {
    /**
     * Iniciar sesión con email y contraseña
     */
    login: async (dto: LoginDto): Promise<LoginResponse> => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dto)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      return response.json();
    },

    /**
     * Registrar nuevo usuario
     */
    register: async (dto: RegisterDto): Promise<RegisterResult> => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dto)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al registrarse');
      }

      const data = await response.json();
      return data.requiresEmailConfirmation ? 'confirm_email' : 'ok';
    },

    /**
     * Iniciar sesión con Google
     */
    loginWithGoogle: async (): Promise<void> => {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error con Google');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirige a Google OAuth
      }
    },

    /**
     * Obtener sesión actual
     */
    getSession: async (): Promise<SessionResponse> => {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        credentials: 'include'
      });

      if (!response.ok) {
        return { user: null };
      }

      return response.json();
    },

    /**
     * Refrescar token de sesión
     */
    refresh: async (): Promise<RefreshResponse> => {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al refrescar sesión');
      }

      return response.json();
    },

    /**
     * Cerrar sesión
     */
    logout: async (): Promise<void> => {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    },
  },
  // ============================================
  // USUARIO - Gestión de perfil
  // ============================================
  usuario: {
    /**
     * Actualizar nombre del usuario
     */
    updateNombre: (nombre: string) =>
      apiRequest('/api/usuario/nombre', {
        method: 'PUT',
        body: JSON.stringify({ nombre }),
      }),

    /**
     * Actualizar dirección del usuario (como string)
     */
    updateDireccion: (direccion: string) =>
      apiRequest('/api/usuario/direccion', {
        method: 'PUT',
        body: JSON.stringify({ direccion }),
      }),

    /**
     * Actualizar dirección completa del usuario (objeto detallado)
     */
    updateDireccionDetallada: (direccion: DireccionDetallada) => {
      const direccionString = serializeDireccion(direccion);

      return apiRequest('/api/usuario/direccion', {
        method: 'PUT',
        body: JSON.stringify({ direccion: direccionString }),
      });
    },

    /**
     * Actualizar teléfono del usuario
     */
    updateTelefono: (telefono: string) =>
      apiRequest('/api/usuario/telefono', {
        method: 'PUT',
        body: JSON.stringify({ telefono }),
      }),

    /**
     * Obtener perfil completo del usuario
     */
    getProfile: () =>
      apiRequest('/api/usuario/perfil'),
  },

  // ============================================
  // PEDIDOS - Gestión de órdenes
  // ============================================
  pedidos: {
    /**
     * Crear un nuevo pedido
     */
    create: (pedidoData: any) =>
      apiRequest('/pedidos', {
        method: 'POST',
        body: JSON.stringify(pedidoData),
      }),

    /**
     * Obtener todos los pedidos del usuario
     */
    getAll: () =>
      apiRequest('/pedidos'),

    /**
     * Obtener un pedido específico por ID
     */
    getById: (id: string) =>
      apiRequest(`/pedidos/${id}`),

    /**
     * Cancelar un pedido
     */
    cancel: (id: string) =>
      apiRequest(`/pedidos/${id}/cancelar`, {
        method: 'PUT',
      }),
  },

  // ============================================
  // FAVORITOS - Productos guardados
  // ============================================
  favoritos: {
    /**
     * Obtener todos los favoritos del usuario
     */
    getAll: () =>
      apiRequest('/favoritos'),

    /**
     * Agregar producto a favoritos
     */
    add: (productoId: string) =>
      apiRequest('/favoritos', {
        method: 'POST',
        body: JSON.stringify({ productoId }),
      }),

    /**
     * Remover producto de favoritos
     */
    remove: (productoId: string) =>
      apiRequest(`/favoritos/${productoId}`, {
        method: 'DELETE',
      }),
  },

  // ============================================
  // CARRITO - Gestión del carrito de compras
  // ============================================
  carrito: {
    /**
     * Obtener carrito del usuario
     */
    get: () =>
      apiRequest('/carrito'),

    /**
     * Agregar producto al carrito
     */
    addItem: (productoId: string, cantidad: number) =>
      apiRequest('/carrito/items', {
        method: 'POST',
        body: JSON.stringify({ productoId, cantidad }),
      }),

    /**
     * Actualizar cantidad de un producto
     */
    updateItem: (itemId: string, cantidad: number) =>
      apiRequest(`/carrito/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ cantidad }),
      }),

    /**
     * Remover producto del carrito
     */
    removeItem: (itemId: string) =>
      apiRequest(`/carrito/items/${itemId}`, {
        method: 'DELETE',
      }),

    /**
     * Limpiar todo el carrito
     */
    clear: () =>
      apiRequest('/carrito', {
        method: 'DELETE',
      }),
  },

  // ============================================
  // PRODUCTOS - Consultas públicas y privadas
  // ============================================
  productos: {
    /**
     * Obtener todos los productos (público)
     */
    getAll: (categoria?: string) =>
      apiRequest(`/productos${categoria ? `?categoria=${categoria}` : ''}`, {
        requiresAuth: false, // No requiere autenticación
      }),

    /**
     * Obtener producto por ID (público)
     */
    getById: (id: string) =>
      apiRequest(`/productos/${id}`, {
        requiresAuth: false,
      }),

    /**
     * Buscar productos (público)
     */
    search: (query: string) =>
      apiRequest(`/productos/buscar?q=${encodeURIComponent(query)}`, {
        requiresAuth: false,
      }),
  },
};

/**
 * Helper para manejar errores de API de forma consistente
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
}
