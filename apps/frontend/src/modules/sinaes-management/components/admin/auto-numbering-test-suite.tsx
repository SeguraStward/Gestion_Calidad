'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Badge } from '@una-gc/ui/components'
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
  code?: string
  duration?: number
}

export const AutoNumberingTestSuite = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Generar código de dimensión', status: 'pending' },
    { name: 'Generar código de componente', status: 'pending' },
    { name: 'Generar código de criterio', status: 'pending' },
    { name: 'Generar código de estándar', status: 'pending' },
    { name: 'Generar código de evidencia', status: 'pending' },
    { name: 'Recálculo masivo', status: 'pending' }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const {
    generateDimensionCode,
    generateComponentCode,
    generateCriterionCode,
    generateStandardCode,
    generateEvidenceCode,
    recalculateAllCodes
  } = useAutoNumbering()

  const updateTestStatus = (index: number, status: TestResult['status'], message?: string, code?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) =>
      i === index ? { ...test, status, message, code, duration } : test
    ))
  }

  const runTest = async (index: number, testFn: () => Promise<any>) => {
    const startTime = Date.now()
    updateTestStatus(index, 'running')

    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      updateTestStatus(index, 'success', 'Test exitoso', result, duration)
    } catch (error) {
      const duration = Date.now() - startTime
      const message = error instanceof Error ? error.message : 'Error desconocido'
      updateTestStatus(index, 'error', message, undefined, duration)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)

    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: undefined, code: undefined, duration: undefined })))

    // Test 1: Dimensión
    await runTest(0, async () => {
      return await generateDimensionCode()
    })

    // Test 2: Componente (necesita dimension mock)
    await runTest(1, async () => {
      // Para pruebas, usamos un ID mock
      return await generateComponentCode('mock-dimension-id')
    })

    // Test 3: Criterio (necesita component mock)
    await runTest(2, async () => {
      return await generateCriterionCode('mock-component-id')
    })

    // Test 4: Estándar (necesita criterion mock)
    await runTest(3, async () => {
      return await generateStandardCode('mock-criterion-id')
    })

    // Test 5: Evidencia
    await runTest(4, async () => {
      return await generateEvidenceCode()
    })

    // Test 6: Recálculo masivo
    await runTest(5, async () => {
      await recalculateAllCodes()
      return 'Recálculo completado'
    })

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Exitoso</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'running':
        return <Badge variant="secondary">Ejecutando...</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  const successCount = tests.filter(t => t.status === 'success').length
  const errorCount = tests.filter(t => t.status === 'error').length
  const totalTests = tests.length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Suite de Pruebas - Auto-numeración SINAES</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Verificación de integración con backend y funcionamiento del sistema
            </p>
          </div>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="min-w-[140px]"
          >
            {isRunning ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Ejecutar Pruebas
              </>
            )}
          </Button>
        </div>

        {(successCount > 0 || errorCount > 0) && (
          <div className="flex gap-4 mt-4">
            <div className="text-sm">
              <span className="text-green-600 font-medium">{successCount} exitosos</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-red-600 font-medium">{errorCount} errores</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-gray-600">{totalTests} total</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-4">
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {test.code && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {test.code}
                      </Badge>
                    )}
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              {tests.filter(test => test.message).map((test, index) => (
                <Alert key={index} variant={test.status === 'error' ? 'destructive' : 'default'}>
                  {test.status === 'error' ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{test.name}</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-1">
                      <p>{test.message}</p>
                      {test.code && (
                        <p className="font-mono text-xs bg-muted p-1 rounded">
                          Código generado: {test.code}
                        </p>
                      )}
                      {test.duration && (
                        <p className="text-xs text-muted-foreground">
                          Tiempo de ejecución: {test.duration}ms
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}

              {tests.every(test => !test.message) && (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Ejecuta las pruebas para ver los detalles</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
