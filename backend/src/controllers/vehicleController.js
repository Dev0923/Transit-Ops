const prisma = require("../config/db");

// GET /api/vehicles
async function getAll(req, res, next) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

// GET /api/vehicles/:id
async function getById(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { trips: true, maintenanceLogs: true, fuelExpenses: true },
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found." });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}

// POST /api/vehicles
async function create(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.create({ data: req.body });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Registration number already exists." });
    }
    next(err);
  }
}

// PUT /api/vehicles/:id
async function update(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/vehicles/:id
async function remove(req, res, next) {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ message: "Vehicle deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
