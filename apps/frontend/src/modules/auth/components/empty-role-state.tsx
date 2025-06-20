import { memo } from 'react'
import { RefreshCcw, AlertTriangle } from 'lucide-react'

import { Button } from '@una-gc/ui/components/button'

interface EmptyRoleStateProps {
  onRetry: () => void
}

export const EmptyRoleState = memo(function EmptyRoleState({ onRetry }: EmptyRoleStateProps) {
  return (
    <div className="space-y-4 text-center py-8">
      <div className="space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
      </div>

      <Button onClick={onRetry} variant="outline" className="w-full">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Intentar nuevamente
      </Button>
    </div>
  )
})
