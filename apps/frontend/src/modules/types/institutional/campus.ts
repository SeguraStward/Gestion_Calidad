export type Status = 'ACTIVE' | 'INACTIVE' // Ajustalo según el enum real si lo tenés definido
import { Classroom } from '@/modules/types/institutional/classroom'

export type Campus = {
  id: string
  nombre: string
  descripcion: string
  status: Status
  sedeId: string
  classrooms: Classroom[]
}
