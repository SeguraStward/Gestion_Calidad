// Script para crear profesor
// Ejecutar: node scripts/create-professor.js (después de compilar con tsc)
// O mejor: copiar el contenido y ejecutar en MongoDB Compass

const { MongoClient } = require("mongodb");

async function main() {
  const url = process.env.DATABASE_URL || "mongodb://localhost:27017";
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db(); // usa la BD del connection string

    // 1. Buscar rol PROFESSOR
    const professorRole = await db
      .collection("user_roles")
      .findOne({ name: "PROFESSOR" });

    if (!professorRole) {
      console.error("❌ Rol PROFESSOR no encontrado");
      return;
    }

    console.log("✅ Rol PROFESSOR encontrado:", professorRole._id.toString());

    // 2. Verificar si ya existe el usuario
    const existing = await db
      .collection("users")
      .findOne({ email: "juan.rodriguez@una.cr" });

    if (existing) {
      console.log("✅ Usuario ya existe!");
      console.log("📋 ID:", existing._id.toString());
      console.log("📧 Email:", existing.email);
      console.log("👤 Nombre:", existing.fullName);
      console.log("\n🎯 USA ESTE ID:", existing._id.toString());
      return;
    }

    // 3. Crear el profesor
    const result = await db.collection("users").insertOne({
      email: "juan.rodriguez@una.cr",
      fullName: "Juan Carlos Rodriguez",
      fullLastName: "Perez Gomez",
      nationalId: "1-2345-6789",
      roleIds: [professorRole._id],
      status: "ACTIVE",
      __v: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✅ PROFESOR CREADO!");
    console.log("📋 ID:", result.insertedId.toString());
    console.log("📧 Email: juan.rodriguez@una.cr");
    console.log("👤 Nombre: Juan Carlos Rodriguez");
    console.log("🆔 Cédula: 1-2345-6789");
    console.log("\n🎯 USA ESTE ID EN TU POST:", result.insertedId.toString());
  } finally {
    await client.close();
  }
}

main().catch(console.error);
