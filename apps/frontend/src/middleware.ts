import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DISABLED_AUTH = process.env.DISABLED_AUTH == 'true'

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/auth/login', '/auth/error']
  return publicPaths.some((path) => pathname.startsWith(path))
}

function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get('auth_token')?.value
}

function getSelectedRoleId(request: NextRequest): string | undefined {
  return request.cookies.get('selected_role_id')?.value
}

function handlePublicPath(request: NextRequest, accessToken?: string) {
  if (accessToken) {
    //home page if already logged in
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

function handleProtectedPath(request: NextRequest, accessToken?: string, selectedRoleId?: string) {
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Check if user has selected a role
  if (!(process.env.DISABLED_PERMISSIONS == 'true')) {
    if (!selectedRoleId && !request.nextUrl.pathname.startsWith('/auth/select-role')) {
      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }
  }

  return NextResponse.next()
}

export async function middleware(request: NextRequest) {
  if (DISABLED_AUTH) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  const accessToken = getAccessToken(request)
  const selectedRoleId = getSelectedRoleId(request)

  if (isPublicPath(pathname)) {
    return handlePublicPath(request, accessToken)
  }

  return handleProtectedPath(request, accessToken, selectedRoleId)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/).*)']
}
