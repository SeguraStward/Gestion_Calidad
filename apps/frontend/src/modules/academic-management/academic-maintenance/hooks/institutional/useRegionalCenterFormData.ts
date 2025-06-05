import { useQuery } from '@tanstack/react-query'
import { HttpClient } from '@/lib/http-client'
import { Status } from '@una-gc/database/prisma/generated/client'
import { CampusSelectOption } from '@/modules/academic-management/academic-maintenance/types/institutional/regional-center'

export function useRegionalCenterFormData() {
  // Cargar campus para el selector
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
