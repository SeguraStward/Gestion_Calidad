'use client'

import { Tabs, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { CrudTabPanel } from '@/app/(components)/crud/crud-tab-panel'
import RegionRegionalCentersCrud from '@/modules/academic-management/academic-maintenance/components/cruds/regional-centers'
// import SchoolsCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/institutional/cruds/schools'
// import ClassroomsCrud from '@/modules/academic-management/academic-maintenance/components/sub-maintenance/institutional/cruds/classrooms'

interface Props {
  loading: boolean
  SkeletonCrud: React.FC
}

export function InstitutionalMaintenanceTabs({ loading, SkeletonCrud }: Props) {
  return (
    <Tabs defaultValue="sedes" className="w-full">
      <TabsList className="flex w-full gap-6 mb-6 justify-center bg-muted/60 rounded-xl p-2">
        <TabsTrigger
          value="sedes"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Sedes
        </TabsTrigger>
        <TabsTrigger
          value="campus"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Campus
        </TabsTrigger>
        <TabsTrigger
          value="facultades"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Facultades
        </TabsTrigger>
        <TabsTrigger
          value="escuelas"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Escuelas
        </TabsTrigger>
        <TabsTrigger
          value="aulas"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Aulas
        </TabsTrigger>
        <TabsTrigger
          value="carreras"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Carreras
        </TabsTrigger>
        <TabsTrigger
          value="cursos"
          className="flex-1 text-lg px-8 py-4 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-black"
        >
          Cursos
        </TabsTrigger>
      </TabsList>

      <CrudTabPanel value="sedes" loading={loading} SkeletonCrud={SkeletonCrud}>
        <RegionRegionalCentersCrud />
      </CrudTabPanel>

      {/* <CrudTabPanel value="campus" loading={loading} SkeletonCrud={SkeletonCrud}>
        <CampusCrud />
      </CrudTabPanel> */}

      {/* <CrudTabPanel value="facultades" loading={loading} SkeletonCrud={SkeletonCrud}>
        <FacultiesCrud />
      </CrudTabPanel> */}

      {/* <CrudTabPanel value="escuelas" loading={loading} SkeletonCrud={SkeletonCrud}>
        <SchoolsCrud />
      </CrudTabPanel> */}

      {/* <CrudTabPanel value="aulas" loading={loading} SkeletonCrud={SkeletonCrud}>
        <ClassroomsCrud />
      </CrudTabPanel> */}
    </Tabs>
  )
}
