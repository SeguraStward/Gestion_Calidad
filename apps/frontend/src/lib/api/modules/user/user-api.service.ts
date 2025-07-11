import { BaseApiService } from '@/lib/api/base-api.service'
import {
  ChangeUserStatusDto,
  CreateUserDto,
  MeUpdateUserDto,
  SetUserRolesDto,
  SimpleRoleWithPermissions,
  SimpleUserRole,
  UpdateUserDto,
  UserDto,
  UserFilters
} from '@/lib/api/modules/user/user.types'
import { PaginatedResponse } from '@/lib/api/types/base.types'
import { HttpClient } from '@/lib/http-client'

export class UserApiService extends BaseApiService<UserDto, CreateUserDto, UpdateUserDto> {
  protected readonly resourcePath = '/users'

  // CRUD methods are inherited from BaseApiService and map to GenericController

  // Specific user methods matching backend UsersController

  /**
   * Update user profile by ID - matches PATCH /users/:id/profile
   */
  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const response = await HttpClient.patch<UserDto>(`${this.resourcePath}/${id}/profile`, updateUserDto)
    return response.data
  }

  /**
   * Get users by role name and status - matches GET /users/by-role/:roleName
   */
  async getUsersByRoleNameAndStatus(
    roleName: string,
    status = 'ACTIVE',
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<UserDto>> {
    const response = await HttpClient.get<PaginatedResponse<UserDto>>(
      `${this.resourcePath}/by-role/${roleName}?status=${status}&page=${page}&limit=${limit}`
    )
    return response.data
  }

  /**
   * Get active roles for current user - matches GET /users/me/roles/active
   */
  async getMyActiveRoles(): Promise<SimpleRoleWithPermissions[]> {
    const response = await HttpClient.get<SimpleRoleWithPermissions[]>(`${this.resourcePath}/me/roles/active`)
    return response.data
  }

  /**
   * Get current user profile - matches GET /users/me
   */
  async getCurrentUser(): Promise<UserDto> {
    const response = await HttpClient.get<UserDto>(`${this.resourcePath}/me`)
    return response.data
  }

  /**
   * Update current user profile - matches PATCH /users/me
   */
  async updateCurrentUser(meUpdateUserDto: MeUpdateUserDto): Promise<UserDto> {
    const response = await HttpClient.patch<UserDto>(`${this.resourcePath}/me`, meUpdateUserDto)
    return response.data
  }

  /**
   * Get all roles for a specific user - matches GET /users/:id/roles
   */
  async getAllUserRoles(userId: string): Promise<SimpleRoleWithPermissions[]> {
    const response = await HttpClient.get<SimpleRoleWithPermissions[]>(`${this.resourcePath}/${userId}/roles`)
    return response.data
  }

  /**
   * Get all roles in the system - matches GET /users/all-roles
   */
  async getAllRoles(): Promise<SimpleUserRole[]> {
    const response = await HttpClient.get<SimpleUserRole[]>(`${this.resourcePath}/all-roles`)
    return response.data
  }

  /**
   * Set user roles (override existing roles) - matches PATCH /users/:id/roles
   */
  async setUserRoles(userId: string, setUserRolesDto: SetUserRolesDto): Promise<UserDto> {
    const response = await HttpClient.patch<UserDto>(`${this.resourcePath}/${userId}/roles`, setUserRolesDto)
    return response.data
  }

  /**
   * Change user status - matches PATCH /users/:id/status
   */
  async changeUserStatus(userId: string, changeUserStatusDto: ChangeUserStatusDto): Promise<UserDto> {
    const response = await HttpClient.patch<UserDto>(`${this.resourcePath}/${userId}/status`, changeUserStatusDto)
    return response.data
  }

  // Override findAll to include user-specific filters
  override async findAll(
    params: UserFilters & { page?: number; limit?: number; orderBy?: string; include?: string } = {}
  ): Promise<PaginatedResponse<UserDto>> {
    return super.findAll(params)
  }

  // Convenience methods using the inherited CRUD operations

  /**
   * Soft delete user - uses the generic soft delete endpoint PATCH /users/:id/soft-delete
   */
  async softDeleteUser(id: string): Promise<UserDto> {
    return this.softDelete(id)
  }
}

export const userApiService = new UserApiService()
