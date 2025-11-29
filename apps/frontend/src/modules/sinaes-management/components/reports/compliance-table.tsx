'use client';

import React, { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card';
import { Badge } from '@una-gc/ui/components/badge';
import { Button } from '@una-gc/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@una-gc/ui/components/table';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import type {
  DimensionCompliance,
  ComponentCompliance,
  CriterionCompliance,
} from '../../types/sinaes-reports.types';
import {
  getCriterionStatusClass,
  getCriterionStatusLabel,
  getComplianceColor,
} from '../../types/sinaes-reports.types';

interface ComplianceTableProps {
  dimensions?: DimensionCompliance[];
}

export function ComplianceTable({ dimensions }: ComplianceTableProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

  // Early return if no dimensions
  if (!dimensions || dimensions.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">No hay datos de dimensiones disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const toggleDimension = (id: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDimensions(newExpanded);
  };

  const toggleComponent = (id: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedComponents(newExpanded);
  };

  const toggleCriterion = (id: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCriteria(newExpanded);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/50 py-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Detalle de Cumplimiento por Criterio
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[50%] h-10 text-xs font-semibold">Elemento</TableHead>
                <TableHead className="text-center h-10 text-xs font-semibold">Evidencias</TableHead>
                <TableHead className="text-center h-10 text-xs font-semibold">Con Docs</TableHead>
                <TableHead className="text-center h-10 text-xs font-semibold">Faltantes</TableHead>
                <TableHead className="text-center h-10 text-xs font-semibold">Documentos</TableHead>
                <TableHead className="text-center h-10 text-xs font-semibold">Cumplimiento</TableHead>
                <TableHead className="text-center h-10 text-xs font-semibold">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dimensions.map((dimension) => (
                <React.Fragment key={dimension.dimensionId}>
                  {/* Fila de Dimensión */}
                  <TableRow className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 border-b-2 border-blue-300 dark:border-blue-700">
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 p-1 hover:bg-blue-200/50 dark:hover:bg-blue-800/50"
                        onClick={() => toggleDimension(dimension.dimensionId)}
                      >
                        {expandedDimensions.has(dimension.dimensionId) ? (
                          <ChevronDown className="mr-1 h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="mr-1 h-3.5 w-3.5" />
                        )}
                        <span className="text-sm font-semibold">{dimension.name}</span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-center py-2 text-sm">{dimension.totalEvidences}</TableCell>
                    <TableCell className="text-center py-2 text-sm font-medium text-green-700 dark:text-green-400">
                      {dimension.evidencesWithDocuments}
                    </TableCell>
                    <TableCell
                      className={`text-center py-2 text-sm font-medium ${dimension.evidencesMissing > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                      {dimension.evidencesMissing}
                    </TableCell>
                    <TableCell className="text-center py-2 text-sm">{dimension.totalDocuments}</TableCell>
                    <TableCell className={`text-center py-2 text-sm font-bold ${getComplianceColor(dimension.compliancePercentage)}`}>
                      {dimension.compliancePercentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Badge variant="outline" className={`text-xs ${getCriterionStatusClass(dimension.complianceStatus === 'EXCELLENT' || dimension.complianceStatus === 'GOOD' ? 'COMPLETE' : dimension.complianceStatus === 'FAIR' ? 'PARTIAL' : 'MISSING')}`}>
                        {dimension.compliancePercentage >= 90 ? 'Excelente' : dimension.compliancePercentage >= 70 ? 'Bueno' : dimension.compliancePercentage >= 50 ? 'Regular' : 'Deficiente'}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Filas de Componentes */}
                  {expandedDimensions.has(dimension.dimensionId) &&
                    dimension.components.map((component) => (
                      <React.Fragment key={component.componentId}>
                        <TableRow className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 border-b border-purple-200 dark:border-purple-700">
                          <TableCell className="pl-8 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 p-1 hover:bg-purple-100/70 dark:hover:bg-purple-800/50"
                              onClick={() => toggleComponent(component.componentId)}
                            >
                              {expandedComponents.has(component.componentId) ? (
                                <ChevronDown className="mr-1 h-3 w-3" />
                              ) : (
                                <ChevronRight className="mr-1 h-3 w-3" />
                              )}
                              <span className="text-sm font-medium">{component.name}</span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-center py-2 text-sm">{component.totalEvidences}</TableCell>
                          <TableCell className="text-center py-2 text-sm font-medium text-green-700 dark:text-green-400">
                            {component.evidencesWithDocuments}
                          </TableCell>
                          <TableCell
                            className={`text-center py-2 text-sm font-medium ${component.evidencesMissing > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
                          >
                            {component.evidencesMissing}
                          </TableCell>
                          <TableCell className="text-center py-2 text-sm">{component.totalDocuments}</TableCell>
                          <TableCell className={`text-center py-2 text-sm font-bold ${getComplianceColor(component.compliancePercentage)}`}>
                            {component.compliancePercentage.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Badge variant="outline" className={`text-xs ${getCriterionStatusClass(component.complianceStatus === 'EXCELLENT' || component.complianceStatus === 'GOOD' ? 'COMPLETE' : component.complianceStatus === 'FAIR' ? 'PARTIAL' : 'MISSING')}`}>
                              {component.compliancePercentage >= 90 ? 'Excelente' : component.compliancePercentage >= 70 ? 'Bueno' : component.compliancePercentage >= 50 ? 'Regular' : 'Deficiente'}
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {/* Filas de Criterios */}
                        {expandedComponents.has(component.componentId) &&
                          component.criteria.map((criterion) => (
                            <React.Fragment key={criterion.criterionId}>
                              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <TableCell className="pl-16 py-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 p-1 hover:bg-gray-100/70 dark:hover:bg-gray-700/50"
                                    onClick={() => toggleCriterion(criterion.criterionId)}
                                  >
                                    {expandedCriteria.has(criterion.criterionId) ? (
                                      <ChevronDown className="mr-1 h-2.5 w-2.5" />
                                    ) : (
                                      <ChevronRight className="mr-1 h-2.5 w-2.5" />
                                    )}
                                    <span className="text-xs">{criterion.name}</span>
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center py-1.5 text-xs">{criterion.totalEvidences}</TableCell>
                                <TableCell className="text-center py-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                                  {criterion.evidencesWithDocuments}
                                </TableCell>
                                <TableCell
                                  className={`text-center py-1.5 text-xs font-medium ${criterion.evidencesMissing > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
                                >
                                  {criterion.evidencesMissing}
                                </TableCell>
                                <TableCell className="text-center py-1.5 text-xs">{criterion.totalDocuments}</TableCell>
                                <TableCell className={`text-center py-1.5 text-xs font-bold ${getComplianceColor(criterion.compliancePercentage)}`}>
                                  {criterion.compliancePercentage.toFixed(1)}%
                                </TableCell>
                                <TableCell className="text-center py-1.5">
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getCriterionStatusClass(criterion.status)}`}>
                                    {getCriterionStatusLabel(criterion.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>

                              {/* Filas de Evidencias */}
                              {expandedCriteria.has(criterion.criterionId) &&
                                criterion.evidences.map((evidence) => (
                                  <TableRow key={evidence.evidenceId} className="bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-800/30">
                                    <TableCell className="pl-24 py-1.5 text-muted-foreground">
                                      <span className="text-xs">📄 {evidence.name}</span>
                                    </TableCell>
                                    <TableCell className="text-center py-1.5 text-xs">1</TableCell>
                                    <TableCell className="text-center py-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                                      {evidence.hasDocuments ? '1' : '0'}
                                    </TableCell>
                                    <TableCell className={`text-center py-1.5 text-xs font-medium ${evidence.hasDocuments ? 'text-gray-400 dark:text-gray-500' : 'text-red-700 dark:text-red-400'}`}>
                                      {evidence.hasDocuments ? '0' : '1'}
                                    </TableCell>
                                    <TableCell className="text-center py-1.5 text-xs">
                                      {evidence.documentCount}
                                    </TableCell>
                                    <TableCell className={`text-center py-1.5 text-xs font-bold ${evidence.hasDocuments ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {evidence.hasDocuments ? '100%' : '0%'}
                                    </TableCell>
                                    <TableCell className="text-center py-1.5">
                                      <Badge
                                        variant={evidence.hasDocuments ? 'default' : 'destructive'}
                                        className="text-[10px] px-1.5 py-0"
                                      >
                                        {evidence.hasDocuments ? 'Completo' : 'Faltante'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </React.Fragment>
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
