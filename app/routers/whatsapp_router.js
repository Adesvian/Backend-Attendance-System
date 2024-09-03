const { Router } = require("express");
const {
  createSession,
  sendMessage,
} = require("../controllers/whatsapp_controller");

const WhatsappRouter = Router();

WhatsappRouter.all("/start-session", createSession);
WhatsappRouter.all("/send-message", sendMessage);

module.exports = WhatsappRouter;
