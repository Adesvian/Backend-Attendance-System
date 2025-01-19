const { Router } = require("express");
const {
  getWhatsappCreds,
  createWhatsappCreds,
  createSession,
  updateWhatsappCreds,
  deleteWhatsappCreds,
  stopSession,
  startSession,
  sendMessage,
} = require("../controllers/whatsapp_controller");
const { verifyToken } = require("../auth/auth");
const { logger } = require("../controllers/log_controller");

const WhatsappRouter = Router();

WhatsappRouter.get("/get-whatsapp-creds", verifyToken, getWhatsappCreds);
WhatsappRouter.post("/create-whatsapp-creds", createWhatsappCreds, logger);
WhatsappRouter.post("/create-session", createSession, logger);
WhatsappRouter.post("/start-session", startSession);
WhatsappRouter.post("/stop-session", stopSession, logger);
WhatsappRouter.post("/send-message", sendMessage);
WhatsappRouter.put("/update-whatsapp-creds/:name", updateWhatsappCreds, logger);
WhatsappRouter.delete(
  "/delete-whatsapp-creds/:name",
  deleteWhatsappCreds,
  logger
);

module.exports = WhatsappRouter;
