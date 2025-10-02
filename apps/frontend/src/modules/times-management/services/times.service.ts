const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export const TimesService = {
  async getCampusAllocations() {
    const res = await fetch(`${API_URL}/times/mock-campus`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Error al obtener asignaciones')
    const json = await res.json()
    console.log('API Response:', json)
    const data = json.data || []
    console.log('Returning data:', data)
    return data // 👈 devolvemos SIEMPRE array
  },

  async getActiveConfig() {
    const res = await fetch(`${API_URL}/journey-time-configs/active`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Error al obtener config activa')
    return res.json()
  },

  async calculate(hours: number) {
    const res = await fetch(`${API_URL}/journey-time-configs/calc?hours=${hours}`)
    if (!res.ok) throw new Error('Error en cálculo de equivalencia')
    return res.json()
  }
}
