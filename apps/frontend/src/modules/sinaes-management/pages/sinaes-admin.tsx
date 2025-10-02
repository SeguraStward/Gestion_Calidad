'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components'
import { RecalculateCodesAdmin, AutoNumberingTestSuite } from '../components/admin'

export default function SinaesAdminPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Administración SINAES</h1>
        <p className="text-muted-foreground">
          Herramientas administrativas para gestión del sistema de numeración automática
        </p>
      </div>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="testing">Pruebas de Sistema</TabsTrigger>
          <TabsTrigger value="management">Gestión de Códigos</TabsTrigger>
          <TabsTrigger value="documentation">Documentación</TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="mt-6">
          <AutoNumberingTestSuite />
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          <div className="grid gap-6">
            <RecalculateCodesAdmin />

            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>
                  Información sobre el estado actual del sistema de numeración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">DIMENSIONES</p>
                    <p className="text-2xl font-bold">Numeración: 1, 2, 3...</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">COMPONENTES</p>
                    <p className="text-2xl font-bold">Jerárquica: 1.1, 1.2...</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">EVIDENCIAS</p>
                    <p className="text-2xl font-bold">Global: 1, 2, 3...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentación del Sistema</CardTitle>
              <CardDescription>
                Guía completa sobre las reglas de numeración automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Reglas de Numeración</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">DIMENSIONES</h4>
                    <p className="text-sm">Numeración secuencial simple: <code className="bg-muted px-1 rounded">1, 2, 3, 4...</code></p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">COMPONENTES</h4>
                    <p className="text-sm">Numeración jerárquica basada en dimensión: <code className="bg-muted px-1 rounded">1.1, 1.2, 2.1, 2.2...</code></p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">CRITERIOS</h4>
                    <p className="text-sm">Numeración jerárquica basada en componente: <code className="bg-muted px-1 rounded">1.1.1, 1.1.2, 1.2.1, 2.1.1...</code></p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">ESTÁNDARES</h4>
                    <p className="text-sm">Numeración jerárquica basada en criterio: <code className="bg-muted px-1 rounded">1.1.1.1, 1.1.1.2, 1.1.2.1...</code></p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">EVIDENCIAS</h4>
                    <p className="text-sm">
                      <strong>Numeración global secuencial:</strong> <code className="bg-muted px-1 rounded">1, 2, 3, 4, 5...</code>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠️ Las evidencias NO siguen jerarquía. Todas van enumeradas consecutivamente sin importar su dimensión.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Funcionalidades</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ <strong>Auto-generación:</strong> Los códigos se generan automáticamente al crear nuevas entidades</li>
                  <li>✅ <strong>Regeneración manual:</strong> Botón para recalcular códigos individualmente</li>
                  <li>✅ <strong>Recálculo masivo:</strong> Reorganización completa del sistema</li>
                  <li>✅ <strong>Validación:</strong> Verificación de códigos únicos</li>
                  <li>✅ <strong>Integración:</strong> Funcionamiento con React hooks y componentes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Casos de Uso</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p><strong>Crear nueva dimensión:</strong></p>
                    <p className="text-muted-foreground">El sistema genera automáticamente el siguiente número (ej: "3" si existen 2 dimensiones)</p>
                  </div>

                  <div>
                    <p><strong>Crear nuevo componente:</strong></p>
                    <p className="text-muted-foreground">Se genera código jerárquico basado en la dimensión seleccionada (ej: "2.1" para primer componente de dimensión 2)</p>
                  </div>

                  <div>
                    <p><strong>Crear nueva evidencia:</strong></p>
                    <p className="text-muted-foreground">Se asigna el siguiente número global, sin importar la dimensión a la que pertenece</p>
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
