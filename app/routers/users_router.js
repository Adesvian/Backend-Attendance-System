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
  createParentAndUser,
  updateParentAndUser,
  createStudentWithParent,
} = require("../controllers/users_controller");
const { verifyToken } = require("../auth/auth");
const { logger } = require("../controllers/log_controller");

const user = Router();

user.use(verifyToken);

user.get("/users", getUsers);
user.get("/users/:id", getUserByid);
user.post("/users", addUser, logger);
user.put("/users/:id", updateUser, logger);
user.delete("/users/:id", deleteUser, logger);

user.get("/students", getStudents);
user.get("/students/:id", getStudentByid);
user.get("/students/count/:nid", getStudentCountByParentNid);
user.post("/students", addStudent, logger);
user.put("/students/:id", updateStudent, logger);
user.delete("/students/:id", deleteStudent, logger);

user.get("/parents", getParents);
user.get("/parents/:id", getParentByid);
user.post("/parents", addParent, logger); // deprecated
user.put("/parents/:id", updateParent, logger);
user.delete("/parents/:id", deleteParent, logger);

user.get("/teachers", getTeachers);
user.get("/teachers/:id", getTeacherByid);
user.post("/teachers", addTeacher, logger);
user.put("/teachers/:id", updateTeacher, logger);
user.delete("/teachers/:id", deleteTeacher, logger);

user.post("/create-student-with-parent", createStudentWithParent, logger);
user.post("/parent-and-user", createParentAndUser, logger);
user.put("/parent-and-user/:id", updateParentAndUser, logger);

module.exports = user;
