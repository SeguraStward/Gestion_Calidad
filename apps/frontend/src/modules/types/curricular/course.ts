export type Course = {
  id: string
  name: string
  code: string
  description?: string
  credits: number
  level: string
  contactHours: number
  programaId: string // This will need to be updated to schoolId and careerId later
}
