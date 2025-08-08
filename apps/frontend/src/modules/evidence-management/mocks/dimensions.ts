import { DimensionType } from '../types/evidence.types'

export const dimensionsMock: DimensionType[] = [
  {
    id: 'dim1',
    code: 'D1',
    name: 'Relación con el contexto',
    description: 'Analiza la correspondencia entre la carrera y el contexto social y económico',
    order: 1
  },
  {
    id: 'dim2',
    code: 'D2',
    name: 'Recursos',
    description: 'Evalúa los recursos disponibles para el programa académico',
    order: 2
  },
  {
    id: 'dim3',
    code: 'D3',
    name: 'Proceso educativo',
    description: 'Analiza la metodología de enseñanza y aprendizaje',
    order: 3
  },
  {
    id: 'dim4',
    code: 'D4',
    name: 'Resultados',
    description: 'Evalúa los resultados del programa académico',
    order: 4
  }
]