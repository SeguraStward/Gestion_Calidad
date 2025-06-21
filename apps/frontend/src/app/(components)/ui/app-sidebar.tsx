'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@una-gc/ui/components/sidebar'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
      title: 'Gestión de Usuarios',
      url: '/gestión-usuarios',
      icon: require('lucide-react').Users,
      items: [{ title: 'Mantenimiento', url: '/user-management/user-maintenance' }]
    },
    {
      title: 'Informe Final',
      url: '/final-report',
      icon: require('lucide-react').FileText,
      items: [{ title: 'Lista de Informes', url: '/final-reports' }]
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
        <div className="flex items-center h-12 px-4 text-lg font-bold tracking-tight">Gestión de la Calidad</div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
