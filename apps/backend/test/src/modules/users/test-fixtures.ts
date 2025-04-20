import { Status, UserRole, Province, UserPermission } from '@una-gc/database/prisma/generated/client';
import { UserDto } from '@modules/users/dtos/user.dto';

// Minimal user data for most tests
export const testUser = {
  email: {
    email: 'test@example.com',
    isVerified: false,
  },
  fullName: 'Test',
  fullLastName: 'User',
  status: Status.ACTIVE,
  roles: [UserRole.USER],
};

// ALL user data for most tests
export const testUser2 = {
  id: '507f1f77bcf86cd799439011',
  version: 1,
  email: {
    email: 'john.doe@example.com',
    isVerified: true,
  },
  fullName: 'John',
  fullLastName: 'Doe Smith',
  photoUrl: 'https://example.com/photos/johndoe.jpg',
  nationalId: '123456789',
  birthDate: new Date('1990-01-15T00:00:00.000Z'),
  primaryPhone: '88776655',
  phoneNumbers: [
    {
      number: '88776655',
      isPrimary: true,
    },
    {
      number: '22334455',
      isPrimary: false,
    },
  ],
  province: Province.SAN_JOSE,
  canton: 'Central',
  district: 'Catedral',
  address: '100m Norte del Parque Central',
  professionalTitle: 'Ingeniero en Sistemas',
  hireDate: new Date('2020-03-01T00:00:00.000Z'),
  condition: 'Tiempo completo',
  roles: [UserRole.USER, UserRole.PROFESSOR],
  permissions: [UserPermission.VIEW, UserPermission.EDIT],
  profileTypes: ['academic', 'research'],
  status: Status.ACTIVE,
  googleId: 'g-123456789',
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
};

export const testUserDto = new UserDto(testUser);

export const testUserUpdate = {
  email: {
    email: 'updated@example.com',
    isVerified: true,
  },
  fullName: 'Updated',
  fullLastName: 'User Name',
  photoUrl: 'https://example.com/photos/updated.jpg',
  primaryPhone: '99887766',
  province: Province.HEREDIA,
  roles: [UserRole.USER, UserRole.ADMIN],
  status: Status.INACTIVE,
};

// Helper function to create mock repository
export const createMockRepository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  count: jest.fn(),
});

// Helper function to create mock Prisma service
export const createMockPrisma = () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn()),
});
