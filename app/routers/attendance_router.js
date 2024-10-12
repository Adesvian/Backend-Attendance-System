const { Router } = require("express");
const {
  getAttendances,
  getAttendancestoday,
  getSubjectAttendances,
  getSubjectAttendancestoday,
  createAttendance,
  deleteAttendance,
  deleteSubjectAttendance,
} = require("../controllers/attendance_controller");

const attendance = Router();

attendance.get("/attendance", getAttendances);
attendance.get("/attendance-today", getAttendancestoday);
attendance.get("/subject-attendance", getSubjectAttendances);
attendance.get("/subject-attendance-today", getSubjectAttendancestoday);
attendance.post("/attendance", createAttendance);
attendance.delete("/attendance/:id", deleteAttendance);
attendance.delete("/subject-attendance/:id", deleteSubjectAttendance);

module.exports = attendance;
