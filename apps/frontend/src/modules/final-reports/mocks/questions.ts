// Define a common structure for options, aligning with FinalReportEvaluationOptions
export interface Option {
  label: string
  value: string
  category?: string // Optional category for grouping options if needed
}

// Define TipoInforme if not already globally available in this mock file
export type TipoInforme = 'INFORME_FINAL_V1' | 'INFORME_FINAL_V2' | 'TODOS' // Add other types as needed

// --- Step 5: Logros, Dificultades y Recomendaciones (Text-based) ---
export interface PreguntaPaso5 {
  idPregunta: string // Corresponds to FinalReportEvaluation.questionId
  pregunta: string // Corresponds to FinalReportEvaluation.question
  // responseType would implicitly be 'TEXT'
}

export const preguntasPaso5Mock: PreguntaPaso5[] = [
  {
    idPregunta: 'logros_alcanzados',
    pregunta: '¿Cuáles han sido los principales logros alcanzados durante el ciclo académico?'
  },
  {
    idPregunta: 'dificultades_presentadas',
    pregunta: '¿Cuáles han sido las principales dificultades presentadas y cómo se abordaron?'
  },
  {
    idPregunta: 'recomendaciones_mejora',
    pregunta: '¿Qué recomendaciones podría ofrecer para la mejora continua del curso/programa?'
  }
]

// --- Step 6: Herramientas Tecnológicas (Multiple Selection & Other) ---
export interface PreguntaPaso6 {
  idPregunta: string // Corresponds to FinalReportEvaluation.questionId
  pregunta: string // Corresponds to FinalReportEvaluation.question
  descripcion?: string // UI helper
  opciones?: Option[] // Corresponds to FinalReportEvaluation.options
  // responseType would implicitly be 'SELECCION_MULTIPLE' for the main question
  // Another question would handle 'otras_herramientas' as 'TEXT'
}

export const preguntasPaso6PageMock: PreguntaPaso6[] = [
  {
    idPregunta: 'herramientas_utilizadas',
    pregunta: 'Herramientas Tecnológicas Utilizadas',
    descripcion: 'Seleccione todas las herramientas tecnológicas que utilizó durante el ciclo académico.',
    opciones: [
      { label: 'Plataforma Moodle', value: 'moodle' },
      { label: 'Microsoft Teams', value: 'teams' },
      { label: 'Zoom', value: 'zoom' },
      { label: 'Google Classroom', value: 'classroom' },
      { label: 'Kahoot!', value: 'kahoot' },
      { label: 'Genially', value: 'genially' },
      { label: 'Canva', value: 'canva' },
      { label: 'Padlet', value: 'padlet' }
    ]
  },
  // "Otras herramientas" is handled as a separate text field in your Step6FormData,
  // which would translate to a separate FinalReportEvaluation item.
  // For the purpose of question definition, it could be:
  {
    idPregunta: 'otras_herramientas',
    pregunta: 'Otras herramientas utilizadas (opcional)'
    // No opciones, as it's a text input. responseType would be 'TEXT'.
  }
]

// --- Step 7: Percepción General y Desempeño (Radio Buttons) ---
export interface PreguntaPaso7 {
  idPregunta: string // Corresponds to FinalReportEvaluation.questionId
  pregunta: string // Corresponds to FinalReportEvaluation.question
  opciones: Option[] // Corresponds to FinalReportEvaluation.options
  grupo?: string // UI grouping, corresponds to FinalReportEvaluation.questionGroup
  aplicaPara: TipoInforme[] // For filtering which report versions this question applies to
  // responseType would implicitly be 'RADIO'
}

export const preguntasPaso7PageMock: PreguntaPaso7[] = [
  // Grupo: Percepción del Estudiante sobre el Curso
  {
    idPregunta: 'percepcion_contenido_relevante',
    pregunta: 'El contenido del curso fue relevante para mi aprendizaje.',
    opciones: [
      { label: 'Totalmente de acuerdo', value: '5' },
      { label: 'De acuerdo', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'En desacuerdo', value: '2' },
      { label: 'Totalmente en desacuerdo', value: '1' }
    ],
    grupo: 'Percepción del Estudiante sobre el Curso',
    aplicaPara: ['TODOS']
  },
  {
    idPregunta: 'percepcion_metodologia_adecuada',
    pregunta: 'La metodología de enseñanza utilizada fue adecuada.',
    opciones: [
      { label: 'Totalmente de acuerdo', value: '5' },
      { label: 'De acuerdo', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'En desacuerdo', value: '2' },
      { label: 'Totalmente en desacuerdo', value: '1' }
    ],
    grupo: 'Percepción del Estudiante sobre el Curso',
    aplicaPara: ['INFORME_FINAL_V1', 'INFORME_FINAL_V2']
  },

  // Grupo: Desempeño del Docente
  {
    idPregunta: 'desempeno_dominio_tema',
    pregunta: 'El docente demostró dominio de los temas tratados.',
    opciones: [
      { label: 'Excelente', value: 'excelente' },
      { label: 'Bueno', value: 'bueno' },
      { label: 'Regular', value: 'regular' },
      { label: 'Deficiente', value: 'deficiente' }
    ],
    grupo: 'Desempeño del Docente',
    aplicaPara: ['TODOS']
  },
  {
    idPregunta: 'desempeno_claridad_explicaciones',
    pregunta: 'Las explicaciones del docente fueron claras y comprensibles.',
    opciones: [
      { label: 'Siempre', value: 'siempre' },
      { label: 'Casi siempre', value: 'casi_siempre' },
      { label: 'A veces', value: 'a_veces' },
      { label: 'Rara vez', value: 'rara_vez' },
      { label: 'Nunca', value: 'nunca' }
    ],
    grupo: 'Desempeño del Docente',
    aplicaPara: ['INFORME_FINAL_V1']
  },
  {
    idPregunta: 'desempeno_fomento_participacion',
    pregunta: 'El docente fomentó la participación activa de los estudiantes.',
    opciones: [
      { label: 'Totalmente de acuerdo', value: '5' },
      { label: 'De acuerdo', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'En desacuerdo', value: '2' },
      { label: 'Totalmente en desacuerdo', value: '1' }
    ],
    grupo: 'Desempeño del Docente',
    aplicaPara: ['INFORME_FINAL_V2', 'TODOS'] // Example: V2 and also for all if not overridden
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
