// Tipos directos desde prisma de la base de datos
// Los tipos y enums exportados son para casos generales en casos especificos es nesesariao definir manualmente los tipos

export type {
  // Models
  AcademicBackground,
  AcademicCycle,
  AcademicLoadGroup,
  AcademicLoad,
  Campus,
  Career,
  Classroom,
  CommMember,
  CommSessionAttendance,
  CommSession,
  Commission,
  Course,
  Document,
  Faculty,
  FinalReport,
  FinalWork,
  IntellectualProduction,
  Observation,
  Parameter,
  Ppaa,
  ProjectLog,
  ProjectReview,
  Project,
  QuestionGroup,
  Question,
  RegionalCenter,
  Schedule,
  School,
  UserLanguage,
  UserPermission,
  UserRole,
  UserWorkExperience,
  User,
  RefreshToken,

  // Types
  ProjectCommSession,
  Evidence,
  FinalReportStatistics,
  FinalReportEvaluation,
  FinalReportEvaluationOptions,
  FinalReportStudentInformation,
  FinalReportStudentAdjustment,
  FinalReportStudentSafeguard,
  TypeObservation,
  ProjectLogEntry,
  QuestionOption,
  Permission,
  UserPhone
} from '@una-gc/database/prisma/generated/client'

export {
  // Enums
  ProjectCommSessionStatus,
  CommSessionStage,
  WorkType,
  Status,
  FinalReportStatus,
  DataType,
  ProjectStatus,
  ResponseType,
  ScheduleDays,
  PermissionType,
  PermissionScope,
  UserStatus,
  Province
} from '@una-gc/database/prisma/generated/client'
