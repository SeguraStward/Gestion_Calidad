// Test temporal para debugging
// Este archivo será eliminado una vez que se resuelva el problema

import { AuthService } from '@/modules/auth/services/auth.service'

export const testBackendResponse = async () => {
  try {
    console.log('🧪 [TEST] Iniciando test de respuesta del backend...')

    // Test directo al endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    console.log('🧪 [TEST] Respuesta del fetch directo:')
    console.log('  - Status:', response.status)
    console.log('  - Status Text:', response.statusText)
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const rawData = await response.text()
      console.log('🧪 [TEST] Datos RAW (texto):', rawData)

      try {
        const jsonData = JSON.parse(rawData)
        console.log('🧪 [TEST] Datos JSON parseados:', jsonData)
        console.log('🧪 [TEST] Tipo de datos JSON:', typeof jsonData)
        console.log('🧪 [TEST] Claves del objeto:', Object.keys(jsonData))

        // Verificar cada campo crítico
        console.log('🧪 [TEST] Verificación de campos:')
        console.log('  - id:', jsonData.id, '(tipo:', typeof jsonData.id, ')')
        console.log('  - email:', jsonData.email, '(tipo:', typeof jsonData.email, ')')
        console.log('  - name:', jsonData.name, '(tipo:', typeof jsonData.name, ')')
        console.log('  - fullName:', jsonData.fullName, '(tipo:', typeof jsonData.fullName, ')')
      } catch (parseError) {
        console.error('🧪 [TEST] ❌ Error parseando JSON:', parseError)
      }
    } else {
      console.error('🧪 [TEST] ❌ Response no exitosa:', response.status, response.statusText)
    }

    // Test usando HttpClient
    console.log('🧪 [TEST] Probando con HttpClient...')
    const httpClientResponse = await import('@/lib/http-client').then(({ HttpClient }) => HttpClient.get('/auth/me'))
    console.log('🧪 [TEST] HttpClient response:', httpClientResponse)
    console.log('🧪 [TEST] HttpClient response.data:', httpClientResponse.data)

    // Test usando AuthService
    console.log('🧪 [TEST] Probando con AuthService...')
    const authServiceResponse = await AuthService.getUserProfile()
    console.log('🧪 [TEST] AuthService response:', authServiceResponse)
  } catch (error) {
    console.error('🧪 [TEST] ❌ Error en test:', error)
  }
}
