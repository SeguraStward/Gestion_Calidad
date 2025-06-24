// Main hooks - Unified and optimized
export { useAuth } from './useAuth'
export { useLoginCallback } from './useLoginCallback'

// Legacy hooks (kept for backward compatibility if needed)
export { useRoleSelection } from './useRoleSelection'
export { useHttpOnlyAuth } from './useHttpOnlyAuth'
export { useCookieDebug } from './useCookieDebug'
export { useIntegratedAuth } from './useIntegratedAuth'

// Default export - Primary auth hook
export { useAuth as default } from './useAuth'
