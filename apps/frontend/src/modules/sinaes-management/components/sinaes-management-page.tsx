'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { SinaesStructureTab } from './structure/sinaes-structure-tab'
import { DocumentTypesTab } from './document-types/document-types-tab'
import { SimpleProofDocumentForm } from './upload/simple-proof-document-form'

const SinaesManagementPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDocumentSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // TODO: Implementar la lógica de subida usando el servicio correspondiente
      console.log('Submitting proof document data:', data)

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      alert('Documento probatorio subido exitosamente!')
    } catch (error) {
      console.error('Error uploading proof document:', error)
      alert('Error al subir el documento probatorio')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <TabsTrigger value="document-types">
              Tipos de Documentos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="structure" className="flex-1 overflow-hidden m-0">
            <SinaesStructureTab />
          </TabsContent>
          <TabsContent value="upload" className="flex-1 px-6">
            <SimpleProofDocumentForm
              onSubmit={handleDocumentSubmit}
              isSubmitting={isSubmitting}
            />
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
