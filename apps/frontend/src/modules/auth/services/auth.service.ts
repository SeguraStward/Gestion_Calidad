import { CompleteProfileData, UserBasicInfo, UserRolesResponse } from '../types'

/**
 * Auth Service - Centralized authentication service for frontend
 * Handles all auth-related API calls and session management
 * Compatible with backend HttpOnly cookie authentication
 */
export class AuthService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  /**
   * Get current user profile
   */
  static async getUserBasicInfo(): Promise<UserBasicInfo> {
    const response = await fetch(`${this.API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
      }
      throw new Error(`Error al obtener perfil de usuario: ${response.statusText}`)
    }

    const data = await response.json()

    // El backend puede enviar: {data: {...}} o directamente {...}
    // Verificar ambas estructuras
    if (data.data) {
      return data.data as UserBasicInfo
    }

    return data as UserBasicInfo
  }

  /**
   * Get user roles (uses users controller for role queries)
   */
  static async getUserRoles(): Promise<UserRolesResponse> {
    const response = await fetch(`${this.API_URL}/users/me/roles/active`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401: Unauthorized');
      }
      throw new Error(`Failed to get user roles: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend puede enviar: {data: [...]} o directamente [...]
    return data.data || data;
  }

  /**
   * Complete user profile
   */
  static async completeProfile(profileData: CompleteProfileData): Promise<UserBasicInfo> {
    const response = await fetch(`${this.API_URL}/auth/complete-profile`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to complete profile: ${response.statusText}`)
    }

    const data = await response.json()
    // Backend puede enviar: {data: {...}} o {user: {...}}
    return data.data || data.user || data
  }

  /**
   * Set active role for current user
   */
  static async setActiveRole(roleId: string): Promise<boolean> {
    const response = await fetch(`${this.API_URL}/auth/set-active-role`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roleId })
    })

    return response.ok
  }

  /**
   * Get current active role ID
   */
  static async getActiveRole(): Promise<string | null> {
    const response = await fetch(`${this.API_URL}/auth/active-role`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    // Backend puede enviar: {data: {activeRoleId: ...}} o {activeRoleId: ...}
    return data.data?.activeRoleId || data.activeRoleId || null
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      })
      return response.ok
    } catch {
      return false
    }
  }
}
