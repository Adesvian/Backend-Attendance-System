// routes/authRoutes.js
const express = require("express");
const { login, logout, getCookies } = require("../auth/auth");
const {
  verify_reset,
  reset_password,
} = require("../controllers/users_controller");

const router = express.Router();

router.get("/get-cookies", getCookies);
router.get("/verify-reset", verify_reset);
router.put("/reset-password/:username", reset_password);
router.post("/login", login);
router.delete("/logout", logout);

module.exports = router;
