'use client'

import { Tabs, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { CrudTabPanel } from '@/app/(components)/crud/crud-tab-panel'
//import CareerCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/curricular/cruds/careers'
//import CourseCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/curricular/cruds/courses'

interface Props {
  loading: boolean
  SkeletonCrud: React.FC
}

export function CurricularMaintenanceTabs({ loading, SkeletonCrud }: Props) {
  return (
    <Tabs defaultValue="carreras" className="w-full">
      <TabsList className="grid grid-cols-4 w-full gap-2 mb-4">
        <TabsTrigger value="carreras">Carreras</TabsTrigger>
        <TabsTrigger value="programas">Programas</TabsTrigger>
        <TabsTrigger value="cursos">Cursos</TabsTrigger>
        <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
      </TabsList>

      {/* 
      <CrudTabPanel value="carreras" loading={loading} SkeletonCrud={SkeletonCrud}>
        <CareerCrud />
      </CrudTabPanel>

      <CrudTabPanel value="programas" loading={loading} SkeletonCrud={SkeletonCrud}>
        <AcademicProgramCrud />
      </CrudTabPanel>

      <CrudTabPanel value="cursos" loading={loading} SkeletonCrud={SkeletonCrud}>
        <CourseCrud />
      </CrudTabPanel>

      <CrudTabPanel value="asignaciones" loading={loading} SkeletonCrud={SkeletonCrud}>
        <AssignmentCrud />
      </CrudTabPanel> 
      */}
    </Tabs>
  )
}
