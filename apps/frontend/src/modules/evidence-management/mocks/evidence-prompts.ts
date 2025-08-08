import { EvidencePromptType } from '../types/evidence.types'

export const evidencePromptsMock: EvidencePromptType[] = [
  {
    id: 'ep1',
    code: 'Evidencia 1.1',
    description: 'Folleto, página web, u otros medios de divulgación de la carrera.',
    criterionId: 'crit1'
  },
  {
    id: 'ep2',
    code: 'Evidencia 3.2',
    description: 'Actas de reuniones o minutas del comité de enlace con empleadores.',
    criterionId: 'crit3'
  },
  {
    id: 'ep3',
    code: 'Evidencia 3.4',
    description: 'Lista de convenios existentes con instituciones parauniversitarias.',
    criterionId: 'crit3'
  },
  {
    id: 'ep4',
    code: 'Evidencia 7.1',
    description: 'Registros de rendimiento académico de los últimos 3 años (tasas de aprobación, reprobación, deserción).',
    criterionId: 'crit7'
  }
]