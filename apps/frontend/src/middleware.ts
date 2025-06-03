import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Configuración global de autenticación
 * DISABLED_AUTH: Si es 'true', desactiva completamente la autenticación (útil para desarrollo)
 *
 * Opciones de configuración:
 * - Puede establecerse a 'true' durante desarrollo para omitir verificaciones de autenticación
 * - En producción debe ser 'false' para garantizar la seguridad
 * - Se configura mediante la variable DISABLED_AUTH en el archivo .env
 */
const DISABLED_AUTH = process.env.DISABLED_AUTH === 'true'
const LOG_PREFIX = '[Middleware]'

/**
 * Define las rutas que son accesibles sin autenticación
 * @param pathname La ruta actual de la solicitud
 * @returns true si la ruta es pública, false si requiere autenticación
 *
 * Configuración:
 * - Añadir o quitar rutas del array para modificar qué páginas son públicas
 * - Para añadir una nueva ruta pública, simplemente agregar su path al array 'publicPaths'
 * - El método startsWith permite acceder a cualquier ruta que comience con el path especificado
 * - Por ejemplo, '/auth/login' permite acceso a '/auth/login/reset', '/auth/login/forgot', etc.
 */
function isPublicPath(pathname: string): boolean {
  // Puede modificarse este array para incluir más rutas públicas según necesidades del proyecto
  const publicPaths = ['/auth/login', '/auth/error', '/static', '/images']
  return publicPaths.some((path) => pathname.startsWith(path))
}

/**
 * Obtiene el token de acceso de las cookies
 * @param request La solicitud entrante
 * @returns El token de acceso o undefined si no existe
 *
 * Configuración:
 * - Se puede modificar el nombre de la cookie ('refresh_token') según la implementación de autenticación
 * - Permite adaptarse a diferentes sistemas de gestión de tokens (JWT, OAuth, etc.)
 * - Para cambiar el mecanismo de autenticación, modificar esta función para obtener el token
 *   de otras fuentes (headers, localStorage, etc.)
 */
function getAccessToken(request: NextRequest): string | undefined {
  // Para cambiar el tipo de token, modificar el nombre de la cookie aquí
  return request.cookies.get('refresh_token')?.value
}

/**
 * Maneja el acceso a rutas públicas
 * Si el usuario ya está autenticado, lo redirige al home
 * @param request La solicitud entrante
 * @param accessToken El token de acceso del usuario (si existe)
 * @returns Respuesta apropiada según el estado de autenticación
 *
 * Configuración:
 * - Se puede modificar la redirección para llevar al usuario a una página diferente
 * - Útil para implementar diferentes flujos de usuario según el estado de autenticación
 */
function handlePublicPath(request: NextRequest, accessToken?: string) {
  if (accessToken) {
    console.log(`${LOG_PREFIX} Usuario ya autenticado accediendo a ruta pública: ${request.nextUrl.pathname}`)
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

/**
 * Maneja el acceso a rutas protegidas
 * Si el usuario no está autenticado, lo redirige a login
 * @param request La solicitud entrante
 * @param accessToken El token de acceso del usuario (si existe)
 * @returns Respuesta apropiada según el estado de autenticación
 *
 * Configuración:
 * - Se puede modificar la URL de redirección para cambiar dónde se envían usuarios no autenticados
 * - Puede extenderse para validar permisos específicos o verificar la validez del token
 * - Útil para implementar lógicas de autorización más complejas
 */
function handleProtectedPath(request: NextRequest, accessToken?: string) {
  if (!accessToken) {
    console.log(`${LOG_PREFIX} Acceso denegado a ruta protegida: ${request.nextUrl.pathname}, token no encontrado`)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  return NextResponse.next()
}

/**
 * Función principal del middleware que intercepta todas las solicitudes
 * y aplica la lógica de autenticación correspondiente
 * @param request La solicitud entrante
 * @returns Respuesta apropiada según las reglas de autenticación
 */
export async function middleware(request: NextRequest) {
  try {
    // Si la autenticación está deshabilitada, permite el acceso a todas las rutas
    if (DISABLED_AUTH) {
      console.log(`${LOG_PREFIX} Autenticación deshabilitada, permitiendo acceso a: ${request.nextUrl.pathname}`)
      return NextResponse.next()
    }

    const pathname = request.nextUrl.pathname
    const accessToken = getAccessToken(request)

    // Log para depuración
    console.log(`${LOG_PREFIX} Verificando acceso a: ${pathname}, token presente: ${!!accessToken}`)

    // Manejo de rutas públicas
    if (isPublicPath(pathname)) {
      return handlePublicPath(request, accessToken)
    }

    /**
     * Lógica específica para la selección de rol
     * Si el usuario ya seleccionó un rol, lo redirige al home
     *
     * Configuración: Se puede extender para incluir verificaciones de roles
     * o permisos específicos para diferentes rutas
     */
    if (pathname === '/auth/select-role') {
      const selectedRole = request.cookies.get('selected_role')?.value
      if (selectedRole && accessToken) {
        console.log(`${LOG_PREFIX} Usuario ya tiene rol seleccionado, redirigiendo al home`)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Por defecto, trata todas las demás rutas como protegidas
    return handleProtectedPath(request, accessToken)
  } catch (error) {
    console.error(`${LOG_PREFIX} Error en middleware:`, error)
    return NextResponse.redirect(new URL('/auth/error?reason=middleware_error', request.url))
  }
}

/**
 * Configuración del middleware - define en qué rutas se ejecutará
 *
 * Configuración:
 * - El patrón actual excluye archivos estáticos, API, imágenes, etc.
 * - Se puede modificar para incluir o excluir rutas específicas
 * - Formato: array de patrones regex o strings para hacer match con rutas
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/).*)']
}
