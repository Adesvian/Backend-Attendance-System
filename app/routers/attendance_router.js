const { Router } = require("express");
const {
  getAttendances,
  getAttendancestoday,
} = require("../controllers/attendance_controller");
const { verifyToken } = require("../auth/auth");

const attendance = Router();

attendance.get("/attendance", getAttendances);
attendance.get("/attendancetoday", getAttendancestoday);

module.exports = attendance;
