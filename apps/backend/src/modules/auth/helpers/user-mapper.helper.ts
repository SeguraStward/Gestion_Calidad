import { UserResponseDto } from '../dtos/user-response.dto';

/**
 * Helper function to consistently map user data to response format
 * Ensures all user responses have the same structure and required fields
 * VERSIÓN MEJORADA CON LOGS Y VALIDACIONES
 */
export function mapUserToResponse(user: {
  id: string;
  email: string;
  fullName?: string | null;
  fullLastName?: string | null;
  photoUrl?: string | null;
  status: string;
}): UserResponseDto {
  // Log de entrada para debugging
  console.log('[mapUserToResponse] Procesando usuario:', {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    fullLastName: user.fullLastName,
    photoUrl: user.photoUrl,
    status: user.status,
  });

  // Validar datos obligatorios
  if (!user.id) {
    console.error('[mapUserToResponse] ❌ Error: Falta ID de usuario');
    throw new Error('User ID is required');
  }
  if (!user.email) {
    console.error('[mapUserToResponse] ❌ Error: Falta email de usuario');
    throw new Error('User email is required');
  }

  // Ensure we have a display name (consistent logic with frontend)
  const name = user.fullName || user.email.split('@')[0] || 'Usuario';

  const response: UserResponseDto = {
    id: user.id,
    name: name, // Campo principal que usa el frontend
    email: user.email,
    fullName: user.fullName || undefined,
    fullLastName: user.fullLastName || undefined,
    photoUrl: user.photoUrl || null,
    status: user.status,
  };

  // Log de salida para debugging
  console.log('[mapUserToResponse] Respuesta generada:', response);

  return response;
}

/**
 * Validates that user data contains all required fields
 */
export function validateUserData(user: any): void {
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

export function logUserResponse(user: UserResponseDto, context: string = ''): void {
  // eslint-disable-next-line no-console
  console.log(`[UserResponseDto][${context}]`, {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    status: user.status,
  });
}
