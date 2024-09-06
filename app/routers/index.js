const { Router, json } = require("express");
const WhatsappRouter = require("./whatsapp_router");
const UidRouter = require("./uid_router");
const teacher = require("./teacher_router");
const user = require("./users_router");
const classes = require("./class_router");
const subject = require("./subject_router");
const attendance = require("./attendance_router");
const auth = require("./auth_router");

const MainRouter = Router();

MainRouter.use(auth);
MainRouter.use(teacher);
MainRouter.use(classes);
MainRouter.use(subject);
MainRouter.use(attendance);
MainRouter.use(user);
MainRouter.use(WhatsappRouter);
MainRouter.use(UidRouter);

MainRouter.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = MainRouter;
