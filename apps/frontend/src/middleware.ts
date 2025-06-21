import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { SessionStorageManager, Logger } from './utils'

// DEV temporal for testing purposes
const DISABLED_AUTH = process.env.DISABLED_AUTH === 'true'
const DISABLED_ROLES = process.env.DISABLED_ROLES === 'true'

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/auth/login',
    '/auth/error',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/assets',
    '/sw.js',
    '/_next',
    '/api/auth'
  ]

  const isPublic = publicPaths.some((path) => pathname.startsWith(path))
  Logger.debug(`Checking if path is public: ${pathname}`, { isPublic })
  return isPublic
}

function getAccessToken(request: NextRequest): string | undefined {
  try {
    const token = request.cookies.get('auth_token')?.value
    Logger.debug('Access token retrieved', { hasToken: !!token })
    return token
  } catch (error) {
    Logger.error('[Middleware Error] Failed to get access token:', error)
    return undefined
  }
}

function getActiveRoleId(request: NextRequest): string | undefined {
  try {
    const roleId = request.cookies.get('active_role_id')?.value // Changed from 'user_active_role_id' to 'active_role_id'
    Logger.debug('Role ID retrieved', { hasRoleId: !!roleId, roleIdValue: roleId })
    return roleId
  } catch (error) {
    Logger.error('[Middleware Error] Failed to get role ID:', error)
    return undefined
  }
}

function handlePublicPath(request: NextRequest, accessToken?: string) {
  Logger.debug('Handling public path', {
    path: request.nextUrl.pathname,
    hasAccessToken: !!accessToken
  })

  if (accessToken && request.nextUrl.pathname.startsWith('/auth/login')) {
    Logger.debug('User is authenticated, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

/**
 * Handles access control for protected routes in the application.
 *
 * This function checks for the presence of an access token and an active role ID,
 * redirecting the user to the appropriate authentication or role selection page if necessary.
 * It also respects a global flag (`DISABLED_ROLES`) to optionally bypass role checks.
 * If an error occurs during processing, the user is redirected to a generic error page.
 *
 * @param request - The incoming Next.js request object.
 * @param accessToken - (Optional) The user's access token, if available.
 * @param activeRoleId - (Optional) The currently selected role ID for the user, if available.
 * @returns A `NextResponse` object that either allows the request to proceed or redirects the user.
 */
function handleProtectedPath(request: NextRequest, accessToken?: string, activeRoleId?: string) {
  Logger.debug('Handling protected path', {
    path: request.nextUrl.pathname,
    hasAccessToken: !!accessToken,
    hasRoleId: !!activeRoleId,
    rolesDisabled: DISABLED_ROLES
  })

  try {
    if (!accessToken) {
      Logger.debug('No access token found, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (DISABLED_ROLES) {
      Logger.debug('Roles are disabled, proceeding with request')
      return NextResponse.next()
    }

    if (!activeRoleId && !SessionStorageManager.hasActiveRole && !request.nextUrl.pathname.startsWith('/auth/select-role')) {
      Logger.debug('No role selected, redirecting to role selection')
      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }

    Logger.debug('Request authorized, proceeding')
    return NextResponse.next()
  } catch (error) {
    Logger.error('[Middleware Error] Error in handleProtectedPath:', error)
    return NextResponse.redirect(new URL('/auth/error?reason=protected-path-error', request.url))
  }
}

export async function middleware(request: NextRequest) {
  if (DISABLED_AUTH) {
    Logger.debug('Auth is disabled, proceeding with request')
    return NextResponse.next()
  }

  Logger.debug('Middleware called', {
    path: request.nextUrl.pathname
  })

  try {
    const pathname = request.nextUrl.pathname
    const accessToken = getAccessToken(request)
    const activeRoleId = getActiveRoleId(request)

    if (isPublicPath(pathname)) {
      return handlePublicPath(request, accessToken)
    }

    return handleProtectedPath(request, accessToken, activeRoleId)
  } catch (error) {
    Logger.error('[Middleware Error] Unhandled error in middleware:', error)
    return NextResponse.redirect(new URL('/auth/error?reason=middleware-error', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|sw.js|assets/).*)']
}
