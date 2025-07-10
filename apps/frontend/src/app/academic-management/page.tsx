'use client'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { BookOpen, Wrench, ChevronRight, Target } from 'lucide-react'
import Link from 'next/link'

export default function GestionAcademicaPage() {
  const quickActions = [
    {
      title: 'Cargas Académicas',
      description: 'Gestionar y administrar las cargas académicas',
      icon: BookOpen,
      href: '/academic-management/academic-load',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Mantenimiento General',
      description: 'Mantenimiento y configuración general académica',
      icon: Wrench,
      href: '/academic-management/academic-maintenance',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      iconColor: 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <>
      <div className="fixed inset-0 -z-10 animated-bg" />
      <div className="h-full w-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 mr-4 icon-bounce">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Gestión Académica
                </h1>
                <div className="flex items-center justify-center mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Acciones Rápidas
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Seleccione una opción para comenzar a gestionar la información académica.
            </p>
          </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="group card-hover border-0 shadow-sm glass-effect">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 icon-bounce`}>
                    <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{action.title}</CardTitle>
                  <CardDescription className="text-sm">{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    <Link href={action.href}>
                      Acceder
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
