require('dotenv').config({ path: '.env' });
const { MongoClient, ObjectId } = require('mongodb');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

async function migrate() {
  const client = new MongoClient(DATABASE_URL);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();

    // 1. Check for records with null campusId
    console.log('\n📝 Verificando registros con campusId null...');
    const nullRecords = await db
      .collection('campus_journey_time_allocations')
      .find({ campusId: null })
      .toArray();

    console.log(`🔍 Encontrados ${nullRecords.length} registros con campusId null`);

    if (nullRecords.length === 0) {
      console.log('✅ No hay registros para actualizar');
      return;
    }

    // 2. Check if there are any campuses in the database
    const campuses = await db.collection('campuses').find().limit(5).toArray();
    console.log(`\n🏫 Encontrados ${campuses.length} campus en la base de datos`);

    if (campuses.length > 0) {
      console.log('\n📋 Campuses disponibles:');
      campuses.forEach((campus, index) => {
        console.log(`  ${index + 1}. ${campus.name} (${campus.code}) - ID: ${campus._id}`);
      });

      // Use the first campus as default
      const defaultCampusId = campuses[0]._id.toString();
      console.log(`\n✨ Usando campus por defecto: ${campuses[0].name} (${defaultCampusId})`);

      // 3. Update records with null campusId
      console.log('\n📝 Actualizando registros...');
      const updateResult = await db.collection('campus_journey_time_allocations').updateMany(
        { campusId: null },
        {
          $set: {
            campusId: defaultCampusId,
          },
        },
      );

      console.log('✅ Actualización completada:', {
        matched: updateResult.matchedCount,
        modified: updateResult.modifiedCount,
      });
    } else {
      console.log('\n⚠️  No hay campuses en la base de datos.');
      console.log('💡 Opción 1: Eliminar registros incompletos');
      console.log('💡 Opción 2: Crear un campus por defecto primero');
      console.log('\n❌ Eliminando registros incompletos...');

      const deleteResult = await db
        .collection('campus_journey_time_allocations')
        .deleteMany({ campusId: null });

      console.log(`✅ Eliminados ${deleteResult.deletedCount} registros incompletos`);
    }

    console.log('\n✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
