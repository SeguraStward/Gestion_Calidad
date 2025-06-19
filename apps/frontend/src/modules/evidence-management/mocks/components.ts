import { ComponentType } from '../types/evidence.types'

export const componentsMock: ComponentType[] = [
  {
    id: 'comp1',
    code: 'C1.1',
    name: 'Información y promoción',
    description: 'Estrategias de información y promoción de la carrera',
    dimensionId: 'dim1',
    order: 1
  },
  {
    id: 'comp2',
    code: 'C1.2',
    name: 'Correspondencia con el contexto',
    description: 'Relación de la carrera con las necesidades del entorno',
    dimensionId: 'dim1',
    order: 2
  },
  {
    id: 'comp3',
    code: 'C2.1',
    name: 'Plan de estudios',
    description: 'Estructura y contenido del plan de estudios',
    dimensionId: 'dim2',
    order: 1
  },
  {
    id: 'comp4',
    code: 'C2.2',
    name: 'Personal académico',
    description: 'Características y composición del personal académico',
    dimensionId: 'dim2',
    order: 2
  },
  {
    id: 'comp5',
    code: 'C3.1',
    name: 'Desarrollo docente',
    description: 'Proceso de enseñanza y aprendizaje',
    dimensionId: 'dim3',
    order: 1
  },
  {
    id: 'comp6',
    code: 'C4.1',
    name: 'Desempeño estudiantil',
    description: 'Rendimiento académico de los estudiantes',
    dimensionId: 'dim4',
    order: 1
  }
]