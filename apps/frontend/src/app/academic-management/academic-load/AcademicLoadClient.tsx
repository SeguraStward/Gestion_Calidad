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
  return <AcademicLoadPage />
}
