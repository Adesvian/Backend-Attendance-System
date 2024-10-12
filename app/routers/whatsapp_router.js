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

const WhatsappRouter = Router();

WhatsappRouter.post("/create-session", createSession);
WhatsappRouter.post("/start-session", startSession);
WhatsappRouter.post("/stop-session", stopSession);
WhatsappRouter.post("/send-message", sendMessage);
WhatsappRouter.get("/get-whatsapp-creds", verifyToken, getWhatsappCreds);
WhatsappRouter.post("/create-whatsapp-creds", createWhatsappCreds);
WhatsappRouter.put("/update-whatsapp-creds/:num", updateWhatsappCreds);
WhatsappRouter.delete("/delete-whatsapp-creds/:num", deleteWhatsappCreds);

module.exports = WhatsappRouter;
