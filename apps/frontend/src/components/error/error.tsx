'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
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
      <p>Ha ocurrido un error inesperado. Por favor, intenta nuevamente.</p>
      <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#666' }}>500</p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>Error interno del servidor</p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          margin: '0.25rem',
          borderRadius: '0.375rem',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}
      >
        Intentar nuevamente
      </button>
      <button
        onClick={() => window.location.assign('/')}
        style={{
          padding: '0.5rem 1rem',
          margin: '0.25rem',
          borderRadius: '0.375rem',
          border: 'none',
          backgroundColor: '#007bff',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Ir al inicio
      </button>
    </div>
  )
}
