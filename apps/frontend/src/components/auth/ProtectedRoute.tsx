import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePermissions?: {
    resource: string
    action: string
    scope?: string
  }[]
  fallbackPath?: string
}

/**
 * Component to protect routes that require specific permissions
 */
export function ProtectedRoute({
  children,
  requirePermissions = [],
  fallbackPath = '/dashboard'
}: ProtectedRouteProps) {
  const { hasPermission, isLoading, user, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return

    // Check if user is authenticated
    if (!user) {
      console.log('[ProtectedRoute] No user found, redirecting to login')
      router.push('/auth/login')
      return
    }

    // Check if user has an active role
    if (!role) {
      console.log('[ProtectedRoute] No active role found, user cannot access protected resources')
      router.push('/auth/no-role')
      return
    }

    // Check specific permissions if required
    if (requirePermissions.length > 0) {
      const hasAllPermissions = requirePermissions.every(permission =>
        hasPermission(permission.resource, permission.action, permission.scope)
      )

      if (!hasAllPermissions) {
        console.log('[ProtectedRoute] User lacks required permissions:', requirePermissions)
        router.push('/auth/unauthorized')
        return
      }
    }
  }, [isLoading, user, role, hasPermission, requirePermissions, router, fallbackPath])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render children if not authenticated or no role
  if (!user || !role) {
    return null
  }

  // Check permissions before rendering
  if (requirePermissions.length > 0) {
    const hasAllPermissions = requirePermissions.every(permission =>
      hasPermission(permission.resource, permission.action, permission.scope)
    )

    if (!hasAllPermissions) {
      return null
    }
  }

  return <>{children}</>
}

/**
 * Higher-order component for user management protection
 */
export function withUserManagementProtection<T extends object>(Component: React.ComponentType<T>) {
  return function ProtectedUserManagementComponent(props: T) {
    return (
      <ProtectedRoute
        requirePermissions={[
          {
            resource: USER_MANAGEMENT_PERMISSIONS.USER,
            action: ACTIONS.READ,
            scope: SCOPES.ALL
          }
        ]}
        fallbackPath="/dashboard"
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
