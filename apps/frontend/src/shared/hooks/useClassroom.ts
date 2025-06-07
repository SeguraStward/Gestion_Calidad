import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { Classroom, Status } from '@una-gc/database/prisma/generated/client'

interface ClassroomWithRelations extends Classroom {
  roomNumber: string
  capacity: number
  status: Status
}

const classroomService = new GenericService<ClassroomWithRelations, any, any, any>('classrooms')

export function useClassroom() {
  return useQuery({
    queryKey: ['classrooms', { status: 'ACTIVE', limit: 1000 }],
    queryFn: () => classroomService.list({ status: 'ACTIVE', limit: 1000 }).then((res) => res.data),
    staleTime: 60_000,
    select: (data) => {
      console.log('AULAS DESDE API:', data)
      return data
        .filter((classroom) => classroom && classroom.id && classroom.roomNumber)
        .map((classroom) => ({
          id: String(classroom.id),
          name: classroom.roomNumber
        }))
    }
  })
}
