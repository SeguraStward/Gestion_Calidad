import { Status } from '@una-gc/database/prisma/generated/client'

// =============================================================================
// CONSTANTS
// =============================================================================

export const CRUD_CONSTANTS = {
  PAGE_SIZE: 10,
  MAX_ITEMS_PER_PAGE: 50,
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 3,
  
  // Configuración de formularios
  FORM_CONFIG: {
    MODE: 'onChange' as const,
    RESET_ON_SUCCESS: true,
    CLEAR_ERRORS_ON_EDIT: true
  },
  
  // Configuración de queries
  QUERY_CONFIG: {
    KEEP_PREVIOUS_DATA: true,
    REFETCH_ON_WINDOW_FOCUS: false,
    STALE_TIME: 5 * 60 * 1000, // 5 minutos
    CACHE_TIME: 10 * 60 * 1000  // 10 minutos
  }
} as const

// =============================================================================
// STATUS UTILITIES
// =============================================================================

export const STATUS_CONFIG = {
  [Status.ACTIVE]: {
    label: 'Activo',
    variant: 'default' as const,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  [Status.INACTIVE]: {
    label: 'Inactivo',
    variant: 'secondary' as const,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  },
  // Agregar configuración para ARCHIVED si existe en el enum Status
  ...(Status.ARCHIVED ? {
    [Status.ARCHIVED]: {
      label: 'Archivado',
      variant: 'outline' as const,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800'
    }
  } : {})
} as const

// Corrección para manejar todos los valores posibles del enum Status
export const getStatusConfig = (status: Status) => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: 'Desconocido',
    variant: 'outline' as const,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  }
}

// =============================================================================
// VALIDATION PATTERNS
// =============================================================================

export const VALIDATION_PATTERNS = {
  // Código alfanumérico con guiones
  CODE: {
    pattern: /^[A-Za-z0-9-]+$/,
    message: 'El código solo puede contener letras, números y guiones'
  },
  
  // Código estricto (letras mayúsculas, números y guiones)
  CODE_STRICT: {
    pattern: /^[A-Z0-9-]+$/,
    message: 'El código debe contener solo letras mayúsculas, números y guiones'
  },
  
  // Email
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingrese un email válido'
  },
  
  // Teléfono (formato flexible)
  PHONE: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    message: 'Ingrese un número de teléfono válido'
  },
  
  // Solo letras y espacios
  LETTERS_ONLY: {
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
    message: 'Solo se permiten letras y espacios'
  },
  
  // Nombre de persona (letras, espacios, acentos)
  PERSON_NAME: {
    pattern: /^[a-zA-ZÀ-ÿ\s\.]+$/,
    message: 'Solo se permiten letras, espacios y puntos'
  }
} as const

// =============================================================================
// COMMON VALIDATION RULES
// =============================================================================

export const createValidationRules = () => ({
  required: (fieldName: string) => ({
    required: `${fieldName} es obligatorio`
  }),
  
  minLength: (min: number, fieldName: string = 'El campo') => ({
    minLength: {
      value: min,
      message: `${fieldName} debe tener al menos ${min} caracteres`
    }
  }),
  
  maxLength: (max: number, fieldName: string = 'El campo') => ({
    maxLength: {
      value: max,
      message: `${fieldName} no puede exceder ${max} caracteres`
    }
  }),
  
  codeValidation: (minLength: number = 3, maxLength: number = 10) => ({
    required: 'El código es obligatorio',
    pattern: VALIDATION_PATTERNS.CODE,
    minLength: {
      value: minLength,
      message: `El código debe tener al menos ${minLength} caracteres`
    },
    maxLength: {
      value: maxLength,
      message: `El código no puede exceder ${maxLength} caracteres`
    }
  }),
  
  nameValidation: (minLength: number = 2, maxLength: number = 100) => ({
    required: 'El nombre es obligatorio',
    minLength: {
      value: minLength,
      message: `El nombre debe tener al menos ${minLength} caracteres`
    },
    maxLength: {
      value: maxLength,
      message: `El nombre no puede exceder ${maxLength} caracteres`
    }
  }),
  
  emailValidation: () => ({
    pattern: VALIDATION_PATTERNS.EMAIL
  })
})

// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

export const paginationHelpers = {
  calculatePageInfo: (page: number, pageSize: number, total: number) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const startItem = (page - 1) * pageSize + 1
    const endItem = Math.min(page * pageSize, total)
    const hasMore = page < totalPages
    const hasPrevious = page > 1
    
    return {
      totalPages,
      startItem,
      endItem,
      hasMore,
      hasPrevious,
      isFirstPage: page === 1,
      isLastPage: page === totalPages
    }
  },
  
  generatePageText: (page: number, pageSize: number, total: number, entityName: string) => {
    if (total === 0) {
      return `No hay ${entityName} registrados`
    }
    
    const { startItem, endItem } = paginationHelpers.calculatePageInfo(page, pageSize, total)
    return `Mostrando ${startItem} a ${endItem} de ${total} ${entityName}`
  }
}

// =============================================================================
// FORM UTILITIES
// =============================================================================

export const formHelpers = {
  // Generar valores por defecto para una entidad
  createDefaultValues: <T extends Record<string, any>>(
    fields: Partial<T>,
    includeRelations: boolean = true
  ): T => {
    // Creamos un objeto que respete la tipificación
    const baseDefaults: Record<string, any> = {
      code: '',
      name: '',
      status: Status.ACTIVE,
      createdBy: null,
      updatedBy: null,
      ...fields
    }
    
    if (includeRelations) {
      // Agregar campos de relación vacíos si no están presentes
      Object.keys(baseDefaults).forEach(key => {
        if (key.endsWith('Id') || key.includes('connect')) {
          if (!baseDefaults[key]) {
            baseDefaults[key] = { connect: [] }
          }
        }
      })
    }
    
    return baseDefaults as unknown as T
  },
  
  // Limpiar datos para envío (remover relaciones vacías)
  sanitizeSubmitData: <T extends Record<string, any>>(data: T): Partial<T> => {
    // Creamos una copia mutable del objeto
    const cleaned: Record<string, any> = { ...data }
    
    // Remover campos de relación vacíos
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] && typeof cleaned[key] === 'object' && 'connect' in cleaned[key]) {
        if (!cleaned[key].connect || 
            (Array.isArray(cleaned[key].connect) && cleaned[key].connect.length === 0) ||
            (typeof cleaned[key].connect === 'object' && !cleaned[key].connect.id)) {
          delete cleaned[key]
        }
      }
    })
      // Limpiar strings
    Object.keys(cleaned).forEach(key => {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim()
      }
    })
    
    return cleaned as unknown as Partial<T>
  }
}

// =============================================================================
// UI UTILITIES
// =============================================================================

export const uiHelpers = {
  // Generar clases CSS para estados de edición
  getEditingClasses: (isEditing: boolean) => ({
    card: `transition-all duration-200 hover:shadow-md ${
      isEditing ? 'ring-2 ring-blue-500 shadow-lg' : ''
    } overflow-hidden`,
    badge: isEditing ? 'animate-pulse' : ''
  }),
  
  // Generar texto de conteo para relaciones
  getRelationText: (count: number, singular: string, plural?: string) => {
    const displayPlural = plural || `${singular}s`
    return `${count} ${count === 1 ? singular : displayPlural}`
  },
    // Colores para diferentes tipos de entidades
  getEntityColors: (entityType: string) => {
    const colorMap: Record<string, { bg: string, text: string, border: string }> = {
      'regional-center': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      'campus': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      'classroom': { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      'career': { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      'subject': { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
    }
    
    return colorMap[entityType] || colorMap.default
  }
}

// =============================================================================
// RELATIONSHIP UTILITIES
// =============================================================================

export const relationshipHelpers = {
  // Verificar si una entidad puede ser eliminada
  canDelete: (item: any, relationshipFields: string[]) => {
    return relationshipFields.every(field => {
      const relation = item[field]
      return !relation || (Array.isArray(relation) ? relation.length === 0 : false)
    })
  },
  
  // Generar mensaje de advertencia para eliminación
  getDeleteWarningMessage: (item: any, relationshipConfig: Record<string, string>) => {
    const blockers = Object.entries(relationshipConfig).filter(([field]) => {
      const relation = item[field]
      return relation && (Array.isArray(relation) ? relation.length > 0 : true)
    })
    
    if (blockers.length === 0) return null
    
    const blockerTexts = blockers.map(([, description]) => description)
    return `No se puede eliminar: tiene ${blockerTexts.join(', ')} relacionados`
  },
  
  // Contar total de relaciones
  countRelations: (item: any, relationshipFields: string[]) => {
    return relationshipFields.reduce((total, field) => {
      const relation = item[field]
      return total + (Array.isArray(relation) ? relation.length : (relation ? 1 : 0))
    }, 0)
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export const errorHelpers = {
  // Generar mensaje de error user-friendly
  getErrorMessage: (error: any, defaultMessage: string = 'Ha ocurrido un error') => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.response?.data?.message) return error.response.data.message
    return defaultMessage
  },
  
  // Verificar si es un error de validación
  isValidationError: (error: any) => {
    return error?.status === 400 || error?.response?.status === 400
  },
  
  // Verificar si es un error de duplicación
  isDuplicateError: (error: any) => {
    const message = errorHelpers.getErrorMessage(error).toLowerCase()
    return message.includes('duplicate') || 
           message.includes('unique') || 
           message.includes('ya existe')
  }
}

// =============================================================================
// EXPORT EVERYTHING
// =============================================================================

export const crudUtils = {
  constants: CRUD_CONSTANTS,
  validation: {
    patterns: VALIDATION_PATTERNS,
    rules: createValidationRules()
  },
  pagination: paginationHelpers,
  forms: formHelpers,
  ui: uiHelpers,
  relationships: relationshipHelpers,
  errors: errorHelpers,
  status: {
    config: STATUS_CONFIG,
    get: getStatusConfig
  }
}

export default crudUtils
