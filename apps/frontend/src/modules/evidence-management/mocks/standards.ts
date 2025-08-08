import { StandardType } from '../types/evidence.types'

export const standardsMock: StandardType[] = [
  {
    id: 'std1',
    code: 'Estándar 1',
    description: 'La información sobre la carrera, su plan de estudios, perfiles y requisitos, debe ser pública, accesible y estar actualizada permanentemente.',
    criterionId: 'crit2'
  },
  {
    id: 'std2',
    code: 'Estándar 5',
    description: 'El 100% del personal académico deberá poseer como mínimo el grado de Licenciatura. (Cuando este estándar no se cumpla en su totalidad, deberán indicarse las razones).',
    criterionId: 'crit5'
  },
  {
    id: 'std3',
    code: 'Estándar 8',
    description: 'Las metodologías de enseñanza y aprendizaje deben ser coherentes con los objetivos del plan de estudios y promover la participación activa del estudiante.',
    criterionId: 'crit6'
  }
]