'use client'

import { EvidenceTable } from '@/modules/evidence-management/components/evidence-table'
import { Card, CardContent } from '@una-gc/ui/components/card'

export default function EvidenceManagementPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden"> 
      <EvidenceTable />
    </div>
  )
}