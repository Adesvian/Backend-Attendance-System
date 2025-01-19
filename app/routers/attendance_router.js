const { Router } = require("express");
const {
  getAttendances,
  getAttendancestoday,
  getSubjectAttendances,
  getSubjectAttendancestoday,
  createAttendance,
  deleteAttendance,
  deleteSubjectAttendance,
  getAttendancesByMonth,
} = require("../controllers/attendance_controller");
const { logger } = require("../controllers/log_controller");

const attendance = Router();

attendance.get("/attendance", getAttendances);
attendance.get("/attendance-today", getAttendancestoday);
attendance.get("/attendance-month", getAttendancesByMonth);
attendance.get("/subject-attendance", getSubjectAttendances);
attendance.get("/subject-attendance-today", getSubjectAttendancestoday);
attendance.post("/attendance", createAttendance);
attendance.delete("/attendance/:id", deleteAttendance, logger);
attendance.delete("/subject-attendance/:id", deleteSubjectAttendance, logger);

module.exports = attendance;
