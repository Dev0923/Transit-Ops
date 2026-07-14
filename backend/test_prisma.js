const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { notIn: ['RETIRED'] } },
      include: {
        trips: {
          where: { status: 'COMPLETED' },
          select: { revenue: true, distance: true },
        },
        maintenanceLogs: {
          select: { cost: true },
        },
        fuelExpenses: {
          select: { totalCost: true },
        },
      },
      take: 1
    });
    console.log('Success!', vehicles.length, 'vehicles found.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
