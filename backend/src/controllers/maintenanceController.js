const prisma = require("../config/db");

// GET /api/maintenance
async function getAll(req, res, next) {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { vehicle: { select: { registrationNo: true, make: true, model: true } } },
      orderBy: { startDate: "desc" },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

// GET /api/maintenance/:id
async function getById(req, res, next) {
  try {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });
    if (!log) return res.status(404).json({ error: "Maintenance log not found." });
    res.json(log);
  } catch (err) {
    next(err);
  }
}

// POST /api/maintenance
async function create(req, res, next) {
  try {
    const log = await prisma.maintenanceLog.create({ data: req.body });

    // When maintenance starts, set vehicle to IN_SHOP
    await prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: "IN_SHOP" },
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

// PUT /api/maintenance/:id
async function update(req, res, next) {
  try {
    const log = await prisma.maintenanceLog.update({
      where: { id: req.params.id },
      data: req.body,
    });

    // If endDate is provided, vehicle is back to AVAILABLE
    if (req.body.endDate) {
      await prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    res.json(log);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/maintenance/:id
async function remove(req, res, next) {
  try {
    await prisma.maintenanceLog.delete({ where: { id: req.params.id } });
    res.json({ message: "Maintenance log deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
