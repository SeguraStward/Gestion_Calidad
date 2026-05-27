import { Injectable, Logger } from '@nestjs/common';
import { User, UserStatus } from '@una-gc/database/prisma/generated/client';

import { DtoValidator } from '@core/common/dto-validator';
import { GenericService } from '@core/common/interfaces/generic.service';

import { UsersRepository } from './users.repository';

import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';

import { PaginatedResponse } from '@src/core/http/interfaces/paginated-response.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { SimpleRoleWithPermissions, SimpleUserRole } from './types';

@Injectable()
export class UsersService extends GenericService<User, UserDto, UserDto, UpdateUserDto> {
  protected readonly logger = new Logger(UsersService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['roles', 'academicLoads', 'finalWorks'],
    errorMessage: 'Cannot delete User because it has associated records.',
  };

  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly dtoValidator: DtoValidator,
    protected readonly prisma: PrismaService,
  ) {
    super(usersRepository, UserDto);
  }

  // * CRUD methods are defined in the GenericService *

  // * specific methods for user*

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    this.logger.debug(`[updateProfile] Starting update for user ${userId}`);
    this.logger.debug(`[updateProfile] Received DTO:`, JSON.stringify(updateUserDto, null, 2));

    // Filter out empty or invalid values to prevent Prisma validation errors
    const cleanedData: any = {}

    // Only include fields that have valid values
    if (updateUserDto.email && updateUserDto.email.trim()) {
      cleanedData.email = updateUserDto.email.trim()
      this.logger.debug(`[updateProfile] Including email: ${cleanedData.email}`);
    }

    if (updateUserDto.fullName && updateUserDto.fullName.trim()) {
      cleanedData.fullName = updateUserDto.fullName.trim()
      this.logger.debug(`[updateProfile] Including fullName: ${cleanedData.fullName}`);
    }

    if (updateUserDto.fullLastName && updateUserDto.fullLastName.trim()) {
      cleanedData.fullLastName = updateUserDto.fullLastName.trim()
      this.logger.debug(`[updateProfile] Including fullLastName: ${cleanedData.fullLastName}`);
    }

    if (updateUserDto.photoUrl && updateUserDto.photoUrl.trim()) {
      cleanedData.photoUrl = updateUserDto.photoUrl.trim()
      this.logger.debug(`[updateProfile] Including photoUrl: ${cleanedData.photoUrl}`);
    }

    // Only include status if it's a valid enum value
    if (updateUserDto.status && ['ACTIVE', 'INACTIVE', 'PRE_REGISTRATION'].includes(updateUserDto.status)) {
      cleanedData.status = updateUserDto.status
      this.logger.debug(`[updateProfile] Including status: ${cleanedData.status}`);
    }

    // Copy other valid fields from the DTO if they exist and are not empty
    const validFields = ['nationalId', 'birthDate', 'primaryPhone', 'phoneNumbers', 'province', 'canton', 'district', 'address', 'professionalTitle', 'hireDate', 'condition']
    validFields.forEach(field => {
      if (updateUserDto[field] !== undefined && updateUserDto[field] !== null && updateUserDto[field] !== '') {
        cleanedData[field] = updateUserDto[field]
        this.logger.debug(`[updateProfile] Including ${field}: ${cleanedData[field]}`);
      }
    })

    this.logger.log(`[updateProfile] Final cleaned data for user ${userId}:`, JSON.stringify(cleanedData, null, 2))

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: cleanedData,
        include: {
          roles: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              permissions: {
                select: {
                  permissionID: true,
                  permissions: true,
                  scope: true,
                  actions: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      this.logger.debug(`[updateProfile] Update successful for user ${userId}`);
      return user;
    } catch (prismaError) {
      this.logger.error(`[updateProfile] Prisma error for user ${userId}:`, prismaError);
      throw prismaError;
    }
  }

  async getUserActiveRolesWithPermissions(userId: string): Promise<SimpleRoleWithPermissions[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roles: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!user?.roles?.length) {
      return [];
    }

    const permissionIds = Array.from(
      new Set(user.roles.flatMap((role) => role.permissions?.map((p: any) => p.permissionID) || [])),
    );

    if (!permissionIds.length) {
      return user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        status: role.status,
        permissions: [],
      }));
    }

    const permissionMap = await this.getActivePermissionsByIds(permissionIds);
    return this.mapRolesWithPermissions(user.roles, permissionMap);
  }

  async findUsersByRoleNameAndStatus(
    roleName: string,
    userStatus = 'ACTIVE',
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<UserDto>> {
    const where = {
      status: userStatus as any,
      roles: { some: { name: roleName, status: 'ACTIVE' } },
    };

    const include = {
      roles: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, description: true, status: true },
      },
    };

    return this.findAll(page, limit, where, { createdAt: 'desc' }, include);
  }

  // get roles
  async getAllRoles(): Promise<SimpleUserRole[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
    }));
  }

  /**
   * Set user roles (override existing roles with new ones)
   * @param userId - The user ID
   * @param roleIds - Array of role IDs to assign to the user
   */
  async setUserRoles(userId: string, roleIds: string[]): Promise<UserDto> {
    // Validate that all role IDs exist and are active
    if (roleIds.length > 0) {
      const existingRoles = await this.prisma.userRole.findMany({
        where: {
          id: { in: roleIds },
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const existingRoleIds = existingRoles.map((role) => role.id);
      const missingRoleIds = roleIds.filter((roleId) => !existingRoleIds.includes(roleId));

      if (missingRoleIds.length > 0) {
        throw new Error(
          `The following role IDs do not exist or are not active: ${missingRoleIds.join(', ')}`,
        );
      }
    }

    // Update user with new roles (this will override existing roles)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: roleIds.map((roleId) => ({ id: roleId })),
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return updatedUser;
  }

  /**
   * Change user status
   * @param userId - The user ID
   * @param status - The new status to set
   */
  async changeUserStatus(userId: string, status: UserStatus): Promise<UserDto> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            permissions: {
              select: {
                permissionID: true,
                permissions: true,
                scope: true,
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return updatedUser;
  }

  // * only for authenticated users and the user to their own information (me info) *

  async meGetUser(userId: string): Promise<UserDto> {
    const include = {
      roles: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, description: true, status: true, permissions: true },
      },
    };

    return this.findById(userId, include);
  }

  async meUpdateUser(userId: string, meUpdateUserDto: any): Promise<UserDto> {
    return this.update(userId, meUpdateUserDto as UpdateUserDto);
  }

  // * auxiliary methods *

  private async getActivePermissionsByIds(permissionIds: string[]) {
    if (!permissionIds.length) return new Map();

    const activePermissions = await this.prisma.userPermission.findMany({
      where: { id: { in: permissionIds }, status: 'ACTIVE' },
      select: { id: true, name: true, code: true, status: true },
    });

    return new Map(activePermissions.map((p) => [p.id, p]));
  }

  private mapRolesWithPermissions(
    roles: any[],
    permissionMap: Map<string, any>,
  ): SimpleRoleWithPermissions[] {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      status: role.status,
      permissions: (role.permissions || [])
        .filter((perm: any) => permissionMap.has(perm.permissionID))
        .map((perm: any) => {
          const details = permissionMap.get(perm.permissionID)!;
          return {
            id: details.id,
            name: details.name,
            code: details.code,
            status: details.status,
            type: perm.permissions,
            scope: perm.scope,
            actions: perm.actions,
          };
        }),
    }));
  }

  /**
   * Override deleteById to handle cascade deletion of user roles
   * This allows deleting users that have assigned roles
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log(`Attempting to delete user with id: ${id}`);

      // First check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
          // Add other relations that might prevent deletion
        }
      });

      if (!user) {
        this.logger.error(`User with id ${id} not found`);
        throw new Error(`User with id ${id} not found`);
      }

      this.logger.log(`User found: ${user.fullName} (${user.email}) with ${user.roles?.length || 0} roles`);

      // Use a transaction to ensure data consistency
      await this.prisma.$transaction(async (tx) => {
        // 1. Remove user from all roles (disconnect relationships)
        if (user.roles && user.roles.length > 0) {
          this.logger.log(`Removing user from ${user.roles.length} roles`);

          await tx.user.update({
            where: { id },
            data: {
              roles: {
                disconnect: user.roles.map(role => ({ id: role.id }))
              }
            }
          });
        }

        // 2. Clear roleIds array
        await tx.user.update({
          where: { id },
          data: {
            roleIds: []
          }
        });

        // 3. Now delete the user
        await tx.user.delete({
          where: { id }
        });

        this.logger.log(`User ${user.fullName} deleted successfully`);
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk import professors from Excel
   * Creates or updates users with PROFESSOR role based on nationalId
   */
  async bulkImportProfessors(
    professors: Array<{ cedula: string; nombre: string; email?: string }>,
  ): Promise<{
    created: number;
    updated: number;
    errors: number;
    errorDetails: string[];
    userIds: string[];
  }> {
    this.logger.debug(`[bulkImportProfessors] Starting bulk import of ${professors.length} professors`);

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];
    const userIds: string[] = [];

    // Get PROFESSOR role
    const professorRole = await this.prisma.userRole.findFirst({
      where: { name: 'PROFESOR' },
    });

    if (!professorRole) {
      throw new Error('Role PROFESOR not found in database');
    }

    // Lightweight email validation. We don't want to fail an entire import on a
    // malformed email for a single row — instead we record the row as an error.
    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    for (const prof of professors) {
      try {
        const cedula = prof.cedula?.trim();
        const nombre = prof.nombre?.trim();
        const providedEmail = prof.email?.trim();

        if (!cedula || !nombre) {
          errors++;
          errorDetails.push(`Fila con datos incompletos: cédula=${cedula}, nombre=${nombre}`);
          continue;
        }

        // Optional email — validate format only when provided. We treat an
        // invalid format as a row error rather than silently dropping it.
        if (providedEmail && !isValidEmail(providedEmail)) {
          errors++;
          errorDetails.push(`Fila ${cedula}: el correo "${providedEmail}" no es un formato válido`);
          continue;
        }

        // Check if user already exists by nationalId
        const existingUser = await this.prisma.user.findFirst({
          where: { nationalId: cedula },
        });

        if (existingUser) {
          // If a real email is provided, make sure it isn't already taken by
          // a DIFFERENT user — otherwise we'd violate the email unique index.
          if (providedEmail && providedEmail.toLowerCase() !== existingUser.email.toLowerCase()) {
            const conflict = await this.prisma.user.findFirst({
              where: { email: providedEmail, id: { not: existingUser.id } },
            });
            if (conflict) {
              errors++;
              errorDetails.push(
                `Fila ${cedula}: el correo "${providedEmail}" ya pertenece a otro usuario`,
              );
              continue;
            }
          }

          const updates: Record<string, any> = {};
          let mutated = false;

          // Add PROFESSOR role if missing
          if (!existingUser.roleIds.includes(professorRole.id)) {
            updates.roleIds = [...existingUser.roleIds, professorRole.id];
            mutated = true;
          }
          // Refresh display name from the Excel row
          if (existingUser.fullName !== nombre) {
            updates.fullName = nombre;
            mutated = true;
          }
          // Adopt the real email when it differs from a previously-generated
          // temporary one (or when the user simply provided a corrected one).
          if (providedEmail && providedEmail.toLowerCase() !== existingUser.email.toLowerCase()) {
            updates.email = providedEmail;
            mutated = true;
          }

          if (mutated) {
            await this.prisma.user.update({ where: { id: existingUser.id }, data: updates });
            updated++;
            userIds.push(existingUser.id);
            this.logger.debug(`[bulkImportProfessors] Updated user ${existingUser.id}`);
          } else {
            this.logger.debug(`[bulkImportProfessors] User ${existingUser.id} unchanged`);
          }
        } else {
          // Same conflict check on the create path — the email unique index
          // would throw otherwise, and a single bad row would abort the loop
          // via the catch below (worse UX than a per-row error).
          if (providedEmail) {
            const conflict = await this.prisma.user.findFirst({
              where: { email: providedEmail },
            });
            if (conflict) {
              errors++;
              errorDetails.push(
                `Fila ${cedula}: el correo "${providedEmail}" ya está registrado para otro usuario`,
              );
              continue;
            }
          }

          // Use the Excel-provided email when present, fall back to the
          // deterministic placeholder otherwise. Lower-cased to keep the
          // email column normalized.
          const email = providedEmail
            ? providedEmail.toLowerCase()
            : `profesor.${cedula}@una.cr`;

          const newUser = await this.prisma.user.create({
            data: {
              email,
              fullName: nombre,
              nationalId: cedula,
              roleIds: [professorRole.id],
              status: UserStatus.PRE_REGISTRATION,
            },
          });

          created++;
          userIds.push(newUser.id);
          this.logger.debug(`[bulkImportProfessors] Created new user ${newUser.id}`);
        }
      } catch (error) {
        errors++;
        const errorMsg = `Error procesando profesor ${prof.nombre} (${prof.cedula}): ${error instanceof Error ? error.message : String(error)}`;
        errorDetails.push(errorMsg);
        this.logger.error(`[bulkImportProfessors] ${errorMsg}`);
      }
    }

    this.logger.log(
      `[bulkImportProfessors] Completed: ${created} created, ${updated} updated, ${errors} errors`,
    );

    return {
      created,
      updated,
      errors,
      errorDetails,
      userIds,
    };
  }
}
