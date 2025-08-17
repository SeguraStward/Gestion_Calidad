/**
 * Represents a permission assigned to a role
 */
export interface Permission {
  id: string;              // Permission identifier
  code?: string;           // Permission code for reference
  permissions: string[];   // Array of allowed actions (CREATE, READ, etc.)
  scope?: 'ALL' | 'OWN';   // Permission scope
  actions?: string[];      // Additional custom actions if needed
}