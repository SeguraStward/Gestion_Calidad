/**
 * Permission constants for User Management module
 * These codes MUST match exactly with backend permission codes
 */
export const USER_MANAGEMENT_PERMISSIONS = {
  // Matches backend: { name: "USUARIOS", code: "USER" }
  USER: 'USER',

  // Matches backend: { name: "ROL DE USUARIO", code: "USER_ROLE" }  
  USER_ROLE: 'USER_ROLE',

  // Matches backend: { name: "PERMISOS", code: "USER_PERMISSION" }
  USER_PERMISSION: 'USER_PERMISSION'
} as const

/**
 * Permission constants for Final Report module
 * These codes MUST match exactly with backend permission codes
 */
export const FINAL_REPORT_PERMISSIONS = {
  // Matches backend ResourceName decorator: FINAL_REPORT
  FINAL_REPORT: 'FINAL_REPORT'
} as const

export const ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  REPORT: 'REPORT'
} as const

export const SCOPES = {
  ALL: 'ALL',
  OWN: 'OWN'
} as const

// Export types for TypeScript
export type UserManagementPermission = typeof USER_MANAGEMENT_PERMISSIONS[keyof typeof USER_MANAGEMENT_PERMISSIONS]
export type FinalReportPermission = typeof FINAL_REPORT_PERMISSIONS[keyof typeof FINAL_REPORT_PERMISSIONS]
export type Action = typeof ACTIONS[keyof typeof ACTIONS]
export type Scope = typeof SCOPES[keyof typeof SCOPES]

/**
 * Check if user has admin permissions for user management
 */
export function isUserManagementAdmin(hasPermission: (resource: string, action: string, scope?: string) => boolean): boolean {
  return hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.READ, SCOPES.ALL) ||
    hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_ROLE, ACTIONS.READ, SCOPES.ALL) ||
    hasPermission(USER_MANAGEMENT_PERMISSIONS.USER_PERMISSION, ACTIONS.READ, SCOPES.ALL)
}

/**
 * Check if user has admin permissions for final reports (can see all reports)
 */
export function isFinalReportAdmin(hasPermission: (resource: string, action: string, scope?: string) => boolean): boolean {
  return hasPermission(FINAL_REPORT_PERMISSIONS.FINAL_REPORT, ACTIONS.READ, SCOPES.ALL)
}

/**
 * Check if user has professor permissions for final reports (can see own reports)
 */
export function isFinalReportProfessor(hasPermission: (resource: string, action: string, scope?: string) => boolean): boolean {
  return hasPermission(FINAL_REPORT_PERMISSIONS.FINAL_REPORT, ACTIONS.READ, SCOPES.OWN)
}