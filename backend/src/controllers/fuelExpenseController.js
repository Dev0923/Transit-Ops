const prisma = require("../config/db");

// GET /api/fuel-expenses
async function getAll(req, res, next) {
  try {
    const expenses = await prisma.fuelExpense.findMany({
      include: { vehicle: { select: { registrationNo: true, make: true, model: true } } },
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

// GET /api/fuel-expenses/:id
async function getById(req, res, next) {
  try {
    const expense = await prisma.fuelExpense.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });
    if (!expense) return res.status(404).json({ error: "Fuel expense not found." });
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

// POST /api/fuel-expenses
async function create(req, res, next) {
  try {
    const data = {
      ...req.body,
      totalCost: req.body.totalCost || req.body.litres * req.body.costPerLitre,
    };
    const expense = await prisma.fuelExpense.create({ data });

    // Update vehicle odometer
    if (data.odometer) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentMileage: data.odometer },
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

// PUT /api/fuel-expenses/:id
async function update(req, res, next) {
  try {
    const expense = await prisma.fuelExpense.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/fuel-expenses/:id
async function remove(req, res, next) {
  try {
    await prisma.fuelExpense.delete({ where: { id: req.params.id } });
    res.json({ message: "Fuel expense deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
