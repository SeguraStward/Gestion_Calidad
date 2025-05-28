/*import { Prisma } from '@una-gc/database/prisma/generated/client';

export type AcademicLoad = Prisma.AcademicLoadGetPayload<{}>;

export type AcademicLoadWithRelations = Prisma.AcademicLoadGetPayload<{
  include: {
    academicCycle: true;
    campus: true;
    course: true;
    classroom: true;
    group: true;
    schedule: true;
    professor: true;
    finalReport: true;
  };
}>;

export type ExtendedAcademicLoad = AcademicLoadWithRelations & {
  isSelected?: boolean;      // Para UI (checkbox, selección)
  label?: string;            // Algo tipo: `${course.code} - NRC: ${nrc}`
  professorName?: string;    // Mostrar el profe más fácil
  availableSeats?: number;   // Por si querés simplificar el acceso
  enrolledCapacity?: number;
};
*/
