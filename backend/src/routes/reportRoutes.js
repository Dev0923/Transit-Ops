const router = require("express").Router();
const ctrl = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN", "MANAGER"));

router.get("/summary", ctrl.getSummary);
router.get("/fleet-utilization", ctrl.getFleetUtilization);
router.get("/fuel-efficiency", ctrl.getFuelEfficiency);
router.get("/export/:type", ctrl.exportCSV);

module.exports = router;
