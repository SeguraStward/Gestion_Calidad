// enums
import { PermissionScope, PermissionType, Province, Status, UserStatus } from '@una-gc/database/prisma/generated/client'
// prisma types
import { UserPhone } from '@una-gc/database/prisma/generated/client'
import { AuditFields } from '../../types/base.types'

// User DTO - matching backend UserDto exactly
export interface UserDto extends AuditFields {
  id: string
  email: string
  fullName: string
  fullLastName?: string
  photoUrl?: string
  nationalId?: string
  birthDate?: Date
  primaryPhone?: string
  phoneNumbers?: UserPhone[]
  province?: Province
  canton?: string
  district?: string
  address?: string
  professionalTitle?: string
  hireDate?: Date
  condition?: string
  roleIds?: string[]
  status: UserStatus
  //reations
  roles?: UserRoleDto[]
}

// Create User DTO - only required fields for creation
export interface CreateUserDto {
  email: string
  fullName: string
  nationalId: string
  status?: UserStatus // optional, backend sets PRE_REGISTRATION by default
}

// Update User DTO - matching backend UpdateUserDto
export interface UpdateUserDto {
  email: string
  fullName?: string
  fullLastName?: string
  photoUrl?: string
  nationalId?: string
  birthDate?: Date
  primaryPhone?: string
  phoneNumbers?: UserPhone[]
  province?: Province
  canton?: string
  district?: string
  address?: string
  professionalTitle?: string
  hireDate?: Date
  condition?: string
  status?: UserStatus
}

// Me Update User DTO - matching backend MeUpdateUserDto
export interface MeUpdateUserDto {
  fullName?: string
  fullLastName?: string
  photoUrl?: string
  email?: string
  nationalId?: string
  birthDate?: Date
  primaryPhone?: string
  phoneNumbers?: UserPhone[]
  province?: Province
  canton?: string
  district?: string
  address?: string
  professionalTitle?: string
  hireDate?: Date
  condition?: string
}

// Role DTO - for user roles
export interface UserRoleDto {
  id: string
  name: string
  description?: string
  status: UserStatus
}

// Permission types for roles
export interface EnrichedPermissions {
  id: string
  name: string
  code: string
  status: Status
  type: PermissionType[]
  scope: PermissionScope
  actions: string[]
}

// Simple Role with Permissions - matching backend
export interface SimpleRoleWithPermissions {
  id: string
  name: string
  status: Status
  description: string
  permissions: EnrichedPermissions[]
}

// Simple User Role - matching backend
export interface SimpleUserRole {
  id: string
  name: string
  status: Status
  description: string
}

// Set User Roles DTO - matching backend
export interface SetUserRolesDto {
  roleIds: string[]
}

// Change User Status DTO - matching backend
export interface ChangeUserStatusDto {
  status: UserStatus
}

// User list filters for queries
export interface UserFilters {
  status?: UserStatus
  province?: Province
  condition?: string
  search?: string
  nationalId?: string
  roleId?: string
}

// Bulk Import Types - matching backend DTOs

export interface ProfessorRowDto {
  cedula: string
  nombre: string
  /** Optional. When present, used as the professor's login email instead of the auto-generated one. */
  email?: string
}

export interface BulkImportProfessorsDto {
  professors: ProfessorRowDto[]
}

export interface BulkImportResultDto {
  created: number
  updated: number
  errors: number
  errorDetails: string[]
  userIds: string[]
}

// Extended type alias for backward compatibility
export type UserWithRelations = UserDto
export type CurrentUserProfile = UserDto
export type UpdateUserProfileDto = MeUpdateUserDto
