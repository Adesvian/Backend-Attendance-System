const { Router } = require("express");
const {
  getAttendances,
  getAttendancestoday,
  getSubjectAttendances,
} = require("../controllers/attendance_controller");
const { verifyToken } = require("../auth/auth");

const attendance = Router();

attendance.get("/attendance", getAttendances);
attendance.get("/attendancetoday", getAttendancestoday);
attendance.get("/subjectattendance", getSubjectAttendances);

module.exports = attendance;
