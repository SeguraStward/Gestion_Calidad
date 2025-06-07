import { useQuery } from '@tanstack/react-query'
import { HttpClient } from '@/lib/http-client'
import { CampusSelectOption } from '@/modules/academic-management/academic-maintenance/types/regional-center'

export function useRegionalCenterFormData() {
  // Cargar campus para el selector (aunque ya no se usa en el CRUD de sedes, se deja para futuros usos)
  const { data: campuses, isLoading: isLoadingCampuses } = useQuery<CampusSelectOption[]>({
    queryKey: ['campuses'],
    queryFn: async () => {
      const response = await HttpClient.get('/campuses', {
        params: {
          status: 'ACTIVE',
          limit: 100
        }
      })
      return response.data.data
    }
  })

  return {
    campuses: campuses || [],
    isLoadingCampuses
  }
}
