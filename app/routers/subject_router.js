const { Router } = require("express");
const { getSubjects } = require("../controllers/subject_controller");
const { verifyToken } = require("../auth/auth");

const subject = Router();

subject.get("/subjects", getSubjects);

module.exports = subject;
