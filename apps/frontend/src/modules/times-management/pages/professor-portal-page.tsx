'use client'

import { useState } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'
import { BookOpen, CheckCircle, ChevronRight, ClipboardList, GraduationCap, LogIn } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

interface SessionInfo {
  token: string
  cedula: string
  campusId: string
  academicCycleId: string
  professor: { id: string | null; fullName: string; nationalId: string }
}

interface AssignedCourse {
  id: string
  curricularMeshCourse?: { course?: { id: string; name: string; code: string } }
  academicCycle?: { name: string; year: number }
  campus?: { name: string }
  assignmentType: string
}

type Step = 'login' | 'courses' | 'report' | 'done'

export default function ProfessorPortalPage() {
  const [step, setStep] = useState<Step>('login')
  const [loginForm, setLoginForm] = useState({ cedula: '', token: '' })
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [courses, setCourses] = useState<AssignedCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<AssignedCourse | null>(null)
  const [reportForm, setReportForm] = useState({ matriculados: '', aprobados: '', reprobados: '', isFinal: false })

  const handleLogin = async () => {
    if (!loginForm.cedula.trim() || !loginForm.token.trim()) {
      toast.error('Ingresa tu cédula y el token que te enviaron')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/professor-portal/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: loginForm.cedula.trim(), token: loginForm.token.trim() })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Token o cédula inválidos')
      }
      const data: SessionInfo = await res.json()
      setSession(data)

      const coursesRes = await fetch(`${API_URL}/professor-portal/my-courses`, {
        headers: {
          'x-professor-token': loginForm.token.trim(),
          'x-professor-cedula': loginForm.cedula.trim()
        }
      })
      const coursesData = coursesRes.ok ? await coursesRes.json() : []
      setCourses(Array.isArray(coursesData) ? coursesData : [])
      setStep('courses')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al ingresar')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!selectedCourse || !session) return

    const courseId = selectedCourse.curricularMeshCourse?.course?.id
    if (!courseId) {
      toast.error('No se pudo identificar el curso')
      return
    }

    const mat = Number(reportForm.matriculados)
    const apr = Number(reportForm.aprobados)
    const rep = Number(reportForm.reprobados)

    if (!mat || mat <= 0) { toast.error('Ingresa el número de matriculados'); return }
    if (apr + rep > mat) { toast.error('Aprobados + reprobados no puede superar matriculados'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/professor-portal/submit-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-professor-token': session.token,
          'x-professor-cedula': session.cedula
        },
        body: JSON.stringify({ courseId, matriculados: mat, aprobados: apr, reprobados: rep, isFinal: reportForm.isFinal })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Error al enviar el informe')
      }
      toast.success(reportForm.isFinal ? 'Informe final enviado' : 'Pre-informe guardado')
      setStep('done')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  const courseName = (c: AssignedCourse) => c.curricularMeshCourse?.course?.name ?? 'Curso sin nombre'
  const courseCode = (c: AssignedCourse) => c.curricularMeshCourse?.course?.code ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        <div className="text-center space-y-1">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Portal del Profesor</h1>
          <p className="text-sm text-muted-foreground">Universidad Nacional — Sede Regional Brunca</p>
        </div>

        {step === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LogIn className="h-5 w-5" /> Ingresa al portal
              </CardTitle>
              <CardDescription>
                Usa tu cédula y el token que te envió la coordinación para acceder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Número de cédula</label>
                <Input
                  placeholder="Ej: 112340567"
                  value={loginForm.cedula}
                  onChange={(e) => setLoginForm((p) => ({ ...p, cedula: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Token de acceso</label>
                <Input
                  placeholder="Token enviado por la coordinación"
                  value={loginForm.token}
                  onChange={(e) => setLoginForm((p) => ({ ...p, token: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? 'Verificando...' : 'Ingresar'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'courses' && session && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" /> Tus cursos asignados
              </CardTitle>
              <CardDescription>
                Bienvenido, <span className="font-medium">{session.professor.fullName}</span>.
                Selecciona el curso para el que deseas enviar tu informe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p>No tienes cursos asignados en este ciclo.</p>
                  <p className="mt-1 text-xs">Consulta con la coordinación si crees que es un error.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => { setSelectedCourse(course); setStep('report') }}
                      className="w-full flex items-center justify-between rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{courseName(course)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {courseCode(course)}
                          {course.campus?.name ? ` · ${course.campus.name}` : ''}
                          {course.academicCycle?.name ? ` · ${course.academicCycle.name}` : ''}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'report' && selectedCourse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" /> Informe del curso
              </CardTitle>
              <CardDescription>
                <span className="font-medium">{courseName(selectedCourse)}</span>
                {courseCode(selectedCourse) ? ` (${courseCode(selectedCourse)})` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Matriculados</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={reportForm.matriculados}
                    onChange={(e) => setReportForm((p) => ({ ...p, matriculados: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Aprobados</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={reportForm.aprobados}
                    onChange={(e) => setReportForm((p) => ({ ...p, aprobados: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Reprobados</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={reportForm.reprobados}
                    onChange={(e) => setReportForm((p) => ({ ...p, reprobados: e.target.value }))}
                  />
                </div>
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">Tipo de informe</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!reportForm.isFinal} onChange={() => setReportForm((p) => ({ ...p, isFinal: false }))} />
                    <span className="text-sm">Pre-informe</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={reportForm.isFinal} onChange={() => setReportForm((p) => ({ ...p, isFinal: true }))} />
                    <span className="text-sm">Informe final</span>
                  </label>
                </div>
                {reportForm.isFinal && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
                    Al enviar el informe final tu token de acceso quedará invalidado.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setStep('courses')}>
                  Volver
                </Button>
                <Button className="flex-1" onClick={handleSubmitReport} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar informe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
              <h2 className="text-xl font-semibold">
                {reportForm.isFinal ? 'Informe final enviado' : 'Pre-informe guardado'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {reportForm.isFinal
                  ? 'Tu informe quedó registrado y tu acceso al portal fue cerrado. Muchas gracias.'
                  : 'Tu pre-informe fue guardado. Puedes ingresar de nuevo con tu token para enviar el informe final cuando corresponda.'}
              </p>
              {!reportForm.isFinal && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setStep('courses')
                    setSelectedCourse(null)
                    setReportForm({ matriculados: '', aprobados: '', reprobados: '', isFinal: false })
                  }}
                >
                  Enviar otro informe
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
