import { UserRole } from '@una-gc/database/prisma/generated/client';

// Crear en auth/interfaces/jwt-user.interface.ts
export interface JwtUser {
  id: string;
  email: string;
  fullName: string;
  fullLastName: string;
  activeRole?: UserRole;
  roles: UserRole[];
}
