const prisma = require("../config/db");

// GET /api/trips
async function getAll(req, res, next) {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        vehicle: { select: { registrationNo: true, make: true, model: true } },
        driver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });
    res.json(trips);
  } catch (err) {
    next(err);
  }
}

// GET /api/trips/:id
async function getById(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        vehicle: true,
        driver: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

// POST /api/trips
async function create(req, res, next) {
  try {
    const trip = await prisma.trip.create({
      data: req.body,
      include: { vehicle: true, driver: { select: { id: true, name: true } } },
    });

    // Mark vehicle as ON_TRIP if the trip is starting now
    if (trip.status === "IN_PROGRESS") {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ON_TRIP" },
      });
    }

    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
}

// PUT /api/trips/:id  — also handles dispatch / complete / cancel
async function update(req, res, next) {
  try {
    const existing = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Trip not found." });

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: req.body,
    });

    // Status transitions → update vehicle status
    if (req.body.status === "IN_PROGRESS") {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ON_TRIP" },
      });
    }
    if (req.body.status === "COMPLETED" || req.body.status === "CANCELLED") {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    res.json(trip);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/trips/:id
async function remove(req, res, next) {
  try {
    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ message: "Trip deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
