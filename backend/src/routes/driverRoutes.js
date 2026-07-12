const router = require("express").Router();
const ctrl = require("../controllers/driverController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

router.get("/", roleMiddleware("ADMIN", "MANAGER"), ctrl.getAll);
router.get("/:id", roleMiddleware("ADMIN", "MANAGER"), ctrl.getById);
router.post("/", roleMiddleware("ADMIN", "MANAGER"), ctrl.create);
router.put("/:id", roleMiddleware("ADMIN", "MANAGER"), ctrl.update);
router.delete("/:id", roleMiddleware("ADMIN"), ctrl.remove);

module.exports = router;
