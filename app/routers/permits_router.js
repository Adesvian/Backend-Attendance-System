const { Router } = require("express");
const upload = require("../controllers/upload_controller");
const {
  getPermits,
  getPermitstoday,
  addPermit,
  updateStatusPermit,
} = require("../controllers/permit_controller");

const permit = Router();

permit.get("/permits", getPermits);
permit.get("/permits-today", getPermitstoday);
permit.post("/permits", upload.single("file"), addPermit);
permit.put("/permits-udpate-status/:id", updateStatusPermit);

module.exports = permit;
