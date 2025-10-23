'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { SinaesStructureTab } from './structure/sinaes-structure-tab'
import { DocumentTypesTab } from './document-types/document-types-tab'
import { UploadDocumentsTab } from './upload-documents-tab'
import { QueryDocumentsTab } from './query/query-documents-tab'

const SinaesManagementPage = () => {

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3">
        <h2 className="text-2xl font-bold">Gestión SINAES</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="structure" className="h-full flex flex-col">
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
            <UploadDocumentsTab />
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
