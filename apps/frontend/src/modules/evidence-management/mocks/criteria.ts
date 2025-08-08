import { CriterionType } from '../types/evidence.types'

export const criteriaMock: CriterionType[] = [
  {
    id: 'crit1',
    code: '1.1.1',
    name: 'Estrategias de divulgación',
    description: 'La carrera cuenta con estrategias de divulgación accesibles y actualizadas',
    componentId: 'comp1',
    order: 1
  },
  {
    id: 'crit2',
    code: '1.1.2',
    name: 'Información disponible',
    description: 'La información sobre la carrera está disponible para estudiantes potenciales',
    componentId: 'comp1',
    order: 2
  },
  {
    id: 'crit3',
    code: '1.2.1',
    name: 'Vinculación con sector empleador',
    description: 'La carrera mantiene vinculación con el sector empleador',
    componentId: 'comp2',
    order: 1
  },
  {
    id: 'crit4',
    code: '2.1.1',
    name: 'Coherencia del plan de estudios',
    description: 'El plan de estudios es coherente con la naturaleza de la disciplina',
    componentId: 'comp3',
    order: 1
  },
  {
    id: 'crit5',
    code: '2.2.1',
    name: 'Idoneidad de docentes',
    description: 'Los docentes tienen la formación académica adecuada',
    componentId: 'comp4',
    order: 1
  },
  {
    id: 'crit6',
    code: '3.1.1',
    name: 'Metodologías de enseñanza',
    description: 'Las metodologías de enseñanza son apropiadas para el logro de los objetivos',
    componentId: 'comp5',
    order: 1
  },
  {
    id: 'crit7',
    code: '4.1.1',
    name: 'Rendimiento académico',
    description: 'La carrera cuenta con información sobre el rendimiento académico estudiantil',
    componentId: 'comp6',
    order: 1
  }
]