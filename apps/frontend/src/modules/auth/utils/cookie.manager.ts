/**
 * Cookie Manager - Simplified
 *
 * IMPORTANT: This does NOT handle HttpOnly cookies (auth_token, refresh_token, user_active_role_id)
 * Those are handled automatically by the browser and validated via API calls.
 *
 * This only manages sessionStorage for UI state and preferences.
 */
export class CookieManager {
  private static readonly ROLE_KEY = 'selected_role_id'
  private static readonly ROLE_DATA_KEY = 'selected_role_data'

  /**
   * Get selected role ID from sessionStorage
   * This is UI preference only, not authentication state
   */
  static getRoleId(): string | null {
    try {
      return sessionStorage.getItem(this.ROLE_KEY)
    } catch {
      return null
    }
  }

  /**
   * Set selected role ID in sessionStorage
   * This is UI preference only, actual role setting is done via API
   */
  static setRoleId(roleId: string): void {
    try {
      sessionStorage.setItem(this.ROLE_KEY, roleId)
    } catch (error) {
      console.warn('Failed to save role preference:', error)
    }
  }

  /**
   * Check if user has a role preference stored
   * This does NOT check actual authentication state
   */
  static hasActiveRole(): boolean {
    return this.getRoleId() !== null
  }

  /**
   * Set active role object in sessionStorage (UI preference only)
   * The actual role activation must be done via API
   */
  static setActiveRole(role: { id: string; name: string; [key: string]: any }): void {
    try {
      this.setRoleId(role.id)
      sessionStorage.setItem(this.ROLE_DATA_KEY, JSON.stringify(role))
    } catch (error) {
      console.warn('Failed to save role data:', error)
    }
  }

  /**
   * Get active role data from sessionStorage
   */
  static getActiveRole(): any | null {
    try {
      const roleData = sessionStorage.getItem(this.ROLE_DATA_KEY)
      return roleData ? JSON.parse(roleData) : null
    } catch {
      return null
    }
  }

  /**
   * Clear selected role from sessionStorage
   */
  static clearRole(): void {
    try {
      sessionStorage.removeItem(this.ROLE_KEY)
      sessionStorage.removeItem(this.ROLE_DATA_KEY)
    } catch (error) {
      console.warn('Failed to clear role preference:', error)
    }
  }

  /**
   * Clear all managed session data
   */
  static clearAll(): void {
    this.clearRole()
  }
}
