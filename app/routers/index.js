const { Router } = require("express");
const WhatsappRouter = require("./whatsapp_router");
const RFID = require("./uid_router");
const permit = require("./permits_router");
const user = require("./users_router");
const classes = require("./class_router");
const subject = require("./subject_router");
const attendance = require("./attendance_router");
const auth = require("./auth_router");
const threshold = require("./threshold_router");
const events = require("./events_router");

const MainRouter = Router();

MainRouter.get("/", (req, res) => {
  res.send("Backend API 17 RAMADHAN v1.0.0");
});
MainRouter.use(RFID);
MainRouter.use(auth);
MainRouter.use(permit);
MainRouter.use(classes);
MainRouter.use(events);
MainRouter.use(subject);
MainRouter.use(threshold);
MainRouter.use(WhatsappRouter);
MainRouter.use(user);
MainRouter.use(attendance);

module.exports = MainRouter;
