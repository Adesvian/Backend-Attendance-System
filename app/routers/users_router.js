const { Router } = require("express");
const {
  getUsers,
  getStudents,
  getStudentByid,
  getTeachers,
  getTeacherByid,
} = require("../controllers/users_controller");
const { verifyToken } = require("../auth/auth");

const user = Router();

user.get("/users", verifyToken, getUsers);
user.get("/students", getStudents);
user.get("/students/:id", getStudentByid);
user.get("/teachers", getTeachers);
user.get("/teachers/:id", getTeacherByid);

module.exports = user;
