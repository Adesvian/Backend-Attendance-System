// routes/authRoutes.js
const express = require("express");
const { login, logout, getCookies } = require("../auth/auth");
const {
  verify_reset,
  reset_password,
} = require("../controllers/users_controller");
const { logger } = require("../controllers/log_controller");

const router = express.Router();

router.get("/get-cookies", getCookies);
router.get("/verify-reset", verify_reset);
router.put("/reset-password/:username", reset_password, logger);
router.post("/login", login, logger);
router.delete("/logout", logout, logger);

module.exports = router;
