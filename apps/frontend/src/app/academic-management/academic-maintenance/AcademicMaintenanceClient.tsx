'use client'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const AcademicMaintenancePage = dynamic(
  () =>
    import('@/modules/academic-management/academic-maintenance/components/academic-maintenance-page').then((mod) => ({
      default: mod.AcademicMaintenancePage
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando mantenimiento académico..." />
      </div>
    ),
    ssr: false
  }
)

export default function AcademicMaintenanceClient() {
  return (
    <>
      <div className="fixed inset-0 -z-10 animated-bg" />
      <div className="h-full w-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar px-4 py-8">
        <div className="w-full max-w-7xl">
          <AcademicMaintenancePage />
        </div>
      </div>
    </>
  )
}
