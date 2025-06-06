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
  questionId: string // Was idPregunta
  question: string // Was pregunta (user-facing)
  // responseType would implicitly be 'TEXT'
}

export const step5QuestionsMock: Step5Question[] = [
  {
    questionId: 'logros_alcanzados',
    question:
      '¿Cuáles han sido los principales logros alcanzados durante el ciclo académico en relación con los objetivos del curso?'
  },
  {
    questionId: 'dificultades_presentadas',
    question: '¿Cuáles han sido las principales dificultades presentadas por los estudiantes y cómo se abordaron?'
  },
  {
    questionId: 'aspectos_positivos_curso',
    question: '¿Qué aspectos positivos destacaría del curso (metodología, recursos, evaluación, etc.)?'
  },
  {
    questionId: 'aspectos_a_mejorar_curso',
    question: '¿Qué aspectos considera que podrían mejorarse en futuras ediciones del curso?'
  },
  {
    questionId: 'estrategias_exitosas_ensenanza',
    question:
      '¿Qué estrategias de enseñanza o actividades resultaron particularmente exitosas para el aprendizaje de los estudiantes?'
  },
  {
    questionId: 'adecuacion_contenidos_tiempo',
    question: '¿Considera que la cantidad de contenidos fue adecuada para el tiempo disponible en el ciclo?'
  },
  {
    questionId: 'recomendaciones_mejora_generales',
    question:
      '¿Qué recomendaciones generales podría ofrecer para la mejora continua del proceso de enseñanza-aprendizaje en este curso o programa?'
  }
]

// --- Step 6: Technological Tools (Multiple Selection & Other) ---
export interface Step6Question {
  questionId: string // Was idPregunta
  question: string // Was pregunta (user-facing)
  description?: string // Was descripcion (user-facing)
  options?: OptionFE[] // Was opciones
  questionGroup?: string // Was grupo_pregunta
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
    questionGroup: 'herramientas' // Added for consistency
  },
  {
    questionId: 'otras_herramientas', // For the "other tools" text input
    question: 'Otras herramientas utilizadas (opcional)',
    questionGroup: 'herramientas'
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

export const step7QuestionsPageMock: Step7Question[] = [
  // Renamed from preguntasPaso7PageMock
  // Grupo: Percepción del Estudiante sobre el Curso
  {
    questionId: 'percepcion_contenido_relevante',
    question: 'El contenido del curso fue relevante para mi aprendizaje.',
    options: [
      { label: 'Totalmente de acuerdo', value: '5' },
      { label: 'De acuerdo', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'En desacuerdo', value: '2' },
      { label: 'Totalmente en desacuerdo', value: '1' }
    ],
    group: 'Percepción del Estudiante sobre el Curso',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'percepcion_metodologia_adecuada',
    question: 'La metodología de enseñanza utilizada fue adecuada.',
    options: [
      { label: 'Totalmente de acuerdo', value: '5' },
      { label: 'De acuerdo', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'En desacuerdo', value: '2' },
      { label: 'Totalmente en desacuerdo', value: '1' }
    ],
    group: 'Percepción del Estudiante sobre el Curso',
    appliesTo: ['INFORME_FINAL_V1', 'INFORME_FINAL_V2'],
    responseType: 'SELECCION_UNICA'
  },
  // Grupo: Desempeño del Docente
  {
    questionId: 'desempeno_dominio_tema',
    question: 'El docente demostró dominio de los temas tratados.',
    options: [
      { label: 'Excelente', value: 'excelente' },
      { label: 'Bueno', value: 'bueno' },
      { label: 'Regular', value: 'regular' },
      { label: 'Deficiente', value: 'deficiente' }
    ],
    group: 'Desempeño del Docente',
    appliesTo: ['TODOS'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'desempeno_claridad_explicaciones',
    question: 'Las explicaciones del docente fueron claras y comprensibles.',
    options: [
      { label: 'Siempre', value: 'siempre' },
      { label: 'Casi siempre', value: 'casi_siempre' },
      { label: 'A veces', value: 'a_veces' },
      { label: 'Rara vez', value: 'rara_vez' },
      { label: 'Nunca', value: 'nunca' }
    ],
    group: 'Desempeño del Docente',
    appliesTo: ['INFORME_FINAL_V1'],
    responseType: 'SELECCION_UNICA'
  },
  {
    questionId: 'desempeno_fomento_participacion',
    question: 'El docente fomentó la participación activa de los estudiantes.',
    options: [
      { label: 'Totalmente de acuerdo', value: '5' },
      { label: 'De acuerdo', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'En desacuerdo', value: '2' },
      { label: 'Totalmente en desacuerdo', value: '1' }
    ],
    group: 'Desempeño del Docente',
    appliesTo: ['INFORME_FINAL_V2', 'TODOS'],
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
