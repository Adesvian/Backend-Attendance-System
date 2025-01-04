const express = require("express");
const { config } = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { init, getIO } = require("./app/utils/socketIO");
const MainRouter = require("./app/routers");
const whatsapp = require("./app/controllers/whatsapp.services");
const errorHandlerMiddleware = require("./app/middleware/error-middleware");
const morgan = require("morgan");

config();

const app = express();
const server = http.createServer(app);
init(server);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static("public"));

app.use("/api", MainRouter);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});

// WhatsApp event listeners
whatsapp.onQRUpdated((data) => {});

whatsapp.onConnecting((listener) => {
  console.log(`Connecting to WhatsApp ${listener} ...`);
});

whatsapp.onConnected((listener) => {
  console.log(`WhatsApp ${listener} Connected`);
  const io = getIO();
  io.emit("connected-creds", listener);
  console.log(`WhatsApp ${listener} Connected`);
});

whatsapp.onDisconnected((listener) => {
  console.log(`WhatsApp ${listener} Disconnected`);
});

// Load WhatsApp session
whatsapp.loadSession();
