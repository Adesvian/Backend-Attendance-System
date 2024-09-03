// routes/authRoutes.js
const express = require("express");
const { login, logout, getCookies } = require("../auth/auth");

const router = express.Router();

router.get("/get-cookies", getCookies);
router.post("/login", login);
router.delete("/logout", logout);

module.exports = router;
