import { NextResponse } from 'next/server'

/**
 * API route para silenciar las peticiones de herramientas de desarrollo
 * que no son necesarias para el funcionamiento de la aplicación
 */

export async function GET() {
  // Devolver un 204 No Content para silenciar las peticiones
  return new NextResponse(null, { status: 204 })
}

export async function POST() {
  return new NextResponse(null, { status: 204 })
}

export async function HEAD() {
  return new NextResponse(null, { status: 204 })
}
