'use client'

import { Tabs, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { CrudTabPanel } from '@/app/(components)/crud/crud-tab-panel'
// import FacultiesCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/institutional/cruds/faculties'
// import SchoolsCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/institutional/cruds/schools'
// import ClassroomsCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/institutional/cruds/classrooms'

interface Props {
  loading: boolean
  SkeletonCrud: React.FC
}

export function InstitutionalMaintenanceTabs({ loading, SkeletonCrud }: Props) {
  return (
    <Tabs defaultValue="sedes" className="w-full">
      <TabsList className="grid grid-cols-5 w-full gap-2 mb-4">
        <TabsTrigger value="sedes">Sedes</TabsTrigger>
        <TabsTrigger value="campus">Campus</TabsTrigger>
        <TabsTrigger value="facultades">Facultades</TabsTrigger>
        <TabsTrigger value="escuelas">Escuelas</TabsTrigger>
        <TabsTrigger value="aulas">Aulas</TabsTrigger>
      </TabsList>

      {/* <CrudTabPanel value="sedes" loading={loading} SkeletonCrud={SkeletonCrud}>
        <HeadquartersCrud />
      </CrudTabPanel>

      <CrudTabPanel value="campus" loading={loading} SkeletonCrud={SkeletonCrud}>
        <CampusCrud />
      </CrudTabPanel> */}

      {/* <CrudTabPanel value="facultades" loading={loading} SkeletonCrud={SkeletonCrud}>
        <FacultiesCrud />
      </CrudTabPanel>

      <CrudTabPanel value="escuelas" loading={loading} SkeletonCrud={SkeletonCrud}>
        <SchoolsCrud />
      </CrudTabPanel>

      <CrudTabPanel value="aulas" loading={loading} SkeletonCrud={SkeletonCrud}>
        <ClassroomsCrud />
      </CrudTabPanel> */}
    </Tabs>
  )
}
