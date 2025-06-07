'use client'

import { useEffect, useState } from 'react'
import { Card } from '@una-gc/ui/components/card'
import { InstitutionalMaintenanceTabs } from '@/modules/academic-management/academic-maintenance/components/tabs'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { PageHeader } from '@/modules/academic-management/academic-maintenance/components/page-header'
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
    <Card className="w-full shadow-sm border p-4 space-y-6">
      <PageHeader title="Mantenimiento de Estructura Institucional" icon={Layers3} />
      <InstitutionalMaintenanceTabs loading={loading} SkeletonCrud={SkeletonCrud} />
    </Card>
  )
}
