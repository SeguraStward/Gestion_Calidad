import { useQuery } from '@tanstack/react-query'
import { HttpClient } from '@/lib/http-client'

export interface Professor {
  id: string
  cedula: string
  fullName: string
  email: string | null
  status: 'ACTIVE' | 'INACTIVE'
}

export function useProfessors() {
  return useQuery({
    queryKey: ['users-by-role', 'PROFESSOR', { status: 'ACTIVE' }],
    queryFn: async () => {
      const response = await HttpClient.get('/users/by-role/PROFESSOR', {
        params: {
          status: 'ACTIVE',
          limit: 1000
        }
      })
      console.log('🔍 Raw professor data:', response.data)
      return response.data?.data || []
    },
    staleTime: 60_000,
    select: (data: any[]) => {
      console.log('🔍 Data to map:', data)
      return data.map((professor) => ({
        id: professor.id || professor.userId,
        cedula: professor.cedula || professor.identification || professor.id,
        fullName: professor.fullName || professor.name || professor.firstName + ' ' + professor.lastName || 'Sin nombre',
        email: professor.email || '',
        status: professor.status
      }))
    }
  })
}
