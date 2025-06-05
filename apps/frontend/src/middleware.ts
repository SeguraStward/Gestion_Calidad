import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DISABLED_AUTH = process.env.DISABLED_AUTH == 'true'
const DISABLED_ROLES = process.env.DISABLED_ROLES == 'true'
const DEBUG = process.env.DEBUG === 'true'

function logDebug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Middleware Debug] ${message}`, data ? data : '')
  }
}

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/auth/login', '/auth/error']
  const isPublic = publicPaths.some((path) => pathname.startsWith(path))
  logDebug(`Checking if path is public: ${pathname}`, { isPublic })
  return isPublic
}

function getAccessToken(request: NextRequest): string | undefined {
  try {
    const token = request.cookies.get('auth_token')?.value
    logDebug('Access token retrieved', { hasToken: !!token })
    return token
  } catch (error) {
    console.error('[Middleware Error] Failed to get access token:', error)
    return undefined
  }
}

function getSelectedRoleId(request: NextRequest): string | undefined {
  try {
    const roleId = request.cookies.get('active_role_id')?.value
    logDebug('Role ID retrieved', { hasRoleId: !!roleId })
    return roleId
  } catch (error) {
    console.error('[Middleware Error] Failed to get role ID:', error)
    return undefined
  }
}

function handlePublicPath(request: NextRequest, accessToken?: string) {
  logDebug('Handling public path', {
    path: request.nextUrl.pathname,
    hasAccessToken: !!accessToken
  })

  if (accessToken) {
    logDebug('User is authenticated, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

function handleProtectedPath(request: NextRequest, accessToken?: string, activeRoleId?: string) {
  logDebug('Handling protected path', {
    path: request.nextUrl.pathname,
    hasAccessToken: !!accessToken,
    hasRoleId: !!activeRoleId,
    rolesDisabled: DISABLED_ROLES
  })

  try {
    if (!accessToken) {
      logDebug('No access token found, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (DISABLED_ROLES) {
      logDebug('Roles are disabled, proceeding with request')
      return NextResponse.next()
    }

    if (!activeRoleId && !request.nextUrl.pathname.startsWith('/auth/select-role')) {
      logDebug('No role selected, redirecting to role selection')
      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }

    logDebug('Request authorized, proceeding')
    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware Error] Error in handleProtectedPath:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}

export async function middleware(request: NextRequest) {
  logDebug('Middleware called', {
    path: request.nextUrl.pathname,
    authDisabled: DISABLED_AUTH
  })

  try {
    if (DISABLED_AUTH) {
      logDebug('Auth is disabled, proceeding with request')
      return NextResponse.next()
    }

    const pathname = request.nextUrl.pathname
    const accessToken = getAccessToken(request)
    const activeRoleId = getSelectedRoleId(request)

    if (isPublicPath(pathname)) {
      return handlePublicPath(request, accessToken)
    }

    return handleProtectedPath(request, accessToken, activeRoleId)
  } catch (error) {
    console.error('[Middleware Error] Unhandled error in middleware:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/).*)']
}
