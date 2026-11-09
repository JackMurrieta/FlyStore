/**
 * Componente centralizado de íconos para FlyStore
 *
 * IMPORTANTE: Este archivo es la ÚNICA fuente de íconos en el proyecto.
 * - Ningún otro archivo debe importar lucide-react directamente
 * - Cuando se exporten los SVG del Figma, solo se modifica este archivo
 * - Los 51 íconos están definidos en el PROMPT §7.4
 *
 * Patrón: Variaciones protegidas (GRASP)
 */

import {
  Search,
  User,
  ShoppingCart,
  Heart,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Upload,
  Check,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  SlidersHorizontal,
  ArrowUpDown,
  Home,
  Package,
  Clipboard,
  Tag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Pencil,
  Eye,
  RefreshCw,
  Truck,
  File,
  Image,
  Grid,
  Lock,
  Banknote,
  Building2,
  Calendar,
  MoreHorizontal,
  Archive,
  Undo,
  SearchX,
  WifiOff,
  MapPin,
  Bell,
  Ban,
} from 'lucide-react'

/**
 * Ícono personalizado de WhatsApp (SVG personalizado)
 */
function WhatsAppIcon({ size = 24, ...props }: { size?: number; [key: string]: unknown }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.463,3.488C18.217,1.24,15.231,0.001,12.05,0 C5.495,0,0.16,5.334,0.157,11.892c-0.001,2.096,0.547,4.142,1.588,5.946L0.057,24l6.304-1.654 c1.737,0.948,3.693,1.447,5.683,1.448h0.005c6.554,0,11.89-5.335,11.893-11.893C23.944,8.724,22.708,5.735,20.463,3.488z M12.05,21.785h-0.004c-1.774,0-3.513-0.477-5.031-1.378l-0.361-0.214l-3.741,0.981l0.999-3.648l-0.235-0.374 c-0.99-1.574-1.512-3.393-1.511-5.26c0.002-5.45,4.437-9.884,9.889-9.884c2.64,0,5.122,1.03,6.988,2.898 c1.866,1.869,2.893,4.352,2.892,6.993C21.932,17.351,17.498,21.785,12.05,21.785z M17.472,14.382 c-0.297-0.149-1.758-0.868-2.031-0.967c-0.272-0.099-0.47-0.149-0.669,0.148s-0.767,0.967-0.941,1.166 c-0.173,0.198-0.347,0.223-0.644,0.074c-0.297-0.149-1.255-0.462-2.39-1.475c-0.883-0.788-1.48-1.761-1.653-2.059 s-0.018-0.458,0.13-0.606c0.134-0.133,0.297-0.347,0.446-0.521C9.87,9.97,9.919,9.846,10.019,9.647 c0.099-0.198,0.05-0.372-0.025-0.521C9.919,8.978,9.325,7.515,9.078,6.92c-0.241-0.58-0.486-0.501-0.669-0.51 C8.236,6.401,8.038,6.4,7.839,6.4c-0.198,0-0.52,0.074-0.792,0.372c-0.272,0.298-1.04,1.017-1.04,2.479 c0,1.463,1.065,2.876,1.213,3.074c0.148,0.198,2.095,3.2,5.076,4.487c0.709,0.306,1.263,0.489,1.694,0.626 c0.712,0.226,1.36,0.194,1.872,0.118c0.571-0.085,1.758-0.719,2.006-1.413c0.248-0.694,0.248-1.29,0.173-1.413 C17.967,14.605,17.769,14.531,17.472,14.382z"
        />
      </g>
    </svg>
  )
}

/**
 * Ícono personalizado de Instagram (SVG personalizado)
 */
function InstagramIcon({ size = 24, ...props }: { size?: number; [key: string]: unknown }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path d="M12,2.162c3.204,0,3.584,0.012,4.849,0.07c1.308,0.06,2.655,0.358,3.608,1.311c0.962,0.962,1.251,2.296,1.311,3.608 c0.058,1.265,0.07,1.645,0.07,4.849c0,3.204-0.012,3.584-0.07,4.849c-0.059,1.301-0.364,2.661-1.311,3.608 c-0.962,0.962-2.295,1.251-3.608,1.311c-1.265,0.058-1.645,0.07-4.849,0.07s-3.584-0.012-4.849-0.07 c-1.291-0.059-2.669-0.371-3.608-1.311c-0.957-0.957-1.251-2.304-1.311-3.608c-0.058-1.265-0.07-1.645-0.07-4.849 c0-3.204,0.012-3.584,0.07-4.849c0.059-1.296,0.367-2.664,1.311-3.608c0.96-0.96,2.299-1.251,3.608-1.311 C8.416,2.174,8.796,2.162,12,2.162 M12,0C8.741,0,8.332,0.014,7.052,0.072C5.197,0.157,3.355,0.673,2.014,2.014 C0.668,3.36,0.157,5.198,0.072,7.052C0.014,8.332,0,8.741,0,12c0,3.259,0.014,3.668,0.072,4.948c0.085,1.853,0.603,3.7,1.942,5.038 c1.345,1.345,3.186,1.857,5.038,1.942C8.332,23.986,8.741,24,12,24c3.259,0,3.668-0.014,4.948-0.072 c1.854-0.085,3.698-0.602,5.038-1.942c1.347-1.347,1.857-3.184,1.942-5.038C23.986,15.668,24,15.259,24,12 c0-3.259-0.014-3.668-0.072-4.948c-0.085-1.855-0.602-3.698-1.942-5.038c-1.343-1.343-3.189-1.858-5.038-1.942 C15.668,0.014,15.259,0,12,0z" />
        <path d="M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162s6.162-2.759,6.162-6.162 C18.162,8.597,15.403,5.838,12,5.838z M12,16c-2.209,0-4-1.791-4-4s1.791-4,4-4s4,1.791,4,4S14.209,16,12,16z" />
        <circle cx="18.406" cy="5.594" r="1.44" />
      </g>
    </svg>
  )
}

/**
 * Ícono personalizado de Google (SVG personalizado)
 */
function GoogleIcon({ size = 24, ...props }: { size?: number; [key: string]: unknown }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

/**
 * Nombres de los 54 íconos disponibles (según PROMPT §7.4 + personalizados)
 */
export type NombreIcono =
  | 'search'
  | 'user'
  | 'cart'
  | 'heart'
  | 'menu'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-right'
  | 'x'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'copy'
  | 'upload'
  | 'check'
  | 'check-circle'
  | 'alert-triangle'
  | 'alert-circle'
  | 'info'
  | 'clock'
  | 'sliders'
  | 'sort'
  | 'home'
  | 'package'
  | 'clipboard'
  | 'tag'
  | 'users'
  | 'chart'
  | 'settings'
  | 'logout'
  | 'pencil'
  | 'eye'
  | 'refresh'
  | 'truck'
  | 'file'
  | 'image'
  | 'grid'
  | 'whatsapp'
  | 'instagram'
  | 'google'
  | 'lock'
  | 'cash'
  | 'bank'
  | 'calendar'
  | 'more'
  | 'archive'
  | 'undo'
  | 'search-x'
  | 'wifi-off'
  | 'pin'
  | 'bell'
  | 'ban'

export interface IconoProps {
  readonly nombre: NombreIcono
  readonly tamano?: number
  readonly className?: string
  readonly 'aria-label'?: string
}

/**
 * Mapeo de nombres a componentes de lucide-react o SVG personalizados
 * NOTA: Los iconos de marca (whatsapp, instagram, google) usan SVG personalizados
 */
const ICONOS_MAP = {
  search: Search,
  user: User,
  cart: ShoppingCart,
  heart: Heart,
  menu: Menu,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'arrow-right': ArrowRight,
  x: X,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  copy: Copy,
  upload: Upload,
  check: Check,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  info: Info,
  clock: Clock,
  sliders: SlidersHorizontal,
  sort: ArrowUpDown,
  home: Home,
  package: Package,
  clipboard: Clipboard,
  tag: Tag,
  users: Users,
  chart: BarChart3,
  settings: Settings,
  logout: LogOut,
  pencil: Pencil,
  eye: Eye,
  refresh: RefreshCw,
  truck: Truck,
  file: File,
  image: Image,
  grid: Grid,
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  google: GoogleIcon,
  lock: Lock,
  cash: Banknote,
  bank: Building2,
  calendar: Calendar,
  more: MoreHorizontal,
  archive: Archive,
  undo: Undo,
  'search-x': SearchX,
  'wifi-off': WifiOff,
  pin: MapPin,
  bell: Bell,
  ban: Ban,
} as const

/**
 * Componente de ícono
 *
 * @example
 * <Icono nombre="user" />
 * <Icono nombre="alert-circle" tamano={20} aria-label="Error" />
 */
export function Icono({ nombre, tamano = 24, className = '', ...props }: IconoProps) {
  const IconoComponente = ICONOS_MAP[nombre]

  if (!IconoComponente) {
    console.warn(`Ícono "${nombre}" no encontrado`)
    return null
  }

  return (
    <IconoComponente
      size={tamano}
      strokeWidth={1.75}
      className={className}
      aria-hidden={!props['aria-label']}
      {...props}
    />
  )
}
