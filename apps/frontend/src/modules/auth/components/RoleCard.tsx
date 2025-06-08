import { memo } from 'react'
import { CheckCircle, Shield, Users, ChevronRight } from 'lucide-react'
import { RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Label } from '@una-gc/ui/components/label'
import { cn } from '@una-gc/ui/lib/utils'
import { Role } from '../interfaces'

interface RoleCardProps {
  role: Role
  isSelected: boolean
  index: number
  totalRoles: number
}

export const RoleCard = memo(function RoleCard({ role, isSelected, index, totalRoles }: RoleCardProps) {
  const permissionCount = role.permissions?.length || 0

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 transition-colors cursor-pointer group',
        isSelected ? 'border-primary bg-primary/5 shadow' : 'border-border bg-background hover:bg-accent/30'
      )}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem value={role.id.toString()} id={role.id.toString()} className="mt-1" />
        <div className="flex-1 min-w-0">
          <Label htmlFor={role.id.toString()} className="flex flex-col gap-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground truncate">{role.name}</span>
                {role.description && (
                  <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">{role.description}</span>
                )}
              </span>
            </div>
          </Label>
        </div>
      </div>
    </div>
  )
})
