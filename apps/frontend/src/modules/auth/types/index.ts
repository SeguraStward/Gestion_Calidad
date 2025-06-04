// interfaces for authentication module in frontend

// Alineado con la interfaz Permission del backend
export interface Permission {
  permissionID: string
  permissions: string[] // PermissionType[] en el backend, string[] en el frontend
  scope: string | null // PermissionScope en el backend, string en el frontend
  actions: string[]
}

// Alineado con la interfaz SelectedRole del backend
export interface SelectedRole {
  id: string
  name: string
  description?: string | null
  permissions: Permission[]
}

// Alineado con la interfaz UserFromJwt del backend
export interface UserProfile {
  id: string
  email: string
  fullName: string
  fullLastName?: string
  profilePicture?: string
  role?: SelectedRole
}

// Alineado con la interfaz AuthResponse del backend
export interface AuthResponse {
  user: UserProfile
  token: string
  refreshToken?: string
}

// Para la respuesta al cambiar de rol
export interface SwitchRoleResponse {
  user: UserProfile
  token?: string // Optional because it's set in cookie and not returned in response body
}

// Para los roles activos del usuario
export interface Role {
  id: string
  name: string
  description?: string | null
  permissions?: Permission[]
}
