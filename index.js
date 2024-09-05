const express = require("express");
const { config } = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const MainRouter = require("./app/routers");
const whatsapp = require("./app/controllers/whatsapp.services");
const errorHandlerMiddleware = require("./app/middleware/error-middleware");

config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", MainRouter);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(errorHandlerMiddleware);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("rfidData", (data) => {
    console.log("Received RFID data:", data);
    io.emit("rfidData", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// WhatsApp event listeners
whatsapp.onConnecting((listener) => {
  console.log(`Connecting to WhatsApp ${listener} ...`);
});

whatsapp.onConnected((listener) => {
  console.log(`WhatsApp ${listener} Connected`);
});

whatsapp.onDisconnected((listener) => {
  console.log(`WhatsApp ${listener} Disconnected`);
});

whatsapp.onQRUpdated(async (data) => {
  console.log(data);
});

// Load WhatsApp session
whatsapp.loadSession();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});
