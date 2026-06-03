/**
 * EditDocumentDialog Component
 * Dialog para editar documentos existentes
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@una-gc/ui/components/dialog';
import { Button } from '@una-gc/ui/components/button';
import { Input } from '@una-gc/ui/components/input';
import { Label } from '@una-gc/ui/components/label';
import { Textarea } from '@una-gc/ui/components/textarea';
import { Loader2, GraduationCap, Search } from 'lucide-react';
import { useUpdateProofDocument, updateDocumentCareers } from '../../services/proof-documents.service';
import type { ProofDocument } from '../../types/proof-documents.types';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { HttpClient } from '@/lib/http-client';

interface Career {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface EditDocumentDialogProps {
  document: ProofDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDocumentDialog({
  document,
  open,
  onOpenChange,
}: EditDocumentDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedCareerIds, setSelectedCareerIds] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isUpdatingCareers, setIsUpdatingCareers] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useUpdateProofDocument();

  // Fetch careers. `staleTime` evita refetches innecesarios (foco de ventana,
  // remontajes) que provocan renders extra del diálogo sin necesidad.
  const { data: careersData, isLoading: careersLoading } = useQuery<{ data: Career[]; meta: any }>({
    queryKey: ['careers'],
    queryFn: async () => {
      const response = await HttpClient.get('/careers', {
        params: { limit: 1000 }
      });
      return response.data;
    },
    staleTime: 5 * 60_000,
  });

  const careers = careersData?.data || [];

  // Sincronizar estado con el documento seleccionado. Dependemos del `id`
  // (primitivo estable) y de `open`, NO del objeto `document`: si la prop
  // recibe una nueva referencia con el mismo id (p. ej. tras un refetch de la
  // lista), el efecto no debe re-ejecutarse — eso es lo que dispara el loop
  // "Maximum update depth exceeded" (React #185).
  React.useEffect(() => {
    if (open && document) {
      setName(document.name);
      setDescription(document.description || '');
      // Extraer IDs de carreras del documento
      const careerIds = document.careerProofDocuments?.map(cp => cp.careerId) || [];
      setSelectedCareerIds(careerIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) return;

    try {
      // Actualizar información básica del documento
      await updateMutation.mutateAsync({
        id: document.id,
        data: {
          name,
          description: description || undefined,
        },
      });

      // Actualizar carreras si han cambiado
      const originalCareerIds = document.careerProofDocuments?.map(cp => cp.careerId) || [];
      const careersChanged =
        selectedCareerIds.length !== originalCareerIds.length ||
        selectedCareerIds.some(id => !originalCareerIds.includes(id));

      if (careersChanged) {
        setIsUpdatingCareers(true);
        await updateDocumentCareers(document.id, selectedCareerIds);
      }

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['proof-documents'] });

      // Cerrar dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
    } finally {
      setIsUpdatingCareers(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    if (document) {
      setName(document.name);
      setDescription(document.description || '');
      const careerIds = document.careerProofDocuments?.map(cp => cp.careerId) || [];
      setSelectedCareerIds(careerIds);
    }
    setSearchTerm('');
    onOpenChange(false);
  };

  const filteredCareers = careers.filter(career =>
    career.status === 'ACTIVE' && (
      career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      career.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCareerToggle = (careerId: string) => {
    const newSelectedIds = selectedCareerIds.includes(careerId)
      ? selectedCareerIds.filter(id => id !== careerId)
      : [...selectedCareerIds, careerId];
    setSelectedCareerIds(newSelectedIds);
  };

  const selectAllCareers = () => {
    setSelectedCareerIds(filteredCareers.map(career => career.id));
  };

  const selectNoCareers = () => {
    setSelectedCareerIds([]);
  };

  const isSubmitting = updateMutation.isPending || isUpdatingCareers;

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>
            Código: <span className="font-mono font-medium">{document.code}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del documento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del documento"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del documento..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Selector de Carreras */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <Label>
                    Carreras <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    ({selectedCareerIds.length} de {filteredCareers.length} seleccionadas)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllCareers}
                    type="button"
                    disabled={isSubmitting}
                  >
                    Todas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectNoCareers}
                    type="button"
                    disabled={isSubmitting}
                  >
                    Ninguna
                  </Button>
                </div>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar carreras por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  type="search"
                />
              </div>

              {/* Lista de carreras */}
              {careersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="h-[250px] overflow-y-auto border rounded-lg">
                  <div className="p-4 space-y-2">
                    {filteredCareers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron carreras' : 'No hay carreras disponibles'}
                      </div>
                    ) : (
                      filteredCareers.map((career) => (
                        <div
                          key={career.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer"
                          onClick={() => !isSubmitting && handleCareerToggle(career.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCareerIds.includes(career.id)}
                            onChange={() => handleCareerToggle(career.id)}
                            onClick={(e) => e.stopPropagation()}
                            id={`career-${career.id}`}
                            disabled={isSubmitting}
                            className="h-4 w-4 shrink-0 rounded border-primary accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{career.name}</span>
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {career.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Resumen de selección */}
              {selectedCareerIds.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Carreras seleccionadas:</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedCareerIds.slice(0, 3).map((careerId) => {
                      const career = careers.find(c => c.id === careerId);
                      return career ? (
                        <span key={career.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {career.code}
                        </span>
                      ) : null;
                    })}
                    {selectedCareerIds.length > 3 && (
                      <span className="text-xs bg-muted-foreground/10 text-muted-foreground px-2 py-1 rounded">
                        +{selectedCareerIds.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || selectedCareerIds.length === 0}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
