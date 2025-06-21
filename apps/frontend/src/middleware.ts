import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { Logger } from './utils'

// DEV temporal for testing purposes
const DISABLED_AUTH = process.env.DISABLED_AUTH === 'true'
const DISABLED_ROLES = process.env.DISABLED_ROLES === 'true'

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/error',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/assets',
    '/api/auth'
  ]

  return publicPaths.some((path) => pathname.startsWith(path))
}

function getAccessToken(request: NextRequest): boolean {
  try {
    return request.cookies.has('auth_token')
  } catch {
    return false
  }
}

function getActiveRoleId(request: NextRequest): string | undefined {
  try {
    return request.cookies.get('user_active_role_id')?.value
  } catch {
    return undefined
  }
}

function handlePublicPath(request: NextRequest, hasAccessToken: boolean = false) {
  const pathname = request.nextUrl.pathname

  if (hasAccessToken && pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

function handleProtectedPath(request: NextRequest, hasAccessToken: boolean = false, activeRoleId?: string) {
  try {
    if (!hasAccessToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (DISABLED_ROLES) {
      return NextResponse.next()
    }

    // Verificar si viene de la página de selección de roles
    const referer = request.headers.get('referer')
    const isComingFromRoleSelection = referer?.includes('/auth/select-role')

    if (!activeRoleId && !request.nextUrl.pathname.startsWith('/auth/select-role')) {
      // Si viene de selección de roles, dar una segunda oportunidad
      if (isComingFromRoleSelection) {
        const roleIdRetry = request.cookies.get('user_active_role_id')?.value
        if (roleIdRetry) {
          return NextResponse.next()
        }
      }

      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    Logger.error('[Middleware Error] Error in handleProtectedPath:', error)
    return NextResponse.redirect(new URL('/auth/error?reason=protected-path-error', request.url))
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Permitir archivos estáticos específicos de Next.js y herramientas
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/_next/internal/') || pathname.startsWith('/.well-known/')) {
    return NextResponse.next()
  }

  if (DISABLED_AUTH) {
    return NextResponse.next()
  }

  try {
    const hasAccessToken = getAccessToken(request)
    const activeRoleId = getActiveRoleId(request)

    if (isPublicPath(pathname)) {
      return handlePublicPath(request, hasAccessToken)
    }

    return handleProtectedPath(request, hasAccessToken, activeRoleId)
  } catch (error) {
    Logger.error('[Middleware Error] Unhandled error in middleware:', error)
    return NextResponse.redirect(new URL('/auth/error?reason=middleware-error', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - manifest.json
     * - assets (static assets)
     * - .well-known (Chrome DevTools and other tools)
     */
    '/((?!api/|_next/static/|_next/image/|favicon\\.ico|robots\\.txt|manifest\\.json|assets/|\\.well-known/).*)'
  ]
}
