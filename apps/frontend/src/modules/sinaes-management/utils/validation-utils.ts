/**
 * Validation utilities for SINAES forms
 */

import { toast } from 'sonner'

/**
 * Check if a name already exists in a list of entities
 * Case-insensitive comparison
 * 
 * @param name - Name to check
 * @param entities - Array of entities to search in
 * @param currentId - ID of current entity (for edit mode, to exclude itself)
 * @returns true if duplicate found, false otherwise
 */
export function checkDuplicateName<T extends { id: string; name: string }>(
  name: string,
  entities: T[] | undefined,
  currentId?: string
): boolean {
  if (!entities || !name) return false

  const trimmedName = name.trim().toLowerCase()

  const duplicate = entities.find((entity) => {
    // Skip comparing with itself in edit mode
    if (currentId && entity.id === currentId) return false

    return entity.name.toLowerCase() === trimmedName
  })

  return !!duplicate
}

/**
 * Show toast notification for duplicate name
 * 
 * @param entityType - Type of entity (dimension, component, etc.)
 * @param name - Duplicate name
 */
export function showDuplicateAlert(entityType: string, name: string): void {
  toast.error(
    `Ya existe ${getArticle(entityType)} ${entityType} con el nombre "${name}". Por favor, elige un nombre diferente.`,
    {
      duration: 4000,
      position: 'top-center',
      style: {
        background: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
        border: '1px solid hsl(var(--destructive))',
      }
    }
  )
}

/**
 * Get grammatical article for entity type
 */
function getArticle(entityType: string): string {
  const femaleTypes = ['dimensión', 'evidencia']
  return femaleTypes.includes(entityType.toLowerCase()) ? 'una' : 'un'
}
