'use client'

import * as React from 'react'
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  ClipboardList,
  FileText,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  Languages,
  Map,
  PieChart,
  Users
} from 'lucide-react'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@una-gc/ui/components/sidebar'

const data = {
  user: {
    name: 'Daniel Araya',
    email: 'darayaroma@gmail.com',
    avatar: '/assets/images/default-profile-image.png'
  },
  teams: [
    {
      name: 'Gestión de la Calidad',
      logo: GalleryVerticalEnd,
      plan: ''
    }
  ],
  navMain: [
    {
      title: 'Gestión Académica',
      url: '/gestion-academica',
      icon: Building,
      items: [
        //{ title: 'Importación de datos', url: '/academic-management/bulk-import' },
        { title: 'Asignación de profesores', url: '/academic-management/academic-load' },
        { title: 'Mantenimiento General', url: '/academic-management/academic-maintenance' }
      ]
    },
    {
      title: 'Gestión de Usuarios',
      url: '/gestión-usuarios',
      icon: Users,
      items: [{ title: 'Mantenimiento', url: '/user-management/user-maintenance' }]
    },
    /*{
      title: 'Formación Académica',
      url: '/admin/academics',
      icon: GalleryVerticalEnd,
      items: [{ title: 'Lista de Cursos', url: '/admin/courses' }]
    },
    {
      title: 'Experiencia Laboral',
      url: '/admin/experiences',
      icon: Briefcase,
      items: [{ title: 'Lista de Experiencias', url: '/admin/experiences' }]
    },
    {
      title: 'Producción Intelectual',
      url: '/admin/intellectuals',
      icon: BookOpen,
      items: [{ title: 'Lista de Producciones', url: '/admin/intellectuals' }]
    },
    {
      title: 'Idiomas',
      url: '/admin/languages',
      icon: Languages,
      items: [{ title: 'Lista de Idiomas', url: '/admin/languages' }]
    },
    {
      title: 'PPAA',
      url: '/admin/ppaa',
      icon: ClipboardList,
      items: [{ title: 'Lista de PPAA', url: '/admin/ppaa' }]
    },
    {
      title: 'Trabajos de Graduación',
      url: '/admin/graduation-works',
      icon: GraduationCap,
      items: [{ title: 'Lista de Trabajos', url: '/admin/graduation-works' }]
    },*/
    {
      title: 'Informe Final',
      url: '/final-report',
      icon: FileText,
      items: [{ title: 'Lista de Informes', url: '/final-reports' }]
    },
    /*{
      title: 'Modelos SINAES',
      url: '/admin/sinaes-models',
      icon: Building2,
      items: [{ title: 'Lista de Modelos', url: '/admin/sinaes-models' }]
    },*/
    {
      title: 'Reportes',
      url: '/admin/reports',
      icon: BarChart3,
      items: [{ title: 'Lista de Reportes', url: '/admin/reports' }]
    },
    /*{
      title: 'Comisiones',
      url: '/admin/commissions',
      icon: Users,
      items: [{ title: 'Lista de Comisiones', url: '/admin/commissions' }]
    },
    {
      title: 'Trabajo Final Graduación',
      url: '/admin/final-graduation-work',
      icon: Award,
      items: [{ title: 'Lista de Trabajos', url: '/admin/final-graduation-work' }]
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }*/
    {
      title: 'Cambio de Rol',
      url: '/auth/select-role',
      icon: Users,
      items: [{ title: 'Seleccionar Rol', url: '/auth/select-role' }]
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
