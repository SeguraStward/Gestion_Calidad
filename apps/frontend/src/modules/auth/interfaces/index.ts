// Type definitions
export interface Permission {
  id: string
  name: string
  code: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions?: Permission[]
}

// export interface SwitchRoleResponse {
//   user: {
//     id: string
//     email: string
//     fullName: string
//     fullLastName: string
//     profilePicture: string
//     role: {
//       id: string
//       name: string
//       description: string
//       permissions: Array<{
//         permissionID: string
//         permissions: string[]
//         scope: string | null
//         actions: string[]
//       }>
//     }
//   }
//   token: string
// }
