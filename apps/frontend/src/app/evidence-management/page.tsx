'use client'

import { EvidenceTable } from '@/modules/evidence-management/components/evidence-table'
import { Card, CardContent } from '@una-gc/ui/components/card'

export default function EvidenceManagementPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <EvidenceTable />
        </CardContent>
      </Card>
    </div>
  )
}