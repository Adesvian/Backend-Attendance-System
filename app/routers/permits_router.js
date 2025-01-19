const { Router } = require("express");
const upload = require("../controllers/upload_controller");
const {
  getPermits,
  getPermitstoday,
  addPermit,
  updateStatusPermit,
} = require("../controllers/permit_controller");
const { logger } = require("../controllers/log_controller");
const { verifyToken } = require("../auth/auth");

const permit = Router();

permit.get("/permits", getPermits);
permit.get("/permits-today", getPermitstoday);

permit.use(verifyToken);

permit.post("/permits", upload.single("file"), addPermit, logger);
permit.put("/permits-udpate-status/:id", updateStatusPermit, logger);

module.exports = permit;
