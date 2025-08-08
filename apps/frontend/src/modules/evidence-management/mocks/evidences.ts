import { EvidenceType } from '../types/evidence.types'

export const evidencesMock: EvidenceType[] = [
  {
    id: 'ev1',
    documentType: 'PLAN',
    documentCode: 'PLAN-001',
    description: 'Documento oficial del plan de estudios aprobado por el consejo universitario.',
    fileType: 'PDF',
    fileSize: 2097152, // 2MB
    fileName: 'plan_estudios_2023.pdf',
    driveFileId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
    driveFileLink: 'https://docs.google.com/document/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit',
    year: 2023,
    month: 8,
    keywords: ['plan de estudios', 'ingeniería', '2023'],
    careerIds: ['car1'],
    status: 'APPROVED',
    createdAt: '2023-08-15T10:00:00Z',
    updatedAt: '2023-08-16T11:30:00Z',
    evidencePromptLinks: [{ evidencePromptId: 'ep1', notes: '' }]
  },
  {
    id: 'ev2',
    documentType: 'ACTA',
    documentCode: 'ACT-001',
    description: 'Minutas de las reuniones trimestrales con empleadores y sector productivo.',
    fileType: 'DOCX',
    fileSize: 512000, // 500KB
    fileName: 'actas_comite_enlace_Q2.docx',
    driveFileId: '2bCdEfGhIjKlMnOpQrStUvWxYz',
    driveFileLink: 'https://docs.google.com/document/d/2bCdEfGhIjKlMnOpQrStUvWxYz/edit',
    year: 2024,
    month: 4,
    keywords: ['actas', 'empleadores', 'comité'],
    careerIds: ['car1', 'car2'],
    status: 'PENDING',
    createdAt: '2024-04-20T14:00:00Z',
    updatedAt: '2024-04-20T14:00:00Z',
    evidencePromptLinks: [{ evidencePromptId: 'ep2', notes: '' }]
  },
  {
    id: 'ev3',
    documentType: 'CONVENIO',
    documentCode: 'CONV-001',
    description: 'Compendio de convenios firmados para prácticas profesionales y pasantías.',
    fileType: 'PDF',
    fileSize: 10485760, // 10MB
    fileName: 'convenios_parauniversitarios.pdf',
    driveFileId: '3cDeFgHiJkLmNoPqRsTuVwXyZ',
    driveFileLink: 'https://docs.google.com/document/d/3cDeFgHiJkLmNoPqRsTuVwXyZ/edit',
    year: 2024,
    month: 6,
    keywords: ['convenios', 'pasantías', 'prácticas'],
    careerIds: ['car1', 'car2', 'car3'],
    status: 'ACTIVE',
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-05T16:45:00Z',
    evidencePromptLinks: [
      { evidencePromptId: 'ep3', notes: '' },
      { evidencePromptId: 'ep4', notes: '' }
    ]
  }
]