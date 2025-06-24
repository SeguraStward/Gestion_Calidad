import type { ReportType } from '../types/final-reports.types'
import { MAIN_TOOLS_QUESTION_ID, OTHER_TOOLS_QUESTION_ID } from './constants'

export { ReportType }

// Tipos centralizados
export type ResponseTypeFE = 'TEXT' | 'SELECCION_UNICA' | 'SELECCION_MULTIPLE'

export interface OptionFE {
  label: string
  value: string
  category?: string
}

// Interfaz base para preguntas
export interface BaseQuestion {
  questionId: string
  question: string
  group: string
  responseType: ResponseTypeFE
  options: OptionFE[]
}

// Interfaces específicas con extensiones
export interface Step5Question extends BaseQuestion {
  responseType: 'TEXT'
}

export interface Step6Question extends BaseQuestion {
  description?: string
}

export interface Step7Question extends BaseQuestion {
  appliesTo: ReportType[]
}

// Opciones estándar reutilizables
const standardStep7Options: OptionFE[] = [
  { label: 'Muy malo', value: '1' },
  { label: 'Malo', value: '2' },
  { label: 'Regular', value: '3' },
  { label: 'Bueno', value: '4' },
  { label: 'Muy bueno', value: '5' }
]

// Herramientas tecnológicas extendidas
const herramientasTecnologicas: OptionFE[] = [
  { label: 'Plataforma Moodle', value: 'moodle' },
  { label: 'Microsoft Teams', value: 'teams' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Google Classroom', value: 'classroom' },
  { label: 'Google Meet', value: 'meet' },
  { label: 'Kahoot!', value: 'kahoot' },
  { label: 'Mentimeter', value: 'mentimeter' },
  { label: 'Genially', value: 'genially' },
  { label: 'Canva', value: 'canva' },
  { label: 'Padlet', value: 'padlet' },
  { label: 'Nearpod', value: 'nearpod' },
  { label: 'Quizizz', value: 'quizizz' },
  { label: 'Jamboard', value: 'jamboard' },
  { label: 'Notion', value: 'notion' },
  { label: 'Microsoft Forms', value: 'forms' },
  { label: 'Google Forms', value: 'google_forms' },
  { label: 'Flipgrid', value: 'flipgrid' },
  { label: 'EdPuzzle', value: 'edpuzzle' },
  { label: 'Prezi', value: 'prezi' },
  { label: 'Microsoft PowerPoint', value: 'powerpoint' },
  { label: 'Google Slides', value: 'google_slides' },
  { label: 'Slack', value: 'slack' },
  { label: 'Discord', value: 'discord' },
  { label: 'Trello', value: 'trello' }
]

// Datos de preguntas
export const step5QuestionsMock: Step5Question[] = [
  {
    questionId: 'logros_alcanzados',
    question: 'Principales logros alcanzados en el desarrollo de la asignatura.',
    group: 'Evaluacion_general_curso',
    responseType: 'TEXT',
    options: []
  },
  {
    questionId: 'dificultades_presentadas',
    question: 'Principales dificultades que se presentaron en el desarrollo de la asignatura.',
    group: 'Evaluacion_general_curso',
    responseType: 'TEXT',
    options: []
  },
  {
    questionId: 'recomendaciones_mejora',
    question: 'Recomendaciones para la mejora de la asignatura.',
    group: 'Evaluacion_general_curso',
    responseType: 'TEXT',
    options: []
  }
]

export const step6QuestionsPageMock: Step6Question[] = [
  {
    questionId: MAIN_TOOLS_QUESTION_ID, // Usar la constante importada
    question: 'Herramientas Tecnológicas Utilizadas',
    description: 'Seleccione todas las herramientas tecnológicas que utilizó durante el ciclo académico.',
    options: herramientasTecnologicas,
    group: 'Herramientas',
    responseType: 'SELECCION_MULTIPLE'
  },
  {
    questionId: OTHER_TOOLS_QUESTION_ID, // Usar la constante importada
    question: 'Otras herramientas o metodologías utilizadas (opcional)',
    description: 'Si utilizó otras no listadas, descríbalas aquí.',
    group: 'Herramientas',
    responseType: 'TEXT',
    options: []
  }
]

export const step7QuestionsPageMock: Step7Question[] = [
  // Percepción del Estudiante sobre el Curso
  {
    questionId: 'percepcion_contenido_relevante',
    question: 'El contenido del curso fue relevante para mi aprendizaje.',
    options: standardStep7Options,
    group: 'Percepción del Estudiante sobre el Curso',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'percepcion_metodologia_adecuada',
    question: 'La metodología de enseñanza utilizada fue adecuada.',
    options: standardStep7Options,
    group: 'Percepción del Estudiante sobre el Curso',
    appliesTo: ['INFORME_FINAL_V1', 'INFORME_FINAL_V2'],
    responseType: 'SELECCION_UNICA'
  },
  // Desempeño del Docente
  {
    questionId: 'desempeno_dominio_tema',
    question: 'El docente demostró dominio de los temas tratados.',
    options: standardStep7Options,
    group: 'Desempeño del Docente',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'desempeno_claridad_explicaciones',
    question: 'Las explicaciones del docente fueron claras y comprensibles.',
    options: standardStep7Options,
    group: 'Desempeño del Docente',
    appliesTo: ['INFORME_FINAL_V1'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'desempeno_fomento_participacion',
    question: 'El docente fomentó la participación activa de los estudiantes.',
    options: standardStep7Options,
    group: 'Desempeño del Docente',
    appliesTo: ['INFORME_FINAL_V2', 'TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'desempeno_retroalimentacion_util',
    question: 'La retroalimentación proporcionada por el docente fue útil para mi aprendizaje.',
    options: standardStep7Options,
    group: 'Desempeño del Docente',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  // Ambiente de Aprendizaje
  {
    questionId: 'ambiente_aprendizaje_positivo',
    question: 'El docente promovió un ambiente de aprendizaje positivo y respetuoso.',
    options: standardStep7Options,
    group: 'Ambiente de Aprendizaje',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  // Carga de Trabajo y Recursos
  {
    questionId: 'carga_trabajo_adecuada',
    question: 'La carga de trabajo del curso fue adecuada.',
    options: standardStep7Options,
    group: 'Carga de Trabajo y Recursos',
    appliesTo: ['INFORME_FINAL_V1', 'INFORME_FINAL_V2'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'recursos_aprendizaje_suficientes',
    question: 'Los recursos de aprendizaje (materiales, bibliografía, etc.) fueron suficientes y adecuados.',
    options: standardStep7Options,
    group: 'Carga de Trabajo y Recursos',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  }
]
