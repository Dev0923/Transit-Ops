const router = require("express").Router();
const ctrl = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Only Financial Analysts (or ADMIN/MANAGER with REPORT permissions) can view this dashboard
router.get("/financial", roleMiddleware("REPORTS", "FINANCIAL"), ctrl.getFinancialDashboard);

// Only Safety Officers (or ADMIN/MANAGER with REPORT permissions) can view this dashboard
router.get("/safety", roleMiddleware("REPORTS", "SAFETY"), ctrl.getSafetyDashboard);

module.exports = router;
