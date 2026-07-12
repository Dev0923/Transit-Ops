/**
 * RBAC middleware factory.
 * Usage: roleMiddleware("ADMIN", "MANAGER")
 * Only allows users whose role is in the allowed list.
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden. Insufficient permissions." });
    }

    next();
  };
}

module.exports = roleMiddleware;
