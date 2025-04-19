import { UserStatus, UserRole, Province, UserPermission } from '@una-gc/database/prisma/generated/client';
import { UserDto } from '@modules/users/dtos/user.dto';

// Minimal user data for most tests
export const testUser = {
  id: 'test-id',
  email: { email: 'example@example.com', isVerified: true },
  firstName: 'Juan',
  lastName: 'Perez',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  phoneNumbers: [{ number: '123456789', isPrimary: true }],
};

// ALL user data for most tests
export const testUser2 = {
  id: 'e2e-test-id',
  version: 1,
  nationalId: '123456789',
  canton: 'Test Canton',
  district: 'Test District',
  googleId: 'test-google-id',
  firstName: 'E2E',
  lastName: 'Test',
  province: Province.SAN_JOSE,
  role: UserRole.USER,
  email: { email: 'e2e-test@example.com', isVerified: true },
  status: UserStatus.ACTIVE,
  phoneNumbers: [],
  condition: 'Healthy',
  address: '123 Test Street',
  hireDate: new Date('2020-01-01'),
  birthDate: new Date('1990-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
  photoUrl: 'https://example.com/photo.jpg',
  profileType: 'BASIC',
  primaryPhone: '123456789',
  professionalTitle: 'Software Engineer',
  permissions: [UserPermission.EDIT, UserPermission.VIEW],
};

export const testUserDto = new UserDto(testUser);

export const testUserUpdate = {
  firstName: 'Juan update',
  lastName: 'Perez update',
  status: UserStatus.INACTIVE,
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
