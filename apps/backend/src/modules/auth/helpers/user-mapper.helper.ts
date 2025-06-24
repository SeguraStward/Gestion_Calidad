import { Logger } from '@nestjs/common';
import { UserResponseDto } from '../dtos/user-response.dto';
import { DatabaseUser } from '../types';

const logger = new Logger('UserMapper');

/**
 * Helper function to consistently map user data to response format
 * Ensures all user responses have the same structure and required fields
 */
export function mapUserToResponse(user: DatabaseUser): UserResponseDto {
  // Validar datos obligatorios
  if (!user.id) {
    logger.error('User ID is required');
    throw new Error('User ID is required');
  }
  if (!user.email) {
    logger.error('User email is required');
    throw new Error('User email is required');
  }

  const response: UserResponseDto = {
    id: user.id,
    email: user.email,
    fullName: user.fullName || undefined,
    fullLastName: user.fullLastName || undefined,
    photoUrl: user.photoUrl || null,
    status: user.status,
  };

  logger.debug(`Mapped user response for ${user.email}`);
  return response;
}

/**
 * Validates that user data contains all required fields
 */
export function validateUserData(user: DatabaseUser): void {
  if (!user) {
    throw new Error('User data is null or undefined');
  }

  if (!user.id) {
    throw new Error('User ID is required');
  }

  if (!user.email) {
    throw new Error('User email is required');
  }

  if (!user.status) {
    throw new Error('User status is required');
  }
}
