import { useQuery } from '@tanstack/react-query'
import { GenericService } from '@/services/base/generic.service'
import type { Schedule, Status } from '@una-gc/database/prisma/generated/client'

interface ScheduleWithRelations extends Schedule {
  dayOfWeek: string
  startTime: string
  endTime: string
  status: Status
}

const scheduleService = new GenericService<ScheduleWithRelations, any, any, any>('schedules')

export function useSchedule() {
  return useQuery({
    queryKey: ['schedules', { status: 'ACTIVE', limit: 1000 }],
    queryFn: () => scheduleService.list({ status: 'ACTIVE', limit: 1000 }).then((res) => res.data),
    staleTime: 600_000, // 10 minutos
    select: (data) =>
      data.map((schedule) => ({
        id: schedule.id,
        name: `${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`,
        day: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }))
  })
}
