'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { EvidenceForm } from '@/modules/evidence-management/components/evidence-form'
import { useEvidence, useUpdateEvidence } from '@/modules/evidence-management/service/evidence.service'
import { EvidenceFormData } from '@/modules/evidence-management/types/evidence.types'

export default function EditEvidencePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: evidence, isLoading } = useEvidence(params.id)
  const updateEvidenceMutation = useUpdateEvidence()
  
  const handleSubmit = async (data: EvidenceFormData) => {
    await updateEvidenceMutation.mutateAsync({ id: params.id, data })
  }
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando evidencia...</p>
        </div>
      </div>
    )
  }
  
  if (!evidence) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Evidencia no encontrada</p>
          <button 
            className="text-primary hover:underline mt-2"
            onClick={() => router.push('/evidence-management')}
          >
            Volver a la lista
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Editar evidencia</h2>
        <p className="text-muted-foreground text-sm">
          Modifique la información de la evidencia
        </p>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-6 h-full">
          <EvidenceForm 
            initialData={evidence}
            onSubmit={handleSubmit}
            isSubmitting={updateEvidenceMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}