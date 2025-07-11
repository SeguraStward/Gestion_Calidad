'use client'

import { UserStatus } from '@una-gc/database/prisma/generated/client'
import { Badge } from '@una-gc/ui/components/badge'

export function getStatusBadgeVariant(status: UserStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'INACTIVE':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function getStatusLabel(status: UserStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'Activo'
    case 'INACTIVE':
      return 'Archivado'
    default:
      return status
  }
}

export interface StatusBadgeProps {
  status: UserStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
}
