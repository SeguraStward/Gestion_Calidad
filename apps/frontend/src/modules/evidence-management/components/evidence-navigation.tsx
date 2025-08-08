'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { FileText, PlusCircle, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface EvidenceNavigationProps {
  children: React.ReactNode
}

export function EvidenceNavigation({ children }: EvidenceNavigationProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('evidences')
  
  // Determine active tab based on current path
  useEffect(() => {
    if (pathname.includes('/upload')) setActiveTab('upload')
    else if (pathname.includes('/settings')) setActiveTab('settings')
    else if (pathname.includes('/view/') || pathname.includes('/edit/')) setActiveTab('evidences')
    else setActiveTab('evidences')
  }, [pathname])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sistema de Gestión de Evidencias SINAES</h1>
      </div>
      
      <Tabs value={activeTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b pb-2">
          <TabsList className="w-full max-w-3xl grid grid-cols-3">
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
        
        <div className="flex-1 overflow-hidden pt-4">
          {children}
        </div>
      </Tabs>
    </div>
  )
}