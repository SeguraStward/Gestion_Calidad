import { GenericService } from '@/services/base/generic.service'
import type { UserWithRelations, CreateUserInput, UpdateUserInput } from '@/shared/types/user'

// Puedes extender para métodos custom si lo necesitas
export class UserService extends GenericService<UserWithRelations, CreateUserInput, UpdateUserInput, Record<string, any>> {
  constructor() {
    super('users') // endpoint base
  }

  // Filtra los campos permitidos para crear/actualizar usuario
  private filterPayload(payload: Partial<CreateUserInput | UpdateUserInput>) {
    const allowed = [
      'email',
      'fullName',
      'fullLastName',
      'photoUrl',
      'nationalId',
      'birthDate',
      'primaryPhone',
      'phoneNumbers',
      'province',
      'canton',
      'district',
      'address',
      'professionalTitle',
      'hireDate',
      'condition',
      'roleIds',
      'googleId',
      'status'
    ]
    const filtered: any = {}
    for (const key of allowed) {
      let value = (payload as Record<string, unknown>)[key]
      // Si es un campo enum y es string vacío, no lo envíes
      if ((key === 'province' || key === 'status') && value === '') continue
      // Si es string vacío en campos opcionales, omitir
      if (typeof value === 'string' && value.trim() === '') continue
      // Validar que teléfono y cédula sean solo números
      if ((key === 'primaryPhone' || key === 'nationalId') && typeof value === 'string' && value !== '') {
        if (!/^[0-9]+$/.test(value)) continue // Omitir si no es solo números
      }
      // Manejo especial para fechas
      if (key === 'hireDate' || key === 'birthDate') {
        if (!value) continue // null, undefined o string vacío
        if (value instanceof Date) {
          filtered[key] = value.toISOString()
          continue
        }
        if (typeof value === 'string') {
          // Solo aceptar string ISO-8601
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/.test(value)) {
            filtered[key] = value
          }
          // Si no es ISO válido, omitir
          continue
        }
        // Si no es string ni Date, omitir
        continue
      }
      // Manejo especial para roleIds - debe ser array
      if (key === 'roleIds') {
        if (Array.isArray(value)) {
          filtered[key] = value
        } else if (!value) {
          filtered[key] = []
        }
        continue
      }
      if (value !== undefined) filtered[key] = value
    }
    return filtered
  }

  async create(payload: CreateUserInput): Promise<UserWithRelations> {
    const filtered = this.filterPayload(payload)
    return super.create(filtered as CreateUserInput)
  }

  async update(id: string, payload: UpdateUserInput): Promise<UserWithRelations> {
    const filtered = this.filterPayload(payload)
    return super.update(id, filtered as UpdateUserInput)
  }

  async listByRole(roleName: string, status: string = 'ACTIVE', page = 1, limit = 1000) {
    // Usa el HttpClient directamente, como en list()
    const response = await import('@/lib/http-client').then(({ HttpClient }) =>
      HttpClient.get(`/Users/by-role/${roleName}`, {
        params: { status, page, limit }
      })
    )
    return response.data
  }
}

export const userService = new UserService()
