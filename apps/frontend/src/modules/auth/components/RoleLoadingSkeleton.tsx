import { memo } from 'react'
import { Skeleton } from '@una-gc/ui/components/skeleton'

export const RoleLoadingSkeleton = memo(function RoleLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-border shadow-sm animate-pulse min-h-[90px]"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
})
