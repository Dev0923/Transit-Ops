const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateVehicleROI } = require('./src/services/reportService');

async function run() {
  try {
    const vehicle = await prisma.vehicle.findFirst({ where: { status: 'AVAILABLE' } });
    if (!vehicle) {
      console.log('No available vehicle to seed trip');
      return;
    }
    const user = await prisma.user.findFirst({ where: { role: 'DRIVER' } });

    console.log(`Seeding trip for vehicle ${vehicle.registrationNo}`);
    const trip = await prisma.trip.create({
      data: {
        vehicleId: vehicle.id,
        driverId: user ? user.id : null,
        origin: 'Warehouse A',
        destination: 'Store B',
        distance: 120,
        cargoWeight: 500,
        scheduledDate: new Date(),
        status: 'COMPLETED',
        revenue: 15000,
      }
    });
    
    console.log(`Trip ${trip.id} completed with revenue 15000`);

    const roiData = await calculateVehicleROI();
    const vRoi = roiData.find(v => v.id === vehicle.id);
    
    console.log(`ROI for vehicle ${vehicle.registrationNo}: ${vRoi.roi}%`);
    console.log(`Total Revenue: ${vRoi.totalRevenue}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
