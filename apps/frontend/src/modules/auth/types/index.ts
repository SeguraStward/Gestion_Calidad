import { PermissionType, PermissionScope } from '@una-gc/database/prisma/generated/client'

// special tytpe (modifiqueted)
export type Permission = {
  id: string
  name: string
  code: string
  status: string
  type: PermissionType[]
  actions: string[]
  scope: PermissionScope
}

// especial Role type (modifiqueted)
export type Role = {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

// reponde expected from the API
export type UserRolesResponse = {
  data: Role[]
}
