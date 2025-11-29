'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'

interface ProfessorAssignmentsFormProps {
  cycles: any[]
  campuses: any[]
  professors: any[]
  courses: any[]
  loadingCycles: boolean
  loadingCampuses: boolean
  loadingProfessors: boolean
  loadingCourses: boolean
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
}

export function ProfessorAssignmentsForm({
  cycles,
  campuses,
  professors,
  courses,
  loadingCycles,
  loadingCampuses,
  loadingProfessors,
  loadingCourses,
  onSubmit,
  onCancel,
  loading
}: ProfessorAssignmentsFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    academicCycleId: '',
    campusId: '',
    professorId: '',
    professorName: '',
    professorCedula: '',
    courseId: '',
    courseCode: '',
    courseName: '',
    careerName: '',
    journeyType: ''
  })

  const [professorSearch, setProfessorSearch] = useState('')
  const [filteredProfessors, setFilteredProfessors] = useState<any[]>([])
  const [courseSearch, setCourseSearch] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])

  // Filtrar profesores según búsqueda
  useEffect(() => {
    if (professorSearch.trim()) {
      const filtered = professors.filter(
        (p: any) =>
          p.fullName?.toLowerCase().includes(professorSearch.toLowerCase()) ||
          p.cedula?.toLowerCase().includes(professorSearch.toLowerCase())
      )
      setFilteredProfessors(filtered.slice(0, 10))
    } else {
      setFilteredProfessors([])
    }
  }, [professorSearch, professors])

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

  const handleProfessorSelect = (professor: any) => {
    setFormData((prev) => ({
      ...prev,
      professorId: professor.id,
      professorName: professor.fullName,
      professorCedula: professor.cedula
    }))
    setProfessorSearch(`${professor.cedula} - ${professor.fullName}`)
    setFilteredProfessors([])
  }

  const handleCourseSelect = (course: any) => {
    setFormData((prev) => ({
      ...prev,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      careerName: course.career?.name || '' // ✅ Auto-llenar carrera
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
        return !!(formData.professorId && formData.professorName && formData.professorCedula)
      case 4:
        return true // ✅ Curso es opcional, siempre puede avanzar
      case 5:
        return !!formData.journeyType
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(5, prev + 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canProceed()) {
      // Mapear journeyType al enum del backend
      const assignmentTypeMap: { [key: string]: string } = {
        '1/4': 'QUARTER',
        '1/2': 'HALF',
        '3/4': 'THREE_QUARTER',
        Full: 'FULL'
      }

      onSubmit({
        professorId: formData.professorId,
        academicCycleId: formData.academicCycleId,
        campusId: formData.campusId,
        curricularMeshCourseId: formData.courseId || undefined, // ✅ Opcional - solo se envía si existe
        assignmentType: assignmentTypeMap[formData.journeyType] || 'FULL',
        notes: `Asignación para ${formData.professorName} - ${formData.courseName}`
      })
    }
  }

  const steps = [
    { number: 1, title: 'Ciclo Académico', completed: !!formData.academicCycleId },
    { number: 2, title: 'Sede', completed: !!formData.campusId },
    { number: 3, title: 'Profesor', completed: !!formData.professorId },
    { number: 4, title: 'Curso', completed: !!formData.courseId },
    { number: 5, title: 'Tipo de Jornada', completed: !!formData.journeyType }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Asignación de Profesor</CardTitle>
        <CardDescription>Complete el formulario paso a paso</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stepper visual */}
        <div className="mb-8 flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${currentStep === step.number ? 'bg-primary text-primary-foreground' : ''}
                    ${currentStep > step.number ? 'bg-green-500 text-white' : ''}
                    ${currentStep < step.number ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {step.completed && currentStep > step.number ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                </div>
                <span className="text-xs mt-2 text-center max-w-20">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.number ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paso 1: Ciclo Académico */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paso 1: Seleccione el Ciclo Académico</h3>
              {loadingCycles ? (
                <Alert>
                  <AlertDescription>Cargando ciclos académicos...</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciclo Académico *</label>
                  <Select
                    value={formData.academicCycleId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, academicCycleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.code} - {cycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!formData.academicCycleId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Debe seleccionar un ciclo académico antes de continuar</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Paso 2: Sede */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paso 2: Seleccione la Sede</h3>
              {loadingCampuses ? (
                <Alert>
                  <AlertDescription>Cargando sedes...</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sede *</label>
                  <Select
                    value={formData.campusId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, campusId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!formData.campusId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Debe seleccionar una sede antes de continuar</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Paso 3: Profesor */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paso 3: Seleccione el Profesor</h3>
              {loadingProfessors ? (
                <Alert>
                  <AlertDescription>Cargando profesores...</AlertDescription>
                </Alert>
              ) : professors.length === 0 ? (
                <div className="space-y-4">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      No hay profesores registrados en el sistema. Por favor ingrese los datos manualmente.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Profesor *</label>
                    <Input
                      placeholder="Nombre completo del profesor"
                      value={formData.professorName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professorName: e.target.value,
                          professorId: 'manual-' + e.target.value.replace(/\s+/g, '-').toLowerCase()
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cédula *</label>
                    <Input
                      placeholder="Número de cédula"
                      value={formData.professorCedula}
                      onChange={(e) => setFormData((prev) => ({ ...prev, professorCedula: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium">Profesor *</label>
                  <Input
                    placeholder="Buscar por nombre o cédula..."
                    value={professorSearch}
                    onChange={(e) => setProfessorSearch(e.target.value)}
                  />
                  {filteredProfessors.length > 0 && (
                    <div className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredProfessors.map((professor) => (
                        <button
                          key={professor.id}
                          type="button"
                          onClick={() => handleProfessorSelect(professor)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <div className="font-medium">{professor.fullName}</div>
                          <div className="text-sm text-muted-foreground">Cédula: {professor.cedula}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.professorId && (
                    <Alert className="mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Profesor seleccionado: {formData.professorName} ({formData.professorCedula})
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {!formData.professorId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Debe ingresar los datos del profesor antes de continuar</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Paso 4: Curso */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paso 4: Seleccione el Curso</h3>
              {loadingCourses ? (
                <Alert>
                  <AlertDescription>Cargando cursos...</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium">Curso *</label>
                  <Input
                    placeholder="Buscar por código o nombre..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                  {filteredCourses.length > 0 && (
                    <div className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleCourseSelect(course)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <div className="font-medium">
                            {course.code} - {course.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Créditos: {course.credits} • Carrera: {course.career?.name || 'N/A'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.courseId && (
                    <Alert className="mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Curso seleccionado: {formData.courseCode} - {formData.courseName}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {!formData.courseId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Debe seleccionar un curso antes de continuar</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Paso 5: Tipo de Jornada */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Paso 5: Seleccione el Tipo de Jornada</h3>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  📊 <strong>Resumen de la asignación:</strong>
                  <br />• Profesor: {formData.professorName} ({formData.professorCedula})<br />• Curso: {formData.courseCode} -{' '}
                  {formData.courseName}
                  <br />• Carrera: {formData.careerName}
                  <br />• Campus: {campuses.find((c) => c.id === formData.campusId)?.name || 'N/A'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Jornada *</label>
                <Select
                  value={formData.journeyType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, journeyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1/4">1/4 Tiempo (0.25)</SelectItem>
                    <SelectItem value="1/2">1/2 Tiempo (0.50)</SelectItem>
                    <SelectItem value="3/4">3/4 Tiempo (0.75)</SelectItem>
                    <SelectItem value="Full">Tiempo Completo (1.00)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  El tiempo de jornada se calculará automáticamente según el tipo seleccionado
                </p>
              </div>

              {!formData.journeyType && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Debe seleccionar un tipo de jornada antes de continuar</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading || !canProceed()}>
                  {loading ? 'Guardando...' : 'Crear Asignación'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
