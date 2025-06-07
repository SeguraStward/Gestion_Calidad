import { memo } from 'react'
import { CheckCircle, Shield, Users, ChevronRight } from 'lucide-react'
import { RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Label } from '@una-gc/ui/components/label'
import { Badge } from '@una-gc/ui/components/badge'
import { cn } from '@una-gc/ui/lib/utils'
import { Role } from '@/modules/auth/auth.service'

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
        'relative border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:border-primary/40 hover:shadow-md',
        isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-accent/20'
      )}
    >
      <div className="flex items-start space-x-3">
        <RadioGroupItem value={role.id.toString()} id={role.id.toString()} className="mt-1" />

        <div className="flex-1 min-w-0">
          <Label htmlFor={role.id.toString()} className="flex flex-col space-y-2 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground truncate">{role.name}</h3>
                  {role.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{role.description}</p>}
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <ChevronRight className="w-3 h-3 text-primary" />
                </div>
              )}
            </div>

            {/* <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {permissionCount} permisos
                </Badge>
              </div>
            </div> */}
          </Label>
        </div>
      </div>
    </div>
  )
})
