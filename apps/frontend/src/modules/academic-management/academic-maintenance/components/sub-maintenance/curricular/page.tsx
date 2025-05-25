'use client'

import { useEffect, useState } from 'react'
import { Card } from '@una-gc/ui/components/card'
import { CurricularMaintenanceTabs } from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/curricular/tabs'
import { Skeleton } from '@una-gc/ui/components/skeleton'

export function CurricularMaintenancePage() {
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
    <Card className="w-full shadow-sm border p-4 space-y-4">
      <CurricularMaintenanceTabs loading={loading} SkeletonCrud={SkeletonCrud} />
    </Card>
  )
}
