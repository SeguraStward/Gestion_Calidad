'use client'

import { useState } from 'react'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { PageHeader } from '@/modules/academic-management/academic-maintenance/components/page-header'
import { Layers3, LucideBookMarked } from 'lucide-react'
import { InstitutionalMaintenancePage } from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/institutional/page'
import { CurricularMaintenancePage } from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/curricular/page'

export function AcademicMaintenancePage() {
  const [seccion, setSeccion] = useState<'institucional' | 'curricular' | null>(null)

  if (!seccion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-5xl shadow-md p-8">
          <div className="grid gap-6">
            <PageHeader title="Mantenimiento Universitario" icon={LucideBookMarked} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <Card className="cursor-pointer hover:shadow-xl transition-all border" onClick={() => setSeccion('institucional')}>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl font-semibold">Estructura Institucional</h2>
                  <p className="text-muted-foreground text-sm mt-2">Gestiona sedes, campus, facultades y escuelas.</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-xl transition-all border" onClick={() => setSeccion('curricular')}>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl font-semibold">Estructura Curricular</h2>
                  <p className="text-muted-foreground text-sm mt-2">Mantén carreras, programas, cursos y asignaturas.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <PageHeader
          title={
            seccion === 'institucional'
              ? 'Mantenimiento de Estructura Institucional'
              : seccion === 'curricular'
                ? 'Mantenimiento de Estructura Curricular'
                : 'Mantenimiento de Estructura Institucional'
          }
          icon={Layers3}
        />
        <Button variant="ghost" onClick={() => setSeccion(null)}>
          ⬅ Volver
        </Button>
      </div>

      {seccion === 'institucional' && <InstitutionalMaintenancePage />}
      {seccion === 'curricular' && <CurricularMaintenancePage />}
    </div>
  )
}
