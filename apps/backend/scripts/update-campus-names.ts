import { PrismaClient } from '@una-gc/database/prisma/generated/client';

const prisma = new PrismaClient();

async function updateCampusNames() {
  console.log('🔍 Buscando campus actuales...');

  const allCampus = await prisma.campus.findMany();
  console.log(`\n📋 Campus encontrados: ${allCampus.length}`);
  allCampus.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} (ID: ${c.id})`);
  });

  if (allCampus.length === 0) {
    console.log('\n❌ No se encontraron campus para actualizar');
    return;
  }

  // Definir nombres de sedes reales
  const sedeNames = ['Sede Regional Brunca', 'Sede Regional Coto', 'Sede Pérez Zeledón'];

  console.log('\n🔄 Actualizando nombres...');

  for (let i = 0; i < allCampus.length && i < sedeNames.length; i++) {
    const campus = allCampus[i];
    const newName = sedeNames[i];

    await prisma.campus.update({
      where: { id: campus.id },
      data: { name: newName },
    });

    console.log(`  ✅ ${campus.name} → ${newName}`);
  }

  console.log('\n✅ Actualización completada!');

  // Verificar cambios
  console.log('\n📋 Campus actualizados:');
  const updated = await prisma.campus.findMany();
  updated.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}`);
  });
}

updateCampusNames()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
