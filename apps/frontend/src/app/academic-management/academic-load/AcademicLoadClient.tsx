'use client'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const AcademicLoadPage = dynamic(
  () =>
    import('@/modules/academic-management/academic-load/components/academic-load-page').then((mod) => ({
      default: mod.AcademicLoadPage
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando gestión de cargas académicas..." />
      </div>
    ),
    ssr: false
  }
)

export default function AcademicLoadClient() {
  return (
    <>
      <div className="fixed inset-0 -z-10 animated-bg" />
      <div className="h-full w-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar px-4 py-8">
        <div className="w-full max-w-7xl">
          <AcademicLoadPage />
        </div>
      </div>
    </>
  )
}
