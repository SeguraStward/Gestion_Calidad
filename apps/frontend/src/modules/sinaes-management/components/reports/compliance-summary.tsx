'use client';

import { Card, CardContent } from '@una-gc/ui/components/card';
import {
  FileText,
  FileCheck,
  FileX,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { ComplianceStatistics } from '../../types/sinaes-reports.types';
import {
  getComplianceStatusClass,
  getComplianceStatusLabel,
  getComplianceColor,
} from '../../types/sinaes-reports.types';

interface ComplianceSummaryProps {
  statistics?: ComplianceStatistics;
}

export function ComplianceSummary({ statistics }: ComplianceSummaryProps) {
  // Validar que statistics existe
  if (!statistics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p>No hay estadísticas disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Total Evidencias',
      value: statistics.totalEvidences,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Con Documentos',
      value: statistics.evidencesWithDocuments,
      icon: FileCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Faltantes',
      value: statistics.evidencesMissing,
      icon: FileX,
      color: statistics.evidencesMissing > 0 ? 'text-red-600' : 'text-gray-400',
      bgColor: statistics.evidencesMissing > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
    {
      label: 'Total Documentos',
      value: statistics.totalDocuments,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Métrica principal de cumplimiento */}
      <Card className={`border-2 ${statistics.overallCompliance >= 90 ? 'border-green-500' : statistics.overallCompliance >= 70 ? 'border-blue-500' : statistics.overallCompliance >= 50 ? 'border-yellow-500' : 'border-red-500'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Cumplimiento General
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className={`text-4xl font-bold ${getComplianceColor(statistics.overallCompliance)}`}>
                  {statistics.overallCompliance.toFixed(1)}%
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getComplianceStatusClass(statistics.overallStatus)}`}
                >
                  {getComplianceStatusLabel(statistics.overallStatus)}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-4">
              {statistics.overallCompliance >= 70 ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <AlertCircle className="h-8 w-8 text-white" />
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-500 ${statistics.overallCompliance >= 90
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : statistics.overallCompliance >= 70
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : statistics.overallCompliance >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                style={{ width: `${statistics.overallCompliance}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`rounded-lg ${metric.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desglose de estructura */}
      <Card>
        <CardContent className="p-6">
          <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
            Desglose de Estructura SINAES
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Dimensiones</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.totalDimensions}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Componentes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {statistics.totalComponents}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Criterios</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {statistics.totalCriteria}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
