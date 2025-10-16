/**
 * Utility functions for SINAES code formatting
 */

/**
 * Extract the numeric part from a SINAES code
 * Examples:
 *   "DIM-01" -> "01"
 *   "DIM-01.COMP-02" -> "02"
 *   "DIM-01.COMP-02.CRIT-03" -> "03"
 *   "1.2.3" -> "3"
 * 
 * @param fullCode - The complete hierarchical code
 * @returns The last numeric segment
 */
export function extractCodeNumber(fullCode: string): string {
  if (!fullCode) return ''

  // Split by dots to get the last segment
  const segments = fullCode.split('.')
  const lastSegment = segments[segments.length - 1]

  if (!lastSegment) return ''

  // Extract number from formats like "DIM-01", "COMP-02", etc.
  const match = lastSegment.match(/(\d+)/)

  return match?.[1] || lastSegment
}

/**
 * Format code for display in hierarchy lists
 * Shows only the relevant number without parent prefixes
 * 
 * @param fullCode - The complete hierarchical code
 * @returns Formatted code for display
 */
export function formatCodeForDisplay(fullCode: string): string {
  const number = extractCodeNumber(fullCode)
  return number.padStart(2, '0') // Ensure at least 2 digits
}
