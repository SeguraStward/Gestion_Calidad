'use client'

import { Button } from '@una-gc/ui/components'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@una-gc/ui/components/sidebar'
import Link from 'next/link'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { useAuth } from '@/modules/auth/hooks'
import {
  USER_MANAGEMENT_PERMISSIONS,
  FINAL_REPORT_PERMISSIONS,
  ACTIONS,
  SCOPES,
  isFinalReportAdmin,
  isFinalReportProfessor
} from '@/modules/auth/constants/permissions'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasPermission, user, role } = useAuth()

  // Check if user is admin by role name (for ADMINISTRADOR role without specific permissions)
  const isAdminRole = role?.name === 'ADMINISTRADOR'

  // Check if user has admin permission for user management
  const canManageUsers = isAdminRole || hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.READ, SCOPES.ALL)

  // Check permissions for final reports
  const canViewAllFinalReports = isAdminRole || isFinalReportAdmin(hasPermission)
  const canViewOwnFinalReports = isFinalReportProfessor(hasPermission)

  // FALLBACK: Si no funciona con scope, intentar sin scope (backwards compatibility)
  const canViewAnyFinalReports =
    canViewOwnFinalReports || canViewAllFinalReports || hasPermission(FINAL_REPORT_PERMISSIONS.FINAL_REPORT, ACTIONS.READ)

  // Check if user is admin (can manage users = admin)
  const isAdmin = isAdminRole || canManageUsers

  // Debug logs para verificar permisos
  console.log('🔍 Sidebar Debug:', {
    user: user?.fullName,
    roleName: role?.name,
    isAdminRole,
    canManageUsers,
    isAdmin,
    canViewAllFinalReports,
    canViewOwnFinalReports,
    canViewAnyFinalReports,
    rolePermissions: role?.permissions?.map((p) => ({
      code: p.code,
      actions: (p as any).actions || (p as any).permissions,
      scope: (p as any).scope
    }))
  })

  const navMain = [
    // Gestión Académica - Only for admins
    ...(isAdmin
      ? [
          {
            title: 'Gestión Académica',
            url: '/gestion-academica',
            icon: require('lucide-react').Building,
            items: [
              { title: 'Cargas Academicas', url: '/academic-management/academic-load' },
              { title: 'Mantenimiento General', url: '/academic-management/academic-maintenance' }
            ]
          }
        ]
      : []),

    // Gestión de Tiempos de Jornada - Only for admins
    ...(isAdmin
      ? [
          {
            title: 'Gestión de Tiempos de Jornada',
            url: '/times-management',
            icon: require('lucide-react').Clock,
            items: [
              { title: 'Panel de Tiempos', url: '/times-management' },
              { title: 'Resumen Anual', url: '/times-management/summary' },
              { title: 'Proyectos y Proveedores', url: '/times-management/extensions' },
              { title: 'Configuracion de Jornada', url: '/times-management/configuracion' }
            ]
          }
        ]
      : []),

    // Gestión SINAES - Only for admins
    ...(isAdmin
      ? [
          {
            title: 'Gestión SINAES',
            url: '/sinaes-management',
            icon: require('lucide-react').BookCheck,
            items: [
              { title: 'Panel de Gestión', url: '/sinaes-management' },
              { title: 'Reportes de Cumplimiento', url: '/sinaes/reports' }
            ]
          }
        ]
      : []),

    // User Management - Only for admins
    ...(canManageUsers
      ? [
          {
            title: 'Gestión de Usuarios',
            url: '/user-management',
            icon: require('lucide-react').Users,
            items: [
              { title: 'Usuarios', url: '/user-management/user' },
              { title: 'Roles', url: '/user-management/user-role' }
            ]
          }
        ]
      : []),

    // Final Reports section - Admin view (can see all reports)
    ...(canViewAllFinalReports
      ? [
          {
            title: 'Informes Finales (Admin)',
            url: '/admin/final-reports',
            icon: require('lucide-react').FileCheck,
            items: [
              { title: 'Todos los Informes', url: '/admin/final-reports' },
              { title: 'Gestión de Preguntas', url: '/admin/question-management' }
            ]
          }
        ]
      : []),

    // Bulk Import - Only for admins
    ...(isAdmin
      ? [
          {
            title: 'Importación Masiva',
            url: '/admin/bulk-import',
            icon: require('lucide-react').FileSpreadsheet,
            items: [
              { title: 'Cursos', url: '/admin/bulk-import/courses' },
              { title: 'Profesores', url: '/admin/bulk-import/professors' },
              { title: 'Cargas Académicas', url: '/admin/bulk-import/academic-loads' }
            ]
          }
        ]
      : []), // Final Reports section - Professor view (can see own reports)
    // Show if user has professor permissions (even if they also have admin permissions)
    ...(canViewAnyFinalReports && !canViewAllFinalReports
      ? [
          {
            title: 'Mis Informes Finales',
            url: '/final-reports',
            icon: require('lucide-react').FileText,
            items: [
              { title: 'Mis Informes', url: '/final-reports' },
              { title: 'Crear Nuevo Informe', url: '/final-reports/new' }
            ]
          }
        ]
      : []),

    {
      title: 'Cambio de Rol',

      url: '/auth/select-role',
      icon: require('lucide-react').Users,
      items: [{ title: 'Seleccionar Rol', url: '/auth/select-role' }]
    }
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-primary">Gestión de la Calidad</span>
          </div>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full shadow-sm hover:bg-primary/10 transition-colors">
              Menú principal
            </Button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-2">
          <NavMain items={navMain} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <NavUser />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
