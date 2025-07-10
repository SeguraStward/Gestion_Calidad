'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { InstitutionalMaintenanceTabs } from '@/modules/academic-management/academic-maintenance/components/tabs'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { Layers3 } from 'lucide-react'

export function AcademicMaintenancePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  const SkeletonCrud = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3 rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 mr-4 icon-bounce">
            <Layers3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mantenimiento Universitario
            </h1>
            <div className="flex items-center justify-center mt-2">
              <Badge variant="secondary" className="text-xs">
                Estructura Académica
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Administre la estructura académica de la institución, configure cursos, profesores, aulas y más.
        </p>
      </div>

      {/* Content Card */}
      <Card className="border-0 shadow-sm glass-effect">
        <CardContent className="p-6">
          <InstitutionalMaintenanceTabs loading={loading} SkeletonCrud={SkeletonCrud} />
        </CardContent>
      </Card>
    </div>
  )
}
