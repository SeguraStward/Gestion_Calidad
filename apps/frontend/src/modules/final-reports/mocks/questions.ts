// Define a common structure for options, aligning with FinalReportEvaluationOptions
export interface OptionFE {
  // Renamed from Option to avoid conflict with potential HTMLOptionElement
  label: string // User-facing
  value: string
  category?: string
}

// ReportType is now defined in final-reports.types.ts, ensure it's imported if used directly here
// export type ReportType = 'INFORME_FINAL_V1' | 'INFORME_FINAL_V2' | 'TODOS';

// --- Step 5: Achievements, Difficulties, and Recommendations (Text-based) ---
export interface Step5Question {
  questionId: string
  question: string
  group: string // <--- AÑADIR ESTO
  responseType: 'TEXT' // <--- AÑADIR ESTO (o un tipo más general si varía)
  options: OptionFE[] // <--- AÑADIR ESTO (será [] para preguntas de texto)
}

export const step5QuestionsMock: Step5Question[] = [
  {
    questionId: 'logros_alcanzados',
    question: 'Principales logros alcanzados en el desarrollo de la asignatura.',
    group: 'evaluacion_general_curso', // <--- AÑADIR VALOR
    responseType: 'TEXT', // <--- AÑADIR VALOR
    options: [] // <--- AÑADIR VALOR
  },
  {
    questionId: 'dificultades_presentadas',
    question: 'Principales dificultades que se presentaron en el desarrollo de la asignatura.',
    group: 'evaluacion_general_curso', // <--- AÑADIR VALOR
    responseType: 'TEXT', // <--- AÑADIR VALOR
    options: [] // <--- AÑADIR VALOR
  },
  {
    questionId: 'recomendaciones_mejora',
    question: 'Recomendaciones para la mejora de la asignatura.',
    group: 'evaluacion_general_curso', // <--- AÑADIR VALOR
    responseType: 'TEXT', // <--- AÑADIR VALOR
    options: [] // <--- AÑADIR VALOR
  }
  // ... agregar las propiedades a cualquier otra pregunta del Step 5 si existen
]

// --- Step 6: Technological Tools (Multiple Choice & Text) ---
export interface Step6Question {
  questionId: string // Was idPregunta
  question: string // Was pregunta (user-facing)
  description?: string // Was descripcion (user-facing)
  options?: OptionFE[]
  responseType?: 'TEXT' | 'SELECCION_UNICA' | 'SELECCION_MULTIPLE'
  group?: string // Was grupo_pregunta
  // responseType would implicitly be 'SELECCION_MULTIPLE' for the main question
}

export const step6QuestionsPageMock: Step6Question[] = [
  // Renamed from preguntasPaso6PageMock
  {
    questionId: 'herramientas_utilizadas', // This ID should match what Step6Form expects, e.g., 'herramientas_tec'
    question: 'Herramientas Tecnológicas Utilizadas',
    description: 'Seleccione todas las herramientas tecnológicas que utilizó durante el ciclo académico.',
    options: [
      { label: 'Plataforma Moodle', value: 'moodle' },
      { label: 'Microsoft Teams', value: 'teams' },
      { label: 'Zoom', value: 'zoom' },
      { label: 'Google Classroom', value: 'classroom' },
      { label: 'Kahoot!', value: 'kahoot' },
      { label: 'Genially', value: 'genially' },
      { label: 'Canva', value: 'canva' },
      { label: 'Padlet', value: 'padlet' }
    ],
    group: 'herramientas' // Added for consistency
  },
  {
    questionId: 'otras_herramientas', // For the "other tools" text input
    question: 'Otras herramientas utilizadas (opcional)',
    group: 'herramientas'
  }
]

// --- Step 7: General Perception and Performance (Radio Buttons) ---
// Assuming ReportType is imported from types.ts or defined elsewhere if needed here.
// For this file, we'll assume ReportType is available.
import type { ReportType } from '../types/final-reports.types'
export { ReportType }

export interface Step7Question {
  questionId: string // Was idPregunta
  question: string // Was pregunta (user-facing)
  options: OptionFE[] // Was opciones
  group?: string // Was grupo (user-facing for UI grouping)
  appliesTo: ReportType[] // Was aplicaPara
  responseType?: 'TEXT' | 'SELECCION_UNICA' | 'SELECCION_MULTIPLE' // Added to be explicit
}

const standardStep7Options: OptionFE[] = [
  { label: 'Muy malo', value: '1' },
  { label: 'Malo', value: '2' },
  { label: 'Regular', value: '3' },
  { label: 'Bueno', value: '4' },
  { label: 'Muy bueno', value: '5' }
]

export const step7QuestionsPageMock: Step7Question[] = [
  // Renamed from preguntasPaso7PageMock
  // Grupo: Percepción del Estudiante sobre el Curso
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
  // Grupo: Desempeño del Docente
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
  // Adding a few more example questions to show the pattern
  {
    questionId: 'desempeno_retroalimentacion_util',
    question: 'La retroalimentación proporcionada por el docente fue útil para mi aprendizaje.',
    options: standardStep7Options,
    group: 'Desempeño del Docente',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'ambiente_aprendizaje_positivo',
    question: 'El docente promovió un ambiente de aprendizaje positivo y respetuoso.',
    options: standardStep7Options,
    group: 'Ambiente de Aprendizaje',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
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
// Example of how this mock data would translate to FinalReportEvaluation items
// This transformation would happen in your `handleSubmitAllSteps` function in page.tsx

/*
const exampleEvaluationItemFromStep5: FinalReportEvaluation = {
  questionId: 'logros_alcanzados',
  question: '¿Cuáles han sido los principales logros alcanzados durante el ciclo académico?',
  response: 'Se logró que el 90% de los estudiantes comprendieran los conceptos clave.', // User's text input
  responseType: 'TEXT',
  options: [], // No options for text
  multipleResponse: [],
  // questionGroup: null, // Or based on some logic if Step 5 questions are grouped
};

const exampleEvaluationItemFromStep6Tools: FinalReportEvaluation = {
  questionId: 'herramientas_utilizadas',
  question: 'Herramientas Tecnológicas Utilizadas',
  multipleResponse: ['moodle', 'teams'], // User's selected values
  responseType: 'SELECCION_MULTIPLE',
  options: [ // These would be the options defined in preguntasPaso6PageMock
    { label: 'Plataforma Moodle', value: 'moodle' },
    { label: 'Microsoft Teams', value: 'teams' },
    // ... all other tool options
  ],
  // questionGroup: 'Tecnología', // Or however you define it
};

const exampleEvaluationItemFromStep6OtherTools: FinalReportEvaluation = {
  questionId: 'otras_herramientas',
  question: 'Otras herramientas utilizadas (opcional)',
  response: 'Padlet y Mentimeter', // User's text input
  responseType: 'TEXT',
  options: [],
  multipleResponse: [],
};


const exampleEvaluationItemFromStep7: FinalReportEvaluation = {
  questionId: 'percepcion_contenido_relevante',
  question: 'El contenido del curso fue relevante para mi aprendizaje.',
  response: '5', // User's selected radio value
  responseType: 'RADIO',
  options: [ // These would be the options defined in preguntasPaso7PageMock for this question
    { label: 'Totalmente de acuerdo', value: '5' },
    { label: 'De acuerdo', value: '4' },
    // ... other options
  ],
  questionGroup: 'Percepción del Estudiante sobre el Curso',
  multipleResponse: [],
};
*/
