const { Router } = require("express");
const {
  getUsers,
  getStudents,
  getStudentByid,
  getTeachers,
  getTeacherByid,
  getParents,
  getParentByid,
} = require("../controllers/users_controller");
const { verifyToken } = require("../auth/auth");

const user = Router();

user.get("/users", verifyToken, getUsers);
user.get("/students", getStudents);
user.get("/students/:id", getStudentByid);
user.get("/parents", getParents);
user.get("/parents/:id", getParentByid);
user.get("/teachers", getTeachers);
user.get("/teachers/:id", getTeacherByid);

module.exports = user;
