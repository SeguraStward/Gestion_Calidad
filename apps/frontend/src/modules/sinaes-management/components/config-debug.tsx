'use client'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'

export function ConfigDebug() {
  const checkConfig = () => {
    console.log('=== CONFIGURACIÓN DEL FRONTEND ===')
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('=================================')

    // Test fetch directo
    console.log('🔵 Probando fetch directo a auth/me...')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
      credentials: 'include'
    })
      .then(r => {
        console.log('✅ Response status:', r.status)
        return r.json()
      })
      .then(data => {
        console.log('✅ User data:', data)
        console.log('✅ Has Google Token?', data.data?.googleAccessToken ? 'YES' : 'NO')
        console.log('✅ User roles:', data.data?.roles)
      })
      .catch(err => {
        console.error('❌ Error:', err)
      })
  }

  const testGoogleDriveEndpoint = () => {
    console.log('=== TEST GOOGLE DRIVE ENDPOINT ===')
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google-drive/create-structure`
    console.log('🔵 URL completa:', url)

    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dimensionCode: 'DIM01',
        dimensionName: 'Test Dimension',
        componentCode: 'COMP01',
        componentName: 'Test Component',
        criterionCode: 'CRIT01',
        criterionName: 'Test Criterion',
        standardCode: 'STD01',
        standardName: 'Test Standard',
        evidenceCode: 'EV01',
        evidenceName: 'Test Evidence',
        careerCode: 'CAR001',
        careerName: 'Test Career'
      })
    })
      .then(r => {
        console.log('✅ Response status:', r.status)
        console.log('✅ Response headers:', Object.fromEntries(r.headers.entries()))
        return r.json()
      })
      .then(data => {
        console.log('✅ Response data:', data)
      })
      .catch(err => {
        console.error('❌ Error:', err)
      })
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🔧 Config & Connection Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-x-2">
        <Button onClick={checkConfig} size="sm">
          📋 Check Config & Auth
        </Button>
        <Button onClick={testGoogleDriveEndpoint} size="sm" variant="secondary">
          🧪 Test Google Drive Endpoint
        </Button>
        <div className="mt-4 text-xs text-muted-foreground">
          Abre la consola del navegador (F12) para ver los resultados
        </div>
      </CardContent>
    </Card>
  )
}
