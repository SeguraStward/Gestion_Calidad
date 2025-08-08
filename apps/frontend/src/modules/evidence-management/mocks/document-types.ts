import { DocumentType } from '../types/evidence.types'

export const documentTypeOptions: { value: DocumentType; label: string; prefix: string }[] = [
  { value: 'NORMATIVA', label: 'Normativa', prefix: 'NORM' },
  { value: 'INFORME', label: 'Informe', prefix: 'INF' },
  { value: 'ACTA', label: 'Acta de Reunión', prefix: 'ACT' },
  { value: 'PLAN', label: 'Plan Estratégico', prefix: 'PLAN' },
  { value: 'CONVENIO', label: 'Convenio', prefix: 'CONV' },
  { value: 'OTRO', label: 'Otro', prefix: 'DOC' }
]

export const getNextCodeForType = (type: DocumentType): string => {
  const option = documentTypeOptions.find(opt => opt.value === type)
  if (!option) return 'DOC-001'

  // En un sistema real, esto vendría de la base de datos
  // Para el mock, generamos un número aleatorio entre 1 y 999
  const number = Math.floor(Math.random() * 999) + 1
  return `${option.prefix}-${number.toString().padStart(3, '0')}`
}