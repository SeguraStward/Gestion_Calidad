'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Download, ExternalLink, FileType, Tag, Building, BarChart, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { Button } from '@una-gc/ui/components/button'
import { Separator } from '@una-gc/ui/components/separator'
import { useEvidence, useDimensions, useComponents, useCriteria, useEvidencePrompts, useStandards } from '@/modules/evidence-management/service/evidence.service'
import { careersMock } from '@/modules/evidence-management/mocks/careers'
import { componentsMock } from '@/modules/evidence-management/mocks/components'
import { dimensionsMock } from '@/modules/evidence-management/mocks/dimensions'
import { criteriaMock } from '@/modules/evidence-management/mocks/criteria'
import { EvidencePromptLink } from '@/modules/evidence-management/types/evidence.types'
import { evidencePromptsMock } from '@/modules/evidence-management/mocks/evidence-prompts'

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

// Helper para obtener la etiqueta legible del tipo de documento
const getDocumentTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'NORMATIVA': 'Normativa',
    'INFORME': 'Informe',
    'ACTA': 'Acta de Reunión',
    'PLAN': 'Plan Estratégico',
    'CONVENIO': 'Convenio',
    'OTRO': 'Otro Documento'
  }
  return typeMap[type] || type
}

const CriterionDetail = ({ criterionId, notes }: { criterionId: string, notes?: string }) => {
  // Buscar el prompt y luego el criterio
  const prompt = evidencePromptsMock.find(p => p.id === criterionId)
  const criterionDetails = prompt ? getCriterionDetails(prompt.criterionId) :
    getCriterionDetails(criterionId) // Fallback al comportamiento anterior
  const { data: standards } = useStandards(criterionId)
  const { data: evidencePrompts } = useEvidencePrompts(criterionId)

  return (
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

      {notes && (
        <div className="bg-muted/50 rounded-md p-3 mt-2">
          <h4 className="text-sm font-medium mb-1">Notas de la evidencia:</h4>
          <p className="text-sm">{notes}</p>
        </div>
      )}

      {standards && standards.length > 0 && (
        <div className="border-l-2 border-blue-300 pl-3 mt-2">
          <h4 className="text-sm font-semibold mb-1 flex items-center text-blue-800 dark:text-blue-200"><BarChart className="h-4 w-4 mr-2" /> Estándares Asociados</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            {standards.map(std => <li key={std.id}><strong>{std.code}:</strong> {std.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

// Un nuevo componente para mostrar el detalle del vínculo
const EvidenceLinkDetail = ({ link }: { link: EvidencePromptLink }) => {
  // Necesitamos encontrar a qué criterio y componente pertenece este prompt
  const prompt = evidencePromptsMock.find(p => p.id === link.evidencePromptId)
  if (!prompt) return null

  const criterion = criteriaMock.find(c => c.id === prompt.criterionId)
  if (!criterion) return null

  const component = componentsMock.find(c => c.id === criterion.componentId)
  const dimension = component ? dimensionsMock.find(d => d.id === component.dimensionId) : null

  return (
    <div className="space-y-2">
      <div>
        <h4 className="font-medium text-primary">{prompt.code}: {prompt.description}</h4>
        <p className="text-sm text-muted-foreground">
          {criterion.code} - {criterion.name}
        </p>
      </div>
      {link.notes && (
        <div className="bg-muted/50 rounded-md p-3 mt-2">
          <p className="text-sm italic">"{link.notes}"</p>
        </div>
      )}
      <div className="flex gap-2 text-xs">
        <Badge variant="outline">{dimension?.code}</Badge>
        <Badge variant="secondary">{component?.code}</Badge>
      </div>
    </div>
  )
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
          {/* Reemplazar evidence.name con documentCode y documentType */}
          <h2 className="text-xl font-semibold">{evidence.documentCode} - {getDocumentTypeLabel(evidence.documentType)}</h2>
          <p className="text-muted-foreground text-sm">
            Detalles del documento probatorio
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
              Esta evidencia está asociada a {evidence.evidencePromptLinks.length} criterio{evidence.evidencePromptLinks.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {evidence.evidencePromptLinks.map((criteriaItem, index) => (
              <React.Fragment key={criteriaItem.evidencePromptId}>
                {index > 0 && <Separator className="my-4" />}
                <CriterionDetail criterionId={criteriaItem.evidencePromptId} notes={criteriaItem.notes} />
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        {/* Columna derecha - Criterios y Evidencias Cubiertas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Criterios y Evidencias Cubiertas</CardTitle>
            <CardDescription>
              Este documento sirve como prueba para {evidence.evidencePromptLinks.length} evidencia{evidence.evidencePromptLinks.length !== 1 ? 's' : ''} sugerida{evidence.evidencePromptLinks.length !== 1 ? 's' : ''}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {evidence.evidencePromptLinks.map((link, index) => (
              <React.Fragment key={link.evidencePromptId}>
                {index > 0 && <Separator />}
                <EvidenceLinkDetail link={link} />
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}