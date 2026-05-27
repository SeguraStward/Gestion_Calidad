'use client';

import { useState, useMemo } from 'react';
import { Button } from '@una-gc/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card';
import { Label } from '@una-gc/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@una-gc/ui/components/select';
import { CalendarIcon, FileBarChart, Loader2, X } from 'lucide-react';
import { Badge } from '@una-gc/ui/components/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@una-gc/ui/components/popover';
import { Calendar } from '@una-gc/ui/components/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@una-gc/ui/lib/utils';
import { Input } from '@una-gc/ui/components/input';
import { Textarea } from '@una-gc/ui/components/textarea';
import type { GenerateReportFilters } from '../../types/sinaes-reports.types';
import { useDimensionsWithFullHierarchy } from '../../services/dimensions.service';
import { useListCareersFlat } from '@/modules/academic-management/academic-maintenance/hooks/useCareer';

/** Local types for the SINAES hierarchy used in filters */
interface FilterCriterion {
  id: string;
  code?: string;
  name: string;
}

interface FilterComponent {
  id: string;
  code?: string;
  name: string;
  criteria?: FilterCriterion[];
}

interface FilterDimension {
  id: string;
  code?: string;
  name: string;
  components?: FilterComponent[];
}

interface FilterCareer {
  id: string;
  code?: string;
  name: string;
  status?: string;
}

interface ComplianceFiltersProps {
  onGenerateReport: (filters: GenerateReportFilters) => void;
  isGenerating?: boolean;
}

export function ComplianceFilters({ onGenerateReport, isGenerating = false }: ComplianceFiltersProps) {
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [dimensionId, setDimensionId] = useState<string>('');
  const [componentId, setComponentId] = useState<string>('');
  const [criterionId, setCriterionId] = useState<string>('');
  const [careerId, setCareerId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Cargar datos reales
  const { data: dimensionsData, isLoading: isLoadingDimensions } = useDimensionsWithFullHierarchy();
  const { data: careersData, isLoading: isLoadingCareers } = useListCareersFlat();

  // Extraer arrays de datos
  const dimensions = useMemo(() => {
    if (!dimensionsData) return [];
    return Array.isArray(dimensionsData) ? dimensionsData : (dimensionsData as { data: FilterDimension[] }).data || [];
  }, [dimensionsData]);

  const careers = useMemo(() => {
    if (!careersData) return [];
    // Filtrar solo carreras activas
    const careersList = Array.isArray(careersData) ? careersData : [];
    return careersList.filter((c: FilterCareer) => c.status === 'ACTIVE');
  }, [careersData]);

  // Filtrar componentes y criterios según selección
  const components = useMemo(() => {
    if (!dimensionId || dimensionId === 'all') return [];
    const selectedDimension = dimensions.find((d: FilterDimension) => d.id === dimensionId);
    return selectedDimension?.components || [];
  }, [dimensionId, dimensions]);

  const criteria = useMemo(() => {
    if (!componentId || componentId === 'all') return [];
    const selectedComponent = components.find((c: FilterComponent) => c.id === componentId);
    return selectedComponent?.criteria || [];
  }, [componentId, components]);

  const handleDimensionChange = (value: string) => {
    setDimensionId(value);
    setComponentId('');
    setCriterionId('');
  };

  const handleComponentChange = (value: string) => {
    setComponentId(value);
    setCriterionId('');
  };

  const handleGenerateReport = () => {
    const filters: GenerateReportFilters = {
      reportName: reportName || `Reporte ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
      description: description || undefined,
      dimensionId: dimensionId && dimensionId !== 'all' ? dimensionId : undefined,
      componentId: componentId && componentId !== 'all' ? componentId : undefined,
      criterionId: criterionId && criterionId !== 'all' ? criterionId : undefined,
      careerId: careerId && careerId !== 'all' ? careerId : undefined,
      dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
      dateTo: dateTo ? dateTo.toISOString() : undefined,
    };

    onGenerateReport(filters);
  };

  const handleReset = () => {
    setReportName('');
    setDescription('');
    setDimensionId('');
    setComponentId('');
    setCriterionId('');
    setCareerId('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  // Number of structural/date filters that are actually narrowing the report.
  // Used as a visual cue in the header so the user knows what is being applied.
  const activeFilterCount =
    (dimensionId && dimensionId !== 'all' ? 1 : 0) +
    (componentId && componentId !== 'all' ? 1 : 0) +
    (criterionId && criterionId !== 'all' ? 1 : 0) +
    (careerId && careerId !== 'all' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              Filtros de Reporte de Cumplimiento
            </CardTitle>
            <CardDescription>
              Configure los filtros para generar un reporte de cumplimiento SINAES personalizado
            </CardDescription>
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="flex-shrink-0">
              {activeFilterCount} filtro{activeFilterCount === 1 ? '' : 's'} activo{activeFilterCount === 1 ? '' : 's'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información básica del reporte */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reportName">Nombre del Reporte</Label>
            <Input
              id="reportName"
              placeholder="Ej: Reporte Trimestral Q1 2025"
              value={reportName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReportName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción breve del propósito del reporte..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Filtros de estructura SINAES */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Filtros de Estructura SINAES</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dimension">Dimensión</Label>
              <Select value={dimensionId} onValueChange={handleDimensionChange} disabled={isLoadingDimensions}>
                <SelectTrigger id="dimension">
                  <SelectValue placeholder={isLoadingDimensions ? "Cargando dimensiones..." : "Todas las dimensiones"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dimensiones</SelectItem>
                  {dimensions.map((dim: FilterDimension) => (
                    <SelectItem key={dim.id} value={dim.id}>
                      {dim.code ? `${dim.code} - ${dim.name}` : dim.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="component">Componente</Label>
              <Select
                value={componentId}
                onValueChange={handleComponentChange}
                disabled={!dimensionId || dimensionId === 'all' || isLoadingDimensions}
              >
                <SelectTrigger id="component">
                  <SelectValue placeholder="Todos los componentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los componentes</SelectItem>
                  {components.map((comp: FilterComponent) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.code ? `${comp.code} - ${comp.name}` : comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="criterion">Criterio</Label>
              <Select
                value={criterionId}
                onValueChange={setCriterionId}
                disabled={!componentId || componentId === 'all'}
              >
                <SelectTrigger id="criterion">
                  <SelectValue placeholder="Todos los criterios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los criterios</SelectItem>
                  {criteria.map((crit: FilterCriterion) => (
                    <SelectItem key={crit.id} value={crit.id}>
                      {crit.code ? `${crit.code} - ${crit.name}` : crit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="career">Carrera</Label>
              <Select value={careerId} onValueChange={setCareerId} disabled={isLoadingCareers}>
                <SelectTrigger id="career">
                  <SelectValue placeholder={isLoadingCareers ? "Cargando carreras..." : "Todas las carreras"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  {careers.map((career: FilterCareer) => (
                    <SelectItem key={career.id} value={career.id}>
                      {career.code ? `${career.code} - ${career.name}` : career.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filtros de rango de fechas */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Rango de Fechas (Documentos)</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Desde</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start text-left font-normal',
                        !dateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 min-w-[280px]" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      locale={es}
                      weekStartsOn={1}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateFrom && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDateFrom(undefined)}
                    aria-label="Limpiar fecha desde"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Hasta</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start text-left font-normal',
                        !dateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 min-w-[280px]" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      locale={es}
                      weekStartsOn={1}
                      autoFocus
                      disabled={(date: Date) => dateFrom ? date < dateFrom : false}
                    />
                  </PopoverContent>
                </Popover>
                {dateTo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDateTo(undefined)}
                    aria-label="Limpiar fecha hasta"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando reporte...
              </>
            ) : (
              <>
                <FileBarChart className="mr-2 h-4 w-4" />
                Generar Reporte
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isGenerating}
          >
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
