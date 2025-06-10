import { PermissionType, PermissionScope } from '@una-gc/database/prisma/generated/client'

export type Permission = {
  id: string
  name: string
  code: string
  status: string
  type: PermissionType[]
  actions: string[]
  scope: PermissionScope
}

export type Role = {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export type UserRolesResponse = {
  data: Role[]
}
