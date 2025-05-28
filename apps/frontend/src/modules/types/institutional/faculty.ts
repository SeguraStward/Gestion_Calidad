export type Faculty = {
  id: string
  nombre: string
  descripcion?: string
  campusIds: string[] // muchos a muchos
}
