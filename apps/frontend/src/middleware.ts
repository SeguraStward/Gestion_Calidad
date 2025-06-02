import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Rutas que no requieren autenticación
  const publicPaths = ['/auth/login', '/auth/error']
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Obtener el token desde la cookie
  const accessToken = request.cookies.get('auth_token')?.value

  // Lógica para rutas públicas
  if (isPublicPath) {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (accessToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Para rutas protegidas, verificar si el token existe
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // En lugar de verificar el token en cada solicitud, simplemente confiar en su presencia
  // La verificación real se hará en el componente de nivel superior o en llamadas API específicas
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/).*)']
}
