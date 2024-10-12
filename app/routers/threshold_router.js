const { Router } = require("express");
const {
  getThresholds,
  setCheckInTime,
  setCheckOutTime,
  setCheckOutTimeByClass,
} = require("../controllers/threshold_controller");

const threshold = Router();

threshold.get("/threshold", getThresholds);
threshold.put("/threshold/check-in", setCheckInTime);
threshold.put("/threshold/check-out", setCheckOutTime);
threshold.put("/threshold/check-out/:class", setCheckOutTimeByClass);

module.exports = threshold;
