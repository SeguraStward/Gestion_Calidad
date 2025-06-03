import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DISABLED_AUTH = process.env.DISABLED_AUTH === 'true'

function isPublicPath(pathname: string): boolean {
  const publicPaths = ['/auth/login', '/auth/error']
  return publicPaths.some((path) => pathname.startsWith(path))
}

function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get('auth_token')?.value
}

function handlePublicPath(request: NextRequest, accessToken?: string) {
  if (accessToken) {
    //home page if already logged in
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

function handleProtectedPath(request: NextRequest, accessToken?: string) {
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  return NextResponse.next()
}

export async function middleware(request: NextRequest) {
  if (!DISABLED_AUTH) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  const accessToken = getAccessToken(request)

  if (isPublicPath(pathname)) {
    return handlePublicPath(request, accessToken)
  }

  return handleProtectedPath(request, accessToken)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/).*)']
}
