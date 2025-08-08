'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Download, ExternalLink, FileType, Tag, Building, BarChart, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { Button } from '@una-gc/ui/components/button'
import { Separator } from '@una-gc/ui/components/separator'
import { useEvidence } from '@/modules/evidence-management/service/evidence.service'
import { careersMock } from '@/modules/evidence-management/mocks/careers'
import { componentsMock } from '@/modules/evidence-management/mocks/components'
import { dimensionsMock } from '@/modules/evidence-management/mocks/dimensions'
import { criteriaMock } from '@/modules/evidence-management/mocks/criteria'

// Helper function to get criterion details including component and dimension
const getCriterionDetails = (criterionId: string) => {
  const criterion = criteriaMock.find(c => c.id === criterionId)
  if (!criterion) return { code: '', name: '', component: { code: '', name: '' }, dimension: { code: '', name: '' } }
  
  const component = componentsMock.find(comp => comp.id === criterion.componentId)
  const dimension = component ? dimensionsMock.find(dim => dim.id === component.dimensionId) : null
  
  return {
    code: criterion.code,
    name: criterion.name,
    component: {
      code: component?.code || '',
      name: component?.name || ''
    },
    dimension: {
      code: dimension?.code || '',
      name: dimension?.name || ''
    }
  }
}

// Helper for converting bytes to readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function ViewEvidencePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: evidence, isLoading } = useEvidence(params.id)
  
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
          <Button variant="link" onClick={() => router.push('/evidence-management')}>
            Volver a la lista
          </Button>
        </div>
      </div>
    )
  }
  
  const dateFormatted = evidence.month 
    ? format(new Date(evidence.year, evidence.month - 1), 'MMMM yyyy', { locale: es }) 
    : evidence.year.toString()
  
  const careers = evidence.careerIds.map(id => {
    const career = careersMock.find(c => c.id === id)
    return career ? `${career.name} (${career.code})` : id
  })
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push('/evidence-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          <h2 className="text-xl font-semibold">{evidence.title}</h2>
          <p className="text-muted-foreground text-sm">
            Detalles de la evidencia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/evidence-management/edit/${evidence.id}`)}>
            Editar
          </Button>
          <Button onClick={() => window.open(evidence.driveFileLink, '_blank')}>
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-auto pr-2">
        {/* Columna izquierda - Información general */}
        <Card>
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
              <p className="mt-1">{evidence.description || 'Sin descripción'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Fecha
                </h3>
                <p className="mt-1 capitalize">{dateFormatted}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Creado
                </h3>
                <p className="mt-1">{format(new Date(evidence.createdAt), 'dd/MM/yyyy')}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <FileType className="h-4 w-4 mr-1" />
                Archivo
              </h3>
              <div className="mt-1 flex items-center justify-between">
                <span>{evidence.fileName}</span>
                <Badge variant="outline">{formatFileSize(evidence.fileSize)}</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Palabras clave
              </h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {evidence.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Building className="h-4 w-4 mr-1" />
                Carreras
              </h3>
              <div className="mt-1">
                {careers.map((career, i) => (
                  <div key={i} className="text-sm py-1 border-b last:border-0">
                    {career}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(evidence.driveFileLink, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en Google Drive
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Columna derecha - Criterios SINAES */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Criterios SINAES</CardTitle>
            <CardDescription>
              Esta evidencia está asociada a {evidence.criteria.length} criterio{evidence.criteria.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {evidence.criteria.map((criteriaItem, index) => {
              const criterionDetails = getCriterionDetails(criteriaItem.criterionId)
              
              return (
                <div key={criteriaItem.criterionId} className="mb-4 last:mb-0">
                  {index > 0 && <Separator className="mb-4" />}
                  
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="font-medium">
                          {criterionDetails.code} - {criterionDetails.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {criterionDetails.component.code} - {criterionDetails.component.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="sm:self-start">
                        {criterionDetails.dimension.code}
                      </Badge>
                    </div>
                    
                    {criteriaItem.notes && (
                      <div className="bg-muted/50 rounded-md p-3 mt-2">
                        <h4 className="text-sm font-medium mb-1">Notas:</h4>
                        <p className="text-sm">{criteriaItem.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}