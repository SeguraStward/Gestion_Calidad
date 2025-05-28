'use client'

import { Card } from '@una-gc/ui/components/card'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { Loader2 } from 'lucide-react'

export const LoadingState = () => (
  <div className="space-y-6">
    <div className="flex items-center space-x-2 mb-2">
      <Loader2 className="animate-spin h-5 w-5 text-primary" />
      <p className="text-sm text-muted-foreground">Cargando datos de las asignaciones...</p>
    </div>

    <Card className="p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-1/2 rounded-md" />
      </div>
    </Card>

    <div className="mt-6">
      <Skeleton className="h-8 w-1/4 mb-4 rounded-md" />
      <Skeleton className="h-10 w-full mb-2 rounded-md" />
    </div>

    <div className="space-y-4">
      <Skeleton className="h-6 w-1/4 rounded-md" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  </div>
)
