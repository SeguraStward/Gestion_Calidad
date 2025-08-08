'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Switch } from '@una-gc/ui/components/switch'
import { Separator } from '@una-gc/ui/components/separator'
import { AlertCircle, Check, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoKeywords, setAutoKeywords] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [backupFrequency, setBackupFrequency] = useState('daily')
  const [defaultCareer, setDefaultCareer] = useState('') // 1. Add state for the new input

  const handleSyncDrive = async () => {
    setIsSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSyncing(false)
    toast.success('Sincronización con Google Drive completada')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Configuración</h2>
        <p className="text-muted-foreground text-sm">
          Administre la configuración del sistema de gestión de evidencias
        </p>
      </div>

      <Tabs defaultValue="general" className="flex-1 overflow-auto">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
          <TabsTrigger value="backup">Respaldo</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración general</CardTitle>
              <CardDescription>
                Ajustes generales del sistema de gestión de evidencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-career">Carrera predeterminada</Label>
                  {/* 2. Make the input controlled */}
                  <Input
                    id="default-career"
                    placeholder="Seleccionar carrera predeterminada"
                    value={defaultCareer}
                    onChange={(e) => setDefaultCareer(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-keywords">Generar palabras clave automáticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Extraer palabras clave del contenido del documento
                    </p>
                  </div>
                  <Switch
                    id="auto-keywords"
                    checked={autoKeywords}
                    onCheckedChange={setAutoKeywords}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones sobre cambios en las evidencias
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias de visualización</CardTitle>
              <CardDescription>
                Personalice cómo se muestran las evidencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-preview">Mostrar vista previa de documentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Ver miniatura de documentos en la lista
                    </p>
                  </div>
                  <Switch
                    id="show-preview"
                    checked={showPreview}
                    onCheckedChange={setShowPreview}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="items-per-page">Elementos por página</Label>
                  <Input
                    id="items-per-page"
                    type="number"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización con Google Drive</CardTitle>
              <CardDescription>
                Configure la conexión con su cuenta de Google Drive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-4 rounded-lg bg-primary/5 border">
                {isConnected ? (
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Conectado a Google Drive</h3>
                      <p className="text-sm text-muted-foreground">
                        El sistema está correctamente vinculado con Google Drive
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mr-3">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">No conectado</h3>
                      <p className="text-sm text-muted-foreground">
                        Es necesario conectar con Google Drive para almacenar evidencias
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drive-folder">Carpeta de Google Drive</Label>
                  <Input id="drive-folder" value="/SINAES/Evidencias" readOnly />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ruta donde se guardarán los archivos de evidencia
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    onClick={() => setIsConnected(!isConnected)}
                  >
                    {isConnected ? "Desconectar cuenta" : "Conectar con Google Drive"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSyncDrive}
                    disabled={!isConnected || isSyncing}
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Sincronizar ahora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Respaldos</CardTitle>
              <CardDescription>
                Configuración de respaldos automáticos de la base de datos de evidencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup">Respaldos automáticos</Label>
                    <p className="text-sm text-muted-foreground">
                      Crear respaldos periódicos de la base de datos
                    </p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Frecuencia de respaldos</Label>
                  <select
                    id="backup-frequency"
                    value={backupFrequency}
                    onChange={(e) => setBackupFrequency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Respaldo manual</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline">
                      Crear respaldo ahora
                    </Button>
                    <Button variant="outline">
                      Restaurar desde respaldo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}