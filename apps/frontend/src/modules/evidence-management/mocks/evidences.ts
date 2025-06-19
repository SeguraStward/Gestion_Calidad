import { EvidenceType } from '../types/evidence.types'

export const evidencesMock: EvidenceType[] = [
  {
    id: 'ev1',
    title: 'Plan Estratégico 2024',
    description: 'Plan estratégico de la carrera de Ingeniería en Sistemas',
    fileType: 'application/pdf',
    fileSize: 2458000,
    fileName: 'plan-estrategico-2024.pdf',
    driveFileId: 'drive-123456',
    driveFileLink: 'https://drive.google.com/file/d/abc123/view',
    year: 2024,
    month: 3,
    keywords: ['plan', 'estrategia', 'objetivos'],
    careerIds: ['career1', 'career4'],
    status: 'ACTIVE',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
    criteria: [
      {
        criterionId: 'crit1',
        notes: 'Este documento evidencia las estrategias de divulgación'
      },
      {
        criterionId: 'crit3',
        notes: 'Incluye la vinculación con empleadores'
      }
    ]
  },
  {
    id: 'ev2',
    title: 'Informe de Autoevaluación 2023',
    description: 'Informe de autoevaluación para acreditación SINAES',
    fileType: 'application/pdf',
    fileSize: 5240000,
    fileName: 'informe-autoevaluacion-2023.pdf',
    driveFileId: 'drive-789012',
    driveFileLink: 'https://drive.google.com/file/d/def456/view',
    year: 2023,
    month: 11,
    keywords: ['autoevaluación', 'acreditación', 'informe'],
    careerIds: ['career1'],
    status: 'ACTIVE',
    createdAt: '2023-11-20T14:45:00Z',
    updatedAt: '2023-11-20T14:45:00Z',
    criteria: [
      {
        criterionId: 'crit4',
        notes: 'Analiza la coherencia del plan de estudios'
      },
      {
        criterionId: 'crit5',
        notes: 'Incluye información sobre la idoneidad de docentes'
      },
      {
        criterionId: 'crit7',
        notes: 'Contiene datos de rendimiento académico'
      }
    ]
  },
  {
    id: 'ev3',
    title: 'Reunión con Empleadores 2024',
    description: 'Acta de reunión con representantes del sector empleador',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1580000,
    fileName: 'reunion-empleadores-2024.docx',
    driveFileId: 'drive-345678',
    driveFileLink: 'https://drive.google.com/file/d/ghi789/view',
    year: 2024,
    month: 2,
    keywords: ['empleadores', 'vinculación', 'acta'],
    careerIds: ['career1', 'career2'],
    status: 'PENDING',
    createdAt: '2024-02-28T09:15:00Z',
    updatedAt: '2024-02-28T09:15:00Z',
    criteria: [
      {
        criterionId: 'crit3',
        notes: 'Evidencia la vinculación con el sector empleador'
      }
    ]
  },
  {
    id: 'ev4',
    title: 'Material Didáctico Curso Programación I',
    description: 'Material didáctico utilizado en el curso de Programación I',
    fileType: 'application/pdf',
    fileSize: 3640000,
    fileName: 'material-programacion-1.pdf',
    driveFileId: 'drive-901234',
    driveFileLink: 'https://drive.google.com/file/d/jkl012/view',
    year: 2023,
    month: 8,
    keywords: ['material', 'didáctico', 'programación'],
    careerIds: ['career1', 'career4'],
    status: 'ACTIVE',
    createdAt: '2023-08-10T11:20:00Z',
    updatedAt: '2023-08-10T11:20:00Z',
    criteria: [
      {
        criterionId: 'crit6',
        notes: 'Muestra las metodologías de enseñanza empleadas'
      }
    ]
  }
]