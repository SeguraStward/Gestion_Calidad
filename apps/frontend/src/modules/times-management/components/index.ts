// Export all times-management components
export { default as CampusAllocationsTable } from './CampusAllocationsTable'
export { default as JourneyConfigDisplay } from './JourneyConfigDisplay'
export { default as JourneyCalculator, calculateJourneyType } from './JourneyCalculator'
export { default as ProfessorAssignments } from './ProfessorAssignments'
export { default as RepitenciasManager } from './RepitenciasManager'
export { EmptyState } from './EmptyState'
export { Breadcrumbs } from './Breadcrumbs'
export { StatsCard } from './StatsCard'

// Export types
export type { JourneyConfig } from './JourneyConfigDisplay'
export type { ProfessorAssignment } from './ProfessorAssignments'
export type { RepitenciaRecord } from './RepitenciasManager'
export type { CampusAllocation } from './CampusAllocationsTable'
