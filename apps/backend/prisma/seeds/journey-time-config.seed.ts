import { PrismaClient } from '@una-gc/database/prisma/generated/client';

const prisma = new PrismaClient();

export async function seedJourneyTimeConfig() {
  console.log('🌱 Seeding Journey Time Configuration...');

  const currentYear = new Date().getFullYear();

  // Check if config already exists
  const existing = await prisma.journeyTimeCalculationConfig.findFirst({
    where: { effectiveYear: currentYear },
  });

  if (existing) {
    console.log('✅ Journey Time Config already exists for year', currentYear);
    return existing;
  }

  // Create default config
  const config = await prisma.journeyTimeCalculationConfig.create({
    data: {
      effectiveYear: currentYear,

      // Rangos de horas
      quarterTimeMinHours: 1,
      quarterTimeMaxHours: 5,
      halfTimeMinHours: 6,
      halfTimeMaxHours: 7,
      threeQuarterMinHours: 8,
      threeQuarterMaxHours: 11,
      fullTimeMinHours: 12,

      // Valores de tiempo de jornada
      quarterTimeValue: 0.25,
      halfTimeValue: 0.5,
      threeQuarterTimeValue: 0.75,
      fullTimeValue: 1.0,

      isActive: true,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Journey Time Config created:', config.id);
  return config;
}

// Run if called directly
if (require.main === module) {
  seedJourneyTimeConfig()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
