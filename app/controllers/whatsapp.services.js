const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const Error = require("../utils/error");
const { toJid } = require("../utils/number-to-jid");
const { zoneTime } = require("../utils/date-format");

let callback = new Map();
let connectedSocket;

const CALLBACK_KEY = {
  ON_CONNECTING: "onConnecting",
  ON_CONNECTED: "onConnected",
  ON_DISCONNECTED: "onDisconnected",
  ON_QR: "onQR",
};

const MAX_RECONNECT_ATTEMPTS = 10; // Max number of reconnect attempts

exports.connectToWhatsApp = async (sessionName, attempt = 1) => {
  const logger = pino({
    level: "silent",
  });
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(process.env.DIR_NAME, sessionName)
  );

  const socket = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger,
    browser: Browsers.ubuntu("Chrome"),
  });

  connectedSocket = socket;

  try {
    socket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (update.qr) {
        const cb = callback.get(CALLBACK_KEY.ON_QR);
        cb?.({ qr: update.qr });
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect && attempt < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
            exports.connectToWhatsApp(sessionName, attempt + 1);
          }, 2000); // Wait 2 seconds before retrying
        } else if (attempt >= MAX_RECONNECT_ATTEMPTS) {
          // Delete session after maximum reconnect attempts
          try {
            fs.rmSync(`./sessions/${sessionName}`, {
              force: true,
              recursive: true,
            });
            const cb = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
            cb?.(sessionName);
          } catch (err) {
            console.error("Failed to delete session:", err);
          }
        }

        if (lastDisconnect.error?.output?.statusCode === 401) {
          try {
            fs.rmSync(`./sessions/${sessionName}`, {
              force: true,
              recursive: true,
            });
            const cb = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
            cb?.(sessionName);
          } catch (err) {
            throw err;
          }
        }
      }

      if (connection === "connecting") {
        const cb = callback.get(CALLBACK_KEY.ON_CONNECTING);
        cb?.(sessionName);
      }

      if (connection === "open") {
        const cb = callback.get(CALLBACK_KEY.ON_CONNECTED);
        cb?.(sessionName);
      }
    });

    socket.ev.on("creds.update", saveCreds);

    return socket;
  } catch (e) {
    return socket;
  }
};

exports.onDisconnected = (listener) => {
  callback.set(CALLBACK_KEY.ON_DISCONNECTED, listener);
};

exports.onConnecting = (listener) => {
  callback.set(CALLBACK_KEY.ON_CONNECTING, listener);
};

exports.onConnected = (listener) => {
  callback.set(CALLBACK_KEY.ON_CONNECTED, listener);
};

exports.onQRUpdated = (listener) => {
  callback.set(CALLBACK_KEY.ON_QR, listener);
};

exports.loadSession = () => {
  if (!fs.existsSync(path.resolve(process.env.DIR_NAME))) {
    fs.mkdirSync(path.resolve(process.env.DIR_NAME));
  }
  fs.readdir(path.resolve(process.env.DIR_NAME), (err, dirs) => {
    if (err) {
      throw err;
    }
    for (const dir of dirs) {
      if (!dir) continue;
      exports.connectToWhatsApp(dir);
    }
  });
};

exports.sendTextMessage = async (req, res) => {
  if (!connectedSocket) {
    throw new Error.WhatsappError("There is no socket found", 424);
  }
  const receiver = toJid(req.number);
  const isRegistered = await connectedSocket.onWhatsApp(receiver);
  if (!isRegistered[0]) {
    throw new Error.WhatsappError(
      `${req.number} is not registered on WhatsApp`,
      406
    );
  }
  const nama = "Aliffedo Desvian"; // get name from database
  const method = "Check-in"; // get method from database
  const time = new Date().getTime(); // get time from card detected
  const timeformat = new Date(time);
  const zt = zoneTime(timeformat);

  const greetingTemplate = `Selamat pagi bapak/ibu...\nKami menginformasikan terkait kehadiran anak anda yang bernama *${nama}* sedang berada di sekolah.\n\n*Kehadiran*\t: ${method}\n*Pukul*\t\t\t\t: ${zt}\n*Status*\t\t\t: Tepat waktu`;

  return await connectedSocket.sendMessage(receiver, {
    text: greetingTemplate,
  });
};
