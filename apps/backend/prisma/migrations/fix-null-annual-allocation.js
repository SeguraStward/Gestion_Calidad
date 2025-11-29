/**
 * Script para arreglar registros con annualAllocationId = null
 *
 * Este script:
 * 1. Crea una asignación anual por defecto (año 2025)
 * 2. Actualiza todos los registros con annualAllocationId = null
 *
 * Ejecutar con: node fix-null-annual-allocation.js
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@una-gc/database/prisma/generated/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando migración de datos...');

  try {
    // 1. Crear asignación anual por defecto si no existe
    console.log('📝 Buscando o creando asignación anual por defecto...');

    let defaultAllocation = await prisma.annualJourneyTimeAllocation.findFirst({
      where: { year: 2025 },
    });

    if (!defaultAllocation) {
      defaultAllocation = await prisma.annualJourneyTimeAllocation.create({
        data: {
          year: 2025,
          totalJourneyTime: 1000,
          description: 'Asignación anual por defecto (migración)',
          status: 'ACTIVE',
          totalAllocatedToCampus: 0,
          totalFromExternalProviders: 0,
          availableJourneyTime: 1000,
        },
      });
      console.log('✅ Asignación anual creada:', defaultAllocation.id);
    } else {
      console.log('✅ Asignación anual existente:', defaultAllocation.id);
    }

    // 2. Actualizar CampusJourneyTimeAllocation con annualAllocationId = null
    console.log('📝 Actualizando CampusJourneyTimeAllocation...');
    const campusResult = await prisma.$runCommandRaw({
      update: 'campus_journey_time_allocations',
      updates: [
        {
          q: { annualAllocationId: null },
          u: { $set: { annualAllocationId: defaultAllocation.id } },
          multi: true,
        },
      ],
    });
    console.log('✅ CampusJourneyTimeAllocation actualizado:', campusResult);

    // 3. Actualizar ExternalProvider con annualAllocationId = null
    console.log('📝 Actualizando ExternalProvider...');
    const providerResult = await prisma.$runCommandRaw({
      update: 'external_providers',
      updates: [
        {
          q: { annualAllocationId: null },
          u: { $set: { annualAllocationId: defaultAllocation.id } },
          multi: true,
        },
      ],
    });
    console.log('✅ ExternalProvider actualizado:', providerResult);

    console.log('✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
