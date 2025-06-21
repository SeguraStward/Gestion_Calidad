import { NextRequest, NextResponse } from 'next/server'

/**
 * API route para manejar cookies HTTP-only de autenticación
 * Solo el servidor puede leer/escribir estas cookies
 */

export async function POST(request: NextRequest) {
  try {
    const { authToken, refreshToken } = await request.json()

    // Configuración para cookies HTTP-only
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 10, // 10 horas
      path: '/'
    }

    const response = NextResponse.json({ success: true, message: 'Cookies set successfully' })

    // Establecer cookies HTTP-only usando NextResponse
    response.cookies.set('auth_token', authToken, cookieOptions)
    response.cookies.set('refresh_token', refreshToken, cookieOptions)

    return response
  } catch (error) {
    console.error('Error setting auth cookies:', error)
    return NextResponse.json({ success: false, error: 'Failed to set cookies' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true, message: 'Cookies deleted successfully' })

    // Eliminar cookies HTTP-only
    response.cookies.delete('auth_token')
    response.cookies.delete('refresh_token')

    return response
  } catch (error) {
    console.error('Error deleting auth cookies:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete cookies' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar si existen las cookies (sin exponer el contenido)
    const hasAuthToken = request.cookies.has('auth_token')
    const hasRefreshToken = request.cookies.has('refresh_token')

    return NextResponse.json({
      success: true,
      hasAuthToken,
      hasRefreshToken,
      isAuthenticated: hasAuthToken && hasRefreshToken
    })
  } catch (error) {
    console.error('Error checking auth cookies:', error)
    return NextResponse.json({ success: false, error: 'Failed to check cookies' }, { status: 500 })
  }
}
