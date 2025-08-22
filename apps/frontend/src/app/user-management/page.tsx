'use client'

import { Badge } from '@una-gc/ui/components/badge'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { ChevronRight, KeyRound, LockKeyholeOpen, Sparkles, Target, Users } from 'lucide-react'
import Link from 'next/link'

export default function UserManagement() {
  const quickActions = [
    {
      title: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: Users,
      href: '/user-management/user',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Roles de Usuario',
      description: 'Gestionar roles y asignaciones',
      icon: LockKeyholeOpen,
      href: '/user-management/user-role',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  ]

  return (
    <div className="h-full animated-bg">
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-full">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 mr-4 icon-bounce">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Gestión de Usuarios
                </h1>
                <div className="flex items-center justify-center mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Universidad Nacional
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Administra usuarios, roles y permisos del sistema</p>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <Target className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold">Acciones Rápidas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  )
}
