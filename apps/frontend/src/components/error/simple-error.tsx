'use client'

import { useEffect } from 'react'

export default function SimpleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Simple error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem'
      }}
    >
      <h1>Error del servidor</h1>
      <p>Ha ocurrido un error inesperado.</p>
      <button onClick={() => reset()}>Intentar nuevamente</button>
      <button onClick={() => window.location.assign('/')}>Ir al inicio</button>
    </div>
  )
}
