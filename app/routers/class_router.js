const { Router } = require("express");
const {
  getClasses,
  getClassSchedule,
} = require("../controllers/class_controller");
const { verifyToken } = require("../auth/auth");

const classes = Router();

classes.get("/classes", getClasses);
classes.get("/classschedule", getClassSchedule);

module.exports = classes;
