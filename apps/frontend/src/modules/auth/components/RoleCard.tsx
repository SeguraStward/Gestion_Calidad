import { memo } from 'react'
import { CheckCircle, Shield } from 'lucide-react'
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
        'relative border rounded-xl p-5 transition-all cursor-pointer group shadow-sm hover:shadow-lg bg-white/90 dark:bg-zinc-900/90',
        isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:bg-accent/40',
        'flex flex-col gap-2 min-h-[90px]'
      )}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value={role.id.toString()} id={role.id.toString()} className="mt-1" />
        <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shadow">
          <Shield className="w-5 h-5 text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <Label htmlFor={role.id.toString()} className="flex flex-col gap-1 cursor-pointer">
            <span className="block text-base font-semibold text-foreground truncate leading-tight">{role.name}</span>
            {role.description && (
              <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">{role.description}</span>
            )}
          </Label>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">{permissionCount} permisos</span>
        {isSelected && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
      </div>
    </div>
  )
})
