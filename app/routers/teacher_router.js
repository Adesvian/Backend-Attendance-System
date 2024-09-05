const { Router } = require("express");
const upload = require("../controllers/upload_controller");
const {
  getPermits,
  getPermitstoday,
  addPermit,
  updateStatusPermit,
} = require("../controllers/permit_controller");

const teacher = Router();

teacher.get("/permits", getPermits);
teacher.get("/permitstoday", getPermitstoday);
teacher.post("/permits", upload.single("file"), addPermit);
teacher.put("/permitsudpateStatus/:id", updateStatusPermit);

module.exports = teacher;
