'use client'

import { useEffect, useState } from 'react'
import { Card } from '@una-gc/ui/components/card'
import { InstitutionalMaintenanceTabs } from '@/modules/academic-management/academic-maintenance/components/tabs'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { PageHeader } from '@/app/(components)/ui/page-header'
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
    <div className="w-full flex justify-center px-4 md:px-6 lg:px-10 py-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="w-full shadow-md border p-6 space-y-6 rounded-2xl">
          <PageHeader
            title="Mantenimiento Universitario"
            icon={Layers3}
            subtitle="Administra la estructura académica de la institución"
          />
          <InstitutionalMaintenanceTabs loading={loading} SkeletonCrud={SkeletonCrud} />
        </Card>
      </div>
    </div>
  )
}
