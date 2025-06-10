export interface AuthErrorInfo {
  title: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

/**
 * Mapping of standardized authentication error codes to user-friendly messages
 */
export const AUTH_ERROR_CODES: Record<string, AuthErrorInfo> = {
  // Authentication errors (001-099)
  AUTH_001: {
    title: 'Error de autenticación',
    message: 'No pudimos verificar tus credenciales. Por favor intenta de nuevo.',
    severity: 'error'
  },
  AUTH_002: {
    title: 'Dominio no autorizado',
    message: 'Solo se permiten correos del dominio @est.una.ac.cr',
    severity: 'error'
  },
  AUTH_003: {
    title: 'Cuenta pendiente de activación',
    message:
      'Tu cuenta está registrada pero aún no ha sido activada. Por favor contacta al administrador para completar el proceso de activación.',
    severity: 'warning'
  },
  AUTH_004: {
    title: 'Cuenta desactivada',
    message:
      'Tu cuenta ha sido desactivada por un administrador. Por favor contacta al administrador del sistema para reactivar tu acceso.',
    severity: 'error'
  },
  AUTH_005: {
    title: 'Acceso denegado',
    message: 'No tienes permisos para acceder al sistema. Contacta al administrador.',
    severity: 'error'
  },
  AUTH_006: {
    title: 'No autorizado',
    message: 'No pudimos autenticar tu sesión. Por favor intenta iniciar sesión nuevamente.',
    severity: 'error'
  },
  AUTH_007: {
    title: 'Acceso restringido',
    message: 'Tu cuenta no tiene permiso para acceder al sistema.',
    severity: 'error'
  },
  AUTH_010: {
    title: 'Usuario no registrado',
    message:
      'No existe una cuenta asociada a este correo electrónico. Debes contactar al administrador para solicitar acceso al sistema.',
    severity: 'error'
  },
  AUTH_011: {
    title: 'Cuenta desactivada',
    message:
      'Tu cuenta ha sido desactivada por un administrador. Por favor contacta al administrador del sistema para reactivar tu acceso.',
    severity: 'error'
  },
  AUTH_012: {
    title: 'Cuenta pendiente de activación',
    message:
      'Tu cuenta está registrada pero aún no ha sido activada. Por favor contacta al administrador para completar el proceso de activación.',
    severity: 'warning'
  },

  // General server errors (500+)
  AUTH_500: {
    title: 'Error del servidor',
    message: 'Ha ocurrido un error interno. Por favor intenta más tarde o contacta a soporte.',
    severity: 'error'
  }
}

/**
 * Gets error information for a given error code
 * @param code The error code from the server
 * @returns Error information with title and message
 */
export function getAuthErrorInfo(code?: string): AuthErrorInfo {
  if (!code) {
    return {
      title: 'Error desconocido',
      message: 'Ha ocurrido un error desconocido. Por favor intenta nuevamente.',
      severity: 'error'
    }
  }

  return (
    AUTH_ERROR_CODES[code] || {
      title: 'Error inesperado',
      message: `Ha ocurrido un error (${code}). Por favor contacta a soporte.`,
      severity: 'error'
    }
  )
}
