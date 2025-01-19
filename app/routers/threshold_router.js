const { Router } = require("express");
const {
  getThresholds,
  setCheckInTime,
  setCheckOutTime,
  setCheckOutTimeByClass,
} = require("../controllers/threshold_controller");
const { logger } = require("../controllers/log_controller");

const threshold = Router();

threshold.get("/threshold", getThresholds);

threshold.put("/threshold/check-in", setCheckInTime, logger);
threshold.put("/threshold/check-out", setCheckOutTime, logger);
threshold.put("/threshold/check-out/:class", setCheckOutTimeByClass, logger);

module.exports = threshold;
