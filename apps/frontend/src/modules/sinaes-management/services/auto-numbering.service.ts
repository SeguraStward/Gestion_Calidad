import HttpClient from '@/lib/http-client'

/**
 * Servicio para manejar la numeración automática de entidades SINAES
 * 
 * REGLAS:
 * - Dimensiones: DIM-01, DIM-02, DIM-03...
 * - Componentes: COMP-01, COMP-02, COMP-03...
 * - Criterios: CRIT-01, CRIT-02, CRIT-03...
 * - Estándares: STD-01, STD-02, STD-03...
 * - Evidencias: EV-001, EV-002, EV-003... (Global, 3 dígitos)
 */

export interface NumberingContext {
  entityType: 'dimension' | 'component' | 'criterion' | 'standard' | 'evidence'
  parentId?: string
  dimensionId?: string
  componentId?: string
  criterionId?: string
  standardId?: string
}

export interface NumberingResult {
  code: string
  order: number
}

class AutoNumberingService {

  /**
   * Métodos públicos para uso en hooks y componentes
   */
  async generateNextDimensionNumber(): Promise<string> {
    const result = await this.generateDimensionNumber()
    return result.code
  }

  async generateNextComponentNumber(dimensionId: string): Promise<string> {
    const result = await this.generateComponentNumber(dimensionId)
    return result.code
  }

  async generateNextCriterionNumber(componentId: string): Promise<string> {
    const result = await this.generateCriterionNumber(componentId)
    return result.code
  }

  async generateNextStandardNumber(criterionId: string): Promise<string> {
    const result = await this.generateStandardNumber(criterionId)
    return result.code
  }

  async generateNextEvidenceNumber(): Promise<string> {
    const result = await this.generateEvidenceNumber()
    return result.code
  }

  /**
   * Genera el siguiente código y orden para una entidad
   */
  async generateNextNumber(context: NumberingContext): Promise<NumberingResult> {
    switch (context.entityType) {
      case 'dimension':
        return this.generateDimensionNumber()

      case 'component':
        return this.generateComponentNumber(context.dimensionId!)

      case 'criterion':
        return this.generateCriterionNumber(context.componentId!)

      case 'standard':
        return this.generateStandardNumber(context.criterionId!)

      case 'evidence':
        return this.generateEvidenceNumber()

      default:
        throw new Error(`Tipo de entidad no soportado: ${context.entityType}`)
    }
  }

  /**
   * Genera número para dimensión: DIM-01, DIM-02, DIM-03...
   */
  private async generateDimensionNumber(): Promise<NumberingResult> {
    const response = await HttpClient.get('/dimensions')
    const dimensions = response.data?.data || response.data || []

    const maxOrder = dimensions.reduce((max: number, dim: any) =>
      Math.max(max, dim.order || 0), 0)

    const nextOrder = maxOrder + 1

    return {
      code: `DIM-${nextOrder.toString().padStart(2, '0')}`,
      order: nextOrder
    }
  }

  /**
   * Genera número para componente: COMP-01, COMP-02, COMP-03...
   */
  private async generateComponentNumber(dimensionId: string): Promise<NumberingResult> {
    // Obtener componentes existentes de esta dimensión
    const componentsResponse = await HttpClient.get('/components', {
      params: { dimensionId }
    })
    const components = componentsResponse.data?.data || componentsResponse.data || []

    const maxOrder = components.reduce((max: number, comp: any) =>
      Math.max(max, comp.order || 0), 0)

    const nextOrder = maxOrder + 1

    return {
      code: `COMP-${nextOrder.toString().padStart(2, '0')}`,
      order: nextOrder
    }
  }

  /**
   * Genera número para criterio: CRIT-01, CRIT-02, CRIT-03...
   */
  private async generateCriterionNumber(componentId: string): Promise<NumberingResult> {
    // Obtener criterios existentes de este componente
    const criteriaResponse = await HttpClient.get('/criteria', {
      params: { componentId }
    })
    const criteria = criteriaResponse.data?.data || criteriaResponse.data || []

    const maxOrder = criteria.reduce((max: number, crit: any) =>
      Math.max(max, crit.order || 0), 0)

    const nextOrder = maxOrder + 1

    return {
      code: `CRIT-${nextOrder.toString().padStart(2, '0')}`,
      order: nextOrder
    }
  }

  /**
   * Genera número para estándar: STD-01, STD-02, STD-03...
   */
  private async generateStandardNumber(criterionId: string): Promise<NumberingResult> {
    // Obtener estándares existentes de este criterio
    const standardsResponse = await HttpClient.get('/standards', {
      params: { criterionId }
    })
    const standards = standardsResponse.data?.data || standardsResponse.data || []

    const maxOrder = standards.reduce((max: number, std: any) =>
      Math.max(max, std.order || 0), 0)

    const nextOrder = maxOrder + 1

    return {
      code: `STD-${nextOrder.toString().padStart(2, '0')}`,
      order: nextOrder
    }
  }

  /**
   * Genera número para evidencia: EV-001, EV-002, EV-003... (GLOBAL, no jerárquico)
   */
  private async generateEvidenceNumber(): Promise<NumberingResult> {
    // Obtener TODAS las evidencias del sistema
    const response = await HttpClient.get('/quality-evidences')
    const evidences = response.data?.data || response.data || []

    // Encontrar el orden máximo GLOBAL
    const maxOrder = evidences.reduce((max: number, evidence: any) =>
      Math.max(max, evidence.order || 0), 0)

    const nextOrder = maxOrder + 1

    return {
      code: `EV-${nextOrder.toString().padStart(3, '0')}`,
      order: nextOrder
    }
  }

  /**
   * Verifica si un código ya existe
   */
  async isCodeUnique(code: string, entityType: string, excludeId?: string): Promise<boolean> {
    const endpoints = {
      dimension: '/dimensions',
      component: '/components',
      criterion: '/criteria',
      standard: '/standards',
      evidence: '/quality-evidences'
    }

    const endpoint = endpoints[entityType as keyof typeof endpoints]
    if (!endpoint) return false

    try {
      const response = await HttpClient.get(endpoint, {
        params: { code }
      })
      const entities = response.data?.data || response.data || []

      // Si encontramos entidades con ese código
      if (entities.length > 0) {
        // Si estamos excluyendo un ID (para edición), verificar que no sea el mismo
        if (excludeId) {
          return !entities.some((entity: any) => entity.id !== excludeId)
        }
        return false // Código ya existe
      }

      return true // Código es único
    } catch (error) {
      console.error('Error checking code uniqueness:', error)
      return false
    }
  }

  /**
   * Recalcula todos los códigos en caso de reorganización
   */
  async recalculateAllCodes(): Promise<void> {
    console.log('🔄 Iniciando recálculo de códigos...')

    try {
      // 1. Recalcular dimensiones
      await this.recalculateDimensions()

      // 2. Recalcular componentes
      await this.recalculateComponents()

      // 3. Recalcular criterios
      await this.recalculateCriteria()

      // 4. Recalcular estándares
      await this.recalculateStandards()

      // 5. Recalcular evidencias (GLOBAL)
      await this.recalculateEvidences()

      console.log('✅ Recálculo de códigos completado')
    } catch (error) {
      console.error('❌ Error en recálculo de códigos:', error)
      throw error
    }
  }

  private async recalculateDimensions(): Promise<void> {
    const response = await HttpClient.get('/dimensions')
    const dimensions = (response.data?.data || response.data || [])
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    for (let i = 0; i < dimensions.length; i++) {
      const dimension = dimensions[i]
      const newCode = (i + 1).toString()
      const newOrder = i + 1

      if (dimension.code !== newCode || dimension.order !== newOrder) {
        await HttpClient.put(`/dimensions/${dimension.id}`, {
          ...dimension,
          code: newCode,
          order: newOrder
        })
      }
    }
  }

  private async recalculateComponents(): Promise<void> {
    const dimensionsResponse = await HttpClient.get('/dimensions')
    const dimensions = dimensionsResponse.data?.data || dimensionsResponse.data || []

    for (const dimension of dimensions) {
      const componentsResponse = await HttpClient.get('/components', {
        params: { dimensionId: dimension.id }
      })
      const components = (componentsResponse.data?.data || componentsResponse.data || [])
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

      for (let i = 0; i < components.length; i++) {
        const component = components[i]
        const newCode = `${dimension.code}.${i + 1}`
        const newOrder = i + 1

        if (component.code !== newCode || component.order !== newOrder) {
          await HttpClient.put(`/components/${component.id}`, {
            ...component,
            code: newCode,
            order: newOrder
          })
        }
      }
    }
  }

  private async recalculateCriteria(): Promise<void> {
    const componentsResponse = await HttpClient.get('/components')
    const components = componentsResponse.data?.data || componentsResponse.data || []

    for (const component of components) {
      const criteriaResponse = await HttpClient.get('/criteria', {
        params: { componentId: component.id }
      })
      const criteria = (criteriaResponse.data?.data || criteriaResponse.data || [])
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

      for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i]
        const newCode = `${component.code}.${i + 1}`
        const newOrder = i + 1

        if (criterion.code !== newCode || criterion.order !== newOrder) {
          await HttpClient.put(`/criteria/${criterion.id}`, {
            ...criterion,
            code: newCode,
            order: newOrder
          })
        }
      }
    }
  }

  private async recalculateStandards(): Promise<void> {
    const criteriaResponse = await HttpClient.get('/criteria')
    const criteria = criteriaResponse.data?.data || criteriaResponse.data || []

    for (const criterion of criteria) {
      const standardsResponse = await HttpClient.get('/standards', {
        params: { criterionId: criterion.id }
      })
      const standards = (standardsResponse.data?.data || standardsResponse.data || [])
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

      for (let i = 0; i < standards.length; i++) {
        const standard = standards[i]
        const newCode = `${criterion.code}.${i + 1}`
        const newOrder = i + 1

        if (standard.code !== newCode || standard.order !== newOrder) {
          await HttpClient.put(`/standards/${standard.id}`, {
            ...standard,
            code: newCode,
            order: newOrder
          })
        }
      }
    }
  }

  private async recalculateEvidences(): Promise<void> {
    const response = await HttpClient.get('/quality-evidences')
    const evidences = (response.data?.data || response.data || [])
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    for (let i = 0; i < evidences.length; i++) {
      const evidence = evidences[i]
      const newCode = (i + 1).toString() // Evidencias: 1, 2, 3, 4...
      const newOrder = i + 1

      if (evidence.code !== newCode || evidence.order !== newOrder) {
        await HttpClient.put(`/quality-evidences/${evidence.id}`, {
          ...evidence,
          code: newCode,
          order: newOrder
        })
      }
    }
  }
}

export const autoNumberingService = new AutoNumberingService()

// Hook para usar el servicio de numeración
export const useAutoNumbering = () => {
  return {
    generateNextNumber: autoNumberingService.generateNextNumber.bind(autoNumberingService),
    isCodeUnique: autoNumberingService.isCodeUnique.bind(autoNumberingService),
    recalculateAllCodes: autoNumberingService.recalculateAllCodes.bind(autoNumberingService)
  }
}
