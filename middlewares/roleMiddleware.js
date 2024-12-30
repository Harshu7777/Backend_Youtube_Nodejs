// middlewares/roleMiddleware.js
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user?.role)) {
        return res.status(403).json({ message: "Forbidden: Access Denied" });
      }
      next();
    };
  };
  
  module.exports = authorizeRole;
  