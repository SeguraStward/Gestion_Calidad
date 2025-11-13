'use client';

import { useState } from 'react';
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
  dimensions: DimensionCompliance[];
}

export function ComplianceTable({ dimensions }: ComplianceTableProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Detalle de Cumplimiento por Criterio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Elemento</TableHead>
                <TableHead className="text-center">Evidencias</TableHead>
                <TableHead className="text-center">Con Docs</TableHead>
                <TableHead className="text-center">Sin Docs</TableHead>
                <TableHead className="text-center">Total Docs</TableHead>
                <TableHead className="text-center">Cumplimiento</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dimensions.map((dimension) => (
                <>
                  {/* Fila de Dimensión */}
                  <TableRow key={dimension.dimensionId} className="bg-blue-50 font-semibold">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => toggleDimension(dimension.dimensionId)}
                      >
                        {expandedDimensions.has(dimension.dimensionId) ? (
                          <ChevronDown className="mr-2 h-4 w-4" />
                        ) : (
                          <ChevronRight className="mr-2 h-4 w-4" />
                        )}
                        {dimension.name}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">{dimension.totalEvidences}</TableCell>
                    <TableCell className="text-center text-green-600">
                      {dimension.evidencesWithDocuments}
                    </TableCell>
                    <TableCell
                      className={`text-center ${dimension.evidencesMissing > 0 ? 'text-red-600' : 'text-gray-400'}`}
                    >
                      {dimension.evidencesMissing}
                    </TableCell>
                    <TableCell className="text-center">{dimension.totalDocuments}</TableCell>
                    <TableCell className={`text-center font-bold ${getComplianceColor(dimension.compliancePercentage)}`}>
                      {dimension.compliancePercentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getCriterionStatusClass(dimension.complianceStatus === 'EXCELLENT' || dimension.complianceStatus === 'GOOD' ? 'COMPLETE' : dimension.complianceStatus === 'FAIR' ? 'PARTIAL' : 'MISSING')}>
                        {dimension.compliancePercentage >= 90 ? 'Excelente' : dimension.compliancePercentage >= 70 ? 'Bueno' : dimension.compliancePercentage >= 50 ? 'Regular' : 'Deficiente'}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Filas de Componentes */}
                  {expandedDimensions.has(dimension.dimensionId) &&
                    dimension.components.map((component) => (
                      <>
                        <TableRow key={component.componentId} className="bg-purple-50">
                          <TableCell className="pl-8">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 hover:bg-transparent"
                              onClick={() => toggleComponent(component.componentId)}
                            >
                              {expandedComponents.has(component.componentId) ? (
                                <ChevronDown className="mr-2 h-4 w-4" />
                              ) : (
                                <ChevronRight className="mr-2 h-4 w-4" />
                              )}
                              {component.name}
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">{component.totalEvidences}</TableCell>
                          <TableCell className="text-center text-green-600">
                            {component.evidencesWithDocuments}
                          </TableCell>
                          <TableCell
                            className={`text-center ${component.evidencesMissing > 0 ? 'text-red-600' : 'text-gray-400'}`}
                          >
                            {component.evidencesMissing}
                          </TableCell>
                          <TableCell className="text-center">{component.totalDocuments}</TableCell>
                          <TableCell className={`text-center font-bold ${getComplianceColor(component.compliancePercentage)}`}>
                            {component.compliancePercentage.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getCriterionStatusClass(component.complianceStatus === 'EXCELLENT' || component.complianceStatus === 'GOOD' ? 'COMPLETE' : component.complianceStatus === 'FAIR' ? 'PARTIAL' : 'MISSING')}>
                              {component.compliancePercentage >= 90 ? 'Excelente' : component.compliancePercentage >= 70 ? 'Bueno' : component.compliancePercentage >= 50 ? 'Regular' : 'Deficiente'}
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {/* Filas de Criterios */}
                        {expandedComponents.has(component.componentId) &&
                          component.criteria.map((criterion) => (
                            <>
                              <TableRow key={criterion.criterionId} className="bg-gray-50">
                                <TableCell className="pl-16">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 hover:bg-transparent"
                                    onClick={() => toggleCriterion(criterion.criterionId)}
                                  >
                                    {expandedCriteria.has(criterion.criterionId) ? (
                                      <ChevronDown className="mr-2 h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="mr-2 h-4 w-4" />
                                    )}
                                    {criterion.name}
                                  </Button>
                                </TableCell>
                                <TableCell className="text-center">{criterion.totalEvidences}</TableCell>
                                <TableCell className="text-center text-green-600">
                                  {criterion.evidencesWithDocuments}
                                </TableCell>
                                <TableCell
                                  className={`text-center ${criterion.evidencesMissing > 0 ? 'text-red-600' : 'text-gray-400'}`}
                                >
                                  {criterion.evidencesMissing}
                                </TableCell>
                                <TableCell className="text-center">{criterion.totalDocuments}</TableCell>
                                <TableCell className={`text-center font-bold ${getComplianceColor(criterion.compliancePercentage)}`}>
                                  {criterion.compliancePercentage.toFixed(1)}%
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={getCriterionStatusClass(criterion.status)}>
                                    {getCriterionStatusLabel(criterion.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>

                              {/* Filas de Evidencias */}
                              {expandedCriteria.has(criterion.criterionId) &&
                                criterion.evidences.map((evidence) => (
                                  <TableRow key={evidence.evidenceId} className="text-sm">
                                    <TableCell className="pl-24 text-muted-foreground">
                                      📄 {evidence.name}
                                    </TableCell>
                                    <TableCell className="text-center">1</TableCell>
                                    <TableCell className="text-center">
                                      {evidence.hasDocuments ? '1' : '0'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {evidence.hasDocuments ? '0' : '1'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {evidence.documentCount}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className={evidence.hasDocuments ? 'text-green-600' : 'text-red-600'}>
                                        {evidence.hasDocuments ? '100%' : '0%'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge
                                        variant={evidence.hasDocuments ? 'default' : 'destructive'}
                                        className="text-xs"
                                      >
                                        {evidence.hasDocuments ? 'Completo' : 'Faltante'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </>
                          ))}
                      </>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
