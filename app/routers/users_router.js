const { Router } = require("express");
const {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getUserByid,
  getStudents,
  getStudentByid,
  getStudentCountByParentNid,
  addStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherByid,
  getParents,
  getParentByid,
  addParent,
  updateParent,
  deleteParent,
} = require("../controllers/users_controller");
const { verifyToken } = require("../auth/auth");

const user = Router();

user.use(verifyToken);

user.get("/users", getUsers);
user.get("/users/:id", getUserByid);
user.post("/users", addUser);
user.put("/users/:id", updateUser);
user.delete("/users/:id", deleteUser);

user.get("/students", getStudents);
user.get("/students/:id", getStudentByid);
user.get("/students/count/:nid", getStudentCountByParentNid);
user.post("/students", addStudent);
user.put("/students/:id", updateStudent);
user.delete("/students/:id", deleteStudent);

user.get("/parents", getParents);
user.get("/parents/:id", getParentByid);
user.post("/parents", addParent);
user.put("/parents/:id", updateParent);
user.delete("/parents/:id", deleteParent);

user.get("/teachers", getTeachers);
user.get("/teachers/:id", getTeacherByid);
user.post("/teachers", addTeacher);
user.put("/teachers/:id", updateTeacher);
user.delete("/teachers/:id", deleteTeacher);

module.exports = user;
