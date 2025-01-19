const { Router } = require("express");
const { getLogs, logger } = require("../controllers/log_controller");

const logs = Router();

logs.get("/logsys", getLogs);
logs.post("/logger", logger);

module.exports = logs;
