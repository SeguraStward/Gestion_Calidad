'use client'
import { BulkImportPage } from '@/modules/academic-management/bulk-data-import/components/bulk-import-page'

export default function Page() {
  return (
    <>
      <div className="fixed inset-0 -z-10 animated-bg" />
      <div className="h-full w-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar px-4 py-8">
        <div className="w-full max-w-7xl">
          <BulkImportPage />
        </div>
      </div>
    </>
  )
}
