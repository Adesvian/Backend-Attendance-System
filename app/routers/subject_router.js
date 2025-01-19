const { Router } = require("express");
const {
  getSubjects,
  getSubjectById,
  addSubjects,
  updateSubjects,
  deleteSubjects,
} = require("../controllers/subject_controller");
const { verifyToken } = require("../auth/auth");
const { logger } = require("../controllers/log_controller");

const subject = Router();

subject.get("/subjects", getSubjects);
subject.get("/subjects/:id", getSubjectById);

subject.use(verifyToken);

subject.post("/subjects", addSubjects, logger);
subject.put("/subjects/:id", updateSubjects, logger);
subject.delete("/subjects/:id", deleteSubjects, logger);

module.exports = subject;
