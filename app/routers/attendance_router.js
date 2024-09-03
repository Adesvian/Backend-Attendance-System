const { Router } = require("express");
const { getAttendances } = require("../controllers/attendance_controller");
const { verifyToken } = require("../auth/auth");

const attendance = Router();

attendance.get("/attendance", getAttendances);

module.exports = attendance;
