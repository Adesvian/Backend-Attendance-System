const { Router } = require("express");
const {
  getClasses,
  getClassSchedule,
  getClassScheduleById,
  getClassScheduleByNID,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  getEnrollment,
  addEnrollment,
  removeEnrollment,
} = require("../controllers/class_controller");
const { verifyToken } = require("../auth/auth");

const classes = Router();

classes.get("/classes", getClasses);
classes.get("/class-schedule", getClassSchedule);
classes.get("/class-schedule/:id", getClassScheduleById);
classes.get("/class-schedule/teacher/:nid", getClassScheduleByNID);
classes.post("/class-schedule", createClassSchedule);
classes.put("/class-schedule/:id", updateClassSchedule);
classes.delete("/class-schedule/:id", deleteClassSchedule);
classes.get("/enroll/:id", getEnrollment);
classes.post("/enroll", addEnrollment);
classes.delete("/enroll", removeEnrollment);

module.exports = classes;
