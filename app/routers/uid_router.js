const { Router } = require("express");
const { renderForm, getUID } = require("../controllers/uid_controller");

const UidRouter = Router();

UidRouter.all("/get-uid", getUID);
UidRouter.all("/form", renderForm);

module.exports = UidRouter;
