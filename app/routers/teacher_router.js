const { Router } = require("express");
const upload = require("../controllers/upload_controller");
const {
  getPermits,
  addPermit,
  acceptPermit,
  rejectPermit,
} = require("../controllers/permit_controller");

const teacher = Router();

teacher.get("/permits", getPermits);
teacher.post("/permits", upload.single("file"), addPermit);
teacher.put("/permits/:id", acceptPermit);
teacher.delete("/permits/:id", rejectPermit);

module.exports = teacher;
