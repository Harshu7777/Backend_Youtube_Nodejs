const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Role-Based Routes
 *   description: Routes for different user roles (admin, manager, user)
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Access admin functionalities (role-based)
 *     tags: [Role-Based Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user has access.
 *       403:
 *         description: Forbidden, not authorized.
 *       401:
 *         description: Unauthorized, token missing or invalid.
 */
router.post(
  "/admin",
  verifyToken,
  authorizeRole("admin", "manager", "user"), 
  (req, res) => {
    res.send("Admin User Successfully");
  }
);

/**
 * @swagger
 * /manager:
 *   post:
 *     summary: Access manager functionalities (role-based)
 *     tags: [Role-Based Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Manager user has access.
 *       403:
 *         description: Forbidden, not authorized.
 *       401:
 *         description: Unauthorized, token missing or invalid.
 */
router.post(
  "/manager",
  verifyToken,
  authorizeRole("user", "manager"), 
  (req, res) => {
    res.send("Manager User Successfully");
  }
);

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Register or access user functionalities (role-based)
 *     tags: [Role-Based Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User registered or has access.
 *       403:
 *         description: Forbidden, not authorized.
 *       401:
 *         description: Unauthorized, token missing or invalid.
 */
router.post(
  "/user",
  verifyToken,
  authorizeRole("user"),
  (req, res) => {
    res.send("User Register Successfully");
  }
);

module.exports = router;
