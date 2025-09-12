'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { Plus, Settings, MessageSquare, List } from 'lucide-react'
import { QuestionGroupsManagement } from './question-groups-management'
import { QuestionsManagement } from './questions-management'
import { FINAL_REPORT_STEPS, REPORT_TYPES } from '../../types/question-management.types'

export function QuestionManagementDashboard() {
  const [activeStep, setActiveStep] = useState<number>(5)
  const [selectedReportType, setSelectedReportType] = useState<string>('TODOS')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Administración de Preguntas</h1>
            <p className="text-muted-foreground">
              Gestione las preguntas y grupos para los pasos 5 y 7 de los informes finales
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Panel de Administración</span>
          </div>
        </div>

        {/* Step and Report Type Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Paso:</span>
            <div className="flex gap-1">
              {[5, 7].map((step) => (
                <Button
                  key={step}
                  variant={activeStep === step ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveStep(step)}
                  className="min-w-[80px]"
                >
                  Paso {step}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tipo de Informe:</span>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="INFORME_FINAL_V1">Informe Final V1</option>
              <option value="INFORME_FINAL_V2">Informe Final V2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Paso {activeStep} - {activeStep === 5 ? 'Reflexión y Análisis' : 'Percepción General y Desempeño'}
          </CardTitle>
          <CardDescription>
            {activeStep === 5 ? (
              <>
                <strong>Tipo de preguntas:</strong> Respuesta abierta (texto libre).
                <br />
                Los profesores responden con sus propias palabras sobre el desarrollo y resultados del curso.
              </>
            ) : (
              <>
                <strong>Tipo de preguntas:</strong> Selección única (radio buttons).
                <br />
                Los profesores califican diferentes aspectos usando una escala de valoración.
              </>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Grupos de Preguntas
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Preguntas Individuales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <QuestionGroupsManagement
            stepNumber={activeStep}
            reportType={selectedReportType === 'TODOS' ? undefined : selectedReportType}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <QuestionsManagement
            stepNumber={activeStep}
            reportType={selectedReportType === 'TODOS' ? undefined : selectedReportType}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
