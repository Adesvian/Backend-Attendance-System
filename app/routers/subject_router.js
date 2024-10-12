const { Router } = require("express");
const {
  getSubjects,
  getSubjectById,
  addSubjects,
  updateSubjects,
  deleteSubjects,
} = require("../controllers/subject_controller");
const { verifyToken } = require("../auth/auth");

const subject = Router();

subject.get("/subjects", getSubjects);
subject.get("/subjects/:id", getSubjectById);
subject.post("/subjects", addSubjects);
subject.put("/subjects/:id", updateSubjects);
subject.delete("/subjects/:id", deleteSubjects);

module.exports = subject;
