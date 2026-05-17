'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { SinaesStructureTab } from './structure/sinaes-structure-tab'
import { DocumentTypesTab } from './document-types/document-types-tab'
import { UploadDocumentsTab } from './upload-documents-tab'
import { QueryDocumentsTab } from './query/query-documents-tab'

const VALID_TABS = new Set(['structure', 'upload', 'query', 'document-types'])

const SinaesManagementPage = () => {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<string>(
    tabParam && VALID_TABS.has(tabParam) ? tabParam : 'structure',
  )

  // Update local state if the URL changes (e.g. deep-link from the Inventory tab).
  useEffect(() => {
    if (tabParam && VALID_TABS.has(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam])

  // Surface the pre-selection params to the upload tab. Nullable so the
  // form only applies them once and resets cleanly on subsequent uploads.
  const prefillEvidenceId = searchParams.get('evidenceId') || undefined
  const prefillCareerId = searchParams.get('careerId') || undefined

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3">
        <h2 className="text-2xl font-bold">Gestión SINAES</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-6 mb-3">
            <TabsTrigger value="structure">Estructura SINAES</TabsTrigger>
            <TabsTrigger value="upload">Subir Documentos</TabsTrigger>
            <TabsTrigger value="query">Consultar Documentos</TabsTrigger>
            <TabsTrigger value="document-types">
              Tipos de Documentos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="structure" className="flex-1 m-0 overflow-hidden">
            <SinaesStructureTab />
          </TabsContent>
          <TabsContent value="upload" className="flex-1 px-6 overflow-y-auto">
            <UploadDocumentsTab
              prefillEvidenceId={prefillEvidenceId}
              prefillCareerId={prefillCareerId}
            />
          </TabsContent>
          <TabsContent value="query" className="flex-1 px-6 overflow-y-auto">
            <QueryDocumentsTab />
          </TabsContent>
          <TabsContent value="document-types" className="flex-1 px-6">
            <DocumentTypesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SinaesManagementPage
