const { Router } = require("express");
const { getUID, authorizeUID } = require("../controllers/uid_controller");

const UidRouter = Router();

UidRouter.post("/scan-RFID", authorizeUID, getUID);

module.exports = UidRouter;
