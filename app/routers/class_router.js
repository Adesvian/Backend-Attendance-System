const { Router } = require("express");
const { getClasses } = require("../controllers/class_controller");
const { verifyToken } = require("../auth/auth");

const classes = Router();

classes.get("/classes", getClasses);

module.exports = classes;
