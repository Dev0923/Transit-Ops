const prisma = require("../config/db");
const { geocodeTripEndpoints } = require("../services/geocodingService");

// GET /api/trips
async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.user.role === "DRIVER") {
      where.OR = [
        { driverId: req.user.id },
        { driverId: null, status: "DRAFT" }
      ];
    }
    const trips = await prisma.trip.findMany({
      where,
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
    
    if (req.user.role === "DRIVER" && trip.driverId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden. Can only view own trips." });
    }
    
    res.json(trip);
  } catch (err) {
    next(err);
  }
}

// POST /api/trips
async function create(req, res, next) {
  try {
    const data = req.body;
    if (req.user.role === "DRIVER") {
      // Drivers can only create trips for themselves
      data.driverId = req.user.id;
    }

    // Geocode origin and destination (best-effort, non-blocking on failure)
    try {
      const coords = await geocodeTripEndpoints(
        data.origin || "",
        data.destination || ""
      );
      data.sourceLat = coords.sourceLat;
      data.sourceLng = coords.sourceLng;
      data.destLat = coords.destLat;
      data.destLng = coords.destLng;
    } catch (geoErr) {
      console.warn("Geocoding failed (non-fatal):", geoErr.message);
      // Continue without coordinates — map will show fallback
    }

    const trip = await prisma.trip.create({
      data,
      include: { vehicle: true, driver: { select: { id: true, name: true } } },
    });

    // Mark vehicle as ON_TRIP if it's assigned to a trip
    if (trip.status === "IN_PROGRESS" || trip.status === "SCHEDULED" || trip.status === "DRAFT") {
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

    if (req.user.role === "DRIVER" && existing.driverId !== req.user.id) {
      if (existing.driverId === null && existing.status === "DRAFT" && req.body.driverId === req.user.id) {
        // Driver is accepting an open trip
      } else {
        return res.status(403).json({ error: "Forbidden. Can only update own trips." });
      }
    }

    const data = req.body;
    if (req.user.role === "DRIVER") {
      if (existing.driverId === null && existing.status === "DRAFT" && data.driverId === req.user.id) {
        // Driver is accepting an open trip, allow setting driverId and status
      } else {
        // Drivers cannot change the assigned driver of an already assigned trip
        delete data.driverId;
      }
    }

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data,
    });

    // Status transitions → update vehicle status
    if (req.body.status === "IN_PROGRESS" || req.body.status === "SCHEDULED" || req.body.status === "DRAFT") {
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
    const existing = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (req.user.role === "DRIVER" && existing && existing.driverId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }
    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ message: "Trip deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
