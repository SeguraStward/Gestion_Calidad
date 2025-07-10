import { memo } from 'react'
import { Skeleton } from '@una-gc/ui/components/skeleton'

export const RoleLoadingSkeleton = memo(function RoleLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/20">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})
