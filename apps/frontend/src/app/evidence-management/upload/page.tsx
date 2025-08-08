'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { EvidenceForm } from '@/modules/evidence-management/components/evidence-form'
import { useUploadEvidence } from '@/modules/evidence-management/service/evidence.service'
import { EvidenceFormData } from '@/modules/evidence-management/types/evidence.types'

export default function UploadEvidencePage() {
  const router = useRouter()
  const uploadEvidenceMutation = useUploadEvidence()
  
  const handleSubmit = async (data: EvidenceFormData) => {
    await uploadEvidenceMutation.mutateAsync(data)
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Subir nueva evidencia</h2>
        <p className="text-muted-foreground text-sm">
          Complete el formulario para subir un nuevo documento de evidencia
        </p>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-6 h-full">
          <EvidenceForm 
            onSubmit={handleSubmit}
            isSubmitting={uploadEvidenceMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}