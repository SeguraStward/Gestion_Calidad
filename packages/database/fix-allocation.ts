import { PrismaClient } from "./prisma/generated/client"

const prisma = new PrismaClient()

async function updateAnnualAllocation() {
  const annual = await prisma.annualJourneyTimeAllocation.findFirst({ where: { year: 2025 } })
  
  if (annual) {
    await prisma.annualJourneyTimeAllocation.update({
      where: { id: annual.id },
      data: {
        totalAllocatedToCampus: 500,
        totalFromExternalProviders: 80,
        availableJourneyTime: 420
      }
    })
    console.log("Asignacion actualizada con totales correctos")
  }
}

updateAnnualAllocation().then(() => prisma.$disconnect())
