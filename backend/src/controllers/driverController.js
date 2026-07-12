const prisma = require("../config/db");
const { hashPassword } = require("../utils/bcrypt");

// GET /api/drivers
async function getAll(req, res, next) {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: "DRIVER" },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
}

// GET /api/drivers/:id
async function getById(req, res, next) {
  try {
    const driver = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { tripsAsDriver: { orderBy: { scheduledDate: "desc" }, take: 10 } },
    });
    if (!driver || driver.role !== "DRIVER") {
      return res.status(404).json({ error: "Driver not found." });
    }
    const { password, ...safe } = driver;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

// POST /api/drivers
async function create(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const hashed = await hashPassword(password);
    const driver = await prisma.user.create({
      data: { name, email, password: hashed, phone, role: "DRIVER" },
    });
    const { password: _, ...safe } = driver;
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already exists." });
    }
    next(err);
  }
}

// PUT /api/drivers/:id
async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    const driver = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });
    const { password, ...safe } = driver;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/drivers/:id
async function remove(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "Driver deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
