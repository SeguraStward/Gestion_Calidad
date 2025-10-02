'use client'

import { Button } from '@una-gc/ui/components'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@una-gc/ui/components/sidebar'
import Link from 'next/link'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { useAuth } from '@/modules/auth/hooks'
import { USER_MANAGEMENT_PERMISSIONS, ACTIONS, SCOPES } from '@/modules/auth/constants/permissions'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasPermission, user, role } = useAuth()

  // Check if user has admin permission for user management
  const canManageUsers = hasPermission(USER_MANAGEMENT_PERMISSIONS.USER, ACTIONS.READ, SCOPES.ALL)

  // Debug logging
  console.debug('Sidebar permission check:', {
    user,
    role,
    canManageUsers,
    userPermission: USER_MANAGEMENT_PERMISSIONS.USER,
    action: ACTIONS.READ,
    scope: SCOPES.ALL
  })

  // Temporarily show user management for all authenticated users while debugging
  const showUserManagement = true // !!user || canManageUsers

  const navMain = [
    {
      title: 'Gestión Académica',
      url: '/gestion-academica',
      icon: require('lucide-react').Building,
      items: [
        { title: 'Cargas Academicas', url: '/academic-management/academic-load' },
        { title: 'Mantenimiento General', url: '/academic-management/academic-maintenance' }
      ]
    },
    {
      title: 'Gestión SINAES',
      url: '/sinaes-management',
      icon: require('lucide-react').BookCheck,
      items: [{ title: 'Panel de Gestión', url: '/sinaes-management' }]
    },

    {
      title: 'Gestión de Tiempos de Jornada',
      url: '/times-management',
      icon: require('lucide-react').Clock,
      items: [{ title: 'Panel de Tiempos', url: '/times-management' }]
    },

    ...(showUserManagement
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
    {
      title: 'Informe Final',
      url: '/final-report',
      icon: require('lucide-react').FileText,
      items: [
        { title: 'Lista de Informes', url: '/final-reports' },
        { title: 'Gestión de Preguntas', url: '/admin/question-management' }
      ]
    },
    {
      title: 'Gestión de Evidencias',
      url: '/evidence-management',
      icon: require('lucide-react').Files,
      items: [
        { title: 'Evidencias', url: '/evidence-management' },
        { title: 'Subir Evidencia', url: '/evidence-management/upload' },
        { title: 'Configuración', url: '/evidence-management/settings' }
      ]
    },
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
