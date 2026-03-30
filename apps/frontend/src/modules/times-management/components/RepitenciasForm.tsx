'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'

interface RepitenciasFormProps {
  cycles: any[]
  campuses: any[]
  courses: any[]
  loadingCycles: boolean
  loadingCampuses: boolean
  loadingCourses: boolean
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
}

export function RepitenciasForm({
  cycles,
  campuses,
  courses,
  loadingCycles,
  loadingCampuses,
  loadingCourses,
  onSubmit,
  onCancel,
  loading
}: RepitenciasFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    academicCycleId: '',
    campusId: '',
    courseId: '',
    courseCode: '',
    courseName: '',
    careerName: '',
    additionalHours: '',
    studentsCount: '',
    reason: ''
  })

  const [courseSearch, setCourseSearch] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])

  // Filtrar cursos según búsqueda
  useEffect(() => {
    if (courseSearch.trim()) {
      const filtered = courses.filter(
        (c: any) =>
          c.code?.toLowerCase().includes(courseSearch.toLowerCase()) || c.name?.toLowerCase().includes(courseSearch.toLowerCase())
      )
      setFilteredCourses(filtered.slice(0, 10))
    } else {
      setFilteredCourses([])
    }
  }, [courseSearch, courses])

  const handleCourseSelect = (course: any) => {
    setFormData((prev) => ({
      ...prev,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      careerName: course.career?.name || ''
    }))
    setCourseSearch(`${course.code} - ${course.name}`)
    setFilteredCourses([])
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.academicCycleId
      case 2:
        return !!formData.campusId
      case 3:
        return !!formData.courseId
      case 4:
        return !!(formData.careerName && formData.additionalHours && formData.studentsCount && formData.reason)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(4, prev + 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canProceed()) {
      onSubmit(formData)
    }
  }

  const steps = [
    { number: 1, title: 'Ciclo Académico', completed: !!formData.academicCycleId },
    { number: 2, title: 'Sede/Campus', completed: !!formData.campusId },
    { number: 3, title: 'Curso', completed: !!formData.courseId },
    { number: 4, title: 'Detalles', completed: canProceed() }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Repitencia - Paso {currentStep} de 4</CardTitle>
        <CardDescription>{steps[currentStep - 1]?.title}</CardDescription>

        {/* Stepper */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${
                    step.number === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }
                `}
                >
                  {step.completed ? <CheckCircle2 className="h-5 w-5" /> : step.number}
                </div>
                <span className="text-xs mt-1 font-medium">{step.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step.completed ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Ciclo Académico */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Selecciona el ciclo académico para el cual se registrará la repitencia.</AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ciclo Académico <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.academicCycleId}
                  onValueChange={(value) => setFormData({ ...formData, academicCycleId: value })}
                  disabled={loadingCycles}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCycles ? 'Cargando...' : 'Selecciona un ciclo'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.code} - {cycle.name} ({cycle.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Campus */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Selecciona la sede o campus donde se impartirá el curso.</AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sede/Campus <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.campusId}
                  onValueChange={(value) => setFormData({ ...formData, campusId: value })}
                  disabled={loadingCampuses}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCampuses ? 'Cargando...' : 'Selecciona una sede'} />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.code} - {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Curso */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Busca el curso por código o nombre para seleccionarlo.</AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Buscar Curso <span className="text-red-500">*</span>
                </label>
                <Input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Escribe el código (IS-401) o nombre del curso..."
                  disabled={loadingCourses}
                />

                {/* Resultados de búsqueda */}
                {filteredCourses.length > 0 && (
                  <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                    {filteredCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => handleCourseSelect(course)}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium">{course.code}</div>
                        <div className="text-sm text-muted-foreground">{course.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Créditos: {course.credits || 'N/A'} • Carrera: {course.career?.name || 'Sin carrera'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Curso seleccionado */}
                {formData.courseId && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-green-900">{formData.courseCode}</div>
                        <div className="text-sm text-green-700">{formData.courseName}</div>
                        {formData.careerName && <div className="text-xs text-green-600 mt-1">{formData.careerName}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Detalles */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Completa los detalles adicionales de la repitencia.</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Carrera <span className="text-red-500">*</span>
                    {formData.careerName && <span className="ml-2 text-xs text-muted-foreground">(asociada al curso)</span>}
                  </label>
                  <Input
                    value={formData.careerName}
                    onChange={(e) => setFormData({ ...formData, careerName: e.target.value })}
                    placeholder="Ingeniería en Sistemas"
                    required
                    disabled={!!formData.careerName}
                    className={formData.careerName ? 'bg-muted cursor-not-allowed' : ''}
                  />
                  {formData.careerName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Esta carrera está asociada automáticamente al curso seleccionado
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Horas Adicionales <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.additionalHours}
                    onChange={(e) => setFormData({ ...formData, additionalHours: e.target.value })}
                    placeholder="3"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Cantidad de Estudiantes <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.studentsCount}
                    onChange={(e) => setFormData({ ...formData, studentsCount: e.target.value })}
                    placeholder="15"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Razón/Motivo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Alto índice de reprobados"
                    required
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Resumen</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciclo:</span>
                    <span className="font-medium">{cycles.find((c) => c.id === formData.academicCycleId)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campus:</span>
                    <span className="font-medium">{campuses.find((c) => c.id === formData.campusId)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Curso:</span>
                    <span className="font-medium">
                      {formData.courseCode} - {formData.courseName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horas:</span>
                    <span className="font-medium text-primary">{formData.additionalHours} horas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={currentStep === 1 ? onCancel : handleBack} disabled={loading}>
              {currentStep === 1 ? (
                'Cancelar'
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Atrás
                </>
              )}
            </Button>

            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext} disabled={!canProceed() || loading}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={!canProceed() || loading}>
                {loading ? 'Guardando...' : 'Guardar Repitencia'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
