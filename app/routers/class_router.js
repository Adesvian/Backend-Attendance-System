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
const { logger } = require("../controllers/log_controller");

const classes = Router();

classes.get("/classes", getClasses);
classes.get("/class-schedule", getClassSchedule);
classes.get("/class-schedule/:id", getClassScheduleById);
classes.get("/class-schedule/teacher/:nid", getClassScheduleByNID);
classes.get("/enroll/:id", getEnrollment);

classes.use(verifyToken);

classes.post("/class-schedule", createClassSchedule, logger);
classes.put("/class-schedule/:id", updateClassSchedule, logger);
classes.delete("/class-schedule/:id", deleteClassSchedule, logger);
classes.post("/enroll", addEnrollment, logger);
classes.delete("/enroll", removeEnrollment, logger);

module.exports = classes;
