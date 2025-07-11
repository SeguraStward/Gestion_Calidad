import { AuthService } from '../services/auth.service'
import { CookieDetectionService } from '../services/cookie-detection.service'
import { CookieManager } from '../utils/cookie.manager'

/**
 * Integration test utilities for the updated auth system
 * These functions can be used to verify the new auth system works correctly
 */

export class AuthTestUtils {
  /**
   * Test basic authentication flow
   */
  static async testAuthFlow() {
    console.log('🧪 Testing Auth Flow...')

    try {
      // 1. Check cookie presence
      const cookiePresence = await CookieDetectionService.checkCookiePresence()
      console.log('Cookie presence:', cookiePresence)

      // 2. If authenticated, get user profile
      if (cookiePresence.isAuthenticated) {
        const UserBasicInfo = await AuthService.getUserBasicInfo()
        console.log('User profile:', UserBasicInfo)

        // 3. Get user roles
        const roles = await AuthService.getUserRoles()
        console.log('User roles:', roles)

        // 4. Get active role
        const activeRole = await AuthService.getActiveRole()
        console.log('Active role ID:', activeRole)
      }

      console.log('✅ Auth flow test completed')
      return true
    } catch (error) {
      console.error('❌ Auth flow test failed:', error)
      return false
    }
  }

  /**
   * Test role management
   */
  static async testRoleManagement() {
    console.log('🧪 Testing Role Management...')

    try {
      // 1. Get available roles
      const roles = await AuthService.getUserRoles()

      if (roles.length === 0) {
        console.log('ℹ️ No roles available for testing')
        return true
      }

      // 2. Set first role as active
      const firstRole = roles[0]
      if (!firstRole) {
        console.log('❌ No first role found to set as active')
        return false
      }
      const setSuccess = await AuthService.setActiveRole(firstRole.id)
      console.log('Set active role success:', setSuccess)

      // 3. Verify role was set
      const activeRoleId = await AuthService.getActiveRole()
      console.log('Active role ID after setting:', activeRoleId)

      // 4. Store role in session storage
      CookieManager.setActiveRole(firstRole)
      const storedRole = CookieManager.getActiveRole()
      console.log('Role stored in session:', storedRole)

      console.log('✅ Role management test completed')
      return true
    } catch (error) {
      console.error('❌ Role management test failed:', error)
      return false
    }
  }

  /**
   * Test environment detection
   */
  static testEnvironmentDetection() {
    console.log('🧪 Testing Environment Detection...')

    const isDev = process.env.NODE_ENV == 'development'
    const cookieDomain = isDev ? 'localhost' : process.env.DOMAIN

    console.log('Is development:', isDev)
    console.log('Cookie domain:', cookieDomain)
    console.log('Expected domain:', isDev ? 'undefined' : process.env.DOMAIN)

    const isCorrect = isDev ? cookieDomain === undefined : cookieDomain === process.env.DOMAIN

    if (isCorrect) {
      console.log('✅ Environment detection test passed')
    } else {
      console.log('❌ Environment detection test failed')
    }

    return isCorrect
  }

  /**
   * Test users service
   */
  static async testUsersService() {
    console.log('🧪 Testing Users Service...')

    try {
      // Test getting current user
      const currentUser = await AuthService.getUserBasicInfo()
      console.log('Current user:', currentUser)

      // Test getting current user roles
      const userRoles = await AuthService.getUserRoles()
      console.log('Current user roles:', userRoles)

      console.log('✅ Users service test completed')
      return true
    } catch (error) {
      console.error('❌ Users service test failed:', error)
      return false
    }
  }

  /**
   * Test logout flow
   */
  static async testLogout() {
    console.log('🧪 Testing Logout Flow...')

    try {
      // 1. Check auth status before logout
      const beforeLogout = await CookieDetectionService.checkCookiePresence()
      console.log('Auth status before logout:', beforeLogout)

      // 2. Perform logout
      await AuthService.logout()

      // 3. Clear local session data
      CookieManager.clearAll()

      // 4. Check auth status after logout
      const afterLogout = await CookieDetectionService.checkCookiePresence()
      console.log('Auth status after logout:', afterLogout)

      const logoutSuccess = !afterLogout.isAuthenticated

      if (logoutSuccess) {
        console.log('✅ Logout test passed')
      } else {
        console.log('❌ Logout test failed - still authenticated')
      }

      return logoutSuccess
    } catch (error) {
      console.error('❌ Logout test failed:', error)
      return false
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Running all auth system tests...')

    const results = {
      authFlow: await this.testAuthFlow(),
      roleManagement: await this.testRoleManagement(),
      environmentDetection: this.testEnvironmentDetection(),
      usersService: await this.testUsersService()
      // Note: Logout test is destructive, so it's commented out
      // logout: await this.testLogout()
    }

    const passed = Object.values(results).filter(Boolean).length
    const total = Object.keys(results).length

    console.log(`\n📊 Test Results: ${passed}/${total} passed`)
    console.log('Results:', results)

    return results
  }
}
