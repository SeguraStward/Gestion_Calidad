'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { FileText, PlusCircle, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EvidenceManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname.includes('/upload')) return 'upload'
    if (pathname.includes('/settings')) return 'settings'
    if (pathname.includes('/view/') || pathname.includes('/edit/')) return 'evidences'
    return 'evidences'
  }

  return (
    <div className="">
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Sistema de Gestión de Evidencias SINAES</h1>
          </div>
          
          <Tabs defaultValue={getActiveTab()} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b pb-2">
              <TabsList className="grid w-full max-w-3xl grid-cols-3">
                <TabsTrigger value="evidences" asChild>
                  <Link href="/evidence-management">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Evidencias</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="upload" asChild>
                  <Link href="/evidence-management/upload">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Subir Evidencia</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="settings" asChild>
                  <Link href="/evidence-management/settings">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Configuración</span>
                  </Link>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="evidences" className="flex-1 overflow-hidden pt-4">
              {getActiveTab() === 'evidences' ? children : null}
            </TabsContent>
            
            <TabsContent value="upload" className="flex-1 overflow-hidden pt-4">
              {getActiveTab() === 'upload' ? children : null}
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 overflow-hidden pt-4">
              {getActiveTab() === 'settings' ? children : null}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}