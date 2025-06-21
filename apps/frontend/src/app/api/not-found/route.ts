import { NextResponse } from 'next/server'

// Handle requests for non-existent resources (like Chrome DevTools requests)
export async function GET() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function POST() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
